// Main entry point for the Bite Size Academic core package

// Configuration
export * from './config'

// Types
export * from './types'

// Utilities
export * from './utils'

// Services
export * from './ingestion/arxiv-adapter'
export * from './ingestion/crossref-adapter'
export * from './ingestion/content-ingestion-service'

export * from './summarize/summarization-service'
export * from './summarize/digest-composer'

export * from './email/email-service'

export * from './podcast/podcast-service'

// Services
export * from './services/admin-service'

// Jobs
export * from './jobs/weekly-digest'

// Initialize configuration
import { config } from './config'

// Log initialization in development
if (config.nodeEnv === 'development' && config.enableDebugLogs) {
  console.log('🚀 Bite Size Academic Core initialized')
  console.log(`📋 Mock Mode: ${config.mockMode ? 'Enabled' : 'Disabled'}`)
  console.log(`📧 Email Service: ${config.emailProvider}`)
  console.log(`📁 Storage: ${config.storageDir}`)
  console.log(`🔧 Environment: ${config.nodeEnv}`)
}