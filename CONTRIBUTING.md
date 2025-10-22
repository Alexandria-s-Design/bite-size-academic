# Contributing to Bite Size Academic

Thank you for your interest in contributing to Bite Size Academic! This document provides guidelines and information for contributors.

## 🎯 Our Mission

We're building a platform that helps academics stay current with cutting-edge research without information overload. Every contribution helps us better serve the academic community.

## 🤝 How to Contribute

### Reporting Issues

1. **Bug Reports**: Use [GitHub Issues](https://github.com/bite-size-academic/bite-size-academic/issues) with:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment details

2. **Feature Requests**: Suggest new features with:
   - Problem statement
   - Proposed solution
   - Use cases and benefits
   - Implementation ideas

3. **Content Feedback**: Help us improve content quality by:
   - Reporting inaccurate summaries
   - Suggesting better research sources
   - Improving editorial guidelines

### Development Contributions

#### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/bite-size-academic.git
   cd bite-size-academic
   ```

2. **Set up development environment**
   ```bash
   pnpm install
   cp .env.example .env
   # Configure your environment
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation
   - Ensure all tests pass

5. **Submit a pull request**
   - Provide clear description of changes
   - Link related issues
   - Include screenshots if applicable
   - Request reviews from maintainers

#### Development Guidelines

##### Code Standards

- **TypeScript**: Use strict mode with comprehensive typing
- **ESLint**: Follow configured rules (see `.eslintrc.json`)
- **Prettier**: Auto-format code (see `.prettierrc`)
- **Conventional Commits**: Use semantic commit messages

```bash
# Examples
git commit -m "feat: add podcast generation service"
git commit -m "fix: resolve email template rendering issue"
git commit -m "docs: update API documentation"
```

##### File Organization

```
packages/core/src/
├── ingestion/     # Data source adapters
├── normalize/     # Data normalization
├── rank/         # Content ranking algorithms
├── summarize/    # Content summarization
├── tts/          # Text-to-speech processing
├── email/        # Email templates and sending
├── podcast/      # Podcast generation
└── config/       # Configuration management
```

##### Testing Requirements

- **Unit Tests**: All new functions must have tests
- **Integration Tests**: API endpoints and service interactions
- **E2E Tests**: Critical user workflows
- **Coverage**: Minimum 80% coverage for core modules

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

##### Documentation Requirements

- **Code Comments**: Complex logic requires inline documentation
- **Type Definitions**: All interfaces and types must be documented
- **API Documentation**: Endpoints require JSDoc comments
- **README Updates**: New features must be documented

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Example test structure
describe('ContentIngestionService', () => {
  describe('fetchArticles', () => {
    it('should fetch articles from mock data', async () => {
      const service = new ContentIngestionService()
      const articles = await service.fetchArticles('life-sciences')

      expect(articles).toHaveLength(5)
      expect(articles[0]).toHaveProperty('title')
      expect(articles[0]).toHaveProperty('authors')
    })
  })
})
```

### Integration Tests

```typescript
// Example integration test
describe('Email Service Integration', () => {
  it('should send weekly digest email', async () => {
    const result = await emailService.sendWeeklyDigest(mockUser, mockDigest, mockArticles)

    expect(result.success).toBe(true)
    expect(result.emailId).toBeDefined()
  })
})
```

### E2E Tests

```typescript
// Example E2E test
test('user signup flow', async ({ page }) => {
  await page.goto('/')
  await page.selectOption('[data-testid="field-select"]', 'life-sciences')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.click('[data-testid="signup-button"]')

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

## 📝 Content Contributions

### Academic Field Expertise

We welcome contributions from subject matter experts:

1. **Field Validation**: Review field definitions and taxonomies
2. **Source Recommendations**: Suggest important journals and conferences
3. **Quality Assessment**: Help evaluate content relevance and quality
4. **Curriculum Development**: Contribute to educational content

### Editorial Guidelines

Follow our editorial standards when contributing content:

- **Accuracy**: All facts must be verifiable
- **Clarity**: Write for educated non-specialists
- **Balance**: Present multiple perspectives when relevant
- **Attribution**: Proper credit to sources and researchers
- **Context**: Provide background and significance

### Content Review Process

1. **Draft Creation**: Write or edit content following guidelines
2. **Peer Review**: Subject matter expert review
3. **Editorial Review**: Style and quality assessment
4. **Final Approval**: Content approval and publication

## 🔧 Technical Contributions

### Architecture and Infrastructure

We welcome contributions to:

- **Core Services**: Content ingestion, summarization, delivery
- **Web Application**: Next.js frontend and API routes
- **Database**: Schema design and optimization
- **DevOps**: CI/CD, deployment, monitoring
- **Security**: Authentication, authorization, data protection

### Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL (production), SQLite (development)
- **Email**: Resend/SendGrid, React Email
- **Audio**: AWS Polly, RSS feeds
- **Testing**: Vitest, Playwright, ESLint

### Performance Optimization

- **Code Splitting**: Optimize bundle sizes
- **Database Queries**: Optimize database interactions
- **Caching**: Implement effective caching strategies
- **Image Optimization**: Use modern image formats
- **Monitoring**: Track performance metrics

## 🎨 Design Contributions

### UI/UX Improvements

- **Component Development**: Create reusable React components
- **Design System**: Maintain and extend our design system
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Mobile Experience**: Optimize for mobile devices
- **User Research**: Conduct user testing and feedback sessions

### Brand and Visual Design

- **Brand Guidelines**: Maintain brand consistency
- **Visual Assets**: Create icons, illustrations, images
- **Email Templates**: Design responsive email layouts
- **Marketing Materials**: Create promotional content

## 📚 Documentation Contributions

### Documentation Types

- **API Documentation**: Comprehensive API reference
- **User Guides**: Step-by-step user instructions
- **Developer Guides**: Setup and development tutorials
- **Architecture Documentation**: System design and decisions
- **Process Documentation**: Development and deployment processes

### Documentation Standards

- **Clarity**: Write clearly and concisely
- **Accuracy**: Keep documentation up to date
- **Examples**: Include code examples and screenshots
- **Structure**: Use consistent formatting and organization
- **Accessibility**: Ensure documentation is accessible

## 🏗️ Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **hotfix/***: Critical bug fixes
- **release/***: Preparation for releases

### Pull Request Process

1. **Create PR**: From feature branch to `develop`
2. **Automated Checks**: CI/CD pipeline runs automatically
3. **Code Review**: At least one maintainer must review
4. **Testing**: All tests must pass
5. **Documentation**: Update relevant documentation
6. **Merge**: PR is merged to `develop`

### Release Process

1. **Preparation**: Update version numbers, changelog
2. **Testing**: Full integration testing on release branch
3. **Deployment**: Deploy to staging for final validation
4. **Release**: Merge `develop` to `main` and tag release
5. **Post-release**: Monitor for issues and user feedback

## 🤝 Community Guidelines

### Code of Conduct

- **Respect**: Treat all contributors with respect
- **Inclusivity**: Welcome contributors from all backgrounds
- **Constructive**: Provide helpful, constructive feedback
- **Professional**: Maintain professional communication
- **Support**: Help others learn and grow

### Communication

- **GitHub Issues**: For bugs, features, and discussions
- **Discord/Slack**: For real-time collaboration (if available)
- **Email**: For private discussions or security issues
- **Documentation**: For technical questions and guidance

### Getting Help

- **Issues**: Create an issue for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check existing documentation first
- **Community**: Ask for help in community channels

## 🎉 Recognition

### Contributor Recognition

- **Contributors List**: Maintain a list of all contributors
- **Release Notes**: Acknowledge contributors in releases
- **Blog Posts**: Highlight significant contributions
- **Community**: Recognize active community members

### Types of Contributions

- **Code**: Bug fixes, features, infrastructure
- **Documentation**: Guides, API docs, tutorials
- **Design**: UI/UX, visual assets, branding
- **Content**: Academic content, editorial work
- **Community**: Support, moderation, outreach
- **Translation**: Localization and internationalization

## 📜 License

By contributing to Bite Size Academic, you agree that your contributions will be licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Getting Started

### First Contributions

If you're new to open source, we recommend:

1. **Start Small**: Fix a typo or improve documentation
2. **Read the Code**: Familiarize yourself with the codebase
3. **Ask Questions**: Don't hesitate to ask for help
4. **Learn**: Take advantage of learning opportunities
5. **Be Patient**: Reviews may take time

### Good First Issues

Look for issues labeled `good first issue` or `help wanted` in our GitHub repository. These are great starting points for new contributors.

### Mentorship

We're happy to mentor new contributors. If you'd like guidance on contributing:

- **Reach Out**: Contact maintainers via GitHub issues
- **Join Discussions**: Participate in GitHub Discussions
- **Attend Events**: Join virtual events or office hours
- **Ask for Help**: Request help with specific tasks

---

Thank you for contributing to Bite Size Academic! Your help makes academic research more accessible and manageable for everyone.

For questions about contributing, don't hesitate to:
- Create an issue on GitHub
- Start a discussion in our repository
- Contact us at hello@bite-size-academic.com