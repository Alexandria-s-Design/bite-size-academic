// Podcast module exports
export * from './podcast-service'

// Audio configuration
export const AudioConfig = {
  // Voice configurations
  voices: {
    'Joanna': {
      provider: 'aws-polly',
      language: 'en-US',
      gender: 'female',
      description: 'Natural, professional American English female voice',
      sampleRate: '22050',
      fields: ['life-sciences', 'humanities-culture', 'climate-earth-systems'],
    },
    'Matthew': {
      provider: 'aws-polly',
      language: 'en-US',
      gender: 'male',
      description: 'Clear, authoritative American English male voice',
      sampleRate: '22050',
      fields: ['ai-computing', 'policy-governance'],
    },
    'Emma': {
      provider: 'google-tts',
      language: 'en-GB',
      gender: 'female',
      description: 'Sophisticated British English female voice',
      sampleRate: '24000',
      fields: ['humanities-culture', 'policy-governance'],
    },
    'Brian': {
      provider: 'google-tts',
      language: 'en-GB',
      gender: 'male',
      description: 'Authoritative British English male voice',
      sampleRate: '24000',
      fields: ['life-sciences', 'policy-governance'],
    },
  },

  // Audio quality presets
  qualityPresets: {
    low: {
      bitrate: 64,
      sampleRate: '16000',
      format: 'mp3',
      channels: 'mono',
      description: '64kbps mono, suitable for voice content',
    },
    medium: {
      bitrate: 128,
      sampleRate: '22050',
      format: 'mp3',
      channels: 'stereo',
      description: '128kbps stereo, good balance of quality and size',
    },
    high: {
      bitrate: 192,
      sampleRate: '44100',
      format: 'mp3',
      channels: 'stereo',
      description: '192kbps stereo, high quality for music and voice',
    },
  },

  // Content specifications
  targetDuration: 12, // minutes
  minDuration: 8, // minutes
  maxDuration: 20, // minutes
  wordsPerMinute: 150,

  // RSS feed specifications
  rssConfig: {
    ttl: 60, // minutes
    maxEpisodes: 50, // episodes to include in feed
    explicit: false,
    category: 'Science',
    subcategory: 'Natural Sciences',
  },

  // File naming conventions
  generateFilename(field: string, date: Date, format: string = 'mp3'): string {
    const week = date.getWeek()
    const year = date.getFullYear()
    const weekStr = week.toString().padStart(2, '0')
    return `${field}-${year}-W${weekStr}-podcast.${format}`
  },

  // Directory structure
  getAudioDirectory(field: string, date: Date): string {
    const year = date.getFullYear()
    return `audio/${field}/${year}`
  },

  // Validation rules
  validateEpisode(episode: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!episode.title || episode.title.length < 10) {
      errors.push('Episode title must be at least 10 characters')
    }

    if (!episode.description || episode.description.length < 50) {
      errors.push('Episode description must be at least 50 characters')
    }

    if (!episode.script || episode.script.length < 200) {
      errors.push('Episode script must be at least 200 characters')
    }

    if (episode.duration < 300) { // Less than 5 minutes
      errors.push('Episode must be at least 5 minutes long')
    }

    if (episode.duration > 1200) { // More than 20 minutes
      errors.push('Episode must not exceed 20 minutes')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
} as const

// Voice management utilities
export const VoiceManager = {
  getRecommendedVoice(field: string): string {
    const fieldVoiceMap: Record<string, string> = {
      'life-sciences': 'Joanna',
      'ai-computing': 'Matthew',
      'humanities-culture': 'Emma',
      'policy-governance': 'Brian',
      'climate-earth-systems': 'Joanna',
    }

    return fieldVoiceMap[field] || 'Joanna'
  },

  getVoiceConfig(voiceId: string): any {
    return AudioConfig.voices[voiceId as keyof typeof AudioConfig.voices] || AudioConfig.voices.Joanna
  },

  getAvailableVoices(): string[] {
    return Object.keys(AudioConfig.voices)
  },

  getVoicesForField(field: string): string[] {
    return Object.entries(AudioConfig.voices)
      .filter(([_, config]) => config.fields.includes(field))
      .map(([voiceId]) => voiceId)
  },
} as const

// Audio processing utilities
export const AudioProcessor = {
  estimateDuration(text: string, wordsPerMinute = 150): number {
    const words = text.trim().split(/\s+/).length
    return Math.ceil((words / wordsPerMinute) * 60) // Return in seconds
  },

  estimateFileSize(duration: number, bitrate: number): number {
    return Math.floor((duration * bitrate * 1000) / 8) // Size in bytes
  },

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  generateWaveform(duration: number, samples = 100): number[] {
    const waveform: number[] = []
    for (let i = 0; i < samples; i++) {
      // Generate mock waveform data (in production, would analyze actual audio)
      waveform.push(Math.random() * 0.8 + 0.1)
    }
    return waveform
  },
} as const

// RSS feed utilities
export const RSSGenerator = {
  generateFeedMetadata(field: string, episodes: any[]): any {
    const fieldInfo = this.getFieldInfo(field)

    return {
      title: `Bite Size ${fieldInfo.name}`,
      description: `Weekly research highlights from the world of ${fieldInfo.name}. Each episode covers 3-5 cutting-edge research papers in under 15 minutes.`,
      language: 'en-us',
      copyright: `© ${new Date().getFullYear()} Bite Size Academic`,
      lastBuildDate: new Date().toUTCString(),
      pubDate: episodes[0]?.publishedAt?.toUTCString() || new Date().toUTCString(),
      author: 'Bite Size Academic',
      subtitle: 'Weekly research digest in audio format',
      summary: `Stay current with cutting-edge academic research in bite-sized audio episodes. Each week we cover the most important developments in ${fieldInfo.name}.`,
      category: AudioConfig.rssConfig.category,
      explicit: AudioConfig.rssConfig.explicit,
    }
  },

  getFieldInfo(field: string) {
    const fieldMap = {
      'life-sciences': { name: 'Life Sciences', emoji: '🧬' },
      'ai-computing': { name: 'AI & Computing', emoji: '🤖' },
      'humanities-culture': { name: 'Humanities & Culture', emoji: '📚' },
      'policy-governance': { name: 'Policy & Governance', emoji: '🏛️' },
      'climate-earth-systems': { name: 'Climate & Earth Systems', emoji: '🌍' },
    }

    return fieldMap[field] || fieldMap['life-sciences']
  },

  validateRSSFeed(rssContent: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Basic XML validation
    if (!rssContent.includes('<?xml')) {
      errors.push('Missing XML declaration')
    }

    if (!rssContent.includes('<rss')) {
      errors.push('Missing RSS root element')
    }

    if (!rssContent.includes('<channel>')) {
      errors.push('Missing channel element')
    }

    if (!rssContent.includes('<title>')) {
      errors.push('Missing channel title')
    }

    if (!rssContent.includes('<description>')) {
      errors.push('Missing channel description')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
} as const