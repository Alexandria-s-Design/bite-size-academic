# Bite Size Academic

> Stay current with academic research without the information overload.

Bite Size Academic is an email-first subscription service that delivers curated weekly digests of cutting-edge academic research. Each digest contains 3-5 carefully selected papers with clear summaries, context, and "why this matters" analysis—all consumable in under 15 minutes.

## 🎯 Mission

**Empowering academics to stay current without the overwhelm** by delivering intelligent, time-efficient research summaries that respect both the complexity of scholarship and the constraints of busy schedules.

## ✨ Key Features

### 📧 **Free Tier**
- **Weekly Email Digest**: 3-5 curated research papers in your field
- **Smart Summaries**: Key findings, methodology, and significance
- **Time Estimates**: Reading time for each article (2-10 minutes)
- **Why This Matters**: Context about relevance and impact
- **5 Academic Fields**: Life Sciences, AI & Computing, Humanities & Culture, Policy & Governance, Climate & Earth Systems

### 🎧 **Premium Tier** (Mock)
- **Podcast Episodes**: Weekly audio versions (8-15 minutes)
- **RSS Feed**: Subscribe in your favorite podcast app
- **NotebookLM-Style Overview**: Cohesive narrative connections
- **Audio Transcripts**: Full text versions for reference

## 🏗️ Architecture

Built with a modern, scalable architecture designed for reliability and extensibility:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│  Content Engine │───▶│  Delivery Layer │
│                 │    │                 │    │                 │
│ • arXiv         │    │ • Curation      │    │ • Email Service │
│ • Crossref      │    │ • Summarization │    │ • RSS Feeds     │
│ • PubMed        │    │ • Audio Gen     │    │ • Web Interface │
│ • RSS Feeds     │    │ • QA Checks     │    │ • Admin Panel   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

- **Content Ingestion**: Mock adapters for arXiv, Crossref, PubMed
- **Summarization Pipeline**: AI-powered content analysis (mock NotebookLM)
- **Email System**: Beautiful HTML templates with React Email
- **Podcast Generation**: TTS integration with RSS feed creation
- **Web Interface**: Next.js 14 with Tailwind CSS
- **Admin Dashboard**: Content review and analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- pnpm 9.x or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/bite-size-academic.git
   cd bite-size-academic
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start all services
   pnpm dev

   # Or start individually
   pnpm --filter web dev    # Next.js app
   pnpm --filter core dev    # Core services
   ```

5. **Access the application**
   - Web App: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin (mock credentials)

## 🧪 Development Mode

The application runs in **mock mode** by default, using:

- **Mock Academic APIs**: Simulated arXiv, Crossref, PubMed responses
- **Mock Email Service**: Saves emails to local files
- **Mock TTS Service**: Generates placeholder audio files
- **Sample Data**: Pre-populated fixtures for testing

### Running Jobs

```bash
# Generate weekly digest (mock mode)
pnpm job:weekly --field=life-sciences --mock

# Load sample fixtures
pnpm seed:fixtures

# Run quality checks
pnpm test
pnpm test:e2e
```

## 📁 Project Structure

```
bite-size-academic/
├── .spec/                    # GitHub Spec Kit specifications
├── .pai/                     # Personal Intelligence (brand voice)
├── .claude-flow/             # Architecture & orchestration
├── apps/
│   └── web/                  # Next.js web application
├── packages/
│   └── core/                 # Shared business logic
├── fixtures/                 # Mock data sources
├── storage/                  # Local file storage
├── artifacts/                # QA outputs & previews
├── scripts/                  # CLI utilities
└── docs/                     # Documentation
```

## 🎨 Design System

### Brand Colors
- **Academic Blue**: `#1e3a8a` - Primary brand color
- **Insight Teal**: `#0891b2` - Accent color
- **Wisdom Gray**: `#374151` - Text and UI elements

### Typography
- **Inter**: Primary font for UI elements
- **Georgia**: Secondary font for editorial content

### Components
- Responsive design with mobile-first approach
- WCAG 2.1 AA accessibility compliance
- Lighthouse scores ≥ 90 (performance, accessibility, SEO, best practices)

## 🧪 Testing & Quality Assurance

### Automated Testing
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# End-to-end tests
pnpm test:e2e

# Lighthouse audits
pnpm qa:lighthouse

