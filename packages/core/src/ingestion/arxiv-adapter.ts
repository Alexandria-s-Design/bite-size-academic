import type { Article, ContentSource } from '../types'
import { config } from '../config'
import { generateArticleId, createLogger, delay, retry } from '../utils'

const logger = createLogger('ArXivAdapter')

// Mock arXiv API response structure
interface MockArXivResponse {
  id: string
  title: string
  summary: string
  published: string
  updated: string
  authors: Array<{
    name: string
    affiliation?: string
  }>
  link: string
  primary_category: {
    term: string
    scheme: string
  }
  categories: string[]
}

export class ArXivAdapter {
  private readonly baseUrl = 'http://export.arxiv.org/api/query'
  private readonly maxRetries = 3
  private readonly delayBetweenRequests = 1000 // 1 second

  constructor() {
    logger.info('ArXiv adapter initialized', {
      mockMode: config.mockMode,
      baseUrl: this.baseUrl,
    })
  }

  async fetchArticles(field: string, maxResults = 50): Promise<Article[]> {
    if (config.mockMode) {
      return this.fetchMockArticles(field, maxResults)
    }

    return retry(
      () => this.fetchRealArticles(field, maxResults),
      this.maxRetries,
      2000
    )
  }

  private async fetchRealArticles(field: string, maxResults: number): Promise<Article[]> {
    try {
      const searchQuery = this.buildSearchQuery(field)
      const url = `${this.baseUrl}?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`

      logger.info('Fetching articles from arXiv', { field, url })

      // In a real implementation, you would use fetch or axios here
      // For now, we'll simulate the API call
      await delay(1500) // Simulate network delay

      const mockResponse = await this.simulateArXivResponse(field, maxResults)
      return this.parseArXivResponse(mockResponse, field)

    } catch (error) {
      logger.error('Failed to fetch articles from arXiv', error)
      throw new Error(`ArXiv API error: ${error}`)
    }
  }

  private async fetchMockArticles(field: string, maxResults: number): Promise<Article[]> {
    logger.info('Using mock data for arXiv articles', { field, maxResults })

    // Load from fixtures or generate mock data
    const mockData = await this.loadMockFixtures(field, maxResults)
    return this.parseArXivResponse(mockData, field)
  }

  private buildSearchQuery(field: string): string {
    const fieldQueries: Record<string, string> = {
      'ai-computing': 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV OR cat:cs.RO',
      'life-sciences': 'cat:q-bio OR cat:stat.ML OR cat:cs.NE OR cat:physics.bio-ph',
      'climate-earth-systems': 'cat:physics.ao-ph OR cat:physics.geo-ph OR cat:q-bio.PE',
      'humanities-culture': 'cat:cs.CL OR cat:cs.IR OR cat:cs.DL', // Limited arXiv coverage
      'policy-governance': 'cat:cs.CY OR cat:cs.GT', // Limited arXiv coverage
    }

    return fieldQueries[field] || 'all'
  }

  private async simulateArXivResponse(field: string, maxResults: number): Promise<MockArXivResponse[]> {
    // Simulate realistic arXiv response data
    const mockArticles: MockArXivResponse[] = []

    const fieldTemplates = {
      'ai-computing': [
        {
          title: 'Large Language Models Show Emergent Mathematical Reasoning Abilities',
          summary: 'We demonstrate that scale alone can produce unexpected mathematical reasoning capabilities in language models without explicit training. Our analysis of models ranging from 1B to 175B parameters reveals a sharp phase transition in mathematical problem-solving ability that emerges around 70B parameters.',
          authors: ['Alex Kumar', 'Lisa Zhang', 'Michael Johnson'],
          categories: ['cs.AI', 'cs.LG'],
        },
        {
          title: 'Efficient Fine-Tuning of Pretrained Models for Domain Adaptation',
          summary: 'We propose a novel parameter-efficient fine-tuning method that adapts large pretrained models to new domains using only 0.1% of trainable parameters. Our approach achieves comparable performance to full fine-tuning while reducing computational costs by three orders of magnitude.',
          authors: ['Sarah Chen', 'David Liu', 'Emma Wilson'],
          categories: ['cs.CL', 'cs.LG'],
        },
      ],
      'life-sciences': [
        {
          title: 'CRISPR Gene Editing Shows Promise for Rare Genetic Disorders',
          summary: 'Researchers demonstrate successful gene editing in patient-derived cells, showing potential therapeutic applications for three rare genetic conditions. The study utilized CRISPR-Cas9 to correct pathogenic mutations with 78% efficiency and no detectable off-target effects.',
          authors: ['Sarah Chen, PhD', 'Michael Rodriguez, MD', 'Emma Thompson, PhD'],
          categories: ['q-bio.GN', 'q-bio.MN'],
        },
        {
          title: 'Machine Learning Predicts Protein Structure from Sequence Data',
          summary: 'We present a deep learning approach that predicts 3D protein structures with atomic-level accuracy using only amino acid sequence information. Our method achieves state-of-the-art results on benchmark datasets and successfully predicts structures for previously unsolved proteins.',
          authors: ['James Wilson', 'Maria Garcia', 'Robert Taylor'],
          categories: ['q-bio.BM', 'cs.LG'],
        },
      ],
    }

    const templates = fieldTemplates[field as keyof typeof fieldTemplates] || fieldTemplates['ai-computing']

    for (let i = 0; i < Math.min(maxResults, templates.length); i++) {
      const template = templates[i % templates.length]
      const id = `arxiv_${Date.now()}_${i}`

      mockArticles.push({
        id,
        title: template.title,
        summary: template.summary,
        published: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated: new Date().toISOString(),
        authors: template.authors.map(name => ({ name })),
        link: `https://arxiv.org/abs/${id}`,
        primary_category: {
          term: template.categories[0],
          scheme: 'http://arxiv.org/schemas/atom',
        },
        categories: template.categories,
      })
    }

    return mockArticles
  }

