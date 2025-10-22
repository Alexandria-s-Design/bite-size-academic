# Mock Mode Specifications and Boundaries

## Overview

Mock Mode enables **Bite Size Academic** to function without external dependencies, API keys, or real network calls. This ensures deterministic testing, offline development, and zero-cost operation during development and testing phases.

## Mock Mode Configuration

### Environment Variables
```bash
# Enable mock mode (default for development)
MOCK_MODE=1

# Mock specific services
MOCK_EMAIL_SERVICE=1
MOCK_TTS_SERVICE=1
MOCK_ACADEMIC_APIS=1

# Offline mode (no network calls)
OFFLINE_MODE=1

# Use local fixtures only
FIXTURES_ONLY=1
```

### Configuration Detection
```typescript
const config = {
  mockMode: process.env.MOCK_MODE === '1',
  mockEmailService: process.env.MOCK_EMAIL_SERVICE === '1',
  mockTTSService: process.env.MOCK_TTS_SERVICE === '1',
  mockAcademicAPIs: process.env.MOCK_ACADEMIC_APIS === '1',
  offlineMode: process.env.OFFLINE_MODE === '1',
  fixturesOnly: process.env.FIXTURES_ONLY === '1'
};
```

## Service Mock Specifications

### 1. Email Service Mock

#### Real Service Behavior (Resend/SendGrid)
- API authentication with API keys
- Template rendering and personalization
- Delivery to SMTP servers
- Bounce and webhook handling
- Rate limiting and quotas

#### Mock Service Implementation
```typescript
interface MockEmailService {
  // Simulates email sending without real delivery
  sendEmail(params: EmailParams): Promise<MockEmailResponse>;

  // Saves emails to local file system for inspection
  saveEmailToLocal(params: EmailParams): Promise<string>;

  // Simulates delivery statistics
  getMockDeliveryStats(emailId: string): Promise<DeliveryStats>;
}

// Local storage structure
/storage/mock-emails/
├── 2024/
│   ├── 01/
│   │   ├── digest-life-sciences-2024-W03.html
│   │   ├── digest-ai-computing-2024-W03.html
│   │   └── welcome-email-{user-id}.html
│   └── 02/
└── delivery-stats.json
```

#### Mock Email Features
- **HTML Generation**: Full email templates rendered
- **Personalization**: User name, field preferences, custom content
- **Delivery Simulation**: Random "delivered" status with timestamps
- **Bounce Handling**: Simulated bounce rates and reasons
- **Analytics**: Mock open/click rates for testing

#### Boundary Conditions
- No real email delivery to external addresses
- Local test addresses (localhost, .test, .example) accepted
- Rate limiting simulated with configurable delays
- Template errors handled gracefully with fallbacks

### 2. Academic API Mocks

#### Real Academic APIs
- **arXiv.org**: RSS feeds and OAI-PMH API
- **Crossref**: REST API for metadata search
- **PubMed**: Entrez utilities for biomedical literature
- **Semantic Scholar**: API for paper metadata and citations
- **RSS Feeds**: Journal and conference RSS feeds

#### Mock Academic Data Sources
```typescript
interface MockAcademicSource {
  sourceId: string;
  sourceName: string;
  field: AcademicField;
  articles: MockArticle[];
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  lastUpdated: Date;
}

// Sample fixture structure
/fixtures/academic-sources/
├── life-sciences/
│   ├── nature-medicine.json
│   ├── cell.json
│   ├── pubmed-bioinformatics.json
│   └── biorxiv-biology.json
├── ai-computing/
│   ├── arxiv-ai.json
│   ├── neurips-papers.json
│   └── nature-machine-intelligence.json
└── humanities/
    ├── pmla.json
    ├── american-historical-review.json
    └── digital-humanities.json
```

#### Mock Article Schema
```typescript
interface MockArticle {
  id: string;
  title: string;
  authors: Author[];
  venue: string;
  abstract: string;
  url: string;
  publishedAt: Date;
  field: AcademicField;
  subfield: string;
  tags: string[];
  doi?: string;
  arxivId?: string;
  pubmedId?: string;
  citations?: number;
  readingTime: number;
  openAccess: boolean;

  // Mock quality metrics
  relevanceScore: number;
  impactScore: number;
  qualityScore: number;
}
```

#### Mock API Behaviors
- **Rate Limiting**: Simulated API delays and quotas
- **Error Handling**: Network timeouts, API errors, empty results
- **Content Variation**: Different article sets per "fetch"
- **Temporal Consistency**: Realistic publication date patterns
- **Source Diversity**: Balanced representation across venues

### 3. Text-to-Speech Mock

#### Real TTS Services
- **AWS Polly**: Professional speech synthesis
- **Google Cloud TTS**: Multiple voice options
- **Azure Speech**: High-quality neural voices

