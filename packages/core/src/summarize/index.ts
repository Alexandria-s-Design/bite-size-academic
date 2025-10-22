// Summarization module exports
export * from './summarization-service'
export * from './digest-composer'

// Content configuration
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