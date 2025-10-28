# Architecture Decision Records (ADRs)

## Bite Size Academic - Production Transformation

This document contains all Architecture Decision Records for the production buildout of Bite Size Academic subscription service.

---

## ADR-001: Next.js App Router vs Pages Router

**Status**: ✅ Accepted
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need to choose routing architecture for Next.js application. Pages Router is stable and well-documented, but App Router represents the future of Next.js with Server Components.

### Decision

Use **App Router** (Next.js 14+)

### Rationale

**Advantages**:
- Server Components reduce client bundle size by ~30%
- Better data fetching patterns with async/await
- Improved layouts and nested routes
- Better TypeScript support
- Official Next.js direction (Pages Router in maintenance mode)
- Streaming SSR for improved perceived performance
- Better code organization with route groups

**Trade-offs**:
- Learning curve for team members
- Some third-party libraries not yet fully compatible
- More complex mental model
- Newer, so fewer Stack Overflow answers

### Consequences

**Positive**:
- Future-proof application
- Better performance out of the box
- Reduced JavaScript sent to client
- Improved developer experience

**Negative**:
- Team training required
- May need workarounds for some libraries
- Debugging can be more complex

**Mitigation**:
- Comprehensive documentation
- Code examples for common patterns
- Gradual adoption (can mix with Pages Router initially)

---

## ADR-002: PostgreSQL vs MongoDB

**Status**: ✅ Accepted
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need to choose primary database for user data, subscriptions, and content. Options are PostgreSQL (relational) or MongoDB (document).

### Decision

Use **PostgreSQL 15+**

### Rationale

**Advantages**:
- ACID compliance crucial for payment transactions
- Complex queries for analytics dashboard
- Strong relational data model (users ↔ subscriptions ↔ articles)
- Mature ecosystem and tooling
- JSON/JSONB support for flexible fields
- Full-text search capabilities
- Better query optimization
- Prisma ORM has excellent PostgreSQL support

**Trade-offs**:
- Schema migrations required
- Vertical scaling limitations
- More complex than MongoDB for document storage

**Alternatives Considered**:
1. **MongoDB**: Good for flexible schemas, but weak for transactions
2. **MySQL**: Similar to PostgreSQL but less feature-rich
3. **Supabase (Postgres)**: Managed solution with auth built-in

### Consequences

**Positive**:
- Data integrity guaranteed
- Complex analytics queries possible
- Industry-standard for SaaS applications
- Strong typing with Prisma

**Negative**:
- Schema changes require migrations
- Need connection pooling for serverless
- More setup than hosted solutions

**Mitigation**:
- Use Prisma for migration management
- Deploy on managed service (Railway/Supabase)
- Implement connection pooling

---

## ADR-003: Resend vs SendGrid for Email

**Status**: ✅ Accepted
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need email service for transactional emails (verification, digests) and marketing emails. Options include Resend, SendGrid, Mailgun, AWS SES.

### Decision

Use **Resend**

### Rationale

**Advantages**:
- React Email integration (type-safe templates)
- Modern developer experience
- Simple pricing ($0.001/email after 3,000/month)
- Good deliverability
- Webhook support
- Built by developers, for developers
- No vendor lock-in (standards-based)

**Trade-offs**:
- Newer company (less established than SendGrid)
- Fewer integrations than competitors
- Smaller community

**Alternatives Considered**:
1. **SendGrid**: More features but complex API, expensive
2. **Mailgun**: Good but older API design
3. **AWS SES**: Cheapest but requires more setup

### Consequences

**Positive**:
- Excellent developer experience
- React Email makes templates maintainable
- Cost-effective for our scale
- Good documentation

**Negative**:
- Less proven at massive scale
- Deliverability needs monitoring
- Smaller support team

**Mitigation**:
- Implement proper SPF/DKIM/DMARC
- Monitor bounce rates closely
- Have backup provider configured (SendGrid)
- Warm up domain gradually

---

## ADR-004: Stripe vs Other Payment Processors

**Status**: ✅ Accepted
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need payment processor for subscription billing. Must support recurring payments, trials, and self-service management.

### Decision

Use **Stripe**

### Rationale

**Advantages**:
- Industry standard for subscriptions
- Excellent developer experience
- Comprehensive API and webhooks
- Built-in fraud protection (Radar)
- Customer portal for self-service
- International support (100+ currencies)
- Subscription management built-in
- Detailed documentation
- React components available

**Trade-offs**:
- 2.9% + 30¢ per transaction fee
- Vendor lock-in (migration would be complex)
- Must handle webhooks reliably

**Alternatives Considered**:
1. **PayPal**: Higher fees, worse UX
2. **Paddle**: Good but more expensive
3. **LemonSqueezy**: Newer, not as feature-rich

### Consequences

