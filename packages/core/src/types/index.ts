import { z } from 'zod'
import type { AcademicField, ContentSource, ContentQuality, UserRole, SubscriptionTier } from '../config'

// Author Information
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  affiliation: z.string().optional(),
  email: z.string().email().optional(),
  orcid: z.string().optional(),
})

export type Author = z.infer<typeof AuthorSchema>

// Article/Research Paper
export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(AuthorSchema),
  venue: z.string(),
  venueType: z.enum(['journal', 'conference', 'preprint', 'book', 'thesis']),
  abstract: z.string(),
  url: z.string().url(),
  publishedAt: z.date(),
  field: z.string(), // Will be validated against AcademicField
  subfield: z.string(),
  tags: z.array(z.string()),
  topics: z.array(z.string()),

  // Quality and classification
  quality: z.enum(['breakthrough', 'significant', 'important', 'notable', 'incremental']),
  relevanceScore: z.number().min(0).max(100),
  impactScore: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  noveltyScore: z.number().min(0).max(100),

  // Access information
  openAccess: z.boolean(),
  doi: z.string().optional(),
  arxivId: z.string().optional(),
  pubmedId: z.string().optional(),

  // Content analysis
  summary: z.string(),
  keyFindings: z.array(z.string()),
  methodology: z.string().optional(),
  limitations: z.string().optional(),
  whyThisMatters: z.string(),
  readingTime: z.number().min(1), // in minutes

  // Processing metadata
  source: z.string(), // Will be validated against ContentSource
  fetchedAt: z.date(),
  processedAt: z.date(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']),

  // Related content
  relatedArticles: z.array(z.string()), // IDs of related articles
  citationContext: z.string().optional(),

  // Mock data indicators
  isMockData: z.boolean().default(false),
  mockDataSource: z.string().optional(),
})

export type Article = z.infer<typeof ArticleSchema>

// Weekly Digest
export const WeeklyDigestSchema = z.object({
  id: z.string(),
  field: z.string(), // Will be validated against AcademicField
  weekNumber: z.number().min(1).max(53),
  year: z.number().min(2024),
  publishedAt: z.date(),
  createdAt: z.date(),

  // Content
  introduction: z.string(),
  featuredArticles: z.array(z.string()), // Article IDs
  methodology: z.string().optional(),
  conclusion: z.string(),

  // Quality metrics
  totalArticles: z.number(),
  averageRelevanceScore: z.number(),
  averageQualityScore: z.number(),

  // Processing information
  processedAt: z.date(),
  processingDuration: z.number(), // in milliseconds
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']),

  // Delivery tracking
  sentAt: z.date().optional(),
  deliveryCount: z.number().default(0),
  openCount: z.number().default(0),
  clickCount: z.number().default(0),

  // Mock data indicators
  isMockData: z.boolean().default(false),
})

export type WeeklyDigest = z.infer<typeof WeeklyDigestSchema>

// User Information
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  confirmed: z.boolean().default(false),
  confirmationCode: z.string().optional(),
  confirmationExpiresAt: z.date().optional(),

  // Preferences
  field: z.string(), // Will be validated against AcademicField
  subfieldInterests: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),

  // Subscription
  subscriptionTier: z.enum(['free', 'premium']),
  subscriptionStatus: z.enum(['active', 'cancelled', 'expired', 'trial']),
  subscriptionStartsAt: z.date().optional(),
  subscriptionEndsAt: z.date().optional(),

  // Communication preferences
  deliveryDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).default('friday'),
  deliveryTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('10:00'),
  timezone: z.string().default('UTC'),

  // Engagement tracking
  totalDigestsReceived: z.number().default(0),
  totalDigestsOpened: z.number().default(0),
  totalClicks: z.number().default(0),
  lastOpenedAt: z.date().optional(),
  lastClickedAt: z.date().optional(),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),

  // Admin information
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),

  // Mock data indicators
  isMockData: z.boolean().default(false),
})

export type User = z.infer<typeof UserSchema>

// Podcast Episode
export const PodcastEpisodeSchema = z.object({
  id: z.string(),
  digestId: z.string(),
  field: z.string(), // Will be validated against AcademicField
  episodeNumber: z.number(),
  title: z.string(),
  description: z.string(),

  // Content
  script: z.string(),
  transcript: z.string(),
  duration: z.number(), // in seconds

  // Audio information
  audioUrl: z.string().url(),
  audioSize: z.number(), // in bytes
  audioFormat: z.string().default('mp3'),
  audioBitrate: z.number().default(128), // kbps

  // Voice information
  voiceId: z.string(),
  voiceName: z.string(),
  voiceProvider: z.string(),

  // Metadata
  publishedAt: z.date(),
  createdAt: z.date(),
  processedAt: z.date(),
  processingDuration: z.number(), // in milliseconds

  // Quality metrics
  audioQualityScore: z.number().min(0).max(100),
  scriptQualityScore: z.number().min(0).max(100),

  // Delivery tracking
  downloadCount: z.number().default(0),
  playCount: z.number().default(0),
  completionCount: z.number().default(0),

  // Mock data indicators
  isMockData: z.boolean().default(false),
  mockAudioPath: z.string().optional(),
})

