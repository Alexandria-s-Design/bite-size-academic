import type { WeeklyDigest, Article, User, PodcastEpisode, ContentJob } from '../types'
import { config } from '../config'
import { createLogger, getCurrentWeekInfo } from '../utils'

const logger = createLogger('AdminService')

export interface AdminDashboardData {
  overview: {
    totalUsers: number
    weeklyDigestsSent: number
    podcastEpisodesGenerated: number
    activeSubscribers: number
    openRate: number
    clickRate: number
    conversionRate: number
  }
  recentDigests: WeeklyDigest[]
  pendingJobs: ContentJob[]
  systemHealth: {
    ingestionService: 'healthy' | 'degraded' | 'down'
    emailService: 'healthy' | 'degraded' | 'down'
    ttsService: 'healthy' | 'degraded' | 'down'
    database: 'healthy' | 'degraded' | 'down'
  }
  weeklyStats: {
    [field: string]: {
      subscribers: number
      digestsSent: number
      openRate: number
      averageReadingTime: number
    }
  }
}

export interface DigestPreview {
  digest: WeeklyDigest
  articles: Article[]
  emailPreview: {
    subject: string
    preheader: string
    htmlContent: string
    textContent: string
  }
  podcastPreview?: {
    script: string
    duration: number
    audioUrl: string
  }
  qualityMetrics: {
    relevanceScore: number
    diversityScore: number
    estimatedReadingTime: number
    qualityScore: number
  }
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'needs_review'
}

export class AdminService {
  constructor() {
    logger.info('Admin service initialized', {
      mockMode: config.mockMode,
    })
  }

  async getDashboardData(): Promise<AdminDashboardData> {
    logger.info('Fetching admin dashboard data')

    try {
      // In production, this would query the database
      // For MVP, return mock data
      return this.generateMockDashboardData()
    } catch (error) {
      logger.error('Failed to fetch dashboard data', error)
      throw new Error(`Dashboard data fetch failed: ${error}`)
    }
  }

  async getDigestPreview(
    field: string,
    weekNumber?: number,
    year?: number
  ): Promise<DigestPreview> {
    const weekInfo = weekNumber && year
      ? { weekNumber, year }
      : getCurrentWeekInfo()

    logger.info('Generating digest preview', {
      field,
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year,
    })

    try {
      // In production, this would fetch real data
      return this.generateMockDigestPreview(field, weekInfo.weekNumber, weekInfo.year)
    } catch (error) {
      logger.error('Failed to generate digest preview', { field, error })
      throw new Error(`Digest preview generation failed: ${error}`)
    }
  }

  async approveDigest(
    digestId: string,
    approvalData: {
      approved: boolean
      notes?: string
      scheduledFor?: Date
    }
  ): Promise<{ success: boolean; message: string }> {
    logger.info('Digest approval action', {
      digestId,
      approved: approvalData.approved,
      notes: approvalData.notes,
    })

    try {
      // In production, this would update the database and trigger delivery
      if (approvalData.approved) {
        // Schedule delivery
        if (approvalData.scheduledFor) {
          logger.info('Digest scheduled for delivery', {
            digestId,
            scheduledFor: approvalData.scheduledFor,
          })
        } else {
          // Send immediately
          await this.sendDigestImmediately(digestId)
        }
      } else {
        // Mark as rejected
        logger.info('Digest rejected', {
          digestId,
          notes: approvalData.notes,
        })
      }

      return {
        success: true,
        message: approvalData.approved
          ? 'Digest approved and scheduled for delivery'
          : 'Digest rejected',
      }
    } catch (error) {
      logger.error('Failed to process digest approval', { digestId, error })
      throw new Error(`Digest approval failed: ${error}`)
    }
  }