#### Mock TTS Implementation
```typescript
interface MockTTSService {
  generateAudio(script: string, options: TTSOptions): Promise<MockAudioResponse>;
  getVoices(): Promise<MockVoice[]>;
  getAudioInfo(audioId: string): Promise<MockAudioInfo>;
}

// Mock audio generation process
1. Script length calculation (words/characters)
2. Duration estimation (150 words per minute)
3. Voice selection based on field and content type
4. Mock MP3 file generation (silent or placeholder audio)
5. Metadata generation (title, description, artwork)

// Local storage structure
/storage/mock-audio/
├── life-sciences/
│   ├── 2024/
│   │   ├── W03-episode-1.mp3
│   │   ├── W03-episode-1.json (metadata)
│   │   └── W03-episode-1.txt (transcript)
│   └── 04/
├── ai-computing/
└── humanities/
```

#### Mock Audio Features
- **Placeholder Audio**: Silent MP3 files with correct duration
- **Metadata Generation**: Complete podcast episode metadata
- **Voice Simulation**: Different voice profiles per field
- **Quality Simulation**: Various audio quality options
- **Processing Time**: Realistic TTS processing delays

### 4. Billing/Payment Mock

#### Real Payment Services
- **Stripe**: Subscription management and payments
- **PayPal**: Alternative payment processing
- **Paddle**: International payment handling

#### Mock Billing Implementation
```typescript
interface MockBillingService {
  createSubscription(userId: string, plan: SubscriptionPlan): Promise<MockSubscription>;
  updateSubscription(subscriptionId: string, plan: SubscriptionPlan): Promise<MockSubscription>;
  cancelSubscription(subscriptionId: string): Promise<MockSubscription>;
  getSubscriptionStatus(userId: string): Promise<MockSubscriptionStatus>;
}

// Mock subscription data structure
/mock-data/subscriptions.json
{
  "subscriptions": [
    {
      "id": "sub_mock_001",
      "userId": "user_mock_001",
      "plan": "premium",
      "status": "active",
      "currentPeriodStart": "2024-01-01",
      "currentPeriodEnd": "2024-02-01",
      "mockPaymentMethod": "card_ending_4242"
    }
  ]
}
```

## Sample Data Fixtures

### Weekly Digest Samples

#### Life Sciences Digest Sample
```json
{
  "digestId": "ls-2024-W03",
  "field": "life-sciences",
  "weekNumber": 3,
  "year": 2024,
  "publishedAt": "2024-01-18T10:00:00Z",
  "articles": [
    {
      "id": "nature-medicine-2024-001",
      "title": "CRISPR Gene Editing Shows Promise for Rare Genetic Disorders",
      "authors": ["Sarah Chen, PhD", "Michael Rodriguez, MD"],
      "venue": "Nature Medicine",
      "summary": "Researchers demonstrate successful gene editing in patient-derived cells, showing potential therapeutic applications for three rare genetic conditions.",
      "whyThisMatters": "This represents a significant step toward personalized gene therapy for diseases with no current treatment options.",
      "readingTime": 4,
      "url": "https://nature.com/articles/mock-url-001",
      "publishedAt": "2024-01-15",
      "relevanceScore": 92,
      "tags": ["genetics", "crispr", "gene-therapy", "rare-diseases"]
    },
    {
      "id": "cell-2024-002",
      "title": "Novel Protein Structure Reveals Alzheimer's Disease Mechanism",
      "authors": ["Emma Thompson, PhD", "James Wilson, PhD"],
      "venue": "Cell",
      "summary": "Cryo-electron microscopy uncovers unexpected protein folding patterns that may explain amyloid plaque formation in Alzheimer's patients.",
      "whyThisMatters": "Understanding this mechanism could lead to new therapeutic approaches targeting protein aggregation.",
      "readingTime": 6,
      "url": "https://cell.com/articles/mock-url-002",
      "publishedAt": "2024-01-14",
      "relevanceScore": 88,
      "tags": ["neuroscience", "alzheimers", "protein-structure", "cryo-em"]
    }
  ]
}
```

#### AI & Computing Digest Sample
```json
{
  "digestId": "ai-2024-W03",
  "field": "ai-computing",
  "weekNumber": 3,
  "year": 2024,
  "publishedAt": "2024-01-18T10:00:00Z",
  "articles": [
    {
      "id": "arxiv-ai-2024-001",
      "title": "Large Language Models Show Emergent Mathematical Reasoning Abilities",
      "authors": ["Alex Kumar, PhD", "Lisa Zhang, PhD"],
      "venue": "arXiv.org",
      "summary": "New research demonstrates that scale alone can produce unexpected mathematical reasoning capabilities in language models without explicit training.",
      "whyThisMatters": "This challenges our understanding of how reasoning emerges in AI systems and has implications for AGI development.",
      "readingTime": 7,
      "url": "https://arxiv.org/abs/mock-url-001",
      "publishedAt": "2024-01-16",
      "relevanceScore": 95,
      "tags": ["llm", "emergent-abilities", "mathematical-reasoning", "scaling-laws"]
    }
  ]
}
```