export type PodcastEpisode = z.infer<typeof PodcastEpisodeSchema>

// RSS Feed
export const RSSFeedSchema = z.object({
  id: z.string(),
  field: z.string(), // Will be validated against AcademicField
  title: z.string(),
  description: z.string(),
  language: z.string().default('en-us'),
  copyright: z.string().optional(),
  managingEditor: z.string().optional(),
  webMaster: z.string().optional(),

  // Feed metadata
  category: z.string().optional(),
  generator: z.string().default('Bite Size Academic'),
  docs: z.string().url().optional(),
  lastBuildDate: z.date(),
  pubDate: z.date(),

  // Media information
  imageUrl: z.string().url().optional(),
  imageTitle: z.string().optional(),
  imageLink: z.string().url().optional(),

  // Episodes
  episodes: z.array(z.string()), // Episode IDs
  episodeCount: z.number(),

  // File information
  feedUrl: z.string().url(),
  filePath: z.string(),
  fileSize: z.number(),

  // Processing information
  generatedAt: z.date(),
  processingDuration: z.number(), // in milliseconds

  // Validation
  isValid: z.boolean(),
  validationErrors: z.array(z.string()).default([]),

  // Mock data indicators
  isMockData: z.boolean().default(false),
})

export type RSSFeed = z.infer<typeof RSSFeedSchema>

// Email Content
export const EmailContentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  digestId: z.string(),
  templateType: z.enum(['weekly-digest', 'welcome', 'preference-update', 'premium-upgrade']),

  // Content
  subject: z.string(),
  preheader: z.string(),
  htmlContent: z.string(),
  textContent: z.string(),

  // Personalization
  userName: z.string().optional(),
  userField: z.string(), // Will be validated against AcademicField
  personalizedIntro: z.string().optional(),
  personalizedContent: z.string().optional(),

  // Delivery information
  fromEmail: z.string().email(),
  fromName: z.string(),
  toEmail: z.string().email(),
  toName: z.string().optional(),

  // Tracking
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  openedAt: z.date().optional(),
  clickedAt: z.date().optional(),

  // Email service information
  externalId: z.string().optional(),
  deliveryStatus: z.enum(['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed']),
  deliveryErrors: z.array(z.string()).default([]),

  // Mock data indicators
  isMockData: z.boolean().default(false),
  localFilePath: z.string().optional(),
})

export type EmailContent = z.infer<typeof EmailContentSchema>

// Content Processing Job
export const ContentJobSchema = z.object({
  id: z.string(),
  jobType: z.enum(['weekly-digest', 'podcast-generation', 'rss-generation', 'email-delivery']),
  field: z.string().optional(), // Will be validated against AcademicField
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),

  // Configuration
  config: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),

  // Timing
  scheduledAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  duration: z.number().optional(), // in milliseconds

  // Results
  result: z.any().optional(),
  error: z.string().optional(),

  // Retry information
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  nextRetryAt: z.date().optional(),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),

  // Dependencies
  dependsOn: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
})

export type ContentJob = z.infer<typeof ContentJobSchema>

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date(),
  requestId: z.string(),
})

export type ApiResponse = z.infer<typeof ApiResponseSchema>

// Pagination
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().min(0),
  totalPages: z.number().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
})

export type Pagination = z.infer<typeof PaginationSchema>

// Search and Filter
export const SearchFiltersSchema = z.object({
  field: z.string().optional(),
  subfield: z.string().optional(),
  tags: z.array(z.string()).optional(),
  quality: z.enum(['breakthrough', 'significant', 'important', 'notable', 'incremental']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  venue: z.string().optional(),
  openAccess: z.boolean().optional(),
  minRelevanceScore: z.number().min(0).max(100).optional(),
  source: z.string().optional(),
})

export type SearchFilters = z.infer<typeof SearchFiltersSchema>

// Analytics Events
export const AnalyticsEventSchema = z.object({
  id: z.string(),
  eventType: z.enum([
    'user_registered',
    'email_confirmed',
    'digest_sent',
    'digest_opened',
    'link_clicked',
    'podcast_downloaded',
    'podcast_played',
    'preferences_updated',
    'subscription_upgraded',
    'subscription_cancelled',
  ]),
  userId: z.string().optional(),
  sessionId: z.string().optional(),

  // Event data
  eventData: z.record(z.any()).optional(),

  // Context
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  referrer: z.string().optional(),

  // Timing
  timestamp: z.date(),

  // Metadata
  isMockData: z.boolean().default(false),
})

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>

// Export all types
export type {
  AcademicField,
  ContentSource,
  ContentQuality,
  UserRole,
  SubscriptionTier,
}