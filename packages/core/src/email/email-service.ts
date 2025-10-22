import type { EmailContent, WeeklyDigest, User, Article } from '../types'
import { config } from '../config'
import { createLogger, ensureDirectoryExists, sanitizeFilename } from '../utils'

const logger = createLogger('EmailService')

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  preheader: string
  htmlContent: string
  textContent: string
}

export interface EmailDeliveryOptions {
  userId: string
  templateId: string
  personalizationData?: Record<string, any>
  scheduleFor?: Date
  trackOpens?: boolean
  trackClicks?: boolean
}

export interface DeliveryResult {
  success: boolean
  emailId: string
  externalId?: string
  deliveredAt?: Date
  error?: string
  metadata?: Record<string, any>
}

export class EmailService {
  constructor() {
    logger.info('Email service initialized', {
      provider: config.emailProvider,
      mockMode: config.mockMode,
    })

    // Ensure email storage directory exists
    ensureDirectoryExists(`${config.storageDir}/mock-emails`)
  }

  async sendWeeklyDigest(
    user: User,
    digest: WeeklyDigest,
    articles: Article[]
  ): Promise<DeliveryResult> {
    logger.info('Sending weekly digest email', {
      userId: user.id,
      userEmail: user.email,
      digestId: digest.id,
      field: digest.field,
    })

    try {
      const template = await this.generateDigestTemplate(user, digest, articles)
      const deliveryOptions: EmailDeliveryOptions = {
        userId: user.id,
        templateId: template.id,
        personalizationData: {
          userName: this.extractUserName(user),
          userField: user.field,
        },
        trackOpens: true,
        trackClicks: true,
      }

      return await this.sendEmail(template, user.email, deliveryOptions)

    } catch (error) {
      logger.error('Failed to send weekly digest', {
        userId: user.id,
        digestId: digest.id,
        error,
      })
      throw new Error(`Weekly digest delivery failed: ${error}`)
    }
  }

  async sendWelcomeEmail(user: User): Promise<DeliveryResult> {
    logger.info('Sending welcome email', {
      userId: user.id,
      userEmail: user.email,
      field: user.field,
    })

    try {
      const template = await this.generateWelcomeTemplate(user)
      const deliveryOptions: EmailDeliveryOptions = {
        userId: user.id,
        templateId: template.id,
        personalizationData: {
          userName: this.extractUserName(user),
          userField: user.field,
          confirmationCode: user.confirmationCode,
        },
        trackOpens: true,
        trackClicks: true,
      }

      return await this.sendEmail(template, user.email, deliveryOptions)

    } catch (error) {
      logger.error('Failed to send welcome email', {
        userId: user.id,
        error,
      })
      throw new Error(`Welcome email delivery failed: ${error}`)
    }
  }

  async sendConfirmationEmail(user: User): Promise<DeliveryResult> {
    logger.info('Sending confirmation email', {
      userId: user.id,
      userEmail: user.email,
    })

    try {
      const template = await this.generateConfirmationTemplate(user)
      const deliveryOptions: EmailDeliveryOptions = {
        userId: user.id,
        templateId: template.id,
        personalizationData: {
          userName: this.extractUserName(user),
          confirmationCode: user.confirmationCode,
          confirmationLink: this.generateConfirmationLink(user),
        },
        trackOpens: true,
        trackClicks: true,
      }

      return await this.sendEmail(template, user.email, deliveryOptions)

    } catch (error) {
      logger.error('Failed to send confirmation email', {
        userId: user.id,
        error,
      })
      throw new Error(`Confirmation email delivery failed: ${error}`)
    }
  }

  async sendPreferenceUpdateEmail(user: User): Promise<DeliveryResult> {
    logger.info('Sending preference update email', {
      userId: user.id,
      userEmail: user.email,
      newField: user.field,
    })

    try {
      const template = await this.generatePreferenceUpdateTemplate(user)
      const deliveryOptions: EmailEmailOptions = {
        userId: user.id,
        templateId: template.id,
        personalizationData: {
          userName: this.extractUserName(user),
          userField: user.field,
        },
        trackOpens: true,
        trackClicks: true,
      }

      return await this.sendEmail(template, user.email, deliveryOptions)

    } catch (error) {
      logger.error('Failed to send preference update email', {
        userId: user.id,
        error,
      })
      throw new Error(`Preference update email delivery failed: ${error}`)
    }
  }

