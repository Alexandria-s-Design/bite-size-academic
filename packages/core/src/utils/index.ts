import { format, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import type { AcademicField } from '../config'

// Date utilities
export function getWeekNumber(date: Date = new Date()): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function getCurrentWeekInfo() {
  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }) // Sunday

  return {
    weekNumber,
    year,
    weekStart,
    weekEnd,
    isoWeek: format(now, 'yyyy-WW'),
  }
}

export function getNextWeekDate(): Date {
  return addWeeks(new Date(), 1)
}

export function formatPublicationDate(date: Date): string {
  return format(date, 'MMMM d, yyyy')
}

export function formatShortDate(date: Date): string {
  return format(date, 'MMM d, yyyy')
}

export function formatDateForFilename(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function extractPlainText(html: string, maxLength?: number): string {
  const plain = stripHtml(html).replace(/\s+/g, ' ').trim()
  return maxLength ? truncateText(plain, maxLength) : plain
}

// Reading time estimation
export function estimateReadingTime(text: string, wordsPerMinute = 250): number {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return Math.max(1, minutes) // Minimum 1 minute
}

export function estimateAudioDuration(text: string, wordsPerMinute = 150): number {
  const words = text.trim().split(/\s+/).length
  const minutes = words / wordsPerMinute
  return Math.ceil(minutes * 60) // Return in seconds
}

// Field utilities
export function getFieldInfo(field: AcademicField) {
  const fieldMap = {
    'life-sciences': {
      emoji: '🧬',
      color: '#10b981',
      name: 'Life Sciences',
      description: 'Research covering living organisms, biological processes, and health sciences',
    },
    'ai-computing': {
      emoji: '🤖',
      color: '#3b82f6',
      name: 'AI & Computing',
      description: 'Advances in artificial intelligence, computer science, and computational systems',
    },
    'humanities-culture': {
      emoji: '📚',
      color: '#8b5cf6',
      name: 'Humanities & Culture',
      description: 'Scholarly work exploring human expression, cultural phenomena, and historical contexts',
    },
    'policy-governance': {
      emoji: '🏛️',
      color: '#f59e0b',
      name: 'Policy & Governance',
      description: 'Research on public policy, governance systems, and regulatory frameworks',
    },
    'climate-earth-systems': {
      emoji: '🌍',
      color: '#06b6d4',
      name: 'Climate & Earth Systems',
      description: 'Integrated research on Earth\'s climate system, environmental changes, and sustainability',
    },
  }

  return fieldMap[field] || fieldMap['life-sciences']
}

export function getFieldEmoji(field: AcademicField): string {
  return getFieldInfo(field).emoji
}

export function getFieldColor(field: AcademicField): string {
  return getFieldInfo(field).color
}

export function getFieldName(field: AcademicField): string {
  return getFieldInfo(field).name
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function sanitizeHtml(text: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Content utilities
export function extractKeywords(text: string, count = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)

  const wordFrequency: Record<string, number> = {}
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1
  })

  return Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([word]) => word)
}

export function calculateRelevanceScore(
  article: any,
  userField: AcademicField,
  userInterests: string[] = []
): number {
  let score = 0

  // Field match (40 points)
  if (article.field === userField) {
    score += 40
  } else if (isRelatedField(article.field, userField)) {
    score += 20
  }

  // Interest match (25 points)
  const matchingInterests = userInterests.filter(interest =>
    article.tags.includes(interest) ||
    article.topics.includes(interest) ||
    article.subfield.includes(interest)
  )
  score += Math.min(matchingInterests.length * 5, 25)

  // Quality score (20 points)
  score += (article.qualityScore || 0) * 0.2

  // Recency (15 points)
  const daysSincePublished = Math.floor(
    (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSincePublished <= 7) {
    score += 15
  } else if (daysSincePublished <= 14) {
    score += 10
  } else if (daysSincePublished <= 30) {
    score += 5
  }

  return Math.min(100, Math.max(0, score))
}

function isRelatedField(field1: string, field2: string): boolean {
  const relatedFields: Record<string, string[]> = {
    'life-sciences': ['ai-computing', 'climate-earth-systems'],
    'ai-computing': ['life-sciences', 'policy-governance'],
    'humanities-culture': ['policy-governance'],
    'policy-governance': ['humanities-culture', 'climate-earth-systems'],
    'climate-earth-systems': ['life-sciences', 'policy-governance'],
  }

  return relatedFields[field1]?.includes(field2) || relatedFields[field2]?.includes(field1)
}

// File utilities
export function ensureDirectoryExists(dirPath: string): void {
  if (typeof require !== 'undefined') {
    const fs = require('fs')
    const path = require('path')

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

// ID generation
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

export function generateDigestId(field: AcademicField, weekNumber: number, year: number): string {
  return `${field}-${year}-W${weekNumber.toString().padStart(2, '0')}`
}

export function generateUserId(): string {
  return generateId('user')
}

export function generateArticleId(source: string, sourceId: string): string {
  return `${source}_${sourceId}`
}

// Error handling utilities
export class BiteSizeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'BiteSizeError'
  }
}

export class ValidationError extends BiteSizeError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends BiteSizeError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConfigurationError extends BiteSizeError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500)
    this.name = 'ConfigurationError'
  }
}

// Logging utilities
export function createLogger(context: string) {
  return {
    info: (message: string, data?: any) => {
      console.log(`[${context}] INFO: ${message}`, data || '')
    },
    warn: (message: string, data?: any) => {
      console.warn(`[${context}] WARN: ${message}`, data || '')
    },
    error: (message: string, error?: Error | any) => {
      console.error(`[${context}] ERROR: ${message}`, error || '')
    },
    debug: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[${context}] DEBUG: ${message}`, data || '')
      }
    },
  }
}

// Async utilities
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        throw lastError
      }

      await delay(delayMs * attempt) // Exponential backoff
    }
  }

  throw lastError!
}

// Performance utilities
export function createTimer() {
  const start = Date.now()

  return {
    elapsed: () => Date.now() - start,
    elapsedMs: () => Date.now() - start,
    elapsedSeconds: () => Math.floor((Date.now() - start) / 1000),
  }
}