### Podcast Episode Script Samples

#### Life Sciences Episode Script
```markdown
# Episode 3: Gene Therapy Breakthroughs and Alzheimer's Insights

## Introduction (00:00-01:30)
"Welcome to Bite Size Life Sciences, your weekly dose of groundbreaking research. I'm your host, and this week we're covering two remarkable advances that could transform how we treat genetic disorders and understand Alzheimer's disease."

## Segment 1: CRISPR Gene Therapy (01:30-06:00)
[Detailed narrative covering the CRISPR research, methodology, patient impact, and future implications]

## Segment 2: Alzheimer's Protein Structure (06:00-11:00)
[Comprehensive explanation of the protein structure discovery, methodology, therapeutic potential]

## Conclusion and Outlook (11:00-12:30)
[Summary of key insights, what this means for the field, and what to watch for in coming weeks]

## Total Duration: 12 minutes, 30 seconds
```

### RSS Feed Sample

#### Life Sciences RSS Feed
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Bite Size Life Sciences</title>
    <description>Weekly research highlights from the world of life sciences</description>
    <language>en-us</language>
    <itunes:author>Bite Size Academic</itunes:author>
    <itunes:image href="https://example.com/artwork/life-sciences.jpg"/>
    <item>
      <title>Episode 3: Gene Therapy Breakthroughs and Alzheimer's Insights</title>
      <description>Join us as we explore CRISPR advances for rare genetic disorders and new insights into Alzheimer's disease mechanisms.</description>
      <itunes:duration>750</itunes:duration>
      <pubDate>Thu, 18 Jan 2024 10:00:00 GMT</pubDate>
      <enclosure url="https://example.com/audio/life-sciences/2024/W03-episode-3.mp3"
                type="audio/mpeg" length="18000000"/>
      <guid isPermaLink="false">ls-2024-W03-episode-3</guid>
    </item>
  </channel>
</rss>
```

## Mock Mode Testing Scenarios

### Scenario 1: New User Onboarding
1. User signs up with email `test@example.com`
2. Mock confirmation email saved to `/storage/mock-emails/`
3. User confirms via mock link
4. Mock welcome email generated
5. User added to mock subscriber list

### Scenario 2: Weekly Digest Generation
1. Mock scheduler triggers weekly job
2. Mock academic APIs return sample articles
3. Content ranking algorithm processes mock data
4. Digest template rendered with mock content
5. Mock emails saved to local storage
6. Mock RSS feed generated and saved

### Scenario 3: Premium Feature Simulation
1. Mock user upgrade to premium tier
2. Mock billing service processes "payment"
3. Podcast script generated from digest content
4. Mock TTS creates placeholder MP3 file
5. RSS feed updated with new episode
6. Mock podcast email sent to premium user

## Mock Mode Limitations

### Functional Limitations
- **No Real Email Delivery**: Emails only saved locally
- **No Real Audio**: MP3 files are silent placeholders
- **No Real API Data**: Content comes from fixed fixtures
- **No Real Billing**: Payment processing is simulated
- **No Real Analytics**: Usage data is fabricated

### Development Considerations
- **Deterministic Testing**: Same inputs produce same outputs
- **Offline Development**: No internet connection required
- **Fast Iteration**: No API rate limits or external dependencies
- **Cost Control**: No charges from external services
- **Privacy**: No real user data sent to external services

### Transition to Production
```typescript
// Configuration for production mode
const productionConfig = {
  emailService: 'resend', // or 'sendgrid'
  ttsService: 'aws-polly', // or 'google-tts'
  academicAPIs: 'real',
  billingService: 'stripe',
  mockMode: false
};

// Gradual transition strategy
1. Start with all services mocked
2. Enable one real service at a time
3. Monitor performance and costs
4. Full production mode when ready
```

## Mock Mode Quality Assurance

### Automated Tests
- **Fixture Validation**: Ensure mock data matches real API schemas
- **Template Rendering**: Verify email templates render correctly
- **Audio Generation**: Check MP3 files and metadata
- **RSS Validation**: Ensure feeds validate RSS 2.0 specification
- **End-to-End Flow**: Complete user journey testing

### Manual Testing
- **Email Preview**: Review rendered emails in multiple clients
- **Podcast Simulation**: Test audio files in podcast apps
- **User Interface**: Verify all mock features work seamlessly
- **Performance**: Ensure mock mode responds quickly
- **Documentation**: Verify mock boundaries are clear

This comprehensive mock mode system enables robust development and testing while maintaining the full functionality expected by users when transitioning to production services.