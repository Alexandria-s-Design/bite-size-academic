import type { User, AcademicField } from '../types'
import { createLogger, generateId } from '../utils'
import { ValidationService } from './validation-service'

const logger = createLogger('UserPreferencesService')

export interface UserPreferences {
  field: AcademicField
  subfieldInterests: string[]
  tags: string[]
  deliveryDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  deliveryTime: string
  timezone: string
  emailNotifications: boolean
  podcastPreferences?: PodcastPreferences
  contentPreferences?: ContentPreferences
}

export interface PodcastPreferences {
  enabled: boolean
  speed: number
  voice: string
  autoDownload: boolean
}

export interface ContentPreferences {
  maxReadingTime: number
  includePreprints: boolean
  minQualityScore: number
  preferredVenues: string[]
  excludedTopics: string[]
}

export interface PreferenceUpdate {
  userId: string
  preferences: Partial<UserPreferences>
  timestamp: Date
  reason?: string
}

export class UserPreferencesService {
  private validationService: ValidationService
  private preferencesCache: Map<string, UserPreferences>
  private updateHistory: Map<string, PreferenceUpdate[]>

  constructor() {
    this.validationService = new ValidationService()
    this.preferencesCache = new Map()
    this.updateHistory = new Map()
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    logger.info('Getting user preferences', { userId })

    // Check cache first
    if (this.preferencesCache.has(userId)) {
      logger.debug('Returning cached preferences', { userId })
      return this.preferencesCache.get(userId)!
    }

    // In production, fetch from database
    // For MVP, return mock data
    const mockPreferences: UserPreferences = {
      field: 'ai-computing',
      subfieldInterests: ['machine learning', 'natural language processing'],
      tags: ['deep learning', 'transformers', 'LLM'],
      deliveryDay: 'friday',
      deliveryTime: '10:00',
      timezone: 'America/New_York',
      emailNotifications: true,
      podcastPreferences: {
        enabled: true,
        speed: 1.0,
        voice: 'Joanna',
        autoDownload: false,
      },
      contentPreferences: {
        maxReadingTime: 20,
        includePreprints: true,
        minQualityScore: 70,
        preferredVenues: ['Nature', 'Science', 'arXiv'],
        excludedTopics: [],
      },
    }

    this.preferencesCache.set(userId, mockPreferences)
    return mockPreferences
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>,
    reason?: string
  ): Promise<{
    success: boolean
    preferences: UserPreferences
    errors?: string[]
  }> {
    logger.info('Updating user preferences', { userId, updates })

    try {
      // Get current preferences
      const currentPrefs = await this.getUserPreferences(userId)

      if (!currentPrefs) {
        return {
          success: false,
          preferences: {} as UserPreferences,
          errors: ['User preferences not found'],
        }
      }

      // Merge updates
      const newPrefs: UserPreferences = {
        ...currentPrefs,
        ...updates,
      }

      // Validate new preferences
      const validation = this.validatePreferences(newPrefs)
      if (!validation.valid) {
        return {
          success: false,
          preferences: currentPrefs,
          errors: validation.errors.map(e => e.message),
        }
      }

      // Save update history
      const update: PreferenceUpdate = {
        userId,
        preferences: updates,
        timestamp: new Date(),
        reason,
      }

      if (!this.updateHistory.has(userId)) {
        this.updateHistory.set(userId, [])
      }
      this.updateHistory.get(userId)!.push(update)

      // Update cache
      this.preferencesCache.set(userId, newPrefs)

      // In production, save to database
      logger.info('User preferences updated', { userId, updatedFields: Object.keys(updates) })

      return {
        success: true,
        preferences: newPrefs,
      }
    } catch (error) {
      logger.error('Failed to update user preferences', { userId, error })
      throw error
    }
  }

  /**
   * Get preference update history
   */
  getUpdateHistory(userId: string, limit = 10): PreferenceUpdate[] {
    const history = this.updateHistory.get(userId) || []
    return history.slice(-limit)
  }

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(userId: string): Promise<UserPreferences> {
    logger.info('Resetting user preferences to defaults', { userId })

    const defaultPrefs: UserPreferences = {
      field: 'ai-computing',
      subfieldInterests: [],
      tags: [],
      deliveryDay: 'friday',
      deliveryTime: '10:00',
      timezone: 'UTC',
      emailNotifications: true,
      podcastPreferences: {
        enabled: false,
        speed: 1.0,
        voice: 'Joanna',
        autoDownload: false,
      },
      contentPreferences: {
        maxReadingTime: 20,
        includePreprints: true,
        minQualityScore: 70,
        preferredVenues: [],
        excludedTopics: [],
      },
    }

    this.preferencesCache.set(userId, defaultPrefs)

    // Record reset in history
    const update: PreferenceUpdate = {
      userId,
      preferences: defaultPrefs,
      timestamp: new Date(),
      reason: 'User requested preferences reset',
    }

    if (!this.updateHistory.has(userId)) {
      this.updateHistory.set(userId, [])
    }
    this.updateHistory.get(userId)!.push(update)

    return defaultPrefs
  }

  /**
   * Update field preference
   */
  async updateField(userId: string, field: AcademicField): Promise<UserPreferences> {
    return (await this.updateUserPreferences(userId, { field }, 'Field change')).preferences
  }

  /**
   * Update delivery schedule
   */
  async updateDeliverySchedule(
    userId: string,
    day: UserPreferences['deliveryDay'],
    time: string,
    timezone?: string
  ): Promise<UserPreferences> {
    const updates: Partial<UserPreferences> = {
      deliveryDay: day,
      deliveryTime: time,
    }

    if (timezone) {
      updates.timezone = timezone
    }

    return (await this.updateUserPreferences(userId, updates, 'Delivery schedule change')).preferences
  }

