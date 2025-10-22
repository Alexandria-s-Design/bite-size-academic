import type { PodcastEpisode, WeeklyDigest, Article, AcademicField } from '../types'
import { config } from '../config'
import { createLogger, ensureDirectoryExists, sanitizeFilename, estimateAudioDuration } from '../utils'
import { SummarizationService } from '../summarize'

const logger = createLogger('PodcastService')

export interface PodcastGenerationOptions {
  voiceId?: string
  voiceProvider?: 'aws-polly' | 'google-tts' | 'mock'
  audioFormat?: 'mp3' | 'wav'
  audioQuality?: 'low' | 'medium' | 'high'
  includeIntroOutro?: boolean
  targetDuration?: number // minutes
}

export interface GeneratedPodcast {
  episode: PodcastEpisode
  audioFile: {
    path: string
    size: number
    format: string
    duration: number
    bitrate: number
  }
  transcript: string
  rssFeedUrl: string
  generationTime: number
}

export class PodcastService {
  private summarizationService: SummarizationService

  constructor() {
    this.summarizationService = new SummarizationService()
    logger.info('Podcast service initialized', {
      mockMode: config.mockMode,
      ttsProvider: config.mockTTSService ? 'mock' : 'aws-polly',
    })

    // Ensure audio storage directory exists
    ensureDirectoryExists(`${config.storageDir}/audio`)
  }

  async generatePodcastEpisode(
    digest: WeeklyDigest,
    articles: Article[],
    options: PodcastGenerationOptions = {}
  ): Promise<GeneratedPodcast> {
    const startTime = Date.now()
    const {
      voiceId = this.getDefaultVoice(digest.field),
      voiceProvider = config.mockTTSService ? 'mock' : 'aws-polly',
      audioFormat = 'mp3',
      audioQuality = 'medium',
      includeIntroOutro = true,
      targetDuration = ContentConfig.targetPodcastLengthMinutes,
    } = options

    logger.info('Starting podcast episode generation', {
      digestId: digest.id,
      field: digest.field,
      articleCount: articles.length,
      targetDuration,
      voiceProvider,
    })

    try {
      // 1. Generate overview transcript (NotebookLM-style)
      const transcript = await this.summarizationService.generateOverviewTranscript(
        articles,
        digest.field as AcademicField,
        targetDuration
      )

      // 2. Generate audio file
      const audioFile = await this.generateAudioFile(
        transcript,
        digest.field as AcademicField,
        {
          voiceId,
          voiceProvider,
          audioFormat,
          audioQuality,
          includeIntroOutro,
        }
      )

      // 3. Create podcast episode
      const episode = await this.createPodcastEpisode(
        digest,
        transcript,
        audioFile,
        articles
      )

      // 4. Generate RSS feed URL
      const rssFeedUrl = `${config.publicBaseUrl}/feeds/${digest.field}.xml`

      const generationTime = Date.now() - startTime

      logger.info('Podcast episode generation completed', {
        episodeId: episode.id,
        duration: audioFile.duration,
        generationTime,
        audioSize: audioFile.size,
      })

      return {
        episode,
        audioFile,
        transcript: this.formatTranscriptForDisplay(transcript),
        rssFeedUrl,
        generationTime,
      }

    } catch (error) {
      logger.error('Failed to generate podcast episode', {
        digestId: digest.id,
        error,
      })
      throw new Error(`Podcast generation failed: ${error}`)
    }
  }

  private async generateAudioFile(
    transcript: any,
    field: AcademicField,
    options: {
      voiceId: string
      voiceProvider: string
      audioFormat: string
      audioQuality: string
      includeIntroOutro: boolean
    }
  ): Promise<{ path: string; size: number; format: string; duration: number; bitrate: number }> {
    if (config.mockTTSService || options.voiceProvider === 'mock') {
      return this.generateMockAudioFile(transcript, field, options)
    }

    // In production, integrate with real TTS services
    return this.generateRealAudioFile(transcript, field, options)
  }

  private async generateMockAudioFile(
    transcript: any,
    field: AcademicField,
    options: {
      voiceId: string
      audioFormat: string
      audioQuality: string
      includeIntroOutro: boolean
    }
  ): Promise<{ path: string; size: number; format: string; duration: number; bitrate: number }> {
    logger.info('Generating mock audio file', {
      field,
      voiceId: options.voiceId,
      duration: transcript.totalDuration,
    })

    // Simulate audio generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Calculate realistic audio file properties
    const duration = transcript.totalDuration * 60 // Convert minutes to seconds
    const bitrate = this.getBitrateForQuality(options.audioQuality)
    const size = Math.floor((duration * bitrate * 1000) / 8) // File size in bytes

    // Generate file path
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const week = String(new Date().getWeek()).padStart(2, '0')
    const filename = sanitizeFilename(`${field}-${year}-W${week}-podcast.${options.audioFormat}`)
    const directory = `${config.storageDir}/audio/${field}/${year}`
    const path = `${directory}/${filename}`

    ensureDirectoryExists(directory)

    // In a real implementation, you would generate the actual audio file
    logger.info('Mock audio file generated', {
      path,
      duration,
      size,
      bitrate,
      format: options.audioFormat,
    })

    return {
      path,
      size,
      format: options.audioFormat,
      duration,
      bitrate,
    }
  }

