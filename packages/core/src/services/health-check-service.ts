import { config } from '../config'
import { createLogger, createTimer } from '../utils'

const logger = createLogger('HealthCheckService')

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Date
  uptime: number
  version: string
  environment: string
  services: Record<string, ServiceHealth>
  metrics: SystemMetrics
  errors?: string[]
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded'
  responseTime?: number
  lastCheck: Date
  error?: string
  metadata?: Record<string, any>
}

export interface SystemMetrics {
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
  requests: {
    total: number
    success: number
    failed: number
    avgResponseTime: number
  }
  cache: {
    hitRate: number
    size: number
  }
}

export class HealthCheckService {
  private startTime: number
  private requestMetrics: {
    total: number
    success: number
    failed: number
    responseTimes: number[]
  }

  constructor() {
    this.startTime = Date.now()
    this.requestMetrics = {
      total: 0,
      success: 0,
      failed: 0,
      responseTimes: [],
    }
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    logger.info('Performing health check')
    const timer = createTimer()
    const errors: string[] = []

    try {
      // Check all services
      const services: Record<string, ServiceHealth> = {
        database: await this.checkDatabase(),
        emailService: await this.checkEmailService(),
        contentIngestion: await this.checkContentIngestion(),
        podcastService: await this.checkPodcastService(),
      }

      // Collect system metrics
      const metrics = await this.collectSystemMetrics()

      // Determine overall health status
      const status = this.determineOverallHealth(services)

      const result: HealthCheckResult = {
        status,
        timestamp: new Date(),
        uptime: this.getUptime(),
        version: this.getVersion(),
        environment: config.nodeEnv,
        services,
        metrics,
        errors: errors.length > 0 ? errors : undefined,
      }

      logger.info('Health check completed', {
        status,
        duration: timer.elapsedMs(),
      })

      return result
    } catch (error) {
      logger.error('Health check failed', error)
      throw error
    }
  }

  async checkDatabase(): Promise<ServiceHealth> {
    const timer = createTimer()

    try {
      // In production, actually check database connection
      // For MVP, simulate check
      await this.simulateServiceCheck(10)

      return {
        status: 'up',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        metadata: {
          mockMode: config.mockMode,
        },
      }
    } catch (error) {
      return {
        status: 'down',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        error: String(error),
      }
    }
  }

  async checkEmailService(): Promise<ServiceHealth> {
    const timer = createTimer()

    try {
      // Check email service availability
      await this.simulateServiceCheck(5)

      return {
        status: 'up',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        metadata: {
          provider: config.emailProvider,
          mockMode: config.mockEmailService,
        },
      }
    } catch (error) {
      return {
        status: 'down',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        error: String(error),
      }
    }
  }

  async checkContentIngestion(): Promise<ServiceHealth> {
    const timer = createTimer()

    try {
      // Check content ingestion services
      await this.simulateServiceCheck(15)

      return {
        status: 'up',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        metadata: {
          adapters: ['arxiv', 'crossref'],
          mockMode: config.mockAcademicAPIs,
        },
      }
    } catch (error) {
      return {
        status: 'down',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        error: String(error),
      }
    }
  }

  async checkPodcastService(): Promise<ServiceHealth> {
    const timer = createTimer()

    try {
      // Check podcast generation service
      await this.simulateServiceCheck(8)

      return {
        status: 'up',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        metadata: {
          ttsProvider: 'mock',
          mockMode: config.mockTTSService,
        },
      }
    } catch (error) {
      return {
        status: 'down',
        responseTime: timer.elapsedMs(),
        lastCheck: new Date(),
        error: String(error),
      }
    }
  }

  async collectSystemMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage()

    return {
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
      cpu: {
        usage: this.getCpuUsage(),
        cores: require('os').cpus().length,
      },
      requests: {
        total: this.requestMetrics.total,
        success: this.requestMetrics.success,
        failed: this.requestMetrics.failed,
        avgResponseTime: this.calculateAverageResponseTime(),
      },
      cache: {
        hitRate: 0.85, // Mock value
        size: 1024 * 1024, // Mock value
      },
    }
  }

  recordRequest(success: boolean, responseTime: number): void {
    this.requestMetrics.total++
    if (success) {
      this.requestMetrics.success++
    } else {
      this.requestMetrics.failed++
    }
    this.requestMetrics.responseTimes.push(responseTime)

    // Keep only last 100 response times
    if (this.requestMetrics.responseTimes.length > 100) {
      this.requestMetrics.responseTimes.shift()
    }
  }

  private determineOverallHealth(services: Record<string, ServiceHealth>): 'healthy' | 'degraded' | 'unhealthy' {
    const serviceStatuses = Object.values(services).map(s => s.status)
    const downCount = serviceStatuses.filter(s => s === 'down').length
    const degradedCount = serviceStatuses.filter(s => s === 'degraded').length

    if (downCount > 0) {
      return 'unhealthy'
    } else if (degradedCount > 0) {
      return 'degraded'
    }

    return 'healthy'
  }

  private getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  private getVersion(): string {
    try {
      const packageJson = require('../../package.json')
      return packageJson.version || '0.1.0'
    } catch {
      return '0.1.0'
    }
  }

  private getCpuUsage(): number {
    // Mock CPU usage - in production, use proper monitoring
    return Math.random() * 100
  }

  private calculateAverageResponseTime(): number {
    if (this.requestMetrics.responseTimes.length === 0) {
      return 0
    }

    const sum = this.requestMetrics.responseTimes.reduce((a, b) => a + b, 0)
    return sum / this.requestMetrics.responseTimes.length
  }

  private async simulateServiceCheck(delayMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delayMs))
  }
}
