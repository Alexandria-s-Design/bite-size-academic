import type { Article, AcademicField, ContentSource } from '../types'
import { config } from '../config'
import { createLogger, delay } from '../utils'
import { ArXivAdapter } from './arxiv-adapter'
import { CrossrefAdapter } from './crossref-adapter'

const logger = createLogger('ContentIngestionService')

// Import other adapters (will be implemented later)
// import { PubMedAdapter } from './pubmed-adapter'
// import { SemanticScholarAdapter } from './semantic-scholar-adapter'
// import { RSSAdapter } from './rss-adapter'

export interface IngestionOptions {
  maxArticlesPerSource?: number
  maxTotalArticles?: number
  minRelevanceScore?: number
  excludeOlderThanDays?: number
  includePreprints?: boolean
}

export class ContentIngestionService {
  private arxivAdapter: ArXivAdapter
  private crossrefAdapter: CrossrefAdapter
  // private pubmedAdapter: PubMedAdapter
  // private semanticScholarAdapter: SemanticScholarAdapter
  // private rssAdapter: RSSAdapter

  constructor() {
    this.arxivAdapter = new ArXivAdapter()
    this.crossrefAdapter = new CrossrefAdapter()
    // this.pubmedAdapter = new PubMedAdapter()
    // this.semanticScholarAdapter = new SemanticScholarAdapter()
    // this.rssAdapter = new RSSAdapter()

    logger.info('Content ingestion service initialized', {
      mockMode: config.mockMode,
      enabledAdapters: ['arxiv', 'crossref'],
    })
  }