  private async sendEmail(
    template: EmailTemplate,
    toEmail: string,
    options: EmailDeliveryOptions
  ): Promise<DeliveryResult> {
    if (config.mockMode) {
      return this.sendMockEmail(template, toEmail, options)
    }

    // In production, integrate with real email service
    return this.sendRealEmail(template, toEmail, options)
  }

  private async sendMockEmail(
    template: EmailTemplate,
    toEmail: string,
    options: EmailDeliveryOptions
  ): Promise<DeliveryResult> {
    logger.info('Sending mock email', {
      templateId: template.id,
      toEmail,
      userId: options.userId,
    })

    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date()

    // Save email to local storage
    const emailContent: EmailContent = {
      id: emailId,
      userId: options.userId,
      digestId: options.personalizationData?.digestId,
      templateType: this.getTemplateType(template.id),
      subject: template.subject,
      preheader: template.preheader,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      userName: options.personalizationData?.userName,
      userField: options.personalizationData?.userField,
      fromEmail: config.emailFrom,
      fromName: 'Bite Size Academic',
      toEmail,
      sentAt: timestamp,
      deliveredAt: new Date(timestamp.getTime() + Math.random() * 300000), // 0-5 minutes
      externalId: `mock_${emailId}`,
      deliveryStatus: 'delivered',
      isMockData: true,
      localFilePath: await this.saveEmailLocally(template, toEmail, emailId),
    }

    // Simulate delivery analytics
    await this.simulateDeliveryAnalytics(emailContent)

    logger.info('Mock email sent successfully', {
      emailId,
      toEmail,
      templateId: template.id,
    })

    return {
      success: true,
      emailId,
      externalId: emailContent.externalId,
      deliveredAt: emailContent.deliveredAt,
      metadata: {
        localFilePath: emailContent.localFilePath,
        deliveryTime: emailContent.deliveredAt,
      },
    }
  }

  private async sendRealEmail(
    template: EmailTemplate,
    toEmail: string,
    options: EmailDeliveryOptions
  ): Promise<DeliveryResult> {
    // In production, integrate with Resend, SendGrid, or other email services
    logger.info('Sending real email via external service', {
      templateId: template.id,
      toEmail,
      provider: config.emailProvider,
    })

    // Placeholder for real email service integration
    throw new Error('Real email service integration not implemented in MVP')
  }

  private async generateDigestTemplate(
    user: User,
    digest: WeeklyDigest,
    articles: Article[]
  ): Promise<EmailTemplate> {
    const fieldEmoji = this.getFieldEmoji(digest.field)
    const fieldName = this.getFieldName(digest.field)

    const subjectVariations = [
      `${fieldEmoji} ${fieldName}: ${this.generateSubjectFromArticles(articles)}`,
      `${fieldEmoji} This Week in ${fieldName}: ${this.getPrimaryTopic(articles)}`,
      `${fieldEmoji} Research Highlights: ${this.getPrimaryTopic(articles)}`,
      `${fieldEmoji} Bite Size ${fieldName}: ${articles.length} Major Research Breakthroughs`,
    ]

    const subject = subjectVariations[Math.floor(Math.random() * subjectVariations.length)]

    const templateId = `digest_${digest.field}_${digest.weekNumber}_${digest.year}`

    return {
      id: templateId,
      name: 'Weekly Digest',
      subject,
      preheader: `Research highlights from ${this.getTopVenues(articles)} shape the future of ${fieldName}`,
      htmlContent: await this.generateDigestHTML(user, digest, articles),
      textContent: await this.generateDigestText(user, digest, articles),
    }
  }

