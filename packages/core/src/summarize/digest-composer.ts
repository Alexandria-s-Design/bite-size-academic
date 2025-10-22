import type { Article, WeeklyDigest, AcademicField } from '../types'
import { config } from '../config'
import { createLogger, getCurrentWeekInfo, generateDigestId } from '../utils'
import { SummarizationService, type SummaryOptions } from './summarization-service'

const logger = createLogger('DigestComposer')

export interface DigestCompositionOptions {
  maxArticles?: number
  minArticles?: number
  targetReadingTime?: number
  audienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  includeTechnicalDetails?: boolean
  emphasizeApplications?: boolean
  editorialStyle?: 'academic' | 'conversational' | 'professional'
}

export interface ComposedDigest {
  id: string
  field: AcademicField
  weekNumber: number
  year: number
  introduction: string
  featuredArticles: ComposedArticle[]
  methodology: string
  conclusion: string
  totalReadingTime: number
  qualityMetrics: DigestQualityMetrics
  composedAt: Date
  compositionTime: number
}

export interface ComposedArticle {
  article: Article
  summary: string
  whyThisMatters: string
  keyFindings: string[]
  readingTime: number
  position: number
  transition?: string
}

export interface DigestQualityMetrics {
  averageRelevanceScore: number
  averageQualityScore: number
  averageNoveltyScore: number
  diversityScore: number
  readingTimeDistribution: {
    shortest: number
    longest: number
    average: number
  }
  venueDiversity: number
  topicDiversity: number
}

export class DigestComposer {
  private summarizationService: SummarizationService

  constructor() {
    this.summarizationService = new SummarizationService()
    logger.info('Digest composer initialized', {
      mockMode: config.mockMode,
    })
  }

  async composeDigest(
    articles: Article[],
    field: AcademicField,
    options: DigestCompositionOptions = {}
  ): Promise<ComposedDigest> {
    const startTime = Date.now()
    const weekInfo = getCurrentWeekInfo()

    const {
      maxArticles = ContentConfig.maxArticlesPerDigest,
      minArticles = ContentConfig.minArticlesPerDigest,
      targetReadingTime = ContentConfig.maxReadingTimeMinutes,
      audienceLevel = 'intermediate',
      includeTechnicalDetails = true,
      emphasizeApplications = true,
      editorialStyle = 'professional',
    } = options

    logger.info('Starting digest composition', {
      field,
      totalArticles: articles.length,
      weekInfo,
      options,
    })

    try {
      // Select and organize articles
      const selectedArticles = this.selectArticles(articles, {
        maxArticles,
        minArticles,
        targetReadingTime,
      })

      // Generate summaries for selected articles
      const composedArticles = await this.generateComposedArticles(
        selectedArticles,
        {
          audienceLevel,
          includeTechnicalDetails,
          emphasizeApplications,
        }
      )

      // Generate digest components
      const introduction = this.generateIntroduction(composedArticles, field, editorialStyle)
      const methodology = this.generateMethodology(composedArticles, editorialStyle)
      const conclusion = this.generateConclusion(composedArticles, field, editorialStyle)

      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(composedArticles)

      const composedDigest: ComposedDigest = {
        id: generateDigestId(field, weekInfo.weekNumber, weekInfo.year),
        field,
        weekNumber: weekInfo.weekNumber,
        year: weekInfo.year,
        introduction,
        featuredArticles: composedArticles,
        methodology,
        conclusion,
        totalReadingTime: composedArticles.reduce((sum, article) => sum + article.readingTime, 0),
        qualityMetrics,
        composedAt: new Date(),
        compositionTime: Date.now() - startTime,
      }

      logger.info('Digest composition completed', {
        digestId: composedDigest.id,
        articleCount: composedArticles.length,
        totalReadingTime: composedDigest.totalReadingTime,
        compositionTime: composedDigest.compositionTime,
      })

      return composedDigest

    } catch (error) {
      logger.error('Failed to compose digest', { field, error })
      throw new Error(`Digest composition failed: ${error}`)
    }
  }