  async getUserAnalytics(filters?: {
    field?: string
    dateFrom?: Date
    dateTo?: Date
    subscriptionTier?: 'free' | 'premium'
  }): Promise<{
    totalUsers: number
    newUsers: number
    activeUsers: number
    churnedUsers: number
    subscriptionBreakdown: {
      free: number
      premium: number
    }
    fieldBreakdown: {
      [field: string]: number
    }
    engagementMetrics: {
      averageOpenRate: number
      averageClickRate: number
      averagePodcastDownloadRate: number
    }
  }> {
    logger.info('Fetching user analytics', { filters })

    try {
      return this.generateMockUserAnalytics(filters)
    } catch (error) {
      logger.error('Failed to fetch user analytics', error)
      throw new Error(`User analytics fetch failed: ${error}`)
    }
  }

  async getContentPerformance(
    weeks: number = 4
  ): Promise<{
    weeklyDigests: Array<{
      weekNumber: number
      year: number
      field: string
      sentCount: number
      openCount: number
      clickCount: number
      averageReadingTime: number
    }>
    topArticles: Array<{
      article: Article
      clickCount: number
      shareCount: number
      engagementScore: number
    }>
    fieldComparison: Array<{
      field: string
      totalDigests: number
      averageOpenRate: number
      averageClickRate: number
      subscriberGrowth: number
    }>
  }> {
    logger.info('Fetching content performance data', { weeks })

    try {
      return this.generateMockContentPerformance(weeks)
    } catch (error) {
      logger.error('Failed to fetch content performance', error)
      throw new Error(`Content performance fetch failed: ${error}`)
    }
  }

  async triggerManualDigest(
    field: string,
    options: {
      forceRegenerate?: boolean
      sendImmediately?: boolean
      testMode?: boolean
    } = {}
  ): Promise<{ success: boolean; digestId?: string; message: string }> {
    logger.info('Manual digest trigger', { field, options })

    try {
      const weekInfo = getCurrentWeekInfo()
      const digestId = `${field}-${weekInfo.year}-W${weekInfo.weekNumber.toString().padStart(2, '0')}`

      if (options.testMode) {
        logger.info('Test digest generation', { digestId })
        return {
          success: true,
          digestId,
          message: 'Test digest generated successfully (not sent)',
        }
      }

      if (options.sendImmediately) {
        await this.sendDigestImmediately(digestId)
        return {
          success: true,
          digestId,
          message: 'Digest generated and sent immediately',
        }
      }

      return {
        success: true,
        digestId,
        message: 'Digest generation initiated',
      }
    } catch (error) {
      logger.error('Failed to trigger manual digest', { field, error })
      throw new Error(`Manual digest trigger failed: ${error}`)
    }
  }

