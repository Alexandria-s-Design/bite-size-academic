import { z } from 'zod'

// Academic Fields
export const AcademicFieldSchema = z.enum([
  'life-sciences',
  'ai-computing',
  'humanities-culture',
  'policy-governance',
  'climate-earth-systems',
])

export type AcademicField = z.infer<typeof AcademicFieldSchema>

export const ACADEMIC_FIELDS = {
  'life-sciences': {
    name: 'Life Sciences',
    emoji: '🧬',
    description: 'Research covering living organisms, biological processes, and health sciences',
    color: '#10b981',
  },
  'ai-computing': {
    name: 'AI & Computing',
    emoji: '🤖',
    description: 'Advances in artificial intelligence, computer science, and computational systems',
    color: '#3b82f6',
  },
  'humanities-culture': {
    name: 'Humanities & Culture',
    emoji: '📚',
    description: 'Scholarly work exploring human expression, cultural phenomena, and historical contexts',
    color: '#8b5cf6',
  },
  'policy-governance': {
    name: 'Policy & Governance',
    emoji: '🏛️',
    description: 'Research on public policy, governance systems, and regulatory frameworks',
    color: '#f59e0b',
  },
  'climate-earth-systems': {
    name: 'Climate & Earth Systems',
    emoji: '🌍',
    description: 'Integrated research on Earth\'s climate system, environmental changes, and sustainability',
    color: '#06b6d4',
  },
} as const

// Content Sources
export const ContentSourceSchema = z.enum([
  'arxiv',
  'crossref',
  'pubmed',
  'semantic-scholar',
  'rss-feed',
  'manual-curation',
])

export type ContentSource = z.infer<typeof ContentSourceSchema>

// Content Quality
export const ContentQualitySchema = z.enum([
  'breakthrough',
  'significant',
  'important',
  'notable',
  'incremental',
])

export type ContentQuality = z.infer<typeof ContentQualitySchema>

// User Roles
export const UserRoleSchema = z.enum([
  'user',
  'admin',
  'moderator',
])

export type UserRole = z.infer<typeof UserRoleSchema>

// Subscription Tiers
export const SubscriptionTierSchema = z.enum([
  'free',
  'premium',
])

export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>

// Configuration Schema
export const ConfigSchema = z.object({
  // Environment
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().default(3000),

  // Mock Mode
  mockMode: z.boolean().default(true),
  mockEmailService: z.boolean().default(true),
  mockTTSService: z.boolean().default(true),
  mockAcademicAPIs: z.boolean().default(true),
  offlineMode: z.boolean().default(true),
  fixturesOnly: z.boolean().default(true),

  // Email Configuration
  emailProvider: z.enum(['resend', 'sendgrid', 'mock']).default('mock'),
  emailFrom: z.string().default('Bite Size Academic <no-reply@bsa.test>'),
  resendApiKey: z.string().optional(),
  sendgridApiKey: z.string().optional(),

  // Public URLs
  publicBaseUrl: z.string().url().default('http://localhost:3000'),
  publicSiteUrl: z.string().url().default('http://localhost:3000'),

  // Storage
  storageDir: z.string().default('./storage'),
  artifactsDir: z.string().default('./artifacts'),
  fixturesDir: z.string().default('./fixtures'),

  // Content Generation
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),

  // External APIs
  crossrefApiKey: z.string().optional(),
  pubmedApiKey: z.string().optional(),

  // Performance
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  enableMetrics: z.boolean().default(true),
  enableTracing: z.boolean().default(true),

  // Development
  enableDebugLogs: z.boolean().default(true),
  enableHotReload: z.boolean().default(true),
})

export type Config = z.infer<typeof ConfigSchema>

// Default Configuration
export const defaultConfig: Config = {
  nodeEnv: 'development',
  port: 3000,
  mockMode: true,
  mockEmailService: true,
  mockTTSService: true,
  mockAcademicAPIs: true,
  offlineMode: true,
  fixturesOnly: true,
  emailProvider: 'mock',
  emailFrom: 'Bite Size Academic <no-reply@bsa.test>',
  publicBaseUrl: 'http://localhost:3000',
  publicSiteUrl: 'http://localhost:3000',
  storageDir: './storage',
  artifactsDir: './artifacts',
  fixturesDir: './fixtures',
  logLevel: 'info',
  enableMetrics: true,
  enableTracing: true,
  enableDebugLogs: true,
  enableHotReload: true,
}

// Content Processing Configuration
export const ContentConfig = {
  // Weekly digest limits
  maxArticlesPerDigest: 5,
  minArticlesPerDigest: 3,

  // Content freshness
  maxContentAgeDays: 14,
  preferredContentAgeDays: 7,

  // Quality thresholds
  minRelevanceScore: 60,
  minQualityScore: 70,

  // Reading time estimates
  wordsPerMinute: 250,
  maxReadingTimeMinutes: 15,

  // Content diversity
  maxArticlesPerVenue: 1,
  requiredSubfieldVariety: 2,

  // Audio generation
  targetPodcastLengthMinutes: 12,
  wordsPerMinuteAudio: 150,

} as const

// API Rate Limits
export const RateLimits = {
  arxiv: {
    requestsPerSecond: 1,
    requestsPerHour: 1000,
  },
  crossref: {
    requestsPerSecond: 10,
    requestsPerHour: 50000,
  },
  pubmed: {
    requestsPerSecond: 3,
    requestsPerHour: 10000,
  },
  semanticScholar: {
    requestsPerSecond: 1,
    requestsPerHour: 1000,
  },
} as const

// Feature Flags
export const FeatureFlags = {
  enablePodcastGeneration: true,
  enableEmailDelivery: true,
  enableUserPreferences: true,
  enableAdminPanel: true,
  enableAnalytics: true,
  enableContentPersonalization: false, // Future feature
  enableSocialFeatures: false, // Future feature
} as const

// Get environment variables with validation
export function getConfig(): Config {
  const envVars = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    mockMode: process.env.MOCK_MODE === '1',
    mockEmailService: process.env.MOCK_EMAIL_SERVICE === '1',
    mockTTSService: process.env.MOCK_TTS_SERVICE === '1',
    mockAcademicAPIs: process.env.MOCK_ACADEMIC_APIS === '1',
    offlineMode: process.env.OFFLINE_MODE === '1',
    fixturesOnly: process.env.FIXTURES_ONLY === '1',
    emailProvider: process.env.EMAIL_PROVIDER || 'mock',
    emailFrom: process.env.EMAIL_FROM || 'Bite Size Academic <no-reply@bsa.test>',
    resendApiKey: process.env.RESEND_API_KEY,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
    publicSiteUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
    storageDir: process.env.STORAGE_DIR || './storage',
    artifactsDir: process.env.ARTIFACTS_DIR || './artifacts',
    fixturesDir: process.env.FIXTURES_DIR || './fixtures',
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    crossrefApiKey: process.env.CROSSREF_API_KEY,
    pubmedApiKey: process.env.PUBMED_API_KEY,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableMetrics: process.env.ENABLE_METRICS === '1',
    enableTracing: process.env.ENABLE_TRACING === '1',
    enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === '1',
    enableHotReload: process.env.ENABLE_HOT_RELOAD === '1',
  }

  return ConfigSchema.parse(envVars)
}

// Export singleton instance
export const config = getConfig()