  private async generateDigestHTML(
    user: User,
    digest: WeeklyDigest,
    articles: Article[]
  ): Promise<string> {
    const fieldEmoji = this.getFieldEmoji(digest.field)
    const fieldName = this.getFieldName(digest.field)
    const userName = this.extractUserName(user)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly ${fieldName} Digest</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1e3a8a, #0891b2); padding: 32px 24px; text-align: center; }
        .header h1 { color: white; font-size: 28px; margin: 0 0 8px 0; }
        .header p { color: #bfdbfe; font-size: 16px; margin: 0; }
        .intro { background: #f9fafb; padding: 24px; border-left: 4px solid #0891b2; }
        .intro h2 { color: #1e3a8a; font-size: 20px; margin: 0 0 12px 0; font-family: Georgia, serif; }
        .article { padding: 24px; border-bottom: 1px solid #e5e7eb; }
        .article:last-child { border-bottom: none; }
        .article-title { color: #1e3a8a; font-size: 18px; margin: 0 0 8px 0; font-family: Georgia, serif; }
        .article-meta { color: #6b7280; font-size: 14px; margin: 0 0 16px 0; }
        .key-insight { background: #ecfdf5; border-left: 4px solid #059669; padding: 16px; margin: 16px 0; }
        .key-insight h4 { color: #065f46; margin: 0 0 8px 0; font-size: 14px; }
        .key-insight p { color: #064e3b; margin: 0; }
        .summary { color: #374151; margin: 16px 0; }
        .cta { text-align: center; margin: 20px 0; }
        .cta a { background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .footer { background: #f3f4f6; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        .footer a { color: #0891b2; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>${fieldEmoji} Bite Size ${fieldName}</h1>
            <p>Weekly research digest • Week ${digest.weekNumber}, ${digest.year}</p>
        </div>

        <!-- Introduction -->
        <div class="intro">
            <h2>This Week's Research Focus</h2>
            <p>${userName ? `Hi ${userName}, ` : ''}${this.generatePersonalizedIntro(digest, articles)}</p>
        </div>

        <!-- Articles -->
        ${articles.map((article, index) => this.generateArticleHTML(article, index + 1)).join('')}

        <!-- Footer -->
        <div class="footer">
            <p><strong>💬 Feedback Welcome:</strong> Reply to this email with thoughts on this week's content.</p>
            <p><strong>🎧 Premium Access:</strong> Upgrade to receive the audio version of this digest.</p>
            <p><strong>📚 Manage Preferences:</strong> <a href="#">Update your academic field</a> or <a href="#">unsubscribe</a></p>
            <p style="margin-top: 20px; font-size: 12px;">Bite Size Academic • Curated with 🧠 for curious minds</p>
        </div>
    </div>
</body>
</html>`
  }

  private generateArticleHTML(article: Article, position: number): string {
    const openAccessBadge = article.openAccess ? '✅ Open Access' : ''
    const readingTime = article.readingTime || 5

    return `
        <div class="article">
            <h3 class="article-title">${position}. ${article.title}</h3>
            <div class="article-meta">
                <strong>Authors:</strong> ${article.authors.slice(0, 3).map(a => a.name).join(', ')}${article.authors.length > 3 ? ' et al.' : ''}<br>
                <strong>Venue:</strong> ${article.venue} • <strong>Reading Time:</strong> ${readingTime} min ${openAccessBadge ? `• ${openAccessBadge}` : ''}
            </div>

            <div class="key-insight">
                <h4>💡 Why This Matters</h4>
                <p>${article.whyThisMatters}</p>
            </div>

            <div class="summary">
                <p>${article.summary}</p>
            </div>

            ${article.keyFindings && article.keyFindings.length > 0 ? `
                <div style="background: #fef3c7; padding: 16px; margin: 16px 0; border-radius: 8px;">
                    <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">🔬 Key Findings:</h4>
                    <ul style="color: #78350f; font-size: 14px; margin: 8px 0 0 20px; line-height: 1.5;">
                        ${article.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="cta">
                <a href="${article.url}" target="_blank">Read Full Study →</a>
            </div>
        </div>`
  }

  private async generateDigestText(
    user: User,
    digest: WeeklyDigest,
    articles: Article[]
  ): Promise<string> {
    const fieldEmoji = this.getFieldEmoji(digest.field)
    const fieldName = this.getFieldName(digest.field)
    const userName = this.extractUserName(user)

    let text = `${fieldEmoji} BITE SIZE ${fieldName.toUpperCase()} - WEEK ${digest.weekNumber}, ${digest.year}\n\n`
    text += `Weekly research digest from Bite Size Academic\n\n`

    if (userName) {
      text += `Hi ${userName},\n\n`
    }

    text += `${this.generatePersonalizedIntro(digest, articles)}\n\n`
    text += `${'='.repeat(60)}\n\n`

    articles.forEach((article, index) => {
      text += `${index + 1}. ${article.title}\n`
      text += `Authors: ${article.authors.slice(0, 3).map(a => a.name).join(', ')}${article.authors.length > 3 ? ' et al.' : ''}\n`
      text += `Venue: ${article.venue}\n`
      text += `Reading Time: ${article.readingTime || 5} minutes\n`
      if (article.openAccess) text += `Access: Open Access ✅\n`
      text += `\n`

      text += `WHY THIS MATTERS:\n${article.whyThisMatters}\n\n`

      text += `SUMMARY:\n${article.summary}\n\n`

      if (article.keyFindings && article.keyFindings.length > 0) {
        text += `KEY FINDINGS:\n`
        article.keyFindings.forEach(finding => {
          text += `• ${finding}\n`
        })
        text += '\n'
      }

      text += `Read the full study: ${article.url}\n`
      text += `${'-'.repeat(60)}\n\n`
    })

    text += `FEEDBACK & PREFERENCES:\n`
    text += `• Reply with your thoughts on this week's content\n`
    text += `• Upgrade to premium for audio podcast version\n`
    text += `• Update your academic field preferences\n`
    text += `• Unsubscribe from this digest\n\n`

    text += `Bite Size Academic • Curated with 🧠 for curious minds\n`

    return text
  }

  private async generateWelcomeTemplate(user: User): Promise<EmailTemplate> {
    const fieldName = this.getFieldName(user.field)
    const fieldEmoji = this.getFieldEmoji(user.field)

    return {
      id: `welcome_${user.field}`,
      name: 'Welcome Email',
      subject: `Welcome to Bite Size Academic! ${fieldEmoji}`,
      preheader: `Get ready for smarter, faster research updates in ${fieldName}`,
      htmlContent: await this.generateWelcomeHTML(user),
      textContent: this.generateWelcomeText(user),
    }
  }

  private async generateWelcomeHTML(user: User): Promise<string> {
    const fieldName = this.getFieldName(user.field)
    const fieldEmoji = this.getFieldEmoji(user.field)
    const confirmationLink = this.generateConfirmationLink(user)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Bite Size Academic</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .hero { background: linear-gradient(135deg, #1e3a8a, #0891b2); padding: 48px 24px; text-align: center; color: white; }
        .hero h1 { font-size: 32px; margin: 0 0 16px 0; }
        .hero p { font-size: 18px; margin: 0; }
        .content { padding: 32px 24px; }
        .features { margin: 32px 0; }
        .feature { display: flex; align-items: flex-start; margin-bottom: 24px; }
        .feature-icon { font-size: 24px; margin-right: 16px; }
        .feature h3 { margin: 0 0 8px 0; color: #1e3a8a; }
        .confirmation { background: #ecfdf5; border: 2px solid #059669; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0; }
        .confirmation h3 { color: #065f46; margin: 0 0 12px 0; }
        .confirmation a { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>Welcome to Bite Size Academic!</h1>
            <p>You're all set to receive your weekly digest of ${fieldName} research highlights</p>
        </div>

        <div class="content">
            <h2>What to Expect Every Week</h2>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📧</div>
                    <div>
                        <h3>Curated Email Digest</h3>
                        <p>3-5 carefully selected research papers with clear summaries and context about why each finding matters.</p>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">⏰</div>
                    <div>
                        <h3>Time-Efficient Learning</h3>
                        <p>Stay current in just 15-20 minutes per week with reading time estimates and priority-based organization.</p>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">🎧</div>
                    <div>
                        <h3>Optional Audio Version (Premium)</h3>
                        <p>Listen to weekly podcast episodes covering the same content, perfect for commutes or lab work.</p>
                    </div>
                </div>
            </div>

            <div class="confirmation">
                <h3>📧 Confirm Your Email Address</h3>
                <p>Please click the button below to confirm your subscription and start receiving your weekly ${fieldName} digest.</p>
                <br>
                <a href="${confirmationLink}">Confirm Email Address</a>
                <p style="margin-top: 16px; font-size: 14px;">Or copy and paste this link: ${confirmationLink}</p>
            </div>

            <div style="text-align: center; padding: 32px 0; border-top: 1px solid #e5e7eb; margin-top: 32px;">
                <p><strong>Your Subscription Details:</strong></p>
                <p>Email: ${user.email}<br>
                Field: ${fieldName}<br>
                Delivery: Fridays at 10:00 AM</p>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  private generateWelcomeText(user: User): string {
    const fieldName = this.getFieldName(user.field)
    const confirmationLink = this.generateConfirmationLink(user)

    return `WELCOME TO BITE SIZE ACADEMIC! 🎓

You're all set to receive your weekly digest of ${fieldName} research highlights.

WHAT TO EXPECT EVERY WEEK:

📧 CURATED EMAIL DIGEST
3-5 carefully selected research papers with clear summaries and context about why each finding matters.

⏰ TIME-EFFICIENT LEARNING
Stay current in just 15-20 minutes per week with reading time estimates and priority-based organization.

🎧 OPTIONAL AUDIO VERSION (PREMIUM)
Listen to weekly podcast episodes covering the same content, perfect for commutes or lab work.

📧 CONFIRM YOUR EMAIL ADDRESS
Please click the link below to confirm your subscription:
${confirmationLink}

Or copy and paste this link:
${confirmationLink}

YOUR SUBSCRIPTION DETAILS:
Email: ${user.email}
Field: ${fieldName}
Delivery: Fridays at 10:00 AM

We're excited to help you stay current with cutting-edge research in ${fieldName}!

Bite Size Academic Team
Curated with 🧠 for curious minds`
  }

  private async generateConfirmationTemplate(user: User): Promise<EmailTemplate> {
    return {
      id: 'confirmation',
      name: 'Email Confirmation',
      subject: 'Please confirm your Bite Size Academic subscription',
      preheader: 'One click to activate your weekly research digest',
      htmlContent: await this.generateConfirmationHTML(user),
      textContent: this.generateConfirmationText(user),
    }
  }

  private async generateConfirmationHTML(user: User): Promise<string> {
    const confirmationLink = this.generateConfirmationLink(user)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Email</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #1e3a8a; padding: 32px 24px; text-align: center; color: white; }
        .content { padding: 32px 24px; }
        .confirmation-box { background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
        .confirmation-box a { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Confirm Your Email Address</h1>
            <p>Activate your Bite Size Academic subscription</p>
        </div>

        <div class="content">
            <p>Hi there!</p>

            <p>Thanks for signing up for Bite Size Academic! To complete your registration and start receiving your weekly research digest, please confirm your email address.</p>

            <div class="confirmation-box">
                <h3>Click to Confirm Your Subscription</h3>
                <p style="margin-bottom: 20px;">This verifies your email and activates your weekly digest delivery.</p>
                <a href="${confirmationLink}">Confirm Email Address</a>
                <p style="margin-top: 16px; font-size: 14px;">Or copy and paste this link:</p>
                <p style="word-break: break-all; font-size: 12px; color: #6b7280;">${confirmationLink}</p>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Your email is confirmed and added to our subscriber list</li>
                <li>You'll receive a welcome email with more details</li>
                <li>Your first weekly digest arrives next Friday</li>
            </ul>

            <p style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                If you didn't sign up for Bite Size Academic, you can safely ignore this email.
            </p>
        </div>
    </div>
</body>
</html>`
  }

  private generateConfirmationText(user: User): string {
    const confirmationLink = this.generateConfirmationLink(user)

    return `CONFIRM YOUR BITE SIZE ACADEMIC SUBSCRIPTION

Hi there!

Thanks for signing up for Bite Size Academic! To complete your registration and start receiving your weekly research digest, please confirm your email address.

CLICK TO CONFIRM:
${confirmationLink}

Or copy and paste this link:
${confirmationLink}

WHAT HAPPENS NEXT?
• Your email is confirmed and added to our subscriber list
• You'll receive a welcome email with more details
• Your first weekly digest arrives next Friday

If you didn't sign up for Bite Size Academic, you can safely ignore this email.

Bite Size Academic Team`
  }

  private async generatePreferenceUpdateTemplate(user: User): Promise<EmailTemplate> {
    const fieldName = this.getFieldName(user.field)

    return {
      id: 'preference-update',
      name: 'Preference Update',
      subject: `Your ${fieldName} subscription has been updated`,
      preheader: 'Your preferences have been successfully updated',
      htmlContent: await this.generatePreferenceUpdateHTML(user),
      textContent: this.generatePreferenceUpdateText(user),
    }
  }

  private async generatePreferenceUpdateHTML(user: User): Promise<string> {
    const fieldName = this.getFieldName(user.field)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preferences Updated</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #059669; padding: 32px 24px; text-align: center; color: white; }
        .content { padding: 32px 24px; }
        .success-box { background: #ecfdf5; border: 2px solid #059669; border-radius: 8px; padding: 24px; margin: 24px 0; }
        .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Preferences Updated Successfully</h1>
            <p>Your subscription settings have been changed</p>
        </div>

        <div class="content">
            <p>Hi there!</p>

            <p>Your Bite Size Academic preferences have been successfully updated. Here are your current subscription details:</p>

            <div class="success-box">
                <h3>Your Updated Preferences</h3>
                <div class="details">
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Academic Field:</strong> ${fieldName}</p>
                    <p><strong>Delivery Day:</strong> Friday</p>
                    <p><strong>Delivery Time:</strong> 10:00 AM</p>
                    <p><strong>Status:</strong> Active ✅</p>
                </div>
            </div>

            <p><strong>What to expect:</strong></p>
            <ul>
                <li>Your next weekly digest will feature content from ${fieldName}</li>
                <li>You'll receive your next digest this Friday at 10:00 AM</li>
                <li>All future digests will be tailored to your new field preference</li>
            </ul>

            <p style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <strong>Want to make additional changes?</strong><br>
                • Reply to this email with any questions<br>
                • Visit your preferences page to make more changes<br>
                • Share Bite Size Academic with colleagues
            </p>
        </div>
    </div>
</body>
</html>`
  }

  private generatePreferenceUpdateText(user: User): string {
    const fieldName = this.getFieldName(user.field)

    return `✅ PREFERENCES UPDATED SUCCESSFULLY

Your Bite Size Academic preferences have been successfully updated.

YOUR UPDATED PREFERENCES:
Email: ${user.email}
Academic Field: ${fieldName}
Delivery Day: Friday
Delivery Time: 10:00 AM
Status: Active ✅

WHAT TO EXPECT:
• Your next weekly digest will feature content from ${fieldName}
• You'll receive your next digest this Friday at 10:00 AM
• All future digests will be tailored to your new field preference

WANT TO MAKE ADDITIONAL CHANGES?
• Reply to this email with any questions
• Visit your preferences page to make more changes
• Share Bite Size Academic with colleagues

Thanks for staying curious!
Bite Size Academic Team`
  }

  private async saveEmailLocally(
    template: EmailTemplate,
    toEmail: string,
    emailId: string
  ): Promise<string> {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const filename = sanitizeFilename(`${template.id}_${toEmail}_${emailId}.html`)
    const directory = `${config.storageDir}/mock-emails/${year}/${month}`

    ensureDirectoryExists(directory)

    const filePath = `${directory}/${filename}`

    // In a real implementation, you would write the file
    // For now, return the simulated path
    logger.info('Email saved locally', { filePath })

    return filePath
  }

  private async simulateDeliveryAnalytics(emailContent: EmailContent): Promise<void> {
    // Simulate delivery analytics (open rates, click rates, etc.)
    const openProbability = 0.65 // 65% open rate
    const clickProbability = 0.15 // 15% click rate

    const willOpen = Math.random() < openProbability
    const willClick = Math.random() < clickProbability

    if (willOpen) {
      emailContent.openedAt = new Date(
        emailContent.deliveredAt!.getTime() + Math.random() * 24 * 60 * 60 * 1000 // 0-24 hours
      )
    }

    if (willClick) {
      emailContent.clickedAt = new Date(
        (emailContent.openedAt || emailContent.deliveredAt!).getTime() + Math.random() * 60 * 60 * 1000 // 0-1 hour after open
      )
    }
  }

  private extractUserName(user: User): string {
    // Extract first name from email if no name provided
    if (user.name) return user.name.split(' ')[0]
    return user.email.split('@')[0]
  }

  private getFieldEmoji(field: string): string {
    const emojis = {
      'life-sciences': '🧬',
      'ai-computing': '🤖',
      'humanities-culture': '📚',
      'policy-governance': '🏛️',
      'climate-earth-systems': '🌍',
    }
    return emojis[field] || '📚'
  }

  private getFieldName(field: string): string {
    const names = {
      'life-sciences': 'Life Sciences',
      'ai-computing': 'AI & Computing',
      'humanities-culture': 'Humanities & Culture',
      'policy-governance': 'Policy & Governance',
      'climate-earth-systems': 'Climate & Earth Systems',
    }
    return names[field] || 'Academic Research'
  }

  private generateSubjectFromArticles(articles: Article[]): string {
    if (articles.length === 0) return 'Latest Research'
    if (articles.length === 1) return this.extractKeyTopic(articles[0].title)

    const topics = articles.slice(0, 2).map(a => this.extractKeyTopic(a.title))
    return topics.join(' & ')
  }

  private getPrimaryTopic(articles: Article[]): string {
    if (articles.length === 0) return 'Research'
    return this.extractKeyTopic(articles[0].title)
  }

  private getTopVenues(articles: Article[]): string {
    const venues = articles.map(a => a.venue)
    const uniqueVenues = [...new Set(venues)]
    return uniqueVenues.slice(0, 2).join(' and ')
  }

  private extractKeyTopic(title: string): string {
    // Extract the most important topic from title
    const keywords = title.split(' ').filter(word => word.length > 4)
    return keywords[0] || 'Research'
  }

  private generatePersonalizedIntro(digest: WeeklyDigest, articles: Article[]): string {
    const topics = [...new Set(articles.map(a => a.subfield))].slice(0, 3)
    const qualityTypes = articles.filter(a => a.quality === 'breakthrough').length

    let intro = `this week brings ${articles.length} remarkable advances that could transform how we approach ${topics.join(' and ')}. `

    if (qualityTypes > 0) {
      intro += `There ${qualityTypes === 1 ? 'is' : 'are'} ${qualityTypes} potential ${qualityTypes === 1 ? 'breakthrough' : 'breakthroughs'} that could reshape our understanding of the field. `
    }

    intro += `From cutting-edge methodologies to surprising discoveries, these findings represent the most exciting developments in academic research this week.`

    return intro
  }

  private getTemplateType(templateId: string): 'weekly-digest' | 'welcome' | 'preference-update' | 'premium-upgrade' {
    if (templateId.includes('digest')) return 'weekly-digest'
    if (templateId.includes('welcome')) return 'welcome'
    if (templateId.includes('preference')) return 'preference-update'
    if (templateId.includes('premium')) return 'premium-upgrade'
    return 'weekly-digest'
  }

  private generateConfirmationLink(user: User): string {
    // Generate confirmation link - in production, this would be a real URL
    return `${config.publicBaseUrl}/confirm?code=${user.confirmationCode}&email=${encodeURIComponent(user.email)}`
  }
}