  async getSystemLogs(options: {
    level?: 'error' | 'warn' | 'info' | 'debug'
    limit?: number
    offset?: number
    service?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<Array<{
    timestamp: Date
    level: string
    service: string
    message: string
    metadata?: any
  }>> {
    logger.info('Fetching system logs', { options })

    try {
      return this.generateMockSystemLogs(options)
    } catch (error) {
      logger.error('Failed to fetch system logs', error)
      throw new Error(`System logs fetch failed: ${error}`)
    }
  }

  private async generateMockDashboardData(): Promise<AdminDashboardData> {
    return {
      overview: {
        totalUsers: 1247,
        weeklyDigestsSent: 156,
        podcastEpisodesGenerated: 89,
        activeSubscribers: 1089,
        openRate: 0.67,
        clickRate: 0.23,
        conversionRate: 0.087,
      },
      recentDigests: this.generateMockRecentDigests(),
      pendingJobs: this.generateMockPendingJobs(),
      systemHealth: {
        ingestionService: 'healthy',
        emailService: 'healthy',
        ttsService: 'healthy',
        database: 'healthy',
      },
      weeklyStats: {
        'life-sciences': {
          subscribers: 387,
          digestsSent: 45,
          openRate: 0.71,
          averageReadingTime: 12,
        },
        'ai-computing': {
          subscribers: 456,
          digestsSent: 52,
          openRate: 0.68,
          averageReadingTime: 14,
        },
        'humanities-culture': {
          subscribers: 178,
          digestsSent: 23,
          openRate: 0.62,
          averageReadingTime: 11,
        },
        'policy-governance': {
          subscribers: 134,
          digestsSent: 19,
          openRate: 0.59,
          averageReadingTime: 13,
        },
        'climate-earth-systems': {
          subscribers: 92,
          digestsSent: 17,
          openRate: 0.64,
          averageReadingTime: 15,
        },
      },
    }
  }

  private generateMockRecentDigests(): WeeklyDigest[] {
    const weekInfo = getCurrentWeekInfo()
    const digests: WeeklyDigest[] = []

    for (const field of ['life-sciences', 'ai-computing', 'humanities-culture', 'policy-governance', 'climate-earth-systems']) {
      for (let i = 0; i < 3; i++) {
        const weekOffset = i
        const year = weekOffset > (weekInfo.weekNumber - 1) ? weekInfo.year - 1 : weekInfo.year
        const week = weekOffset > (weekInfo.weekNumber - 1) ? 52 - (weekOffset - weekInfo.weekNumber) : weekInfo.weekNumber - weekOffset

        digests.push({
          id: `${field}-${year}-W${week.toString().padStart(2, '0')}`,
          field,
          weekNumber: week,
          year,
          publishedAt: new Date(year, 0, 1 + (week - 1) * 7),
          createdAt: new Date(year, 0, 1 + (week - 1) * 7 - 2),
          introduction: `This week's digest covers important developments in ${field}`,
          featuredArticles: [`article_${field}_${week}_1`, `article_${field}_${week}_2`],
          methodology: 'Content curation based on relevance and quality',
          conclusion: 'Stay tuned for next week\'s developments',
          totalArticles: 4,
          averageRelevanceScore: 85 + Math.random() * 10,
          averageQualityScore: 80 + Math.random() * 15,
          processedAt: new Date(year, 0, 1 + (week - 1) * 7 - 1),
          processingDuration: 120000 + Math.random() * 300000,
          processingStatus: 'completed',
          sentAt: new Date(year, 0, 1 + (week - 1) * 7 + 1),
          deliveryCount: Math.floor(100 + Math.random() * 500),
          openCount: Math.floor(50 + Math.random() * 300),
          clickCount: Math.floor(10 + Math.random() * 100),
          isMockData: true,
        })
      }
    }

    return digests.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, 10)
  }

  private generateMockPendingJobs(): ContentJob[] {
    return [
      {
        id: 'job_001',
        jobType: 'weekly-digest',
        field: 'life-sciences',
        status: 'running',
        scheduledAt: new Date(),
        startedAt: new Date(Date.now() - 300000),
        createdAt: new Date(Date.now() - 600000),
        maxRetries: 3,
        retryCount: 0,
        dependsOn: [],
        triggers: ['weekly-schedule'],
      },
      {
        id: 'job_002',
        jobType: 'podcast-generation',
        field: 'ai-computing',
        status: 'pending',
        scheduledAt: new Date(Date.now() + 300000),
        createdAt: new Date(Date.now() - 120000),
        maxRetries: 3,
        retryCount: 0,
        dependsOn: ['job_003'],
        triggers: ['weekly-schedule'],
      },
    ]
  }

  private generateMockDigestPreview(field: string, weekNumber: number, year: number): DigestPreview {
    const mockArticles = this.generateMockArticles(field)
    const mockDigest = {
      id: `${field}-${year}-W${weekNumber.toString().padStart(2, '0')}`,
      field,
      weekNumber,
      year,
      publishedAt: new Date(),
      createdAt: new Date(),
      introduction: `This week in ${field.replace('-', ' ')} brings exciting developments that could transform our understanding of current research trends.`,
      featuredArticles: mockArticles.map(a => a.id),
      methodology: 'Content curated based on relevance scores and quality metrics',
      conclusion: 'These findings highlight the dynamic nature of academic research and suggest promising directions for future investigation.',
      totalArticles: mockArticles.length,
      averageRelevanceScore: 87,
      averageQualityScore: 83,
      processedAt: new Date(),
      processingDuration: 180000,
      processingStatus: 'completed',
      isMockData: true,
    }

    return {
      digest: mockDigest,
      articles: mockArticles,
      emailPreview: {
        subject: `🧬 ${field.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}: Research Highlights This Week`,
        preheader: `Research highlights from top journals shape the future of ${field.replace('-', ' ')}`,
        htmlContent: this.generateMockEmailHTML(mockDigest, mockArticles),
        textContent: this.generateMockEmailText(mockDigest, mockArticles),
      },
      podcastPreview: {
        script: this.generateMockPodcastScript(mockDigest, mockArticles),
        duration: 12,
        audioUrl: 'https://example.com/audio/mock-episode.mp3',
      },
      qualityMetrics: {
        relevanceScore: 87,
        diversityScore: 75,
        estimatedReadingTime: 14,
        qualityScore: 83,
      },
      approvalStatus: 'pending',
    }
  }

  private generateMockArticles(field: string): Article[] {
    return [
      {
        id: `article_${field}_1`,
        title: `Breakthrough Research in ${field.replace('-', ' ')}`,
        authors: [
          { id: 'author_1', name: 'Dr. Jane Smith', affiliation: 'Stanford University' },
          { id: 'author_2', name: 'Prof. John Doe', affiliation: 'MIT' },
        ],
        venue: 'Nature',
        venueType: 'journal',
        abstract: 'This groundbreaking research presents significant advances in the field...',
        url: 'https://example.com/article1',
        publishedAt: new Date(),
        field,
        subfield: 'Advanced Studies',
        tags: ['research', 'innovation', 'breakthrough'],
        topics: ['scientific advancement', 'methodology'],
        quality: 'breakthrough',
        relevanceScore: 92,
        impactScore: 89,
        qualityScore: 90,
        noveltyScore: 88,
        openAccess: true,
        summary: 'Researchers demonstrate significant breakthroughs in...',
        keyFindings: ['Finding 1', 'Finding 2', 'Finding 3'],
        whyThisMatters: 'This research has important implications for the future of the field.',
        readingTime: 6,
        source: 'nature',
        fetchedAt: new Date(),
        processedAt: new Date(),
        processingStatus: 'completed',
        relatedArticles: [],
        isMockData: true,
      },
      {
        id: `article_${field}_2`,
        title: `Innovative Methodology in ${field.replace('-', ' ')}`,
        authors: [
          { id: 'author_3', name: 'Dr. Alice Johnson', affiliation: 'Harvard University' },
        ],
        venue: 'Science',
        venueType: 'journal',
        abstract: 'An innovative approach to research methodology...',
        url: 'https://example.com/article2',
        publishedAt: new Date(),
        field,
        subfield: 'Methodological Advances',
        tags: ['methodology', 'innovation', 'technique'],
        topics: ['research methods', 'data analysis'],
        quality: 'significant',
        relevanceScore: 85,
        impactScore: 82,
        qualityScore: 87,
        noveltyScore: 83,
        openAccess: false,
        summary: 'The study presents a novel methodology for...',
        keyFindings: ['Method 1', 'Method 2'],
        whyThisMatters: 'This approach could streamline research processes.',
        readingTime: 5,
        source: 'science',
        fetchedAt: new Date(),
        processedAt: new Date(),
        processingStatus: 'completed',
        relatedArticles: [],
        isMockData: true,
      },
    ]
  }

  private generateMockEmailHTML(digest: WeeklyDigest, articles: Article[]): string {
    return `
<!DOCTYPE html>
<html>
<head><title>Weekly ${digest.field} Digest</title></head>
<body>
  <h1>🧬 Bite Size ${digest.field.replace('-', ' ')}</h1>
  <p>This week's research highlights</p>
  ${articles.map(article => `
    <div>
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <p><strong>Why this matters:</strong> ${article.whyThisMatters}</p>
    </div>
  `).join('')}
</body>
</html>`
  }

  private generateMockEmailText(digest: WeeklyDigest, articles: Article[]): string {
    return `
Bite Size ${digest.field.replace('-', ' ')} - Weekly Digest

${articles.map(article => `
${article.title}

${article.summary}

Why this matters: ${article.whyThisMatters}
`).join('\n')}
`
  }

  private generateMockPodcastScript(digest: WeeklyDigest, articles: Article[]): string {
    return `
# Episode Title: ${digest.field} Research Highlights

## Introduction
Welcome to Bite Size ${digest.field.replace('-', ' ')}. This week we're covering ${articles.length} exciting developments.

## Segments
${articles.map((article, index) => `
### Segment ${index + 1}: ${article.title}
${article.summary}

Why this matters: ${article.whyThisMatters}
`).join('\n')}

## Conclusion
Join us next week for more cutting-edge research.
`
  }

  private async sendDigestImmediately(digestId: string): Promise<void> {
    logger.info('Sending digest immediately', { digestId })
    // In production, this would trigger the email sending process
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  private generateMockUserAnalytics(filters?: any): any {
    return {
      totalUsers: 1247,
      newUsers: 45,
      activeUsers: 1089,
      churnedUsers: 8,
      subscriptionBreakdown: {
        free: 1138,
        premium: 109,
      },
      fieldBreakdown: {
        'life-sciences': 387,
        'ai-computing': 456,
        'humanities-culture': 178,
        'policy-governance': 134,
        'climate-earth-systems': 92,
      },
      engagementMetrics: {
        averageOpenRate: 0.67,
        averageClickRate: 0.23,
        averagePodcastDownloadRate: 0.34,
      },
    }
  }

  private generateMockContentPerformance(weeks: number): any {
    return {
      weeklyDigests: [
        {
          weekNumber: 3,
          year: 2024,
          field: 'life-sciences',
          sentCount: 387,
          openCount: 275,
          clickCount: 89,
          averageReadingTime: 12,
        },
        {
          weekNumber: 3,
          year: 2024,
          field: 'ai-computing',
          sentCount: 456,
          openCount: 310,
          clickCount: 105,
          averageReadingTime: 14,
        },
      ],
      topArticles: [
        {
          article: {
            id: 'top_article_1',
            title: 'Breakthrough Research in AI',
            authors: [],
            venue: 'Nature',
            venueType: 'journal',
            abstract: '',
            url: '',
            publishedAt: new Date(),
            field: 'ai-computing',
            subfield: '',
            tags: [],
            topics: [],
            quality: 'breakthrough',
            relevanceScore: 95,
            impactScore: 92,
            qualityScore: 90,
            noveltyScore: 93,
            openAccess: true,
            summary: '',
            keyFindings: [],
            whyThisMatters: '',
            readingTime: 8,
            source: 'nature',
            fetchedAt: new Date(),
            processedAt: new Date(),
            processingStatus: 'completed',
            relatedArticles: [],
            isMockData: true,
          },
          clickCount: 145,
          shareCount: 23,
          engagementScore: 89,
        },
      ],
      fieldComparison: [
        {
          field: 'ai-computing',
          totalDigests: 52,
          averageOpenRate: 0.68,
          averageClickRate: 0.23,
          subscriberGrowth: 12.5,
        },
        {
          field: 'life-sciences',
          totalDigests: 45,
          averageOpenRate: 0.71,
          averageClickRate: 0.25,
          subscriberGrowth: 8.3,
        },
      ],
    }
  }

  private generateMockSystemLogs(options?: any): Array<any> {
    return [
      {
        timestamp: new Date(),
        level: 'info',
        service: 'email-service',
        message: 'Weekly digest sent successfully',
        metadata: { digestId: 'digest_001', recipientCount: 456 },
      },
      {
        timestamp: new Date(Date.now() - 300000),
        level: 'warn',
        service: 'tts-service',
        message: 'TTS processing took longer than expected',
        metadata: { duration: 45000, episodeId: 'episode_001' },
      },
      {
        timestamp: new Date(Date.now() - 600000),
        level: 'error',
        service: 'ingestion-service',
        message: 'Failed to fetch from arXiv API',
        metadata: { error: 'Rate limit exceeded', retryCount: 2 },
      },
    ]
  }
}