  private async loadMockFixtures(field: string, maxResults: number): Promise<MockArXivResponse[]> {
    try {
      // In a real implementation, you would load from files
      // For now, generate realistic mock data
      return this.simulateArXivResponse(field, maxResults)
    } catch (error) {
      logger.warn('Failed to load fixtures, generating mock data', { field, error })
      return this.simulateArXivResponse(field, maxResults)
    }
  }

  private parseArXivResponse(response: MockArXivResponse[], field: string): Article[] {
    return response.map((item) => {
      const publishedAt = new Date(item.published)
      const readingTime = this.estimateReadingTime(item.summary)

      return {
        id: generateArticleId('arxiv', item.id),
        title: item.title,
        authors: item.authors.map(author => ({
          id: generateId('author'),
          name: author.name,
          affiliation: author.affiliation,
        })),
        venue: 'arXiv.org',
        venueType: 'preprint' as const,
        abstract: item.summary,
        url: item.link,
        publishedAt,
        field,
        subfield: this.extractSubfield(item.categories, field),
        tags: this.extractTags(item.categories),
        topics: this.extractTopics(item.summary),

        // Quality scores (mock for now)
        quality: this.assessQuality(item),
        relevanceScore: 0, // Will be calculated later
        impactScore: this.assessImpact(item),
        qualityScore: this.assessQualityScore(item),
        noveltyScore: this.assessNovelty(item),

        // Access information
        openAccess: true, // arXiv is always open access
        arxivId: item.id,

        // Content analysis (mock for now)
        summary: this.generateSummary(item.summary),
        keyFindings: this.extractKeyFindings(item.summary),
        methodology: this.extractMethodology(item.summary),
        limitations: this.extractLimitations(item.summary),
        whyThisMatters: this.generateWhyThisMatters(item, field),
        readingTime,

        // Processing metadata
        source: 'arxiv' as ContentSource,
        fetchedAt: new Date(),
        processedAt: new Date(),
        processingStatus: 'completed' as const,

        // Related content (mock for now)
        relatedArticles: [],

        // Mock data indicators
        isMockData: config.mockMode,
        mockDataSource: 'arxiv-adapter',
      }
    })
  }

  private estimateReadingTime(text: string): number {
    const wordsPerMinute = 250
    const words = text.trim().split(/\s+/).length
    return Math.max(3, Math.ceil(words / wordsPerMinute))
  }

  private extractSubfield(categories: string[], field: string): string {
    const subfieldMap: Record<string, Record<string, string>> = {
      'ai-computing': {
        'cs.AI': 'Artificial Intelligence',
        'cs.LG': 'Machine Learning',
        'cs.CL': 'Natural Language Processing',
        'cs.CV': 'Computer Vision',
        'cs.RO': 'Robotics',
      },
      'life-sciences': {
        'q-bio.GN': 'Genetics',
        'q-bio.MN': 'Molecular Networks',
        'q-bio.BM': 'Biomolecules',
        'q-bio.CB': 'Cell Behavior',
        'q-bio.PE': 'Populations and Evolution',
      },
    }

    const fieldMap = subfieldMap[field]
    if (!fieldMap) return 'General'

    for (const category of categories) {
      if (fieldMap[category]) {
        return fieldMap[category]
      }
    }

    return 'General'
  }