**Positive**:
- Fast implementation
- Great customer experience
- Handles tax compliance
- Scales to millions of transactions

**Negative**:
- Significant cost at scale (3% of revenue)
- Webhook handling complexity
- Account freeze risk (rare but impactful)

**Mitigation**:
- Implement robust webhook handling with retries
- Monitor webhook delivery in real-time
- Keep good standing with Stripe (KYC docs)
- Build webhook event replay system

---

## ADR-005: NextAuth.js vs Custom Auth

**Status**: ✅ Accepted
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need authentication system for user login, session management, and role-based access control. Options are custom implementation or library.

### Decision

Use **NextAuth.js v5 (Auth.js)**

### Rationale

**Advantages**:
- Production-tested by thousands of apps
- OAuth providers built-in (Google, GitHub, etc.)
- JWT and database sessions supported
- Email magic links
- Role-based access control
- TypeScript support
- Next.js 14 App Router compatible
- Active maintenance and community

**Trade-offs**:
- Some learning curve
- Opinionated structure
- Must follow their patterns

**Alternatives Considered**:
1. **Custom Auth**: Full control but high maintenance
2. **Clerk**: Great UX but expensive ($25/month)
3. **Supabase Auth**: Good but locks into Supabase

### Consequences

**Positive**:
- Security best practices built-in
- Fast implementation
- Reduced maintenance burden
- Easy to add OAuth providers later

**Negative**:
- Less flexibility than custom solution
- Must adapt to their API
- Some edge cases may be tricky

**Mitigation**:
- Wrap NextAuth in our own helper functions
- Extend with custom logic where needed
- Document patterns for team

---

## ADR-006: PostHog vs Plausible for Analytics

**Status**: ✅ Accepted (with caveat)
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need analytics to track user behavior, conversion funnels, and business metrics. Privacy compliance (GDPR) is important.

### Decision

Use **PostHog** (with option to switch to Plausible)

### Rationale

**Advantages** (PostHog):
- Full feature set (funnels, cohorts, A/B testing, feature flags)
- Self-hosting option for privacy
- Session replay for UX debugging
- Product analytics focus
- Free tier generous (1M events/month)
- Open source

**Advantages** (Plausible):
- Simpler, privacy-focused
- No cookie consent needed (GDPR-compliant by default)
- Lightweight script
- Beautiful, simple dashboards

**Decision Logic**:
- Start with **PostHog** for rich analytics during growth phase
- Can switch to **Plausible** if privacy becomes primary concern
- Use PostHog feature flags for A/B testing

### Consequences

**Positive** (PostHog):
- Deep insights into user behavior
- Feature flags for gradual rollouts
- All-in-one solution

**Negative** (PostHog):
- More complex setup
- Heavier script weight
- May need cookie consent banner

**Mitigation**:
- Implement privacy-first tracking
- Clear privacy policy
- Easy opt-out mechanism
- Self-host if needed for compliance

---

## ADR-007: Vercel vs Self-Hosted Deployment

**Status**: ✅ Accepted
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need hosting for Next.js application. Options are managed (Vercel) or self-hosted (AWS, DigitalOcean, Railway).

### Decision

Use **Vercel** for Next.js, managed services for database

### Rationale

**Advantages**:
- Built by Next.js creators (optimal performance)
- Zero-config deployment
- Global edge network
- Automatic HTTPS
- Preview deployments per PR
- Serverless functions included
- Generous free tier
- Excellent DX

**Trade-offs**:
- More expensive at scale
- Vendor lock-in
- Less control over infrastructure

**Database Hosting**:
- Use **Railway** or **Supabase** for PostgreSQL (not Vercel Postgres due to cost)

**Cost Analysis** (at 10K users):
- Vercel: ~$20/month (Pro plan)
- Railway: ~$20/month (database)
- Total: ~$40/month vs $200+ for self-hosted

### Consequences

**Positive**:
- Fast time to market
- Minimal DevOps overhead
- Built-in monitoring
- Automatic scaling

**Negative**:
- Cost increases with traffic
- Lock-in to Vercel ecosystem
- Limited customization

**Mitigation**:
- Monitor costs monthly
- Optimize edge function usage
- Plan migration path to self-hosted if needed
- Use external services (database, storage) not tied to Vercel

---

## ADR-008: Monorepo vs Multi-Repo

**Status**: ✅ Accepted (Keep Existing)
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Project already uses monorepo structure (apps/ and packages/). Need to decide if we continue or split.

### Decision

**Keep monorepo structure**

### Rationale

**Advantages**:
- Code sharing between web app and services
- Single dependency management
- Atomic commits across packages
- Easier refactoring
- Single CI/CD pipeline

**Current Structure**:
```
bite-size-academic/
├── apps/
│   └── web/          # Next.js application
└── packages/
    └── core/         # Shared services
```

