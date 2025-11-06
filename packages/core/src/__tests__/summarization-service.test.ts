import { describe, it, expect, beforeEach } from 'vitest'
import { SummarizationService } from '../summarize/summarization-service'
import type { Article } from '../types'

describe('SummarizationService', () => {
  let service: SummarizationService
  let mockArticle: Article

  beforeEach(() => {
    service = new SummarizationService()

    mockArticle = {
      id: 'test-article-1',
      title: 'Novel Machine Learning Techniques for Drug Discovery',
      authors: [
        { id: '1', name: 'Dr. Sarah Johnson', affiliation: 'MIT', email: 'sarah@mit.edu' },
        { id: '2', name: 'Dr. Michael Chen', affiliation: 'Stanford' },
      ],
      venue: 'Nature Biotechnology',
      venueType: 'journal',
      abstract: 'We present a novel approach to drug discovery using deep learning models. Our method demonstrates significant improvements over traditional approaches, achieving 85% accuracy in predicting drug-target interactions. This advance could accelerate the development of new therapeutics.',
      url: 'https://example.com/article',
      publishedAt: new Date(),
      field: 'life-sciences',
      subfield: 'Computational Biology',
      tags: ['machine learning', 'drug discovery', 'deep learning'],
      topics: ['AI in medicine', 'computational biology'],
      quality: 'significant',
      relevanceScore: 85,
      impactScore: 90,
      qualityScore: 88,
      noveltyScore: 85,
      openAccess: true,
      doi: '10.1038/nbt.2024.001',
      summary: '',
      keyFindings: [],
      methodology: 'Deep learning with attention mechanisms',
      whyThisMatters: '',
      readingTime: 8,
      source: 'crossref',
      fetchedAt: new Date(),
      processedAt: new Date(),
      processingStatus: 'completed',
      relatedArticles: [],
      isMockData: true,
    }
  })

  describe('generateSummary', () => {
    it('should generate a summary for an article', async () => {
      const summary = await service.generateSummary(mockArticle)

      expect(summary).toBeDefined()
      expect(summary.id).toBeDefined()
      expect(summary.articleId).toBe(mockArticle.id)
      expect(summary.summary).toBeDefined()
      expect(summary.summary.length).toBeGreaterThan(0)
      expect(summary.whyThisMatters).toBeDefined()
      expect(summary.keyFindings).toBeDefined()
      expect(summary.keyFindings.length).toBeGreaterThan(0)
    })

    it('should respect maxSummaryLength option', async () => {
      const maxLength = 200
      const summary = await service.generateSummary(mockArticle, {
        maxSummaryLength: maxLength,
      })

      expect(summary.summary.length).toBeLessThanOrEqual(maxLength)
    })

    it('should adjust complexity based on audience level', async () => {
      const beginnerSummary = await service.generateSummary(mockArticle, {
        audienceLevel: 'beginner',
      })

      const advancedSummary = await service.generateSummary(mockArticle, {
        audienceLevel: 'advanced',
      })

      expect(beginnerSummary.summary).toBeDefined()
      expect(advancedSummary.summary).toBeDefined()
    })

    it('should include reading time estimate', async () => {
      const summary = await service.generateSummary(mockArticle)

      expect(summary.readingTime).toBeGreaterThan(0)
    })

    it('should calculate quality score', async () => {
      const summary = await service.generateSummary(mockArticle)

      expect(summary.qualityScore).toBeGreaterThanOrEqual(0)
      expect(summary.qualityScore).toBeLessThanOrEqual(100)
    })
  })

  describe('generateOverviewTranscript', () => {
    it('should generate an overview transcript for multiple articles', async () => {
      const articles = [mockArticle, { ...mockArticle, id: 'article-2', title: 'Second Article' }]
      const transcript = await service.generateOverviewTranscript(articles, 'life-sciences', 12)

      expect(transcript).toBeDefined()
      expect(transcript.title).toBeDefined()
      expect(transcript.introduction).toBeDefined()
      expect(transcript.segments).toHaveLength(2)
      expect(transcript.conclusion).toBeDefined()
      expect(transcript.totalDuration).toBe(12)
    })

    it('should create transitions between segments', async () => {
      const articles = [mockArticle, { ...mockArticle, id: 'article-2' }]
      const transcript = await service.generateOverviewTranscript(articles, 'life-sciences')

      expect(transcript.segments[0].transition).toBeDefined()
    })
  })

  describe('batchGenerateSummaries', () => {
    it('should generate summaries for multiple articles', async () => {
      const articles = [
        mockArticle,
        { ...mockArticle, id: 'article-2', title: 'Second Article' },
        { ...mockArticle, id: 'article-3', title: 'Third Article' },
      ]

      const summaries = await service.batchGenerateSummaries(articles)

      expect(summaries).toHaveLength(3)
      summaries.forEach(summary => {
        expect(summary.summary).toBeDefined()
        expect(summary.whyThisMatters).toBeDefined()
      })
    })

    it('should handle errors gracefully', async () => {
      const articles = [mockArticle]
      const summaries = await service.batchGenerateSummaries(articles)

      expect(summaries.length).toBeGreaterThanOrEqual(0)
    })
  })
})