  /**
   * Add interest tags
   */
  async addInterests(userId: string, interests: string[]): Promise<UserPreferences> {
    const currentPrefs = await this.getUserPreferences(userId)
    if (!currentPrefs) {
      throw new Error('User preferences not found')
    }

    const uniqueInterests = Array.from(
      new Set([...currentPrefs.tags, ...interests])
    )

    return (await this.updateUserPreferences(
      userId,
      { tags: uniqueInterests },
      'Added interests'
    )).preferences
  }

  /**
   * Remove interest tags
   */
  async removeInterests(userId: string, interests: string[]): Promise<UserPreferences> {
    const currentPrefs = await this.getUserPreferences(userId)
    if (!currentPrefs) {
      throw new Error('User preferences not found')
    }

    const filteredTags = currentPrefs.tags.filter(tag => !interests.includes(tag))

    return (await this.updateUserPreferences(
      userId,
      { tags: filteredTags },
      'Removed interests'
    )).preferences
  }

  /**
   * Update podcast preferences
   */
  async updatePodcastPreferences(
    userId: string,
    podcastPrefs: Partial<PodcastPreferences>
  ): Promise<UserPreferences> {
    const currentPrefs = await this.getUserPreferences(userId)
    if (!currentPrefs) {
      throw new Error('User preferences not found')
    }

    const updatedPodcastPrefs: PodcastPreferences = {
      ...currentPrefs.podcastPreferences!,
      ...podcastPrefs,
    }

    return (await this.updateUserPreferences(
      userId,
      { podcastPreferences: updatedPodcastPrefs },
      'Podcast preferences update'
    )).preferences
  }

  /**
   * Update content preferences
   */
  async updateContentPreferences(
    userId: string,
    contentPrefs: Partial<ContentPreferences>
  ): Promise<UserPreferences> {
    const currentPrefs = await this.getUserPreferences(userId)
    if (!currentPrefs) {
      throw new Error('User preferences not found')
    }

    const updatedContentPrefs: ContentPreferences = {
      ...currentPrefs.contentPreferences!,
      ...contentPrefs,
    }

    return (await this.updateUserPreferences(
      userId,
      { contentPreferences: updatedContentPrefs },
      'Content preferences update'
    )).preferences
  }

  /**
   * Export user preferences
   */
  async exportPreferences(userId: string): Promise<{
    preferences: UserPreferences
    history: PreferenceUpdate[]
    exportedAt: Date
  }> {
    logger.info('Exporting user preferences', { userId })

    const preferences = await this.getUserPreferences(userId)
    if (!preferences) {
      throw new Error('User preferences not found')
    }

    const history = this.getUpdateHistory(userId, 50)

    return {
      preferences,
      history,
      exportedAt: new Date(),
    }
  }

  /**
   * Import user preferences
   */
  async importPreferences(
    userId: string,
    data: { preferences: UserPreferences }
  ): Promise<UserPreferences> {
    logger.info('Importing user preferences', { userId })

    // Validate imported preferences
    const validation = this.validatePreferences(data.preferences)
    if (!validation.valid) {
      throw new Error(`Invalid preferences: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    return (await this.updateUserPreferences(
      userId,
      data.preferences,
      'Preferences imported'
    )).preferences
  }

  /**
   * Validate preferences
   */
  private validatePreferences(prefs: UserPreferences): {
    valid: boolean
    errors: Array<{ field: string; message: string }>
  } {
    const errors: Array<{ field: string; message: string }> = []

    // Validate field
    const validFields = ['life-sciences', 'ai-computing', 'humanities-culture', 'policy-governance', 'climate-earth-systems']
    if (!validFields.includes(prefs.field)) {
      errors.push({ field: 'field', message: 'Invalid academic field' })
    }

    // Validate delivery time
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(prefs.deliveryTime)) {
      errors.push({ field: 'deliveryTime', message: 'Invalid delivery time format (expected HH:MM)' })
    }

    // Validate podcast speed
    if (prefs.podcastPreferences) {
      if (prefs.podcastPreferences.speed < 0.5 || prefs.podcastPreferences.speed > 2.0) {
        errors.push({ field: 'podcastPreferences.speed', message: 'Podcast speed must be between 0.5 and 2.0' })
      }
    }

    // Validate content preferences
    if (prefs.contentPreferences) {
      if (prefs.contentPreferences.maxReadingTime < 5 || prefs.contentPreferences.maxReadingTime > 60) {
        errors.push({ field: 'contentPreferences.maxReadingTime', message: 'Max reading time must be between 5 and 60 minutes' })
      }

      if (prefs.contentPreferences.minQualityScore < 0 || prefs.contentPreferences.minQualityScore > 100) {
        errors.push({ field: 'contentPreferences.minQualityScore', message: 'Min quality score must be between 0 and 100' })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get preference statistics
   */
  getPreferenceStatistics(): {
    totalUsers: number
    fieldDistribution: Record<AcademicField, number>
    avgTagCount: number
    podcastEnabledCount: number
  } {
    const users = Array.from(this.preferencesCache.values())
    const fieldDistribution: Record<string, number> = {}

    users.forEach(prefs => {
      fieldDistribution[prefs.field] = (fieldDistribution[prefs.field] || 0) + 1
    })

    const totalTags = users.reduce((sum, prefs) => sum + prefs.tags.length, 0)
    const podcastEnabled = users.filter(prefs => prefs.podcastPreferences?.enabled).length

    return {
      totalUsers: users.length,
      fieldDistribution: fieldDistribution as Record<AcademicField, number>,
      avgTagCount: users.length > 0 ? totalTags / users.length : 0,
      podcastEnabledCount: podcastEnabled,
    }
  }
}