**Why Not Multi-Repo**:
- Overhead of managing multiple repos
- Dependency versioning complexity
- Harder to make cross-cutting changes

### Consequences

**Positive**:
- Simplified development workflow
- Faster development velocity
- Shared types across packages

**Negative**:
- Larger codebase
- Need proper monorepo tooling
- All packages deployed together

**Tooling**:
- Use **pnpm workspaces** (already configured)
- Consider **Turborepo** if build times become issue

---

## ADR-009: REST API vs GraphQL

**Status**: ✅ Accepted
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need API layer for frontend-backend communication. Options are REST, GraphQL, or tRPC.

### Decision

Use **REST API** (Next.js API Routes)

### Rationale

**Advantages**:
- Simpler to implement and understand
- Built into Next.js (zero additional setup)
- Easier to cache (HTTP semantics)
- Standard HTTP methods
- Easier to test and debug
- Better for server actions

**Trade-offs**:
- Multiple requests for related data
- Over-fetching/under-fetching
- No type safety between frontend/backend

**Alternatives Considered**:
1. **GraphQL**: Overkill for our use case, adds complexity
2. **tRPC**: Great type safety but less standard

### Consequences

**Positive**:
- Fast development
- Easy to document
- Broad ecosystem support
- Simple deployment

**Negative**:
- More API endpoints needed
- Manual type synchronization
- Potential over-fetching

**Mitigation**:
- Use Zod schemas for validation
- Share types between frontend/backend
- Implement proper pagination
- Consider tRPC for future if API grows complex

---

## ADR-010: Background Jobs - Vercel Cron vs Queue System

**Status**: ✅ Accepted (Hybrid)
**Date**: 2025-10-28
**Deciders**: System Architecture Team

### Context

Need to run scheduled tasks (weekly digest generation) and async jobs (email sending). Options are Vercel Cron, BullMQ, or other queue systems.

### Decision

**Hybrid approach**: Vercel Cron for scheduling, simple queue for async tasks

### Rationale

**For Weekly Digest Generation**:
- Use **Vercel Cron** (runs Friday 10am)
- Simple, built-in, free
- Perfect for scheduled tasks

**For Async Tasks** (email queue, content fetching):
- Use **Upstash** (Redis + QStash)
- Or simple database-backed queue
- Low volume doesn't justify complex system

**Cost Analysis**:
- Vercel Cron: Free (included in Pro plan)
- Upstash: Free tier sufficient
- BullMQ: Requires Redis server (~$15/month)

### Consequences

**Positive**:
- No additional infrastructure for cron jobs
- Simple to implement and maintain
- Cost-effective

**Negative**:
- Limited to 1-minute resolution on cron
- No job retry built into Vercel Cron
- May need to migrate to proper queue later

**Mitigation**:
- Implement retry logic in jobs
- Log all job executions
- Monitor job failures
- Plan migration to BullMQ if volume increases

---

## Summary Table

| # | Decision | Choice | Status | Impact |
|---|----------|--------|--------|--------|
| 001 | Routing | App Router | ✅ | High |
| 002 | Database | PostgreSQL | ✅ | High |
| 003 | Email | Resend | ✅ | Medium |
| 004 | Payments | Stripe | ✅ | High |
| 005 | Auth | NextAuth.js | ✅ | High |
| 006 | Analytics | PostHog | ✅ | Low |
| 007 | Hosting | Vercel | ✅ | Medium |
| 008 | Structure | Monorepo | ✅ | Medium |
| 009 | API | REST | ✅ | Medium |
| 010 | Jobs | Vercel Cron | ✅ | Low |

---

## Future ADRs to Consider

1. **Storage Strategy**: S3 vs Vercel Blob vs Cloudflare R2
2. **CDN**: Vercel Edge vs Cloudflare
3. **Search**: Algolia vs Typesense vs PostgreSQL full-text
4. **Caching**: Redis vs Vercel KV
5. **Monitoring**: Sentry vs LogRocket vs Custom
6. **Testing Strategy**: Vitest + Playwright vs Jest + Cypress
7. **Mobile App**: React Native vs Progressive Web App
8. **API Rate Limiting**: Upstash Rate Limit vs Custom
9. **Feature Flags**: PostHog vs LaunchDarkly vs Custom
10. **Internationalization**: next-intl vs next-i18next

---

## Review Schedule

ADRs should be reviewed quarterly or when:
- Major architecture changes are proposed
- Technology landscape shifts significantly
- Performance/cost issues arise
- Security vulnerabilities discovered
- Team size or structure changes

**Next Review**: 2025-01-28 (3 months)

---

**Document Maintained By**: System Architecture Team
**Last Updated**: 2025-10-28
**Version**: 1.0