  async ingestArticles(
    field: AcademicField,
    options: IngestionOptions = {}
  ): Promise<Article[]> {
    const {
      maxArticlesPerSource = 25,
      maxTotalArticles = 100,
      minRelevanceScore = 0,
      excludeOlderThanDays = 14,
      includePreprints = true,
    } = options

    logger.info('Starting article ingestion', { field, options })

    try {
      // Initialize all adapters in parallel
      const ingestionPromises = this.initializeIngestionTasks(field, maxArticlesPerSource)

      // Wait for all sources to complete
      const results = await Promise.allSettled(ingestionPromises)

      // Combine successful results
      const allArticles: Article[] = []
      const errors: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value)
        } else {
          const adapterName = this.getAdapterName(index)
          errors.push(`${adapterName}: ${result.reason}`)
          logger.error(`Failed to ingest from ${adapterName}`, result.reason)
        }
      })

      logger.info('Article ingestion completed', {
        field,
        totalArticles: allArticles.length,
        errors: errors.length,
      })

      // Filter and deduplicate articles
      const filteredArticles = this.filterArticles(allArticles, {
        maxTotal: maxTotalArticles,
        minRelevanceScore,
        excludeOlderThanDays,
        includePreprints,
      })

      logger.info('Articles filtered and deduplicated', {
        field,
        finalCount: filteredArticles.length,
        originalCount: allArticles.length,
      })

      return filteredArticles

    } catch (error) {
      logger.error('Critical error during article ingestion', error)
      throw new Error(`Content ingestion failed: ${error}`)
    }
  }

  private initializeIngestionTasks(field: string, maxArticles: number): Promise<Article[]>[] {
    const tasks: Promise<Article[]>[] = []

    // ArXiv adapter
    tasks.push(this.arxivAdapter.fetchArticles(field, maxArticles))

    // Crossref adapter
    tasks.push(this.crossrefAdapter.fetchArticles(field, maxArticles))

    // TODO: Add other adapters when implemented
    // tasks.push(this.pubmedAdapter.fetchArticles(field, maxArticles))
    // tasks.push(this.semanticScholarAdapter.fetchArticles(field, maxArticles))
    // tasks.push(this.rssAdapter.fetchArticles(field, maxArticles))

    return tasks
  }

  private getAdapterName(index: number): string {
    const adapterNames = ['ArXiv', 'Crossref', 'PubMed', 'Semantic Scholar', 'RSS']
    return adapterNames[index] || 'Unknown'
  }

  private filterArticles(
    articles: Article[],
    options: {
      maxTotal: number
      minRelevanceScore: number
      excludeOlderThanDays: number
      includePreprints: boolean
    }
  ): Article[] {
    const { maxTotal, minRelevanceScore, excludeOlderThanDays, includePreprints } = options

    // 1. Remove duplicates based on DOI, title, or URL
    const deduplicated = this.deduplicateArticles(articles)

    // 2. Filter by date
    const cutoffDate = new Date(Date.now() - excludeOlderThanDays * 24 * 60 * 60 * 1000)
    const dateFiltered = deduplicated.filter(article =>
      new Date(article.publishedAt) >= cutoffDate
    )

    // 3. Filter by preprint preference
    const venueFiltered = includePreprints
      ? dateFiltered
      : dateFiltered.filter(article => article.venueType !== 'preprint')

    // 4. Filter by relevance score
    const qualityFiltered = venueFiltered.filter(article =>
      article.relevanceScore >= minRelevanceScore
    )

    // 5. Sort by relevance and quality
    const sorted = qualityFiltered.sort((a, b) => {
      // Primary sort: relevance score
      const relevanceDiff = b.relevanceScore - a.relevanceScore
      if (relevanceDiff !== 0) return relevanceDiff

      // Secondary sort: quality score
      const qualityDiff = b.qualityScore - a.qualityScore
      if (qualityDiff !== 0) return qualityDiff

      // Tertiary sort: publication date (more recent first)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })

    // 6. Limit to max total articles
    return sorted.slice(0, maxTotal)
  }

  private deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Set<string>()
    const deduplicated: Article[] = []

    for (const article of articles) {
      // Create a unique key based on DOI, title similarity, or URL
      const dedupeKey = this.getDedupeKey(article)

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey)
        deduplicated.push(article)
      } else {
        // If we've seen this article, potentially merge information
        this.mergeArticleInfo(deduplicated, article)
      }
    }

    return deduplicated
  }

  private getDedupeKey(article: Article): string {
    // Priority order for deduplication keys
    if (article.doi) return `doi:${article.doi}`
    if (article.arxivId) return `arxiv:${article.arxivId}`
    if (article.pubmedId) return `pubmed:${article.pubmedId}`

    // Fallback to normalized title
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return `title:${normalizedTitle}`
  }

  private mergeArticleInfo(existing: Article[], duplicate: Article): void {
    // Find the existing article to merge with
    const existingIndex = existing.findIndex(
      article => this.getDedupeKey(article) === this.getDedupeKey(duplicate)
    )

    if (existingIndex === -1) return

    const existingArticle = existing[existingIndex]

    // Merge information, preferring higher quality data
    if (duplicate.qualityScore > existingArticle.qualityScore) {
      // Replace with higher quality version, but preserve some metadata
      const preserveFields = ['id', 'fetchedAt', 'processingStatus']
      const preserved: Partial<Article> = {}

      preserveFields.forEach(field => {
        if (existingArticle[field as keyof Article]) {
          preserved[field as keyof Article] = existingArticle[field as keyof Article]
        }
      })

      Object.assign(existingArticle, duplicate, preserved)
    }

    // Merge related articles
    if (duplicate.relatedArticles.length > 0) {
      existingArticle.relatedArticles = [
        ...new Set([...existingArticle.relatedArticles, ...duplicate.relatedArticles])
      ]
    }

    // Merge tags and topics
    existingArticle.tags = [...new Set([...existingArticle.tags, ...duplicate.tags])]
    existingArticle.topics = [...new Set([...existingArticle.topics, ...duplicate.topics])]
  }

  async getIngestionStats(field: AcademicField): Promise<{
    totalArticles: number
    sourcesBreakdown: Record<ContentSource, number>
    venueTypeBreakdown: Record<string, number>
    qualityDistribution: Record<string, number>
    averageRelevanceScore: number
    dateRange: { oldest: Date; newest: Date }
  }> {
    logger.info('Generating ingestion statistics', { field })

    try {
      // Ingest a sample of articles to generate stats
      const sampleArticles = await this.ingestArticles(field, {
        maxArticlesPerSource: 10,
        maxTotalArticles: 50,
      })

      const sourcesBreakdown: Record<ContentSource, number> = {} as any
      const venueTypeBreakdown: Record<string, number> = {}
      const qualityDistribution: Record<string, number> = {}

      let totalRelevanceScore = 0
      let oldestDate = new Date()
      let newestDate = new Date(0)

      sampleArticles.forEach(article => {
        // Sources breakdown
        sourcesBreakdown[article.source] = (sourcesBreakdown[article.source] || 0) + 1

        // Venue type breakdown
        venueTypeBreakdown[article.venueType] = (venueTypeBreakdown[article.venueType] || 0) + 1

        // Quality distribution
        qualityDistribution[article.quality] = (qualityDistribution[article.quality] || 0) + 1

        // Relevance scores
        totalRelevanceScore += article.relevanceScore

        // Date range
        const publishedDate = new Date(article.publishedAt)
        if (publishedDate < oldestDate) oldestDate = publishedDate
        if (publishedDate > newestDate) newestDate = publishedDate
      })

      const stats = {
        totalArticles: sampleArticles.length,
        sourcesBreakdown,
        venueTypeBreakdown,
        qualityDistribution,
        averageRelevanceScore: sampleArticles.length > 0 ? totalRelevanceScore / sampleArticles.length : 0,
        dateRange: { oldest: oldestDate, newest: newestDate },
      }

      logger.info('Ingestion statistics generated', { field, stats })
      return stats

    } catch (error) {
      logger.error('Failed to generate ingestion statistics', error)
      throw new Error(`Statistics generation failed: ${error}`)
    }
  }

  async validateIngestionConfiguration(field: AcademicField): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
    adapterStatus: Record<string, { available: boolean; error?: string }>
  }> {
    logger.info('Validating ingestion configuration', { field })

    const errors: string[] = []
    const warnings: string[] = []
    const adapterStatus: Record<string, { available: boolean; error?: string }> = {}

    try {
      // Test ArXiv adapter
      try {
        await this.arxivAdapter.fetchArticles(field, 1)
        adapterStatus.arxiv = { available: true }
      } catch (error) {
        adapterStatus.arxiv = { available: false, error: String(error) }
        errors.push(`ArXiv adapter failed: ${error}`)
      }

      // Test Crossref adapter
      try {
        await this.crossrefAdapter.fetchArticles(field, 1)
        adapterStatus.crossref = { available: true }
      } catch (error) {
        adapterStatus.crossref = { available: false, error: String(error) }
        errors.push(`Crossref adapter failed: ${error}`)
      }

      // Check if field is valid
      const validFields = ['life-sciences', 'ai-computing', 'humanities-culture', 'policy-governance', 'climate-earth-systems']
      if (!validFields.includes(field)) {
        errors.push(`Invalid field: ${field}`)
      }

      // Check configuration
      if (config.mockMode) {
        warnings.push('Running in mock mode - using simulated data')
      }

      const validation = {
        valid: errors.length === 0,
        errors,
        warnings,
        adapterStatus,
      }

      logger.info('Ingestion configuration validation completed', { field, validation })
      return validation

    } catch (error) {
      logger.error('Critical error during configuration validation', error)
      return {
        valid: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
        adapterStatus: {},
      }
    }
  }

  // Helper method to get available sources for a field
  getAvailableSources(field: AcademicField): ContentSource[] {
    // Based on field, determine which sources are most relevant
    const allSources: ContentSource[] = ['arxiv', 'crossref']

    // Field-specific source recommendations
    const fieldSources: Record<string, ContentSource[]> = {
      'life-sciences': ['crossref', 'arxiv'], // Crossref better for life sciences
      'ai-computing': ['arxiv', 'crossref'], // ArXiv excellent for AI/ML
      'humanities-culture': ['crossref'], // Limited ArXiv coverage
      'policy-governance': ['crossref'], // Limited ArXiv coverage
      'climate-earth-systems': ['crossref', 'arxiv'], // Both sources good
    }

    return fieldSources[field] || allSources
  }

  // Helper method to estimate ingestion time
  estimateIngestionTime(
    field: AcademicField,
    articleCount: number = 50
  ): { estimatedMinutes: number; description: string } {
    const sources = this.getAvailableSources(field)
    const articlesPerSource = Math.ceil(articleCount / sources.length)

    // Base time per source (network + processing)
    const baseTimePerSource = 2 // minutes
    const processingTimePerArticle = 0.1 // minutes

    const totalMinutes = sources.length * baseTimePerSource + articleCount * processingTimePerArticle

    return {
      estimatedMinutes: Math.ceil(totalMinutes),
      description: `Estimated ${Math.ceil(totalMinutes)} minutes to fetch ${articleCount} articles from ${sources.length} sources`,
    }
  }
}