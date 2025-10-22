import type { Article, WeeklyDigest, AcademicField } from '../types'
import { config, ContentConfig } from '../config'
import { createLogger, estimateReadingTime, extractPlainText, truncateText } from '../utils'

const logger = createLogger('SummarizationService')

export interface SummaryOptions {
  targetReadingTime?: number
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  includeTechnicalDetails?: boolean
  emphasizeApplications?: boolean
  maxSummaryLength?: number
}

export interface GeneratedSummary {
  id: string
  articleId: string
  summary: string
  whyThisMatters: string
  keyFindings: string[]
  readingTime: number
  qualityScore: number
  generatedAt: Date
  processingTime: number
  options: SummaryOptions
}

export interface OverviewTranscript {
  title: string
  introduction: string
  segments: OverviewSegment[]
  conclusion: string
  totalDuration: number
  generatedAt: Date
}

export interface OverviewSegment {
  title: string
  content: string
  duration: number
  articleIds: string[]
  transition?: string
}

export class SummarizationService {
  constructor() {
    logger.info('Summarization service initialized', {
      mockMode: config.mockMode,
      model: config.mockMode ? 'mock-summary-engine' : 'claude-code',
    })
  }

  async generateSummary(
    article: Article,
    options: SummaryOptions = {}
  ): Promise<GeneratedSummary> {
    const startTime = Date.now()
    const {
      targetReadingTime = ContentConfig.maxReadingTimeMinutes,
      audienceLevel = 'intermediate',
      includeTechnicalDetails = true,
      emphasizeApplications = true,
      maxSummaryLength = 500,
    } = options

    logger.info('Generating article summary', {
      articleId: article.id,
      title: article.title,
      options,
    })

    try {
      if (config.mockMode) {
        const summary = await this.generateMockSummary(article, options)
        return {
          ...summary,
          processingTime: Date.now() - startTime,
        }
      }

      // In production, this would call Claude or other LLM APIs
      const summary = await this.generateRealSummary(article, options)
      return {
        ...summary,
        processingTime: Date.now() - startTime,
      }

    } catch (error) {
      logger.error('Failed to generate summary', { articleId: article.id, error })
      throw new Error(`Summary generation failed: ${error}`)
    }
  }

  private async generateMockSummary(
    article: Article,
    options: SummaryOptions
  ): Promise<Omit<GeneratedSummary, 'processingTime'>> {
    // Generate contextual summary based on article content and options
    const summary = this.createContextualSummary(article, options)
    const whyThisMatters = this.generateWhyThisMatters(article, options)
    const keyFindings = this.extractKeyFindings(article, options)
    const readingTime = estimateReadingTime(summary)

    return {
      id: `summary_${article.id}_${Date.now()}`,
      articleId: article.id,
      summary,
      whyThisMatters,
      keyFindings,
      readingTime,
      qualityScore: this.assessSummaryQuality(summary, article),
      generatedAt: new Date(),
      options,
    }
  }

  private async generateRealSummary(
    article: Article,
    options: SummaryOptions
  ): Promise<Omit<GeneratedSummary, 'processingTime'>> {
    // In production, this would use Claude or other LLM APIs
    // For now, fall back to mock implementation
    return this.generateMockSummary(article, options)
  }

  private createContextualSummary(article: Article, options: SummaryOptions): string {
    const { audienceLevel, includeTechnicalDetails, emphasizeApplications, maxSummaryLength } = options

    let summary = ''

    // Start with main finding
    summary += `${this.extractMainFinding(article.abstract)} `

    // Add methodology details if requested
    if (includeTechnicalDetails && article.methodology) {
      summary += `Using ${article.methodology.toLowerCase()}, `
    }

    // Add key results
    summary += `${this.extractKeyResults(article.abstract)}`

    // Add applications if emphasized
    if (emphasizeApplications) {
      summary += ` ${this.extractApplications(article.abstract)}`
    }

    // Adjust complexity based on audience level
    summary = this.adjustComplexity(summary, audienceLevel)

    // Ensure length constraints
    return truncateText(summary, maxSummaryLength)
  }