  private selectArticles(
    articles: Article[],
    options: {
      maxArticles: number
      minArticles: number
      targetReadingTime: number
    }
  ): Article[] {
    const { maxArticles, minArticles, targetReadingTime } = options

    // Sort by relevance and quality score
    const sortedArticles = [...articles].sort((a, b) => {
      const scoreA = a.relevanceScore * 0.6 + a.qualityScore * 0.4
      const scoreB = b.relevanceScore * 0.6 + b.qualityScore * 0.4
      return scoreB - scoreA
    })

    const selectedArticles: Article[] = []
    let currentReadingTime = 0

    // Select articles to meet reading time target
    for (const article of sortedArticles) {
      if (selectedArticles.length >= maxArticles) break

      const estimatedReadingTime = Math.max(3, article.readingTime || 5)

      if (currentReadingTime + estimatedReadingTime <= targetReadingTime + 5) { // Allow 5 min buffer
        selectedArticles.push(article)
        currentReadingTime += estimatedReadingTime
      }

      // Ensure we have minimum articles even if it exceeds reading time
      if (selectedArticles.length >= minArticles) break
    }

    // If we don't have enough articles, add more prioritized ones
    if (selectedArticles.length < minArticles) {
      const remainingArticles = sortedArticles.filter(article =>
        !selectedArticles.includes(article)
      )

      selectedArticles.push(...remainingArticles.slice(0, minArticles - selectedArticles.length))
    }

    logger.info('Articles selected for digest', {
      totalCandidates: articles.length,
      selectedCount: selectedArticles.length,
      targetReadingTime,
      estimatedReadingTime: selectedArticles.reduce((sum, a) => sum + Math.max(3, a.readingTime || 5), 0),
    })

    return selectedArticles
  }