# Accessibility tests
pnpm qa:a11y
```

### Quality Gates
- **TypeScript**: Strict mode with full type coverage
- **ESLint**: Code style and quality enforcement
- **Prettier**: Consistent code formatting
- **Vitest**: Unit test coverage >80%
- **Playwright**: End-to-end test coverage

## 📊 Content Curation

### Academic Fields

1. **Life Sciences** 🧬
   - Genetics, genomics, proteomics, CRISPR
   - Neuroscience, immunology, cell biology
   - Biomedical research, clinical applications

2. **AI & Computing** 🤖
   - Machine learning, neural networks, deep learning
   - Natural language processing, computer vision
   - Robotics, algorithms, computational theory

3. **Humanities & Culture** 📚
   - Cultural studies, history, philosophy
   - Literature, linguistics, anthropology
   - Digital humanities, archival research

4. **Policy & Governance** 🏛️
   - Public policy, political science, economics
   - Governance, regulatory frameworks, international relations
   - Social policy, ethics, legal studies

5. **Climate & Earth Systems** 🌍
   - Climate science, environmental studies
   - Earth systems, sustainability, ecology
   - Atmospheric science, oceanography, cryosphere

### Content Quality Criteria

- **Recency**: Published within last 14 days
- **Relevance**: Score ≥ 60 (algorithmically assessed)
- **Quality**: Peer-reviewed or from reputable preprint servers
- **Diversity**: Maximum 1 article per venue per digest
- **Reading Time**: 2-10 minutes per article (total 15-25 minutes)

## 📧 Email Templates

### Weekly Digest Structure
1. **Header**: Brand identity and digest information
2. **Introduction**: Weekly theme and content overview
3. **Featured Articles**: 3-5 research items with:
   - Title, authors, venue, reading time
   - "Why This Matters" analysis
   - Key findings and methodology
   - Source links and access information
4. **Footer**: Feedback options, premium upgrade, preferences

### Template System
- **React Email**: Composable email components
- **Responsive Design**: Mobile-first approach
- **Personalization**: User name and field preferences
- **Analytics**: Open and click tracking (mock mode)

## 🎙️ Podcast Generation

### Audio Pipeline
1. **Script Generation**: NotebookLM-style overview
2. **Text-to-Speech**: AWS Polly (mock for MVP)
3. **Audio Processing**: MP3 generation with metadata
4. **RSS Feed**: Podcast feed creation and hosting

### Episode Structure
- **Introduction** (1-2 minutes): Episode overview
- **Research Segments** (2-4 per episode): Detailed coverage
- **Transitions**: Smooth flow between topics
- **Conclusion** (1 minute): Summary and next week preview

## 🛠️ Configuration

### Environment Variables

```bash
# Core Configuration
NODE_ENV=development
MOCK_MODE=1

# Email Service
EMAIL_PROVIDER=mock
EMAIL_FROM="Bite Size Academic <no-reply@bsa.test>"

# Storage
STORAGE_DIR=./storage
ARTIFACTS_DIR=./artifacts

# External Services (optional)
RESEND_API_KEY=your_resend_key
OPENAI_API_KEY=your_openai_key
```

### Feature Flags
```typescript
// Configuration options
{
  enablePodcastGeneration: true,
  enableEmailDelivery: true,
  enableUserPreferences: true,
  enableAdminPanel: true,
  mockMode: true, // MVP default
}
```

## 📈 Monitoring & Analytics

### Key Metrics
- **User Engagement**: Open rates, click rates, reading time
- **Content Quality**: Relevance scores, diversity metrics
- **System Performance**: Processing times, error rates
- **Business Metrics**: Conversion rates, churn, LTV

### Monitoring Tools
- **Application Logs**: Structured logging with winston
- **Error Tracking**: Comprehensive error reporting
- **Performance Metrics**: Processing times and resource usage
- **Health Checks**: Service availability monitoring

## 🔒 Security & Privacy

### Data Protection
- **Email Privacy**: No sharing with third parties
- **GDPR Compliance**: Right to data deletion and export
- **Secure Storage**: Encrypted data at rest
- **Access Control**: Role-based permissions

### Security Measures
- **Input Validation**: XSS prevention and input sanitization
- **Rate Limiting**: API abuse prevention
- **HTTPS**: All communications encrypted
- **Authentication**: Secure user management (future feature)

## 🚀 Deployment

### Development
```bash
pnpm dev              # Start all services
pnpm build            # Build for production
pnpm start            # Start production server
```

### Production
```bash
# Environment setup
export NODE_ENV=production
export MOCK_MODE=0     # Disable mock mode

# Configure real services
export EMAIL_PROVIDER=resend
export RESEND_API_KEY=your_key

# Deploy
docker build -t bite-size-academic .
docker run -p 3000:3000 bite-size-academic
```

## 📚 Documentation

- **[Architecture Guide](./docs/ARCHITECTURE.md)**: System design and components
- **[API Documentation](./docs/API.md)**: External API reference
- **[Content Guidelines](./docs/CONTENT.md)**: Editorial standards
- **[Development Guide](./docs/DEVELOPMENT.md)**: Contributing guidelines
- **[Deployment Guide](./docs/DEPLOYMENT.md)**: Production deployment

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode with comprehensive types
- **ESLint**: Follow configured style guidelines
- **Prettier**: Consistent code formatting
- **Testing**: Include tests for new functionality
- **Documentation**: Update relevant documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Academic Community**: For inspiring the need for better research communication
- **OpenAI**: For Claude's assistance in development
- **Academic Publishers**: For providing open access to research
- **Beta Testers**: For valuable feedback and insights

## 📞 Contact

- **Email**: hello@bite-size-academic.com
- **Website**: https://bite-size-academic.com
- **GitHub**: https://github.com/bite-size-academic/bite-size-academic
- **Twitter**: @bitesizeacademic

---

<div align="center">
  <p>Built with 🧠 for curious academics everywhere</p>
  <p>© 2024 Bite Size Academic. All rights reserved.</p>
</div>