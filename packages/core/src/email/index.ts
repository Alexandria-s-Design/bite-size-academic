// Email module exports
export * from './email-service'

// Email template utilities
export const EmailTemplates = {
  // Template type definitions
  WEEKLY_DIGEST: 'weekly-digest',
  WELCOME: 'welcome',
  CONFIRMATION: 'confirmation',
  PREFERENCE_UPDATE: 'preference-update',
  PREMIUM_UPGRADE: 'premium-upgrade',

  // Template configurations
  getTemplateConfig(templateType: string) {
    const configs = {
      [this.WEEKLY_DIGEST]: {
        subjectPrefix: '📬',
        personalization: true,
        tracking: true,
        priority: 'normal',
      },
      [this.WELCOME]: {
        subjectPrefix: '🎉',
        personalization: true,
        tracking: true,
        priority: 'high',
      },
      [this.CONFIRMATION]: {
        subjectPrefix: '✉️',
        personalization: true,
        tracking: false,
        priority: 'high',
      },
      [this.PREFERENCE_UPDATE]: {
        subjectPrefix: '⚙️',
        personalization: true,
        tracking: true,
        priority: 'normal',
      },
      [this.PREMIUM_UPGRADE]: {
        subjectPrefix: '🎧',
        personalization: true,
        tracking: true,
        priority: 'high',
      },
    }

    return configs[templateType] || configs[this.WEEKLY_DIGEST]
  },

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Subject line generation
  generateSubjectLine(templateType: string, data: any): string {
    const config = this.getTemplateConfig(templateType)

    switch (templateType) {
      case this.WEEKLY_DIGEST:
        return `${config.subjectPrefix} ${data.fieldEmoji} ${data.fieldName}: ${data.topic}`
      case this.WELCOME:
        return `${config.subjectPrefix} Welcome to Bite Size Academic! ${data.fieldEmoji}`
      case this.CONFIRMATION:
        return `${config.subjectPrefix} Please confirm your Bite Size Academic subscription`
      case this.PREFERENCE_UPDATE:
        return `${config.subjectPrefix} Your ${data.fieldName} subscription has been updated`
      case this.PREMIUM_UPGRADE:
        return `${config.subjectPrefix} 🎧 Upgrade to Bite Size Academic Premium`
      default:
        return `${config.subjectPrefix} Bite Size Academic Update`
    }
  },

  // Preheader generation
  generatePreheader(templateType: string, data: any): string {
    switch (templateType) {
      case this.WEEKLY_DIGEST:
        return `Research highlights from ${data.topVenues} shape the future of ${data.fieldName}`
      case this.WELCOME:
        return `Get ready for smarter, faster research updates in ${data.fieldName}`
      case this.CONFIRMATION:
        return 'One click to activate your weekly research digest'
      case this.PREFERENCE_UPDATE:
        return 'Your preferences have been successfully updated'
      case this.PREMIUM_UPGRADE:
        return 'Listen to research highlights on the go with our premium podcast feature'
      default:
        return 'Your weekly dose of cutting-edge academic research'
    }
  }
} as const