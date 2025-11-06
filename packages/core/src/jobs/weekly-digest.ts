import { ContentIngestionService } from '../ingestion'
import { DigestComposer, type DigestCompositionOptions } from '../summarize'
import { EmailService } from '../email'
import { PodcastService } from '../podcast'
import { config, ACADEMIC_FIELDS } from '../config'
import { createLogger, getCurrentWeekInfo, generateDigestId } from '../utils'
import type { WeeklyDigest, Article, AcademicField } from '../types'

const logger = createLogger('WeeklyDigestJob')

export class WeeklyDigestJob {
  private contentIngestion: ContentIngestionService
  private digestComposer: DigestComposer
  private emailService: EmailService
  private podcastService: PodcastService

  constructor() {
    this.contentIngestion = new ContentIngestionService()
    this.digestComposer = new DigestComposer()
    this.emailService = new EmailService()
    this.podcastService = new PodcastService()
  }

  async run(options: {
    field?: AcademicField
    force?: boolean
    mockOnly?: boolean
    dryRun?: boolean
  } = {}): Promise<{
    success: boolean
    digestId?: string
    articlesCount?: number
    podcastGenerated?: boolean
    emailSent?: boolean
    errors?: string[]
    warnings?: string[]
    artifacts?: {
      digestPath?: string
      emailsPath?: string[]
      podcastPath?: string
      rssFeedPath?: string
    }
  }> {
    const startTime = Date.now()
    const { field, force = false, mockOnly = true, dryRun = false } = options

    logger.info('Starting weekly digest job', {
      field,
      force,
      mockOnly,
      dryRun,
    })

    const errors: string[] = []
    const warnings: string[] = []
    const artifacts: any = {}

    try {
      // 1. Determine which fields to process
      const fieldsToProcess = this.getFieldsToProcess(field, force)

      if (fieldsToProcess.length === 0) {
        errors.push('No fields specified for processing')
        return { success: false, errors }
      }

      logger.info(`Processing ${fieldsToProcess.length} fields:`, fieldsToProcess)

      // 2. Process each field
      const results = []
      for (const fieldToProcess of fieldsToProcess) {
        try {
          const result = await this.processField(fieldToProcess, {
            force,
            mockOnly,
            dryRun,
          })
          results.push(result)

          if (!result.success) {
            errors.push(`Failed to process ${fieldToProcess}: ${result.error}`)
          } else {
            logger.info(`Successfully processed ${fieldToProcess}`, {
              digestId: result.digestId,
              articlesCount: result.articlesCount,
            })
          }
        } catch (error) {
          const errorMsg = `Error processing ${fieldToProcess}: ${error}`
          errors.push(errorMsg)
          logger.error(errorMsg, { field: fieldToProcess })
        }
      }

      // 3. Generate summary
      const successfulResults = results.filter(r => r.success)
      const totalArticles = successfulResults.reduce((sum, r) => sum + (r.articlesCount || 0), 0)
      const podcastsGenerated = successfulResults.filter(r => r.podcastGenerated).length
      const emailsSent = successfulResults.filter(r => r.emailSent).length

      const processingTime = Date.now() - startTime

      logger.info('Weekly digest job completed', {
        fieldsProcessed: fieldsToProcess.length,
        successfulFields: successfulResults.length,
        totalArticles,
        podcastsGenerated,
        emailsSent,
        processingTime: `${processingTime}ms`,
        errors: errors.length,
      })

      return {
        success: errors.length === 0,
        digestId: successfulResults[0]?.digestId,
        articlesCount: totalArticles,
        podcastGenerated: podcastsGenerated > 0,
        emailSent: emailsSent > 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        artifacts: Object.keys(artifacts).length > 0 ? artifacts : undefined,
      }

    } catch (error) {
      logger.error('Weekly digest job failed', { error })
      return {
        success: false,
        errors: [`Job execution failed: ${error}`],
      }
    }
  }