  private async generateRealAudioFile(
    transcript: any,
    field: AcademicField,
    options: {
      voiceId: string
      voiceProvider: string
      audioFormat: string
      audioQuality: string
      includeIntroOutro: boolean
    }
  ): Promise<{ path: string; size: number; format: string; duration: number; bitrate: number }> {
    // In production, integrate with AWS Polly, Google TTS, or other services
    logger.info('Generating real audio file via external service', {
      provider: options.voiceProvider,
      voiceId: options.voiceId,
    })

    throw new Error('Real TTS integration not implemented in MVP')
  }

  private async createPodcastEpisode(
    digest: WeeklyDigest,
    transcript: any,
    audioFile: { path: string; size: number; format: string; duration: number; bitrate: number },
    articles: Article[]
  ): Promise<PodcastEpisode> {
    const episodeNumber = await this.getNextEpisodeNumber(digest.field as AcademicField)

    const episode: PodcastEpisode = {
      id: `episode_${digest.field}_${digest.weekNumber}_${digest.year}`,
      digestId: digest.id,
      field: digest.field,
      episodeNumber,
      title: transcript.title,
      description: this.generateEpisodeDescription(transcript, articles),
      script: this.formatTranscriptForAudio(transcript),
      transcript: this.formatTranscriptForDisplay(transcript),
      duration: audioFile.duration,
      audioUrl: `${config.publicBaseUrl}/audio/${digest.field}/${audioFile.path.split('/').pop()}`,
      audioSize: audioFile.size,
      audioFormat: audioFile.format,
      audioBitrate: audioFile.bitrate,
      voiceId: this.getDefaultVoice(digest.field),
      voiceName: this.getVoiceName(this.getDefaultVoice(digest.field)),
      voiceProvider: 'mock',
      publishedAt: new Date(),
      createdAt: new Date(),
      processedAt: new Date(),
      processingDuration: 0, // Will be set by calling function
      audioQualityScore: 90,
      scriptQualityScore: 85,
      isMockData: config.mockTTSService,
      mockAudioPath: audioFile.path,
    }

    return episode
  }

  private generateEpisodeDescription(transcript: any, articles: Article[]): string {
    const topics = [...new Set(articles.map(a => a.subfield))].slice(0, 3)
    const venues = [...new Set(articles.map(a => a.venue))].slice(0, 2)

    return `Join us for this week's exploration of cutting-edge research in ${topics.join(', ')}. We dive into ${articles.length} fascinating studies from ${venues.join(' and ')}, covering everything from ${articles[0]?.subfield || 'emerging discoveries'} to ${articles[articles.length - 1]?.subfield || 'innovative methodologies'}. Perfect for your commute, lab work, or any time you want to stay current with the latest academic research.`
  }

  private formatTranscriptForAudio(transcript: any): string {
    let script = ''

    script += transcript.introduction + '\n\n'

    transcript.segments.forEach((segment: any, index: number) => {
      script += `${segment.title}\n\n`
      script += segment.content + '\n\n'

      if (segment.transition) {
        script += segment.transition + '\n\n'
      }
    })

    script += transcript.conclusion

    return script
  }

  private formatTranscriptForDisplay(transcript: any): string {
    let display = ''

    display += `# ${transcript.title}\n\n`
    display += `**Duration:** ${transcript.totalDuration} minutes\n\n`
    display += `**Published:** ${new Date().toLocaleDateString()}\n\n`

    display += '## Introduction\n\n'
    display += transcript.introduction + '\n\n'

    transcript.segments.forEach((segment: any, index: number) => {
      display += `## ${segment.title}\n\n`
      display += segment.content + '\n\n'

      if (segment.transition) {
        display += `*${segment.transition}*\n\n`
      }
    })

    display += '## Conclusion\n\n'
    display += transcript.conclusion + '\n\n'

    display += '---\n\n'
    display += '*This transcript was generated by Bite Size Academic using advanced summarization techniques. For the full audio experience, subscribe to our podcast feed.*'

    return display
  }

  private async getNextEpisodeNumber(field: AcademicField): Promise<number> {
    // In production, this would query the database for the next episode number
    // For now, simulate episode numbering
    return Math.floor(Math.random() * 50) + 1
  }

  private getDefaultVoice(field: AcademicField): string {
    const voiceMapping: Record<string, string> = {
      'life-sciences': 'Joanna',
      'ai-computing': 'Matthew',
      'humanities-culture': 'Joanna',
      'policy-governance': 'Matthew',
      'climate-earth-systems': 'Joanna',
    }

    return voiceMapping[field] || 'Joanna'
  }

  private getVoiceName(voiceId: string): string {
    const voiceNames: Record<string, string> = {
      'Joanna': 'Joanna (American English)',
      'Matthew': 'Matthew (American English)',
      'Emma': 'Emma (British English)',
      'Brian': 'Brian (British English)',
    }

    return voiceNames[voiceId] || 'Joanna (American English)'
  }

