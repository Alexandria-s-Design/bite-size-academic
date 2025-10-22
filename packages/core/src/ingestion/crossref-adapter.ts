import type { Article, ContentSource } from '../types'
import { config } from '../config'
import { generateArticleId, createLogger, delay, retry } from '../utils'

const logger = createLogger('CrossrefAdapter')

// Mock Crossref API response structure
interface MockCrossrefWork {
  DOI: string
  title: string[]
  author: Array<{
    given?: string
    family?: string
    name?: string
    affiliation?: Array<{
      name: string
    }>
  }>
  published: {
    'date-parts': number[][]
  }
  publishedPrint?: {
    'date-parts': number[][]
  }
  publishedOnline?: {
    'date-parts': number[][]
  }
  containerTitle?: string[]
  ISSN?: string[]
  'short-container-title'?: string[]
  type: string
  URL: string
  subject?: string[]
  'is-referenced-by-count'?: number
  abstract?: string
}

interface MockCrossrefResponse {
  message: {
    items: MockCrossrefWork[]
    totalResults: number
    query: {
      'search-terms': string
    }
  }
}

export class CrossrefAdapter {
  private readonly baseUrl = 'https://api.crossref.org/works'
  private readonly maxRetries = 3
  private readonly delayBetweenRequests = 1000