  private extractTags(categories: string[]): string[] {
    // Map arXiv categories to user-friendly tags
    const tagMap: Record<string, string> = {
      'cs.AI': 'artificial-intelligence',
      'cs.LG': 'machine-learning',
      'cs.CL': 'natural-language-processing',
      'cs.CV': 'computer-vision',
      'cs.RO': 'robotics',
      'q-bio.GN': 'genetics',
      'q-bio.MN': 'molecular-networks',
      'q-bio.BM': 'biomolecules',
      'q-bio.CB': 'cell-biology',
      'q-bio.PE': 'evolution',
    }

    return categories
      .map(cat => tagMap[cat])
      .filter(Boolean)
  }

  private extractTopics(abstract: string): string[] {
    // Simple topic extraction based on keyword patterns
    const topicPatterns = [
      'machine learning',
      'deep learning',
      'neural network',
      'artificial intelligence',
      'crispr',
      'gene editing',
      'protein structure',
      'drug discovery',
      'climate change',
      'renewable energy',
    ]

    const topics: string[] = []
    const lowerAbstract = abstract.toLowerCase()

    for (const pattern of topicPatterns) {
      if (lowerAbstract.includes(pattern)) {
        topics.push(pattern)
      }
    }

    return topics
  }

  private assessQuality(item: MockArXivResponse): 'breakthrough' | 'significant' | 'important' | 'notable' | 'incremental' {
    // Mock quality assessment based on various factors
    const hasMultipleCategories = item.categories.length > 1
    const hasLongAbstract = item.summary.length > 500
    const hasMultipleAuthors = item.authors.length > 2

    if (hasMultipleCategories && hasLongAbstract && hasMultipleAuthors) {
      return 'significant'
    } else if (hasLongAbstract || hasMultipleAuthors) {
      return 'important'
    } else {
      return 'notable'
    }
  }

  private assessImpact(item: MockArXivResponse): number {
    // Mock impact assessment (0-100)
    let score = 50 // Base score

    // Factor in number of categories (interdisciplinary work)
    score += Math.min(item.categories.length * 5, 15)

    // Factor in abstract length (detailed research)
    score += Math.min(item.summary.length / 50, 20)

    // Factor in number of authors (collaborative work)
    score += Math.min(item.authors.length * 2, 10)

    // Add some randomness for realism
    score += Math.random() * 10

    return Math.min(100, Math.max(0, score))
  }

  private assessQualityScore(item: MockArXivResponse): number {
    // Mock quality score (0-100)
    return 60 + Math.random() * 30 // Range: 60-90
  }

  private assessNovelty(item: MockArXivResponse): number {
    // Mock novelty score (0-100)
    return 50 + Math.random() * 40 // Range: 50-90
  }

  private generateSummary(abstract: string): string {
    // Generate a concise summary (mock implementation)
    return abstract.slice(0, 200) + (abstract.length > 200 ? '...' : '')
  }

  private extractKeyFindings(abstract: string): string[] {
    // Mock extraction of key findings
    const sentences = abstract.split('.').filter(s => s.trim().length > 0)
    return sentences.slice(0, 3).map(s => s.trim() + '.')
  }

  private extractMethodology(abstract: string): string | undefined {
    // Mock methodology extraction
    if (abstract.toLowerCase().includes('method') || abstract.toLowerCase().includes('approach')) {
      return 'Novel methodology described in abstract'
    }
    return undefined
  }

  private extractLimitations(abstract: string): string | undefined {
    // Mock limitations extraction
    if (abstract.toLowerCase().includes('limitation') || abstract.toLowerCase().includes('challenge')) {
      return 'Limitations acknowledged in abstract'
    }
    return undefined
  }

  private generateWhyThisMatters(item: MockArXivResponse, field: string): string {
    // Mock "why this matters" generation
    const fieldImpactMessages: Record<string, string> = {
      'ai-computing': 'This advances our understanding of machine learning capabilities and could lead to more powerful AI systems.',
      'life-sciences': 'This represents significant progress in biological research with potential applications in medicine and biotechnology.',
      'climate-earth-systems': 'This contributes to our understanding of environmental systems and inform climate policy decisions.',
      'humanities-culture': 'This provides valuable insights into human culture and society that broaden our perspective.',
      'policy-governance': 'This offers evidence-based insights that could inform policy decisions and governance approaches.',
    }

    return fieldImpactMessages[field] || 'This research contributes valuable knowledge to the academic community.'
  }
}