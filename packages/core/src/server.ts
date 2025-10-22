import { createServer } from 'http'
import 'dotenv/config'
import { config } from './config'
import { createLogger } from './utils'
import { WeeklyDigestJob } from './jobs/weekly-digest'

const logger = createLogger('Server')

// Create HTTP server for core services
const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const { method, url } = req

  // Parse URL
  const parsedUrl = new URL(url, `http://localhost:${process.env.PORT || 3001}`)
  const pathname = parsedUrl.pathname
  const searchParams = parsedUrl.searchParams

  logger.info(`${method} ${pathname}`, { query: Object.fromEntries(searchParams) })

  try {
    // Route handling
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        services: {
          ingestion: config.mockMode ? 'mock' : 'production',
          email: config.emailProvider,
          tts: config.mockTTSService ? 'mock' : 'production',
        },
      }))
      return
    }

    if (pathname === '/job/weekly-digest') {
      const field = searchParams.get('field') as string | undefined
      const force = searchParams.has('force')
      const mockOnly = searchParams.has('mock-only') || config.mockMode
      const dryRun = searchParams.has('dry-run')

      if (method === 'POST') {
        const result = await WeeklyDigestJob.run({
          field,
          force,
          mockOnly,
          dryRun,
        })

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
        return
      } else if (method === 'GET') {
        // Return job status or documentation
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          endpoint: '/job/weekly-digest',
          method: 'POST',
          description: 'Generate weekly digest for academic fields',
          parameters: {
            field: {
              type: 'string',
              description: 'Academic field (optional)',
              enum: ['life-sciences', 'ai-computing', 'humanities-culture', 'policy-governance', 'climate-earth-systems'],
            },
            force: {
              type: 'boolean',
              description: 'Force regeneration even if digest exists',
              default: false,
            },
            'mock-only': {
              type: 'boolean',
              description: 'Use mock data only',
              default: true,
            },
            'dry-run': {
              type: 'boolean',
              description: 'Generate but do not save or send',
              default: false,
            },
          },
          examples: [
            'POST /job/weekly-digest',
            'POST /job/weekly-digest?field=ai-computing',
            'POST /job/weekly-digest?field=life-sciences&force=true',
          ],
        }))
        return
      }
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Endpoint ${pathname} not found`,
      availableEndpoints: ['/health', '/job/weekly-digest'],
    }))

  } catch (error) {
    logger.error('Request failed', { pathname, method, error })
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }))
  }
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  logger.info(`🚀 Bite Size Academic Core Server running on port ${PORT}`)
  logger.info(`🌐 Health check: http://localhost:${PORT}/health`)
  logger.info(`📋 Job API: http://localhost:${PORT}/job/weekly-digest`)
  logger.info(`🔧 Environment: ${config.nodeEnv}`)
  logger.info(`📋 Mock Mode: ${config.mockMode ? 'Enabled' : 'Disabled'}`)
})