  constructor() {
    logger.info('Crossref adapter initialized', {
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
      const url = `${this.baseUrl}?query=${encodeURIComponent(searchQuery)}&rows=${maxResults}&sort=published&order=desc&filter=from-pub-date:${this.getDateRange()}`

      logger.info('Fetching articles from Crossref', { field, url })

      // In a real implementation, you would use fetch with proper headers
      // For now, we'll simulate the API call
      await delay(2000) // Simulate network delay

      const mockResponse = await this.simulateCrossrefResponse(field, maxResults)
      return this.parseCrossrefResponse(mockResponse, field)

    } catch (error) {
      logger.error('Failed to fetch articles from Crossref', error)
      throw new Error(`Crossref API error: ${error}`)
    }
  }

  private async fetchMockArticles(field: string, maxResults: number): Promise<Article[]> {
    logger.info('Using mock data for Crossref articles', { field, maxResults })

    const mockData = await this.loadMockFixtures(field, maxResults)
    return this.parseCrossrefResponse(mockData, field)
  }

  private buildSearchQuery(field: string): string {
    const fieldQueries: Record<string, string> = {
      'ai-computing': 'artificial intelligence OR machine learning OR deep learning OR neural networks',
      'life-sciences': 'biology OR genetics OR molecular biology OR neuroscience OR biomedical',
      'climate-earth-systems': 'climate change OR environmental science OR earth system OR sustainability',
      'humanities-culture': 'cultural studies OR history OR literature OR philosophy OR anthropology',
      'policy-governance': 'public policy OR governance OR political science OR public administration',
    }

    return fieldQueries[field] || 'academic research'
  }

  private getDateRange(): string {
    const today = new Date()
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
    return twoWeeksAgo.toISOString().split('T')[0]
  }

  private async simulateCrossrefResponse(field: string, maxResults: number): Promise<MockCrossrefResponse> {
    const mockWorks: MockCrossrefWork[] = []

    const fieldTemplates = {
      'ai-computing': [
        {
          DOI: '10.1000/182',
          title: ['Machine Learning Advances in Natural Language Understanding'],
          type: 'journal-article',
          containerTitle: ['Nature Machine Intelligence'],
          'short-container-title': ['Nat. Mach. Intell.'],
          subject: ['Artificial Intelligence', 'Machine Learning', 'Natural Language Processing'],
          'is-referenced-by-count': 15,
          abstract: 'Recent advances in transformer architectures have significantly improved natural language understanding capabilities. This paper presents a comprehensive analysis of state-of-the-art models and their applications across various domains.',
        },
        {
          DOI: '10.1000/183',
          title: ['Quantum Machine Learning: A Comprehensive Review'],
          type: 'review-article',
          containerTitle: ['Reviews of Modern Physics'],
          'short-container-title': ['Rev. Mod. Phys.'],
          subject: ['Quantum Physics', 'Machine Learning', 'Computational Physics'],
          'is-referenced-by-count': 42,
          abstract: 'We provide a comprehensive review of the emerging field of quantum machine learning, covering theoretical foundations, practical implementations, and potential applications in scientific computing.',
        },
      ],
      'life-sciences': [
        {
          DOI: '10.1000/184',
          title: ['Novel Protein Structure Prediction Method Achieves Near-Experimental Accuracy'],
          type: 'journal-article',
          containerTitle: ['Nature'],
          'short-container-title': ['Nature'],
          subject: ['Structural Biology', 'Computational Biology', 'Bioinformatics'],
          'is-referenced-by-count': 28,
          abstract: 'We present a novel deep learning approach for protein structure prediction that achieves accuracy comparable to experimental methods. Our model successfully predicts structures for proteins with unknown 3D structures.',
        },
        {
          DOI: '10.1000/185',
          title: ['CRISPR-Cas9 Off-Target Effects: Comprehensive Analysis and Mitigation Strategies'],
          type: 'journal-article',
          containerTitle: ['Cell'],
          'short-container-title': ['Cell'],
          subject: ['Genetics', 'Molecular Biology', 'Genome Editing'],
          'is-referenced-by-count': 35,
          abstract: 'A comprehensive analysis of CRISPR-Cas9 off-target effects reveals patterns in genomic regions susceptible to unintended modifications. We propose novel strategies to minimize off-target activity while maintaining editing efficiency.',
        },
      ],
    }

    const templates = fieldTemplates[field as keyof typeof fieldTemplates] || fieldTemplates['ai-computing']

    for (let i = 0; i < Math.min(maxResults, templates.length); i++) {
      const template = templates[i % templates.length]

      const publishedDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      const published = publishedDate.toISOString().split('T')[0].split('-')

      mockWorks.push({
        ...template,
        author: this.generateMockAuthors(2 + Math.floor(Math.random() * 4)),
        published: {
          'date-parts': [published],
        },
        URL: `https://doi.org/${template.DOI}`,
        ISSN: this.generateMockISSN(),
      })
    }

    return {
      message: {
        items: mockWorks,
        'total-results': mockWorks.length,
        query: {
          'search-terms': this.buildSearchQuery(field),
        },
      },
    }
  }

  private async loadMockFixtures(field: string, maxResults: number): Promise<MockCrossrefResponse> {
    try {
      // In a real implementation, you would load from files
      return this.simulateCrossrefResponse(field, maxResults)
    } catch (error) {
      logger.warn('Failed to load fixtures, generating mock data', { field, error })
      return this.simulateCrossrefResponse(field, maxResults)
    }
  }

  private generateMockAuthors(count: number) {
    const authorNames = [
      { given: 'John', family: 'Smith' },
      { given: 'Sarah', family: 'Johnson' },
      { given: 'Michael', family: 'Chen' },
      { given: 'Emily', family: 'Davis' },
      { given: 'David', family: 'Wilson' },
      { given: 'Lisa', family: 'Brown' },
      { given: 'James', family: 'Taylor' },
      { given: 'Maria', family: 'Garcia' },
    ]

    const selectedAuthors = authorNames.slice(0, count)
    return selectedAuthors.map(author => ({
      ...author,
      affiliation: [{ name: 'University Research Institute' }],
    }))
  }

  private generateMockISSN(): string[] {
    const issns = ['0028-0836', '0036-8075', '0027-8424', '0092-8674', '1546-1696']
    return [issns[Math.floor(Math.random() * issns.length)]]
  }

  private parseCrossrefResponse(response: MockCrossrefResponse, field: string): Article[] {
    return response.message.items.map((item) => {
      const publishedAt = this.extractPublishedDate(item)
      const readingTime = this.estimateReadingTime(item.abstract || '')

      return {
        id: generateArticleId('crossref', item.DOI),
        title: item.title[0],
        authors: item.author.map(author => ({
          id: generateId('author'),
          name: author.given && author.family
            ? `${author.given} ${author.family}`
            : author.name || 'Unknown Author',
          affiliation: author.affiliation?.[0]?.name,
        })),
        venue: item.containerTitle?.[0] || 'Unknown Venue',
        venueType: this.mapWorkTypeToVenueType(item.type),
        abstract: item.abstract || 'Abstract not available',
        url: item.URL,
        publishedAt,
        field,
        subfield: this.extractSubfield(item.subject || [], field),
        tags: this.extractTags(item.subject || []),
        topics: this.extractTopics(item.abstract || '', item.subject || []),

        // Quality scores
        quality: this.assessQuality(item),
        relevanceScore: 0, // Will be calculated later
        impactScore: this.assessImpact(item),
        qualityScore: this.assessQualityScore(item),
        noveltyScore: this.assessNovelty(item),

        // Access information
        openAccess: false, // Crossref doesn't provide OA info directly
        doi: item.DOI,

        // Content analysis (mock for now)
        summary: this.generateSummary(item.abstract || ''),
        keyFindings: this.extractKeyFindings(item.abstract || ''),
        methodology: this.extractMethodology(item.abstract || ''),
        limitations: this.extractLimitations(item.abstract || ''),
        whyThisMatters: this.generateWhyThisMatters(item, field),
        readingTime,

        // Processing metadata
        source: 'crossref' as ContentSource,
        fetchedAt: new Date(),
        processedAt: new Date(),
        processingStatus: 'completed' as const,

        // Related content (mock for now)
        relatedArticles: [],
        citationContext: `Cited by ${item['is-referenced-by-count'] || 0} other works`,

        // Mock data indicators
        isMockData: config.mockMode,
        mockDataSource: 'crossref-adapter',
      }
    })
  }

  private extractPublishedDate(item: MockCrossrefWork): Date {
    // Try different date fields in order of preference
    const dateFields = [
      item.publishedPrint,
      item.publishedOnline,
      item.published,
    ]

    for (const dateField of dateFields) {
      if (dateField && dateField['date-parts'] && dateField['date-parts'].length > 0) {
        const [year, month = 1, day = 1] = dateField['date-parts'][0]
        return new Date(year, month - 1, day)
      }
    }

    // Fallback to current date
    return new Date()
  }

  private mapWorkTypeToVenueType(type: string): 'journal' | 'conference' | 'preprint' | 'book' | 'thesis' {
    const typeMap: Record<string, 'journal' | 'conference' | 'preprint' | 'book' | 'thesis'> = {
      'journal-article': 'journal',
      'conference-paper': 'conference',
      'preprint': 'preprint',
      'book': 'book',
      'book-chapter': 'book',
      'thesis': 'thesis',
      'dissertation': 'thesis',
      'review-article': 'journal',
      'reference-entry': 'journal',
    }

    return typeMap[type] || 'journal'
  }

  private extractSubfield(subjects: string[], field: string): string {
    const subfieldMap: Record<string, Record<string, string>> = {
      'ai-computing': {
        'Artificial Intelligence': 'Artificial Intelligence',
        'Machine Learning': 'Machine Learning',
        'Natural Language Processing': 'Natural Language Processing',
        'Computer Vision': 'Computer Vision',
        'Robotics': 'Robotics',
      },
      'life-sciences': {
        'Molecular Biology': 'Molecular Biology',
        'Genetics': 'Genetics',
        'Cell Biology': 'Cell Biology',
        'Biochemistry': 'Biochemistry',
        'Neuroscience': 'Neuroscience',
      },
      'climate-earth-systems': {
        'Climate Science': 'Climate Science',
        'Environmental Science': 'Environmental Science',
        'Earth System Science': 'Earth System Science',
        'Atmospheric Science': 'Atmospheric Science',
        'Oceanography': 'Oceanography',
      },
    }

    const fieldMap = subfieldMap[field]
    if (!fieldMap) return 'General'

    for (const subject of subjects) {
      if (fieldMap[subject]) {
        return fieldMap[subject]
      }
    }

    return subjects[0] || 'General'
  }

  private extractTags(subjects: string[]): string[] {
    // Convert subjects to tags
    return subjects
      .map(subject => subject.toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean)
  }

  private extractTopics(abstract: string, subjects: string[]): string[] {
    const topics: string[] = []
    const lowerAbstract = abstract.toLowerCase()

    // Extract from subjects
    subjects.forEach(subject => {
      if (lowerAbstract.includes(subject.toLowerCase())) {
        topics.push(subject)
      }
    })

    // Extract from abstract using keyword patterns
    const topicPatterns = [
      'machine learning',
      'deep learning',
      'neural network',
      'artificial intelligence',
      'climate change',
      'protein structure',
      'gene editing',
      'public policy',
      'cultural studies',
    ]

    topicPatterns.forEach(pattern => {
      if (lowerAbstract.includes(pattern) && !topics.includes(pattern)) {
        topics.push(pattern)
      }
    })

    return topics
  }

  private assessQuality(item: MockCrossrefWork): 'breakthrough' | 'significant' | 'important' | 'notable' | 'incremental' {
    const citationCount = item['is-referenced-by-count'] || 0
    const hasAbstract = !!item.abstract
    const hasMultipleSubjects = (item.subject?.length || 0) > 1

    if (citationCount > 50 && hasAbstract && hasMultipleSubjects) {
      return 'significant'
    } else if (citationCount > 20 || hasAbstract) {
      return 'important'
    } else {
      return 'notable'
    }
  }

  private assessImpact(item: MockCrossrefWork): number {
    let score = 50 // Base score

    // Factor in citation count
    score += Math.min((item['is-referenced-by-count'] || 0) * 0.5, 30)

    // Factor in venue prestige (mock based on DOI prefix)
    if (item.DOI.startsWith('10.1000')) {
      score += 20 // High-impact journal
    }

    // Factor in abstract length
    if (item.abstract) {
      score += Math.min(item.abstract.length / 100, 15)
    }

    // Factor in subject diversity
    score += Math.min((item.subject?.length || 0) * 3, 15)

    return Math.min(100, Math.max(0, score))
  }

  private assessQualityScore(item: MockCrossrefWork): number {
    return 65 + Math.random() * 25 // Range: 65-90
  }

  private assessNovelty(item: MockCrossrefWork): number {
    return 55 + Math.random() * 35 // Range: 55-90
  }

  private generateSummary(abstract: string): string {
    if (!abstract) return 'Summary not available'
    return abstract.slice(0, 200) + (abstract.length > 200 ? '...' : '')
  }

  private extractKeyFindings(abstract: string): string[] {
    if (!abstract) return []
    const sentences = abstract.split('.').filter(s => s.trim().length > 0)
    return sentences.slice(0, 3).map(s => s.trim() + '.')
  }

  private extractMethodology(abstract: string): string | undefined {
    if (!abstract) return undefined
    const lowerAbstract = abstract.toLowerCase()
    if (lowerAbstract.includes('method') || lowerAbstract.includes('approach')) {
      return 'Novel methodology described in abstract'
    }
    return undefined
  }

  private extractLimitations(abstract: string): string | undefined {
    if (!abstract) return undefined
    const lowerAbstract = abstract.toLowerCase()
    if (lowerAbstract.includes('limitation') || lowerAbstract.includes('challenge')) {
      return 'Limitations acknowledged in abstract'
    }
    return undefined
  }

  private generateWhyThisMatters(item: MockCrossrefWork, field: string): string {
    const fieldImpactMessages: Record<string, string> = {
      'ai-computing': `This research advances ${field} with ${item['is-referenced-by-count'] || 0} citations, indicating significant impact on the academic community.`,
      'life-sciences': `This work contributes to biological research with potential applications in medicine and biotechnology.`,
      'climate-earth-systems': `This study provides valuable insights into environmental systems that inform climate science and policy.`,
      'humanities-culture': `This research offers important perspectives on human culture and society that deepen our understanding.`,
      'policy-governance': `This work provides evidence-based insights that could inform policy and governance approaches.`,
    }

    return fieldImpactMessages[field] || 'This research contributes valuable knowledge to the academic community.'
  }

  private estimateReadingTime(text: string): number {
    if (!text) return 3 // Default to 3 minutes
    const wordsPerMinute = 250
    const words = text.trim().split(/\s+/).length
    return Math.max(3, Math.ceil(words / wordsPerMinute))
  }
}