  private getBitrateForQuality(quality: string): number {
    const bitrates: Record<string, number> = {
      'low': 64,
      'medium': 128,
      'high': 192,
    }

    return bitrates[quality] || 128
  }

  async generateRSSFeed(
    episodes: PodcastEpisode[],
    field: AcademicField
  ): Promise<string> {
    logger.info('Generating RSS feed', {
      field,
      episodeCount: episodes.length,
    })

    const fieldInfo = this.getFieldInfo(field)
    const feedUrl = `${config.publicBaseUrl}/feeds/${field}.xml`

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bite Size ${fieldInfo.name}</title>
    <link>${config.publicBaseUrl}</link>
    <description>Weekly research highlights from the world of ${fieldInfo.name}. Each episode covers 3-5 cutting-edge research papers in under 15 minutes, perfect for academics who want to stay current without information overload.</description>
    <language>en-us</language>
    <copyright>© 2024 Bite Size Academic</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${episodes[0]?.publishedAt?.toUTCString() || new Date().toUTCString()}</pubDate>

    <itunes:author>Bite Size Academic</itunes:author>
    <itunes:subtitle>Weekly research digest in audio format</itunes:subtitle>
    <itunes:summary>Stay current with cutting-edge academic research in bite-sized audio episodes. Each week we cover the most important developments in ${fieldInfo.name}.</itunes:summary>
    <itunes:owner>
      <itunes:name>Bite Size Academic</itunes:name>
      <itunes:email>hello@bite-size-academic.com</itunes:email>
    </itunes:owner>

    <itunes:image href="${config.publicBaseUrl}/images/podcast-${field}.jpg" />
    <itunes:category text="Science">
      <itunes:category text="Natural Sciences" />
    </itunes:category>

    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />

    ${episodes
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map(episode => this.generateRSSEpisode(episode))
      .join('\n    ')}
  </channel>
</rss>`

    // Save RSS feed to storage
    const directory = `${config.storageDir}/feeds`
    ensureDirectoryExists(directory)

    const filename = `${field}.xml`
    const filePath = `${directory}/${filename}`

    // In a real implementation, you would write the file
    logger.info('RSS feed generated', {
      field,
      filePath,
      episodeCount: episodes.length,
    })

    return rss
  }

  private generateRSSEpisode(episode: PodcastEpisode): string {
    return `
    <item>
      <title>${episode.title}</title>
      <description>${episode.description}</description>
      <itunes:author>Bite Size Academic</itunes:author>
      <itunes:subtitle>Episode ${episode.episodeNumber}</itunes:subtitle>
      <itunes:summary>${episode.description}</itunes:summary>
      <itunes:duration>${episode.duration}</itunes:duration>
      <itunes:explicit>no</itunes:explicit>
      <pubDate>${episode.publishedAt.toUTCString()}</pubDate>
      <guid isPermaLink="false">${episode.id}</guid>
      <enclosure url="${episode.audioUrl}" type="audio/mpeg" length="${episode.audioSize}" />
    </item>`
  }

  private getFieldInfo(field: AcademicField) {
    const fieldMap = {
      'life-sciences': { name: 'Life Sciences', emoji: '🧬' },
      'ai-computing': { name: 'AI & Computing', emoji: '🤖' },
      'humanities-culture': { name: 'Humanities & Culture', emoji: '📚' },
      'policy-governance': { name: 'Policy & Governance', emoji: '🏛️' },
      'climate-earth-systems': { name: 'Climate & Earth Systems', emoji: '🌍' },
    }

    return fieldMap[field] || fieldMap['life-sciences']
  }

  async validatePodcastEpisode(episode: PodcastEpisode): Promise<{
    valid: boolean
    issues: string[]
    suggestions: string[]
  }> {
    const issues: string[] = []
    const suggestions: string[] = []

    // Check required fields
    if (!episode.title || episode.title.length < 10) {
      issues.push('Episode title is too short or missing')
    }

    if (!episode.description || episode.description.length < 50) {
      issues.push('Episode description is too short or missing')
    }

    if (!episode.script || episode.script.length < 100) {
      issues.push('Episode script is too short or missing')
    }

    // Check audio specifications
    if (episode.duration < 300) { // Less than 5 minutes
      suggestions.push('Consider extending episode to at least 8 minutes for better listener engagement')
    }

    if (episode.duration > 1200) { // More than 20 minutes
      suggestions.push('Consider shortening episode to maintain bite-sized format')
    }

    if (episode.audioBitrate < 64) {
      issues.push('Audio bitrate is too low for acceptable quality')
    }

    // Check content quality
    if (episode.audioQualityScore < 70) {
      suggestions.push('Audio quality could be improved for better listener experience')
    }

    if (episode.scriptQualityScore < 70) {
      suggestions.push('Script content could be enhanced for better engagement')
    }

    // Check technical specifications
    if (!episode.audioUrl || !episode.audioUrl.startsWith('http')) {
      issues.push('Audio URL is missing or invalid')
    }

    if (!episode.audioFormat || !['mp3', 'wav', 'm4a'].includes(episode.audioFormat)) {
      issues.push('Audio format is invalid or unsupported')
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions,
    }
  }
}