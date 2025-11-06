import { describe, it, expect, beforeEach } from 'vitest'
import { HealthCheckService } from '../services/health-check-service'

describe('HealthCheckService', () => {
  let service: HealthCheckService

  beforeEach(() => {
    service = new HealthCheckService()
  })

  describe('performHealthCheck', () => {
    it('should return health check result', async () => {
      const result = await service.performHealthCheck()

      expect(result).toBeDefined()
      expect(result.status).toMatch(/^(healthy|degraded|unhealthy)$/)
      expect(result.timestamp).toBeInstanceOf(Date)
      expect(result.uptime).toBeGreaterThanOrEqual(0)
      expect(result.version).toBeDefined()
      expect(result.environment).toBeDefined()
      expect(result.services).toBeDefined()
      expect(result.metrics).toBeDefined()
    })

    it('should check all services', async () => {
      const result = await service.performHealthCheck()

      expect(result.services.database).toBeDefined()
      expect(result.services.emailService).toBeDefined()
      expect(result.services.contentIngestion).toBeDefined()
      expect(result.services.podcastService).toBeDefined()
    })

    it('should collect system metrics', async () => {
      const result = await service.performHealthCheck()

      expect(result.metrics.memory).toBeDefined()
      expect(result.metrics.cpu).toBeDefined()
      expect(result.metrics.requests).toBeDefined()
      expect(result.metrics.cache).toBeDefined()
    })
  })

  describe('recordRequest', () => {
    it('should record successful request', () => {
      service.recordRequest(true, 100)
      service.performHealthCheck().then(result => {
        expect(result.metrics.requests.total).toBeGreaterThan(0)
        expect(result.metrics.requests.success).toBeGreaterThan(0)
      })
    })

    it('should record failed request', () => {
      service.recordRequest(false, 500)
      service.performHealthCheck().then(result => {
        expect(result.metrics.requests.failed).toBeGreaterThan(0)
      })
    })
  })
})
