import type { Article, WeeklyDigest, User } from '../types'
import { ContentConfig } from '../config'
import { createLogger } from '../utils'

const logger = createLogger('ValidationService')

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  score: number
}

export interface ValidationError {
  field: string
  message: string
  severity: 'critical' | 'error'
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
  suggestion?: string
}

export class ValidationService {
  /**
   * Validate an article for inclusion in digest
   */
  validateArticle(article: Article): ValidationResult {
    logger.debug('Validating article', { articleId: article.id })

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Required fields validation
    if (!article.title || article.title.length < 10) {
      errors.push({
        field: 'title',
        message: 'Article title must be at least 10 characters',
        severity: 'critical',
        code: 'TITLE_TOO_SHORT',
      })
    }

    if (!article.abstract || article.abstract.length < 50) {
      errors.push({
        field: 'abstract',
        message: 'Article abstract must be at least 50 characters',
        severity: 'critical',
        code: 'ABSTRACT_TOO_SHORT',
      })
    }

    if (!article.authors || article.authors.length === 0) {
      errors.push({
        field: 'authors',
        message: 'Article must have at least one author',
        severity: 'error',
        code: 'NO_AUTHORS',
      })
    }

    // Quality validation
    if (article.relevanceScore < ContentConfig.minRelevanceScore) {
      warnings.push({
        field: 'relevanceScore',
        message: `Relevance score ${article.relevanceScore} is below threshold ${ContentConfig.minRelevanceScore}`,
        code: 'LOW_RELEVANCE',
        suggestion: 'Consider excluding this article from the digest',
      })
    }

    if (article.qualityScore < ContentConfig.minQualityScore) {
      warnings.push({
        field: 'qualityScore',
        message: `Quality score ${article.qualityScore} is below threshold ${ContentConfig.minQualityScore}`,
        code: 'LOW_QUALITY',
        suggestion: 'Review article quality before including in digest',
      })
    }

    // Content validation
    if (!article.summary || article.summary.length < 100) {
      warnings.push({
        field: 'summary',
        message: 'Article summary should be at least 100 characters for better reader experience',
        code: 'SUMMARY_TOO_SHORT',
        suggestion: 'Generate a more detailed summary',
      })
    }

    if (!article.whyThisMatters) {
      warnings.push({
        field: 'whyThisMatters',
        message: '"Why This Matters" section is missing',
        code: 'MISSING_WHY_THIS_MATTERS',
        suggestion: 'Add context about the article\'s significance',
      })
    }

    // URL validation
    if (!this.isValidUrl(article.url)) {
      errors.push({
        field: 'url',
        message: 'Article URL is invalid',
        severity: 'error',
        code: 'INVALID_URL',
      })
    }

    // Calculate validation score
    const score = this.calculateValidationScore(errors, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
    }
  }