  private async processField(
    field: AcademicField,
    options: {
      force: boolean
      mockOnly: boolean
      dryRun: boolean
    }
  ): Promise<{
    success: boolean
    digestId: string
    articlesCount: number
    podcastGenerated?: boolean
    emailSent?: boolean
    artifacts?: any
    error?: string
  }> {
    const { force, mockOnly, dryRun } = options
    const weekInfo = getCurrentWeekInfo()
    const digestId = generateDigestId(field, weekInfo.weekNumber, weekInfo.year)

    // Initialize warnings and artifacts collections
    const warnings: string[] = []
    const artifacts: Record<string, any> = {}

    logger.info(`Processing field: ${field}`, {
      digestId,
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year,
      force,
      mockOnly,
      dryRun,
    })

    try {
      // 1. Check if digest already exists (unless forced)
      if (!force && await this.digestExists(digestId)) {
        const warning = `Digest ${digestId} already exists. Use --force to override.`
        logger.warn(warning)
        return {
          success: false,
          digestId,
          articlesCount: 0,
          error: warning,
        }
      }

      // 2. Ingest articles
      logger.info('Ingesting articles', { field, mockOnly })
      const articles = await this.contentIngestion.ingestArticles(field, {
        maxArticlesPerSource: 25,
        maxTotalArticles: 50,
        minRelevanceScore: 60,
        excludeOlderThanDays: 14,
      })

      if (articles.length === 0) {
        const error = `No articles found for field: ${field}`
        logger.error(error)
        return {
          success: false,
          digestId,
          articlesCount: 0,
          error,
        }
      }

      logger.info(`Ingested ${articles.length} articles for ${field}`)

      // 3. Compose digest
      logger.info('Composing digest', { digestId, articlesCount: articles.length })
      const digestOptions: DigestCompositionOptions = {
        maxArticles: 5,
        minArticles: 3,
        targetReadingTime: 20,
        audienceLevel: 'intermediate',
        includeTechnicalDetails: true,
        emphasizeApplications: true,
        editorialStyle: 'professional',
      }

      const composedDigest = await this.digestComposer.composeDigest(articles, field, digestOptions)

      logger.info('Digest composed', {
        digestId: composedDigest.id,
        totalReadingTime: composedDigest.totalReadingTime,
        qualityMetrics: composedDigest.qualityMetrics,
      })

      // 4. Validate digest
      const validation = await this.digestComposer.validateDigestComposition(composedDigest)
      if (!validation.valid) {
        const validationWarnings = validation.issues.map(issue => `Validation: ${issue}`)
        warnings.push(...validationWarnings)
        logger.warn('Digest validation warnings', { digestId, warnings })
      }

      if (dryRun) {
        logger.info('Dry run completed - digest not saved', { digestId })
        return {
          success: true,
          digestId,
          articlesCount: articles.length,
          artifacts: {
            digestPreview: composedDigest,
            validationWarnings: validation.issues,
          },
        }
      }

      // 5. Save digest (in production, this would save to database)
      logger.info('Saving digest', { digestId })
      // In MVP, we simulate saving with logging

      // 6. Generate podcast episode
      let podcastGenerated = false
      let podcastPath: string | undefined

      if (!mockOnly) {
        try {
          logger.info('Generating podcast episode', { digestId })
          const podcastResult = await this.podcastService.generatePodcastEpisode(
            composedDigest,
            articles,
            {
              targetDuration: 12,
              voiceId: 'Joanna',
              audioQuality: 'medium',
            }
          )

          podcastGenerated = true
          podcastPath = podcastResult.audioFile.path

          // Generate RSS feed
          const rssFeed = await this.podcastService.generateRSSFeed(
            [podcastResult.episode],
            field
          )

          artifacts.rssFeedPath = `${config.storageDir}/feeds/${field}.xml`

          logger.info('Podcast generated successfully', {
            episodeId: podcastResult.episode.id,
            duration: podcastResult.audioFile.duration,
            rssFeed: artifacts.rssFeedPath,
          })
        } catch (error) {
          const warning = `Podcast generation failed: ${error}`
          warnings.push(warning)
          logger.warn(warning)
        }
      }

      // 7. Send emails (mock mode)
      let emailSent = false
      const emailPaths: string[] = []

      try {
        logger.info('Sending digest emails', { digestId, field })

        // In production, you would fetch actual users for this field
        const mockUsers = this.getMockUsersForField(field)

        for (const user of mockUsers) {
          try {
            const emailResult = await this.emailService.sendWeeklyDigest(user, composedDigest, articles)
            if (emailResult.success && emailResult.localFilePath) {
              emailPaths.push(emailResult.localFilePath)
            }
          } catch (error) {
            const warning = `Email send failed for user ${user.id}: ${error}`
            warnings.push(warning)
            logger.warn(warning)
          }
        }

        emailSent = emailPaths.length > 0
        artifacts.emailsPath = emailPaths

        logger.info(`Sent ${emailPaths.length} emails for ${field}`)
      } catch (error) {
        const warning = `Email sending failed: ${error}`
        warnings.push(warning)
        logger.warn(warning)
      }

      // 8. Save artifacts
      await this.saveArtifacts(composedDigest, {
        digestPath: `${config.artifactsDir}/digests/${digestId}.json`,
        emailPaths,
        podcastPath,
      })

      logger.info('Digest processing completed successfully', {
        digestId,
        articlesCount: articles.length,
        totalReadingTime: composedDigest.totalReadingTime,
        podcastGenerated,
        emailSent: emailSent,
        validationIssues: validation.issues.length,
        warnings: warnings.length,
      })

      return {
        success: true,
        digestId,
        articlesCount: articles.length,
        podcastGenerated,
        emailSent,
        artifacts,
      }

    } catch (error) {
      logger.error(`Failed to process field ${field}`, { error })
      return {
        success: false,
        digestId,
        articlesCount: 0,
        error: `Field processing failed: ${error}`,
      }
    }
  }