  private async generateComposedArticles(
    articles: Article[],
    summaryOptions: SummaryOptions
  ): Promise<ComposedArticle[]> {
    const composedArticles: ComposedArticle[] = []

    // Generate summaries for all articles
    const summaryPromises = articles.map(async (article, index) => {
      const summaryResult = await this.summarizationService.generateSummary(
        article,
        summaryOptions
      )

      return {
        article,
        summary: summaryResult.summary,
        whyThisMatters: summaryResult.whyThisMatters,
        keyFindings: summaryResult.keyFindings,
        readingTime: summaryResult.readingTime,
        position: index + 1,
        transition: index < articles.length - 1
          ? this.generateTransition(article, articles[index + 1])
          : undefined,
      }
    })

    const results = await Promise.allSettled(summaryPromises)

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        composedArticles.push(result.value)
      } else {
        logger.error('Failed to compose article', {
          articleId: articles[index].id,
          error: result.reason,
        })
      }
    })

    return composedArticles
  }

  private generateTransition(current: Article, next: Article): string {
    const transitions = [
      `Moving from ${current.subfield} to ${next.subfield}, let's explore...`,
      `While the previous research focused on ${current.subfield}, our next article examines...`,
      `Building on insights from ${current.subfield}, we now turn to...`,
      `The theme of innovation continues as we examine ${next.subfield}...`,
      `From advances in ${current.subfield} to breakthroughs in ${next.subfield}...`,
    ]

    return transitions[Math.floor(Math.random() * transitions.length)]
  }

  private generateIntroduction(
    articles: ComposedArticle[],
    field: AcademicField,
    editorialStyle: 'academic' | 'conversational' | 'professional'
  ): string {
    const weekInfo = getCurrentWeekInfo()
    const fieldEmojis = {
      'life-sciences': '🧬',
      'ai-computing': '🤖',
      'humanities-culture': '📚',
      'policy-governance': '🏛️',
      'climate-earth-systems': '🌍',
    }

    const emoji = fieldEmojis[field] || '📚'
    const subfields = [...new Set(articles.map(a => a.article.subfield))].slice(0, 3)

    if (editorialStyle === 'academic') {
      return `This week in ${field.replace('-', ' ')} presents significant advances across multiple research domains. We examine ${articles.length} peer-reviewed studies representing substantial progress in ${subfields.join(', ')}. The selected research demonstrates both methodological innovation and practical applications that advance our understanding of the field.`
    } else if (editorialStyle === 'conversational') {
      return `Welcome to this week's highlights from ${field.replace('-', ' and ')}! We've curated ${articles.length} fascinating studies that caught our attention, spanning ${subfields.join(', ')}. From breakthrough methodologies to surprising discoveries, these articles represent the most exciting developments in the field this week.`
    } else {
      return `This week's research digest features ${articles.length} significant advances in ${field.replace('-', ' and ')}, with noteworthy developments in ${subfields.join(', ')}. These studies represent the current trajectory of research in the field, offering both fundamental insights and practical applications that merit attention from the academic community.`
    }
  }

  private generateMethodology(
    articles: ComposedArticle[],
    editorialStyle: 'academic' | 'conversational' | 'professional'
  ): string {
    const venues = [...new Set(articles.map(a => a.article.venue))]
    const venueTypes = [...new Set(articles.map(a => a.article.venueType))]
    const openAccessCount = articles.filter(a => a.article.openAccess).length

    if (editorialStyle === 'academic') {
      return `Research methodology assessment reveals diverse approaches across ${venueTypes.join(', ')} venues. The selected studies employ rigorous methodologies including ${this.extractMethodologies(articles)}. ${openAccessCount > 0 ? `${openAccessCount} studies are openly accessible, ensuring broad dissemination of findings.` : 'All selected articles are from subscription-based journals.'}`
    } else if (editorialStyle === 'conversational') {
      return `We selected these articles from leading publications including ${venues.slice(0, 3).join(', ')}. What makes this research compelling is not just the results, but the innovative approaches researchers are using—from cutting-edge experimental techniques to advanced computational methods. ${openAccessCount > 0 ? `${openAccessCount} of these studies are freely available, so you can dive deeper into the details.` : ''}`
    } else {
      return `Content selection prioritized studies demonstrating both methodological rigor and significant outcomes. Research sources include ${venues.slice(0, 3).join(', ')}, representing ${venueTypes.join(', ')} publications. Assessment criteria encompassed peer review status, methodological soundness, and potential impact on the field.`
    }
  }

  private generateConclusion(
    articles: ComposedArticle[],
    field: AcademicField,
    editorialStyle: 'academic' | 'conversational' | 'professional'
  ): string {
    const themes = [...new Set(articles.map(a => a.article.subfield))]
    const breakthroughCount = articles.filter(a => a.article.quality === 'breakthrough').count()

    if (editorialStyle === 'academic') {
      return `This week's research landscape in ${field.replace('-', ' ')} demonstrates continued advancement across ${themes.join(', ')}. The selected studies reveal both evolutionary progress and ${breakthroughCount > 0 ? 'paradigm-shifting developments' : 'significant incremental advances'}. Future research directions suggested by these findings warrant close attention from the academic community.`
    } else if (editorialStyle === 'conversational') {
      return `What's remarkable about this week's research is how interconnected these advances are. From ${themes[0]} to ${themes[themes.length - 1]}, we're seeing patterns that suggest broader trends in the field. ${breakthroughCount > 0 ? 'There are even a few potential breakthroughs that could change how we think about these problems.' : 'Each study builds on previous work in meaningful ways.'} Stay tuned—next week promises to be just as exciting!`
    } else {
      return `The research presented this week illustrates the dynamic nature of ${field.replace('-', ' and ')}, with ${breakthroughCount > 0 ? 'notable breakthroughs in' : 'advances in'} ${themes.join(', ')}. These findings collectively contribute to the field's evolution and suggest promising avenues for future investigation. Stakeholders should monitor developments in these areas for potential implications.`
    }
  }

  private extractMethodologies(articles: ComposedArticle[]): string[] {
    const methodologies: string[] = []

    articles.forEach(article => {
      if (article.article.methodology) {
        methodologies.push(article.article.methodology)
      }
    })

    // Add common methodologies based on field
    const fieldMethods: Record<string, string[]> = {
      'life-sciences': ['experimental studies', 'clinical analysis', 'molecular techniques'],
      'ai-computing': ['computational experiments', 'algorithm development', 'machine learning'],
      'humanities-culture': ['textual analysis', 'historical research', 'critical theory'],
      'policy-governance': ['policy analysis', 'statistical methods', 'case studies'],
      'climate-earth-systems': ['climate modeling', 'field observations', 'data analysis'],
    }

    const defaultMethods = fieldMethods[articles[0]?.article.field] || []

    return [...new Set([...methodologies, ...defaultMethods])].slice(0, 4)
  }

  private calculateQualityMetrics(articles: ComposedArticle[]): DigestQualityMetrics {
    const readingTimes = articles.map(a => a.readingTime)
    const relevanceScores = articles.map(a => a.article.relevanceScore)
    const qualityScores = articles.map(a => a.article.qualityScore)
    const noveltyScores = articles.map(a => a.article.noveltyScore)
    const venues = [...new Set(articles.map(a => a.article.venue))]
    const topics = [...new Set(articles.flatMap(a => a.article.topics))]

    return {
      averageRelevanceScore: relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length,
      averageQualityScore: qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length,
      averageNoveltyScore: noveltyScores.reduce((sum, score) => sum + score, 0) / noveltyScores.length,
      diversityScore: this.calculateDiversityScore(articles),
      readingTimeDistribution: {
        shortest: Math.min(...readingTimes),
        longest: Math.max(...readingTimes),
        average: readingTimes.reduce((sum, time) => sum + time, 0) / readingTimes.length,
      },
      venueDiversity: venues.length,
      topicDiversity: topics.length,
    }
  }

  private calculateDiversityScore(articles: ComposedArticle[]): number {
    // Calculate diversity based on subfields, venues, and topics
    const subfields = [...new Set(articles.map(a => a.article.subfield))]
    const venues = [...new Set(articles.map(a => a.article.venue))]
    const topics = [...new Set(articles.flatMap(a => a.article.topics))]

    // Normalize to 0-100 scale
    const subfieldScore = Math.min(subfields.length * 20, 40) // Max 40 points
    const venueScore = Math.min(venues.length * 10, 30) // Max 30 points
    const topicScore = Math.min(topics.length * 2, 30) // Max 30 points

    return subfieldScore + venueScore + topicScore
  }

  async validateDigestComposition(
    digest: ComposedDigest
  ): Promise<{
    valid: boolean
    issues: string[]
    suggestions: string[]
  }> {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check article count
    if (digest.featuredArticles.length < ContentConfig.minArticlesPerDigest) {
      issues.push(`Digest has only ${digest.featuredArticles.length} articles, minimum required is ${ContentConfig.minArticlesPerDigest}`)
    }

    if (digest.featuredArticles.length > ContentConfig.maxArticlesPerDigest) {
      suggestions.push(`Consider reducing to ${ContentConfig.maxArticlesPerDigest} articles for optimal reading experience`)
    }

    // Check reading time
    if (digest.totalReadingTime > ContentConfig.maxReadingTimeMinutes + 5) {
      suggestions.push(`Reading time of ${digest.totalReadingTime} minutes exceeds target of ${ContentConfig.maxReadingTimeMinutes} minutes`)
    }

    // Check quality metrics
    if (digest.qualityMetrics.averageRelevanceScore < 70) {
      suggestions.push('Average relevance score could be improved with better article selection')
    }

    if (digest.qualityMetrics.diversityScore < 50) {
      suggestions.push('Consider including more diverse sources and topics')
    }

    // Check content completeness
    if (!digest.introduction || digest.introduction.length < 50) {
      issues.push('Introduction is too short or missing')
    }

    if (!digest.conclusion || digest.conclusion.length < 50) {
      issues.push('Conclusion is too short or missing')
    }

    // Check for transitions
    const missingTransitions = digest.featuredArticles.filter(a => !a.transition && a.position < digest.featuredArticles.length).length
    if (missingTransitions > 0) {
      suggestions.push(`${missingTransitions} articles are missing transitions between them`)
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions,
    }
  }
}