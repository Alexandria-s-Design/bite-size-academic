import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EmailService } from '../email/email-service'
import type { User, WeeklyDigest, Article } from '../types'

describe('EmailService', () => {
  let emailService: EmailService
  let mockUser: User
  let mockDigest: WeeklyDigest
  let mockArticles: Article[]

  beforeEach(() => {
    emailService = new EmailService()

    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      field: 'ai-computing',
      confirmed: true,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      deliveryDay: 'friday',
      deliveryTime: '10:00',
      timezone: 'UTC',
      totalDigestsReceived: 0,
      totalDigestsOpened: 0,
      totalClicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user',
      isActive: true,
      subfieldInterests: [],
      tags: [],
      isMockData: true,
    }

    mockDigest = {
      id: 'digest-ai-computing-2024-W45',
      field: 'ai-computing',
      weekNumber: 45,
      year: 2024,
      publishedAt: new Date(),
      createdAt: new Date(),
      introduction: 'This week in AI & Computing...',
      featuredArticles: ['article-1', 'article-2'],
      conclusion: 'Stay curious!',
      totalArticles: 2,
      averageRelevanceScore: 85,
      averageQualityScore: 90,
      processedAt: new Date(),
      processingDuration: 5000,
      processingStatus: 'completed',
      deliveryCount: 0,
      openCount: 0,
      clickCount: 0,
      isMockData: true,
    }

    mockArticles = [
      {
        id: 'article-1',
        title: 'Advances in Large Language Models',
        authors: [{ id: 'auth-1', name: 'Dr. Jane Smith', affiliation: 'Stanford University' }],
        venue: 'Nature Machine Intelligence',
        venueType: 'journal',
        abstract: 'This paper presents novel approaches to scaling LLMs...',
        url: 'https://example.com/article-1',
        publishedAt: new Date(),
        field: 'ai-computing',
        subfield: 'Natural Language Processing',
        tags: ['LLM', 'scaling', 'transformers'],
        topics: ['machine learning', 'NLP'],
        quality: 'significant',
        relevanceScore: 85,
        impactScore: 90,
        qualityScore: 88,
        noveltyScore: 85,
        openAccess: true,
        doi: '10.1038/s42256-024-00001',
        summary: 'Researchers demonstrate new scaling laws for LLMs...',
        keyFindings: [
          'Scaling efficiency improved by 30%',
          'Novel architecture reduces training time',
        ],
        methodology: 'Empirical analysis with large-scale experiments',
        whyThisMatters: 'This advance could make AI more accessible and efficient.',
        readingTime: 8,
        source: 'arxiv',
        fetchedAt: new Date(),
        processedAt: new Date(),
        processingStatus: 'completed',
        relatedArticles: [],
        isMockData: true,
      },
    ]
  })

  describe('sendWeeklyDigest', () => {
    it('should successfully send a weekly digest email', async () => {
      const result = await emailService.sendWeeklyDigest(mockUser, mockDigest, mockArticles)

      expect(result.success).toBe(true)
      expect(result.emailId).toBeDefined()
      expect(result.deliveredAt).toBeDefined()
    })

    it('should include localFilePath in mock mode', async () => {
      const result = await emailService.sendWeeklyDigest(mockUser, mockDigest, mockArticles)

      expect(result.localFilePath).toBeDefined()
      expect(result.localFilePath).toContain('.html')
    })

    it('should handle user without name', async () => {
      const userWithoutName = { ...mockUser, name: undefined }
      const result = await emailService.sendWeeklyDigest(userWithoutName as any, mockDigest, mockArticles)

      expect(result.success).toBe(true)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with confirmation link', async () => {
      mockUser.confirmationCode = 'ABC123'
      const result = await emailService.sendWelcomeEmail(mockUser)

      expect(result.success).toBe(true)
      expect(result.emailId).toBeDefined()
    })
  })

  describe('sendConfirmationEmail', () => {
    it('should send confirmation email', async () => {
      mockUser.confirmationCode = 'XYZ789'
      const result = await emailService.sendConfirmationEmail(mockUser)

      expect(result.success).toBe(true)
    })
  })

  describe('sendPreferenceUpdateEmail', () => {
    it('should send preference update email', async () => {
      const result = await emailService.sendPreferenceUpdateEmail(mockUser)

      expect(result.success).toBe(true)
      expect(result.emailId).toBeDefined()
    })
  })
})