  private getFieldsToProcess(field?: AcademicField, force = false): AcademicField[] {
    if (field) {
      return [field]
    }

    if (force) {
      return Object.keys(ACADEMIC_FIELDS) as AcademicField[]
    }

    // Default: process all fields
    return Object.keys(ACADEMIC_FIELDS) as AcademicField[]
  }

  private async digestExists(digestId: string): Promise<boolean> {
    // In production, check database
    // In MVP, simulate with file system check
    return false // Assume digest doesn't exist in MVP
  }

  private getMockUsersForField(field: AcademicField): Array<{
    id: string
    email: string
    field: AcademicField
    confirmed: boolean
    subscriptionTier: 'free' | 'premium'
  }> {
    const baseCount = 10
    const premiumCount = 2

    const users = []

    // Free tier users
    for (let i = 0; i < baseCount; i++) {
      users.push({
        id: `user_${field}_free_${i + 1}`,
        email: `user${i + 1}@${field.replace('-', '')}.edu`,
        field,
        confirmed: true,
        subscriptionTier: 'free' as const,
      })
    }

    // Premium tier users
    for (let i = 0; i < premiumCount; i++) {
      users.push({
        id: `user_${field}_premium_${i + 1}`,
        email: `premium${i + 1}@${field.replace('-', '')}.edu`,
        field,
        confirmed: true,
        subscriptionTier: 'premium' as const,
      })
    }

    return users
  }

  private async saveArtifacts(digest: WeeklyDigest, artifacts: {
    digestPath?: string
    emailPaths?: string[]
    podcastPath?: string
  }): Promise<void> {
    try {
      // Save digest to artifacts directory
      if (artifacts.digestPath) {
        const digestData = {
          ...digest,
          artifacts: {
            emailPaths: artifacts.emailPaths || [],
            podcastPath: artifacts.podcastPath,
          },
        }

        // In production, write to file system
        logger.info('Saving digest artifact', { path: artifacts.digestPath })
        // await fs.writeFile(artifacts.digestPath, JSON.stringify(digestData, null, 2))
      }

      // Log artifact locations
      logger.info('Artifacts saved:', {
        digest: artifacts.digestPath || 'Not saved',
        emails: artifacts.emailPaths?.length || 0,
        podcast: artifacts.podcastPath || 'Not generated',
      })
    } catch (error) {
      logger.error('Failed to save artifacts', { error })
    }
  }

  // Utility method to run the job with CLI arguments
  static async run(options: {
    field?: AcademicField
    force?: boolean
    mockOnly?: boolean
    dryRun?: boolean
  } = {}): Promise<{
    success: boolean
    digestId?: string
    articlesCount?: number
    podcastGenerated?: boolean
    emailSent?: boolean
  }> {
    const job = new WeeklyDigestJob()
    return await job.run(options)
  }

  static async runFromCLI(): Promise<void> {
    const args = process.argv.slice(2)
    const options: {
      field?: AcademicField
      force?: boolean
      mockOnly?: boolean
      dryRun?: boolean
    } = {}

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      switch (arg) {
        case '--field':
        case '-f':
          options.field = args[++i] as AcademicField
          break
        case '--force':
        case '-F':
          options.force = true
          break
        case '--mock-only':
          options.mockOnly = true
          break
        case '--dry-run':
        case '-D':
          options.dryRun = true
          break
      }
    }

    // Validate field
    if (options.field && !Object.keys(ACADEMIC_FIELDS).includes(options.field)) {
      console.error(`Invalid field: ${options.field}`)
      console.log(`Valid fields: ${Object.keys(ACADEMIC_FIELDS).join(', ')}`)
      process.exit(1)
    }

    const job = new WeeklyDigestJob()
    const result = await job.run(options)

    if (result.success) {
      console.log('✅ Weekly digest job completed successfully!')
      console.log(`📧 Digest ID: ${result.digestId}`)
      console.log(`📚 Articles: ${result.articlesCount}`)

      if (result.podcastGenerated) {
        console.log('🎙️ Podcast: Generated')
      }

      if (result.emailSent) {
        console.log('📧 Emails: Sent')
      }

      if (result.warnings?.length) {
        console.log(`⚠️  Warnings: ${result.warnings.length}`)
        result.warnings.forEach(warning => console.log(`   - ${warning}`))
      }

      if (result.artifacts) {
        console.log('📁 Artifacts:')
        Object.entries(result.artifacts).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            console.log(`   ${key}: ${value.length} files`)
          } else if (value) {
            console.log(`   ${key}: ${value}`)
          }
        })
      }
    } else {
      console.error('❌ Weekly digest job failed!')
      if (result.errors) {
        result.errors.forEach(error => console.error(`   ${error}`))
      }
      process.exit(1)
    }
  }
}

// Run the job if this file is executed directly
if (require.main === module) {
  WeeklyDigestJob.runFromCLI().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}