  private extractMainFinding(abstract: string): string {
    // Look for sentences that contain main findings
    const sentences = abstract.split('.').filter(s => s.trim().length > 0)

    const findingIndicators = ['found', 'demonstrated', 'showed', 'revealed', 'discovered', 'developed']

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase()
      if (findingIndicators.some(indicator => lowerSentence.includes(indicator))) {
        return sentence.trim()
      }
    }

    // Fallback to first sentence
    return sentences[0]?.trim() || abstract.slice(0, 100) + '...'
  }

  private extractKeyResults(abstract: string): string {
    // Extract quantitative results and key outcomes
    const resultPatterns = [
      /(\d+)%\s*(?:efficiency|accuracy|improvement|reduction)/gi,
      /(\d+(?:\.\d+)?)\s*times?\s*(?:faster|better|greater)/gi,
      /significant\s*(?:improvement|increase|decrease|reduction)/gi,
    ]

    const results: string[] = []

    resultPatterns.forEach(pattern => {
      const matches = abstract.match(pattern)
      if (matches) {
        results.push(matches[0])
      }
    })

    if (results.length > 0) {
      return `The study achieved ${results.join(', ')}.`
    }

    return 'The results show promising outcomes that advance the field.'
  }

  private extractApplications(abstract: string): string[] {
    // Look for application-focused sentences
    const sentences = abstract.split('.').filter(s => s.trim().length > 0)
    const applicationIndicators = [
      'application', 'treatment', 'therapy', 'tool', 'method', 'approach',
      'potential', 'could', 'may', 'enables', 'provides'
    ]

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase()
      if (applicationIndicators.some(indicator => lowerSentence.includes(indicator))) {
        return sentence.trim()
      }
    }

    return 'This work has potential applications in the field.'
  }

  private adjustComplexity(text: string, audienceLevel: 'beginner' | 'intermediate' | 'advanced'): string {
    if (audienceLevel === 'beginner') {
      // Simplify technical terms
      return text
        .replace(/CRISPR-Cas9/g, 'gene editing technology')
        .replace(/cryo-electron microscopy/g, 'advanced imaging techniques')
        .replace(/quantum superposition/g, 'quantum properties')
        .replace(/parameter-efficient fine-tuning/g, 'efficient model adaptation')
    } else if (audienceLevel === 'advanced') {
      // Keep technical terms, add specificity
      return text
    }

    return text // intermediate level - keep most technical terms
  }

  private generateWhyThisMatters(article: Article, options: SummaryOptions): string {
    const { emphasizeApplications } = options

    const fieldImpactMessages: Record<string, string> = {
      'life-sciences': emphasizeApplications
        ? `This research advances ${article.subfield} with potential applications in medicine and biotechnology, offering new approaches to treating diseases and understanding biological processes.`
        : `This work contributes to fundamental understanding of ${article.subfield}, expanding our knowledge of biological systems and mechanisms.`,

      'ai-computing': emphasizeApplications
        ? `This advancement in ${article.subfield} enables practical applications in industry and research, making AI systems more capable and accessible for real-world problems.`
        : `This research pushes the boundaries of ${article.subfield}, contributing to theoretical foundations and methodological advances in artificial intelligence.`,

      'humanities-culture': `This work provides valuable insights into ${article.subfield}, deepening our understanding of human culture and society through scholarly analysis.`,

      'policy-governance': emphasizeApplications
        ? `This research offers evidence-based insights that could inform policy decisions and governance approaches, potentially improving public outcomes.`
        : `This work advances our understanding of ${article.subfield}, contributing to academic discourse on governance and policy.`,

      'climate-earth-systems': emphasizeApplications
        ? `This study provides crucial information for addressing environmental challenges and developing sustainable solutions to climate-related problems.`
        : `This research advances our understanding of ${article.subfield}, expanding scientific knowledge of Earth's systems and processes.`,
    }

    return fieldImpactMessages[article.field] ||
      `This research contributes valuable knowledge to ${article.field} and the broader academic community.`
  }

  private extractKeyFindings(article: Article, options: SummaryOptions): string[] {
    const findings: string[] = []

    // Use existing key findings if available
    if (article.keyFindings && article.keyFindings.length > 0) {
      return article.keyFindings.slice(0, 3) // Limit to 3 key findings
    }

    // Extract from abstract
    const sentences = article.abstract.split('.').filter(s => s.trim().length > 20)

    // Look for sentences with quantitative data or strong claims
    const findingPatterns = [
      /significantly/gi,
      /improved/gi,
      /reduced/gi,
      /increased/gi,
      /demonstrated/gi,
      /achieved/gi,
    ]

    sentences.forEach(sentence => {
      if (findings.length >= 3) return

      const lowerSentence = sentence.toLowerCase()
      if (findingPatterns.some(pattern => pattern.test(lowerSentence))) {
        findings.push(sentence.trim() + '.')
      }
    })

    // Fallback to generic findings
    if (findings.length === 0) {
      findings.push(
        'Novel methodology was developed and validated.',
        'Results show promising outcomes for the field.',
        'This work opens new avenues for future research.'
      )
    }

    return findings
  }

  private assessSummaryQuality(summary: string, article: Article): number {
    let score = 50 // Base score

    // Length appropriateness
    const targetLength = 200
    const lengthDiff = Math.abs(summary.length - targetLength)
    score += Math.max(0, 20 - lengthDiff / 10)

    // Contains key terms
    const keyTerms = article.tags.slice(0, 3)
    const termMatches = keyTerms.filter(term =>
      summary.toLowerCase().includes(term.toLowerCase())
    ).length
    score += termMatches * 5

    // Readability (simple heuristic)
    const avgWordsPerSentence = summary.split('.').length > 1
      ? summary.split(' ').length / summary.split('.').length
      : 20

    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
      score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  async generateOverviewTranscript(
    articles: Article[],
    field: AcademicField,
    targetDuration: number = 12 // minutes
  ): Promise<OverviewTranscript> {
    logger.info('Generating overview transcript', {
      articleCount: articles.length,
      field,
      targetDuration,
    })

    try {
      if (config.mockMode) {
        return this.generateMockOverviewTranscript(articles, field, targetDuration)
      }

      // In production, this would use advanced summarization
      return this.generateMockOverviewTranscript(articles, field, targetDuration)

    } catch (error) {
      logger.error('Failed to generate overview transcript', { field, error })
      throw new Error(`Overview transcript generation failed: ${error}`)
    }
  }

  private generateMockOverviewTranscript(
    articles: Article[],
    field: AcademicField,
    targetDuration: number
  ): OverviewTranscript {
    const fieldInfo = this.getFieldInfo(field)
    const segmentDuration = Math.floor((targetDuration - 2) / articles.length) // Reserve 2 min for intro/outro

    const segments: OverviewSegment[] = articles.map((article, index) => ({
      title: this.generateSegmentTitle(article, index + 1),
      content: this.generateSegmentContent(article, field),
      duration: segmentDuration,
      articleIds: [article.id],
      transition: index < articles.length - 1
        ? this.generateTransition(article, articles[index + 1])
        : undefined,
    }))

    return {
      title: `Bite Size ${fieldInfo.name}: Weekly Research Highlights`,
      introduction: this.generateIntroduction(articles, field, targetDuration),
      segments,
      conclusion: this.generateConclusion(articles, field),
      totalDuration: targetDuration,
      generatedAt: new Date(),
    }
  }

  private getFieldInfo(field: AcademicField) {
    const fieldMap = {
      'life-sciences': { name: 'Life Sciences', emoji: '🧬' },
      'ai-computing': { name: 'AI & Computing', emoji: '🤖' },
      'humanities-culture': { name: 'Humanities & Culture', emoji: '📚' },
      'policy-governance': { name: 'Policy & Governance', emoji: '🏛️' },
      'climate-earth-systems': { name: 'Climate & Earth Systems', emoji: '🌍' },
    }
    return fieldMap[field] || fieldMap['life-sciences']
  }

  private generateSegmentTitle(article: Article, segmentNumber: number): string {
    return `${segmentNumber}. ${article.title}`
  }

  private generateSegmentContent(article: Article, field: AcademicField): string {
    // Create a narrative-style content for the podcast
    const mainFinding = this.extractMainFinding(article.abstract)
    const significance = article.whyThisMatters

    let content = `Let's dive into this fascinating research from ${article.authors[0]?.name || 'researchers'} at ${article.authors[0]?.affiliation || 'leading institutions'}. `

    content += `They ${mainFinding.toLowerCase()}. `

    if (article.keyFindings && article.keyFindings.length > 0) {
      content += `The key findings include: ${article.keyFindings[0].toLowerCase()} `
    }

    content += `${significance} `

    // Add field-specific context
    if (field === 'life-sciences') {
      content += `This could have important implications for future medical treatments and our understanding of biological processes.`
    } else if (field === 'ai-computing') {
      content += `This advancement pushes the boundaries of what's possible in artificial intelligence and could enable new applications across industries.`
    }

    return content
  }

  private generateTransition(current: Article, next: Article): string {
    return `That's fascinating work on ${current.subfield.toLowerCase()}. Now, let's turn our attention to another important development in ${next.subfield.toLowerCase()}.`
  }

  private generateIntroduction(articles: Article[], field: AcademicField, duration: number): string {
    const fieldInfo = this.getFieldInfo(field)
    const articleTopics = articles.map(a => a.subfield).slice(0, 3).join(', ')

    return `Welcome to Bite Size ${fieldInfo.name}, your weekly dose of groundbreaking research. I'm your host, and this week we're exploring ${articles.length} remarkable advances that could transform how we understand ${articleTopics}. In the next ${duration} minutes, we'll dive into research that's pushing the boundaries of ${fieldInfo.name} and offering exciting insights into the future of the field.`
  }

  private generateConclusion(articles: Article[], field: AcademicField): string {
    const fieldInfo = this.getFieldInfo(field)
    const themes = articles.map(a => a.subfield).slice(0, 2).join(' and ')

    return `So this week in ${fieldInfo.name}, we've seen exciting developments in ${themes} that demonstrate the rapid pace of discovery in the field. Each of these studies represents not just an incremental advance, but potentially transformative insights that could shape research directions for years to come.

Looking ahead to next week, we'll be watching for early results from several clinical trials and new theoretical frameworks that could reshape our understanding. Until then, stay curious and keep pushing the boundaries of knowledge.

Thanks for joining us for Bite Size ${fieldInfo.name}. Join us next week for more cutting-edge research that matters.`
  }

  async batchGenerateSummaries(
    articles: Article[],
    options: SummaryOptions = {}
  ): Promise<GeneratedSummary[]> {
    logger.info('Starting batch summary generation', {
      articleCount: articles.length,
      options,
    })

    const summaries: GeneratedSummary[] = []

    // Process articles in parallel (in production, would respect rate limits)
    const promises = articles.map(article =>
      this.generateSummary(article, options)
    )

    try {
      const results = await Promise.allSettled(promises)

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          summaries.push(result.value)
        } else {
          logger.error('Failed to generate summary for article', {
            articleId: articles[index].id,
            error: result.reason,
          })
        }
      })

      logger.info('Batch summary generation completed', {
        successful: summaries.length,
        total: articles.length,
      })

      return summaries

    } catch (error) {
      logger.error('Critical error in batch summary generation', error)
      throw new Error(`Batch summary generation failed: ${error}`)
    }
  }
}