  /**
   * Validate a weekly digest
   */
  validateDigest(digest: WeeklyDigest, articles: Article[]): ValidationResult {
    logger.debug('Validating digest', { digestId: digest.id })

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Article count validation
    if (articles.length < ContentConfig.minArticlesPerDigest) {
      errors.push({
        field: 'articles',
        message: `Digest must contain at least ${ContentConfig.minArticlesPerDigest} articles`,
        severity: 'critical',
        code: 'TOO_FEW_ARTICLES',
      })
    }

    if (articles.length > ContentConfig.maxArticlesPerDigest) {
      errors.push({
        field: 'articles',
        message: `Digest cannot contain more than ${ContentConfig.maxArticlesPerDigest} articles`,
        severity: 'error',
        code: 'TOO_MANY_ARTICLES',
      })
    }

    // Content diversity validation
    const venues = articles.map(a => a.venue)
    const uniqueVenues = new Set(venues)
    if (uniqueVenues.size < articles.length * 0.7) {
      warnings.push({
        field: 'diversity',
        message: 'Digest lacks venue diversity',
        code: 'LOW_VENUE_DIVERSITY',
        suggestion: 'Include articles from more varied sources',
      })
    }

    const subfields = articles.map(a => a.subfield)
    const uniqueSubfields = new Set(subfields)
    if (uniqueSubfields.size < ContentConfig.requiredSubfieldVariety) {
      warnings.push({
        field: 'diversity',
        message: `Digest should include at least ${ContentConfig.requiredSubfieldVariety} different subfields`,
        code: 'LOW_SUBFIELD_DIVERSITY',
        suggestion: 'Include articles from more varied subfields',
      })
    }

    // Reading time validation
    const totalReadingTime = articles.reduce((sum, a) => sum + (a.readingTime || 5), 0)
    if (totalReadingTime > ContentConfig.maxReadingTimeMinutes) {
      warnings.push({
        field: 'readingTime',
        message: `Total reading time ${totalReadingTime} minutes exceeds maximum ${ContentConfig.maxReadingTimeMinutes} minutes`,
        code: 'EXCESSIVE_READING_TIME',
        suggestion: 'Consider removing or shortening some articles',
      })
    }

    // Quality metrics validation
    if (digest.averageRelevanceScore < 70) {
      warnings.push({
        field: 'averageRelevanceScore',
        message: 'Average relevance score is below recommended threshold',
        code: 'LOW_AVG_RELEVANCE',
        suggestion: 'Include more relevant articles',
      })
    }

    // Content validation
    if (!digest.introduction || digest.introduction.length < 50) {
      errors.push({
        field: 'introduction',
        message: 'Digest introduction must be at least 50 characters',
        severity: 'error',
        code: 'MISSING_INTRODUCTION',
      })
    }

    if (!digest.conclusion || digest.conclusion.length < 30) {
      warnings.push({
        field: 'conclusion',
        message: 'Digest conclusion should be at least 30 characters',
        code: 'SHORT_CONCLUSION',
        suggestion: 'Add a more substantial conclusion',
      })
    }

    const score = this.calculateValidationScore(errors, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
    }
  }

  /**
   * Validate user data
   */
  validateUser(user: User): ValidationResult {
    logger.debug('Validating user', { userId: user.id })

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Email validation
    if (!this.isValidEmail(user.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email address',
        severity: 'critical',
        code: 'INVALID_EMAIL',
      })
    }

    // Field validation
    const validFields = ['life-sciences', 'ai-computing', 'humanities-culture', 'policy-governance', 'climate-earth-systems']
    if (!validFields.includes(user.field)) {
      errors.push({
        field: 'field',
        message: 'Invalid academic field',
        severity: 'critical',
        code: 'INVALID_FIELD',
      })
    }

    // Delivery time validation
    if (!this.isValidDeliveryTime(user.deliveryTime)) {
      errors.push({
        field: 'deliveryTime',
        message: 'Invalid delivery time format (expected HH:MM)',
        severity: 'error',
        code: 'INVALID_DELIVERY_TIME',
      })
    }

    // Subscription validation
    if (!user.confirmed && user.subscriptionStatus === 'active') {
      warnings.push({
        field: 'confirmed',
        message: 'User subscription is active but email not confirmed',
        code: 'UNCONFIRMED_ACTIVE',
        suggestion: 'Send confirmation email',
      })
    }

    const score = this.calculateValidationScore(errors, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
    }
  }

  /**
   * Batch validate multiple articles
   */
  batchValidateArticles(articles: Article[]): {
    results: Map<string, ValidationResult>
    summary: {
      total: number
      valid: number
      invalid: number
      avgScore: number
    }
  } {
    logger.info('Batch validating articles', { count: articles.length })

    const results = new Map<string, ValidationResult>()
    let totalScore = 0
    let validCount = 0

    articles.forEach(article => {
      const result = this.validateArticle(article)
      results.set(article.id, result)
      totalScore += result.score
      if (result.valid) validCount++
    })

    return {
      results,
      summary: {
        total: articles.length,
        valid: validCount,
        invalid: articles.length - validCount,
        avgScore: articles.length > 0 ? totalScore / articles.length : 0,
      },
    }
  }

  private calculateValidationScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100

    // Deduct points for errors
    errors.forEach(error => {
      if (error.severity === 'critical') {
        score -= 30
      } else {
        score -= 15
      }
    })

    // Deduct points for warnings
    warnings.forEach(() => {
      score -= 5
    })

    return Math.max(0, Math.min(100, score))
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidDeliveryTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }
}
