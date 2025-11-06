import { describe, it, expect, beforeEach } from 'vitest'
import { ContentIngestionService } from '../ingestion/content-ingestion-service'

describe('ContentIngestionService', () => {
  let service: ContentIngestionService

  beforeEach(() => {
    service = new ContentIngestionService()
  })

  describe('ingestArticles', () => {
    it('should ingest articles for a given field', async () => {
      const articles = await service.ingestArticles('ai-computing', {
        maxArticlesPerSource: 10,
        maxTotalArticles: 20,
        minRelevanceScore: 60,
      })

      expect(articles).toBeDefined()
      expect(Array.isArray(articles)).toBe(true)
      expect(articles.length).toBeGreaterThan(0)
      expect(articles.length).toBeLessThanOrEqual(20)
    })

    it('should filter articles by relevance score', async () => {
      const articles = await service.ingestArticles('life-sciences', {
        minRelevanceScore: 70,
      })

      articles.forEach(article => {
        expect(article.relevanceScore).toBeGreaterThanOrEqual(70)
      })
    })

    it('should deduplicate articles', async () => {
      const articles = await service.ingestArticles('ai-computing')
      const uniqueIds = new Set(articles.map(a => a.id))

      expect(uniqueIds.size).toBe(articles.length)
    })

    it('should sort articles by relevance and quality', async () => {
      const articles = await service.ingestArticles('life-sciences')

      for (let i = 1; i < articles.length; i++) {
        const prevScore = articles[i - 1].relevanceScore
        const currScore = articles[i].relevanceScore
        expect(prevScore).toBeGreaterThanOrEqual(currScore)
      }
    })
  })

  describe('getIngestionStats', () => {
    it('should generate ingestion statistics', async () => {
      const stats = await service.getIngestionStats('ai-computing')

      expect(stats).toBeDefined()
      expect(stats.totalArticles).toBeGreaterThan(0)
      expect(stats.sourcesBreakdown).toBeDefined()
      expect(stats.averageRelevanceScore).toBeGreaterThan(0)
    })
  })

  describe('validateIngestionConfiguration', () => {
    it('should validate ingestion configuration', async () => {
      const validation = await service.validateIngestionConfiguration('ai-computing')

      expect(validation).toBeDefined()
      expect(validation.valid).toBeDefined()
      expect(validation.errors).toBeDefined()
      expect(validation.warnings).toBeDefined()
      expect(validation.adapterStatus).toBeDefined()
    })

    it('should detect invalid field', async () => {
      const validation = await service.validateIngestionConfiguration('invalid-field' as any)

      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })

  describe('getAvailableSources', () => {
    it('should return available sources for field', () => {
      const sources = service.getAvailableSources('ai-computing')

      expect(sources).toBeDefined()
      expect(Array.isArray(sources)).toBe(true)
      expect(sources.length).toBeGreaterThan(0)
      expect(sources).toContain('arxiv')
    })
  })

  describe('estimateIngestionTime', () => {
    it('should estimate ingestion time', () => {
      const estimate = service.estimateIngestionTime('ai-computing', 50)

      expect(estimate).toBeDefined()
      expect(estimate.estimatedMinutes).toBeGreaterThan(0)
      expect(estimate.description).toBeDefined()
    })
  })
})
