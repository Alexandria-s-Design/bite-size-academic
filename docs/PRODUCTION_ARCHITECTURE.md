# Bite Size Academic - Production Architecture

## System Architecture Designer Document

**Date**: October 28, 2025
**Version**: 1.0
**Status**: Architecture Design Phase

---

## Executive Summary

This document outlines the production-ready architecture for transforming Bite Size Academic from an MVP into a scalable subscription service. The architecture focuses on delivering reliable email subscriptions, payment processing, user management, and content curation while maintaining operational excellence.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [Payment Processing](#payment-processing)
8. [Email System](#email-system)
9. [Admin Dashboard](#admin-dashboard)
10. [Analytics & Monitoring](#analytics--monitoring)
11. [Security Considerations](#security-considerations)
12. [Deployment Strategy](#deployment-strategy)
13. [Architecture Decision Records](#architecture-decision-records)

---

## Architecture Overview

### High-Level Architecture (C4 Model - Context Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Bite Size Academic                           │
│                    Subscription Service Platform                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼──────┐  ┌───▼────────┐  ┌─▼──────────┐
            │   End Users   │  │   Admins   │  │  External  │
            │  (Academics)  │  │ (Curators) │  │    APIs    │
            └───────┬───────┘  └────┬───────┘  └─┬──────────┘
                    │               │            │
                    └───────┬───────┴────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │   Web   │         │  Email  │        │ Payment │
   │   App   │────────▶│ Service │        │ Gateway │
   └─────────┘         └─────────┘        └─────────┘
        │                   │                   │
        └───────────┬───────┴───────────────────┘
                    │
            ┌───────▼────────┐
            │   Database     │
            │  (PostgreSQL)  │
            └────────────────┘
```

### Container Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Bite Size Academic System                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐         ┌──────────────────────┐          │
│  │   Next.js Web App   │────────▶│   PostgreSQL DB      │          │
│  │   (Frontend + API)  │         │   (User Data,        │          │
│  │                     │         │    Subscriptions,    │          │
│  │  • Public Pages     │         │    Content)          │          │
│  │  • User Dashboard   │         └──────────────────────┘          │
│  │  • Admin Dashboard  │                    │                       │
│  │  • API Routes       │                    │                       │
│  └──────┬──────────────┘                    │                       │
│         │                                    │                       │
│         ├────────────────────────────────────┘                       │
│         │                                                            │
│  ┌──────▼──────────────┐         ┌──────────────────────┐          │
│  │  Background Jobs    │────────▶│   Email Service      │          │
│  │  (Cron/Queue)       │         │   (Resend API)       │          │
│  │                     │         │                      │          │
│  │  • Weekly Digest    │         │  • Transactional     │          │
│  │  • Content Fetch    │         │  • Digest Delivery   │          │
│  │  • User Onboarding  │         │  • Notifications     │          │
│  └──────┬──────────────┘         └──────────────────────┘          │
│         │                                                            │
│  ┌──────▼──────────────┐         ┌──────────────────────┐          │
│  │  External APIs      │         │   Payment Gateway    │          │
│  │                     │         │   (Stripe)           │          │
│  │  • arXiv            │         │                      │          │
│  │  • Crossref         │         │  • Subscriptions     │          │
│  │  • PubMed           │         │  • Webhooks          │          │
│  │  • OpenAI (AI)      │         │  • Invoices          │          │
│  └─────────────────────┘         └──────────────────────┘          │
│                                                                       │
│  ┌─────────────────────┐         ┌──────────────────────┐          │
│  │   Analytics         │         │   Storage            │          │
│  │   (PostHog/Plausible)│        │   (AWS S3 / Vercel)  │          │
│  │                     │         │                      │          │
│  │  • User Events      │         │  • Email Templates   │          │
│  │  • Conversions      │         │  • Static Assets     │          │
│  │  • Engagement       │         │  • Generated Content │          │
│  └─────────────────────┘         └──────────────────────┘          │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Web Application (Next.js 14)

**Purpose**: Primary user interface and API layer

**Components**:
- Public marketing pages (landing, pricing, about)
- User authentication pages (login, signup, reset password)
- User dashboard (preferences, subscription, analytics)
- Admin dashboard (content curation, user management, analytics)
- API routes (RESTful endpoints for all operations)

**Technology**: Next.js 14 with App Router, TypeScript, Tailwind CSS

### 2. Database (PostgreSQL)

**Purpose**: Persistent data storage

**Key Tables**:
- users (authentication, profile, preferences)
- subscriptions (payment, tier, status)
- articles (research papers, metadata)
- digests (weekly compilations)
- email_logs (delivery tracking)
- analytics_events (user behavior)

**Technology**: PostgreSQL 15+ with Prisma ORM

### 3. Email Service (Resend)

**Purpose**: Transactional and marketing emails

**Email Types**:
- Welcome emails
- Email confirmation
- Weekly digests
- Subscription updates
- Password resets
- Admin notifications

**Technology**: Resend API with React Email templates

### 4. Payment Processing (Stripe)

**Purpose**: Subscription billing and payment management

**Features**:
- Subscription creation and management
- Payment method storage
- Invoice generation
- Webhook handling
- Proration and upgrades/downgrades

**Technology**: Stripe API with Stripe Checkout

### 5. Authentication (NextAuth.js)

**Purpose**: User authentication and session management

**Features**:
- Email/password authentication
- Social login (Google, GitHub - optional)
- JWT tokens
- Session management
- Role-based access control (RBAC)

**Technology**: NextAuth.js v5 (Auth.js)

### 6. Background Jobs (Vercel Cron / BullMQ)

**Purpose**: Scheduled and asynchronous tasks

**Jobs**:
- Weekly digest generation (Friday mornings)
- Content fetching from academic APIs (daily)
- Email queue processing
- Analytics aggregation
- Database cleanup

**Technology**: Vercel Cron (simple) or BullMQ + Redis (advanced)

### 7. Content Management

**Purpose**: Curate and manage research content

**Features**:
- Article ingestion from APIs
- Manual article addition
- Quality scoring
- Content approval workflow
- Digest composition

**Technology**: Custom admin interface with Next.js

### 8. Analytics (PostHog or Plausible)

**Purpose**: Track user behavior and business metrics

**Metrics**:
- User registrations
- Email open rates
- Click-through rates
- Conversion rates (free to premium)
- Content engagement
- Churn analysis

**Technology**: PostHog (self-hosted or cloud) or Plausible Analytics

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Zustand (if needed)

### Backend
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Authentication**: NextAuth.js v5
- **Email**: Resend API + React Email
- **Payment**: Stripe API
- **File Storage**: AWS S3 or Vercel Blob Storage

### Infrastructure
- **Hosting**: Vercel (Next.js), Railway/Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Background Jobs**: Vercel Cron or Upstash (Redis + QStash)
- **Monitoring**: Sentry (errors), PostHog (analytics)
- **CI/CD**: GitHub Actions

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest (unit), Playwright (e2e)
- **API Testing**: Postman/Insomnia
- **Database Management**: Prisma Studio, pgAdmin

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  password_hash VARCHAR(255),
  name VARCHAR(255),

  -- Preferences
  field VARCHAR(50) NOT NULL, -- academic field
  subfield_interests TEXT[], -- array of subfields
  tags TEXT[], -- interest tags

  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, premium, enterprise
  subscription_status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_starts_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  trial_ends_at TIMESTAMP,

  -- Communication
  delivery_day VARCHAR(10) DEFAULT 'friday',
  delivery_time TIME DEFAULT '10:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  opt_out BOOLEAN DEFAULT false,

  -- Engagement
  total_digests_received INTEGER DEFAULT 0,
  total_digests_opened INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  last_opened_at TIMESTAMP,
  last_clicked_at TIMESTAMP,

  -- Admin
  role VARCHAR(20) DEFAULT 'user', -- user, admin, moderator
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe data
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_price_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),

  -- Subscription details
  tier VARCHAR(20) NOT NULL, -- free, premium, enterprise
  status VARCHAR(20) NOT NULL, -- active, cancelled, past_due, unpaid

  -- Billing
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP,

  -- Pricing
  amount INTEGER, -- in cents
  currency VARCHAR(3) DEFAULT 'usd',
  interval VARCHAR(10), -- month, year

  -- Trial
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### articles
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title TEXT NOT NULL,
  authors JSONB NOT NULL, -- array of author objects
  venue VARCHAR(255),
  venue_type VARCHAR(20), -- journal, conference, preprint
  abstract TEXT,
  url TEXT NOT NULL,
  published_at TIMESTAMP NOT NULL,

  -- Classification
  field VARCHAR(50) NOT NULL,
  subfield VARCHAR(100),
  tags TEXT[],
  topics TEXT[],

  -- Scoring
  quality VARCHAR(20), -- breakthrough, significant, important
  relevance_score INTEGER, -- 0-100
  impact_score INTEGER,
  quality_score INTEGER,
  novelty_score INTEGER,

  -- Access
  open_access BOOLEAN DEFAULT false,
  doi VARCHAR(255),
  arxiv_id VARCHAR(255),
  pubmed_id VARCHAR(255),

  -- Content analysis
  summary TEXT,
  key_findings TEXT[],
  methodology TEXT,
  limitations TEXT,
  why_this_matters TEXT,
  reading_time INTEGER, -- minutes

  -- Source
  source VARCHAR(50), -- arxiv, crossref, pubmed
  fetched_at TIMESTAMP,
  processed_at TIMESTAMP,
  processing_status VARCHAR(20),

  -- Curation
  curated_by UUID REFERENCES users(id),
  approved BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_articles_field ON articles(field);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_quality ON articles(quality);
CREATE INDEX idx_articles_approved ON articles(approved);
```

#### digests
```sql
CREATE TABLE digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Details
  field VARCHAR(50) NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  published_at TIMESTAMP NOT NULL,

  -- Content
  introduction TEXT,
  article_ids UUID[], -- references to articles
  conclusion TEXT,

  -- Quality metrics
  total_articles INTEGER,
  average_relevance_score NUMERIC(5,2),
  average_quality_score NUMERIC(5,2),

  -- Processing
  processed_at TIMESTAMP,
  processing_duration INTEGER, -- milliseconds
  processing_status VARCHAR(20),

  -- Delivery
  sent_at TIMESTAMP,
  delivery_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_digests_field ON digests(field);
CREATE INDEX idx_digests_published ON digests(published_at DESC);
CREATE INDEX idx_digests_week ON digests(year, week_number);
```

#### email_logs
```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipients
  user_id UUID REFERENCES users(id),
  digest_id UUID REFERENCES digests(id),

  -- Email details
  template_type VARCHAR(50), -- weekly-digest, welcome, reset-password
  subject TEXT,
  from_email VARCHAR(255),
  to_email VARCHAR(255),

  -- Status
  status VARCHAR(20), -- pending, sent, delivered, opened, clicked, bounced, failed
  external_id VARCHAR(255), -- Resend message ID

  -- Tracking
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  first_click_at TIMESTAMP,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Errors
  error_message TEXT,
  bounce_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent ON email_logs(sent_at DESC);
```

#### analytics_events
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event
  event_type VARCHAR(50) NOT NULL, -- user_registered, digest_opened, link_clicked
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),

  -- Context
  event_data JSONB, -- flexible event properties
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  page_url TEXT,

  -- Timestamp
  timestamp TIMESTAMP DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
```

---

## API Architecture

### RESTful API Design

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/reset-password` - Password reset request
- `POST /api/auth/update-password` - Update password

#### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update current user
- `DELETE /api/users/me` - Delete account
- `GET /api/users/me/preferences` - Get preferences
- `PATCH /api/users/me/preferences` - Update preferences
- `GET /api/users/me/stats` - Get user statistics

#### Subscriptions
- `GET /api/subscriptions` - Get user subscription
- `POST /api/subscriptions/checkout` - Create Stripe checkout session
- `POST /api/subscriptions/portal` - Create Stripe customer portal session
- `POST /api/subscriptions/upgrade` - Upgrade subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/webhooks/stripe` - Stripe webhook handler

#### Digests
- `GET /api/digests` - List digests (paginated)
- `GET /api/digests/:id` - Get digest details
- `GET /api/digests/latest` - Get latest digest
- `GET /api/digests/:id/articles` - Get digest articles

#### Articles
- `GET /api/articles` - List articles (filtered, paginated)
- `GET /api/articles/:id` - Get article details
- `GET /api/articles/trending` - Get trending articles

#### Admin (Protected)
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/articles` - List articles (pending approval)
- `POST /api/admin/articles` - Create article
- `PATCH /api/admin/articles/:id` - Update article
- `POST /api/admin/articles/:id/approve` - Approve article
- `POST /api/admin/digests` - Create digest
- `POST /api/admin/digests/:id/send` - Send digest
- `GET /api/admin/analytics` - Get analytics dashboard
- `GET /api/admin/stats` - Get system statistics

### API Response Format

```typescript
// Success response
{
  success: true,
  data: { ... },
  metadata: {
    timestamp: "2025-10-28T10:00:00Z",
    requestId: "req_123abc"
  }
}

// Error response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid email address",
    details: { ... }
  },
  metadata: {
    timestamp: "2025-10-28T10:00:00Z",
    requestId: "req_123abc"
  }
}

// Paginated response
{
  success: true,
  data: [ ... ],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasNext: true,
    hasPrev: false
  }
}
```

---

## Authentication & Authorization

### Authentication Flow

1. **User Registration**
   - User submits email + password
   - Server validates and hashes password (bcrypt)
   - Create user record with unverified email
   - Send verification email with token
   - Return success message

2. **Email Verification**
   - User clicks link with verification token
   - Server validates token and expiration
   - Mark email as verified
   - Redirect to onboarding or dashboard

3. **User Login**
   - User submits credentials
   - Server validates password
   - Create session with JWT
   - Set httpOnly cookie
   - Return user data

4. **Session Management**
   - JWT stored in httpOnly cookie
   - Short expiration (7 days)
   - Refresh token mechanism
   - Automatic session renewal on activity

### Authorization (RBAC)

**Roles**:
- `user` - Standard subscriber (free or premium)
- `admin` - Full system access
- `moderator` - Content curation access

**Permissions**:
```typescript
const PERMISSIONS = {
  user: ['read:own-profile', 'update:own-profile', 'read:digests', 'read:articles'],
  moderator: ['*:user', 'create:articles', 'update:articles', 'read:admin-analytics'],
  admin: ['*:*'] // all permissions
}
```

### Security Measures

- Password hashing with bcrypt (12 rounds)
- JWT tokens with short expiration
- httpOnly cookies (no XSS exposure)
- CSRF protection with tokens
- Rate limiting on API routes
- SQL injection prevention (Prisma ORM)
- Content Security Policy headers
- HTTPS only in production

---

## Payment Processing

### Stripe Integration Architecture

```
┌──────────────┐         ┌────────────────┐         ┌──────────────┐
│   User       │────1───▶│  Next.js App   │────2───▶│   Stripe     │
│   Browser    │         │  (API Route)   │         │   Checkout   │
└──────────────┘         └────────────────┘         └──────────────┘
       ▲                         │                          │
       │                         │                          │
       └─────────4. Redirect─────┘                          │
                                 │                          │
                                 │         3. Session       │
                                 │◀─────────────────────────┘
                                 │
                                 │
┌──────────────┐         ┌───────▼──────────┐
│   Stripe     │────5───▶│   Webhook        │
│   Events     │         │   Handler        │
└──────────────┘         └───────┬──────────┘
                                 │
                         ┌───────▼──────────┐
                         │   Database       │
                         │   (Update)       │
                         └──────────────────┘
```

### Subscription Flow

1. **Checkout Initiation**
   ```typescript
   // User clicks "Subscribe to Premium"
   POST /api/subscriptions/checkout
   {
     priceId: "price_premium_monthly",
     successUrl: "/dashboard?success=true",
     cancelUrl: "/pricing?cancelled=true"
   }
   ```

2. **Stripe Checkout Session**
   - Create Stripe checkout session
   - Attach user metadata
   - Return session URL
   - Redirect user to Stripe

3. **Payment Completion**
   - User completes payment on Stripe
   - Stripe redirects to success URL
   - Webhook triggered: `checkout.session.completed`

4. **Webhook Processing**
   - Verify webhook signature
   - Extract session data
   - Update user subscription status
   - Create subscription record
   - Send confirmation email

5. **Subscription Management**
   - Customer portal for self-service
   - Automatic invoice generation
   - Prorated upgrades/downgrades
   - Grace period for failed payments

### Pricing Tiers

```typescript
const PRICING = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      'Weekly email digest',
      '3-5 curated papers',
      'Single academic field',
      'Email support'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    stripePriceId: 'price_premium_monthly',
    features: [
      'Everything in Free',
      'Audio podcast episodes',
      'Multiple field subscriptions',
      'Early access to content',
      'Priority support'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly',
    features: [
      'Everything in Premium',
      'Team accounts (up to 10)',
      'Custom content curation',
      'API access',
      'Dedicated support'
    ]
  }
}
```

### Webhook Events

- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

---

## Email System

### Email Service Architecture

```
┌────────────────┐         ┌──────────────┐         ┌──────────────┐
│  Next.js App   │────1───▶│  React Email │────2───▶│   Resend     │
│  (Trigger)     │         │  (Template)  │         │    API       │
└────────────────┘         └──────────────┘         └──────────────┘
                                                             │
                                                             │
                                                        3. Delivery
                                                             │
                                                             ▼
                                                     ┌──────────────┐
                                                     │  User Inbox  │
                                                     └──────────────┘
                                                             │
                                                        4. Webhook
                                                             │
                                                             ▼
                                                     ┌──────────────┐
                                                     │   Database   │
                                                     │  (Log Event) │
                                                     └──────────────┘
```

### Email Templates

1. **Welcome Email**
   - Triggered: User registration
   - Content: Welcome message, verify email CTA
   - Template: `welcome.tsx`

2. **Email Verification**
   - Triggered: User registration
   - Content: Verification link with token
   - Template: `verify-email.tsx`

3. **Weekly Digest**
   - Triggered: Friday 10am user timezone
   - Content: 3-5 curated articles with summaries
   - Template: `weekly-digest.tsx`

4. **Subscription Confirmation**
   - Triggered: Successful payment
   - Content: Thank you, subscription details, invoice
   - Template: `subscription-confirmation.tsx`

5. **Payment Failed**
   - Triggered: Failed payment attempt
   - Content: Update payment method CTA
   - Template: `payment-failed.tsx`

6. **Password Reset**
   - Triggered: Password reset request
   - Content: Reset link with token
   - Template: `password-reset.tsx`

### Email Tracking

- Open tracking (1x1 pixel)
- Click tracking (redirect URLs)
- Unsubscribe tracking
- Bounce handling
- Spam complaint handling

### Email Deliverability

- SPF, DKIM, DMARC configuration
- Domain authentication
- Warm-up period for new domains
- List hygiene (remove bounces)
- Engagement-based sending
- A/B testing subject lines

---

## Admin Dashboard

### Admin Features

1. **User Management**
   - View all users (paginated, searchable)
   - User details (profile, subscription, engagement)
   - Edit user preferences
   - Manage subscriptions (upgrade, downgrade, cancel)
   - Ban/suspend users
   - Export user data (GDPR compliance)

2. **Content Curation**
   - View pending articles
   - Approve/reject articles
   - Edit article metadata
   - Create custom articles
   - Bulk operations
   - Content calendar view

3. **Digest Management**
   - Create weekly digests
   - Preview digest emails
   - Schedule digest delivery
   - View past digests
   - Digest performance metrics

4. **Analytics Dashboard**
   - Key metrics (MRR, user growth, churn)
   - User engagement (open rates, CTR)
   - Content performance (most clicked articles)
   - Subscription funnel
   - Cohort analysis
   - Export reports

5. **System Settings**
   - Email templates management
   - Pricing configuration
   - Academic fields management
   - API integrations configuration
   - Feature flags

### Admin UI Components

```
┌──────────────────────────────────────────────────────────┐
│  Admin Dashboard                                          │
├──────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  Users  │  │ Content │  │ Digests │  │Analytics│    │
│  │  1,234  │  │   45    │  │   12    │  │  $5.2K  │    │
│  │  Active │  │ Pending │  │  Sent   │  │   MRR   │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Recent Activity                                    │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │  New user registered: sarah@example.com     │  │ │
│  │  │  Digest sent: Life Sciences Week 43         │  │ │
│  │  │  Payment succeeded: Premium subscription    │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Quick Actions                                      │ │
│  │  [Create Digest] [Approve Content] [View Users]    │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Analytics & Monitoring

### Key Metrics

**Business Metrics**:
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- Churn rate (monthly/annual)
- Conversion rate (free to premium)

**Product Metrics**:
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- Email open rate (target: 30%+)
- Email click-through rate (target: 5%+)
- Content engagement time
- User retention (cohort analysis)
- Feature adoption rates

**Technical Metrics**:
- API response times (p50, p95, p99)
- Error rates (4xx, 5xx)
- Database query performance
- Background job success rate
- Email delivery rate
- Uptime (target: 99.9%)

### Monitoring Stack

1. **Application Monitoring** (Sentry)
   - Error tracking
   - Performance monitoring
   - Release tracking
   - User feedback

2. **Analytics** (PostHog or Plausible)
   - User behavior tracking
   - Funnel analysis
   - Retention cohorts
   - A/B testing

3. **Infrastructure** (Vercel Analytics)
   - Server metrics
   - Function execution times
   - Edge network performance
   - Build times

4. **Database** (PostgreSQL Insights)
   - Query performance
   - Connection pooling
   - Slow query log
   - Index usage

### Alerting

- Critical: Payment processing failures, system downtime
- Warning: High error rates, slow queries, low email deliverability
- Info: Daily digest sent, new user signups

---

## Security Considerations

### Threat Model

1. **Authentication Attacks**
   - Brute force login attempts
   - Credential stuffing
   - Session hijacking

2. **Data Breaches**
   - SQL injection
   - XSS attacks
   - CSRF attacks
   - API key exposure

3. **Payment Fraud**
   - Stolen credit cards
   - Chargeback fraud

4. **Abuse**
   - Spam signups
   - Email bombing
   - API abuse

### Security Measures

1. **Authentication Security**
   - bcrypt password hashing (12 rounds)
   - Rate limiting on login (5 attempts / 15 min)
   - Account lockout after failed attempts
   - 2FA option (future)
   - Session timeout (7 days)

2. **API Security**
   - Rate limiting (100 req/min per IP)
   - JWT token validation
   - CORS configuration
   - Input validation (Zod schemas)
   - SQL injection prevention (Prisma ORM)

3. **Payment Security**
   - PCI compliance (Stripe handles)
   - Webhook signature verification
   - Secure payment method storage
   - Fraud detection (Stripe Radar)

4. **Data Protection**
   - HTTPS only (TLS 1.3)
   - Database encryption at rest
   - Secure environment variables
   - GDPR compliance
   - Data retention policies

5. **Infrastructure Security**
   - Security headers (CSP, HSTS, X-Frame-Options)
   - DDoS protection (Vercel Edge Network)
   - Regular dependency updates
   - Vulnerability scanning

### Compliance

- **GDPR**: EU data protection
  - Right to access
  - Right to deletion
  - Right to data portability
  - Cookie consent

- **CAN-SPAM**: Email marketing
  - Unsubscribe link in all emails
  - Physical address in footer
  - Accurate subject lines
  - Honor opt-out requests

- **PCI DSS**: Payment processing
  - No credit card storage
  - Secure transmission
  - Regular security audits

---

## Deployment Strategy

### Environment Setup

**Development**:
- Local PostgreSQL instance
- Mock Stripe (test mode)
- Mock Resend (console logging)
- Local file storage
- Hot reload enabled

**Staging**:
- Railway PostgreSQL
- Stripe test mode
- Resend sandbox
- S3 storage (test bucket)
- Preview deployments on PR

**Production**:
- Supabase PostgreSQL (managed)
- Stripe live mode
- Resend production
- S3 storage (production bucket)
- Edge deployment on Vercel

### Infrastructure as Code

```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "STRIPE_SECRET_KEY": "@stripe-secret",
    "RESEND_API_KEY": "@resend-api-key"
  },
  "crons": [
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 10 * * 5"
    },
    {
      "path": "/api/cron/fetch-content",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### Database Migrations

```bash
# Create migration
pnpm prisma migrate dev --name add_subscriptions

# Apply to production
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

### Deployment Pipeline

1. **Code Commit**
   - Developer pushes to feature branch
   - CI runs linting and tests
   - Type checking passes

2. **Pull Request**
   - Preview deployment created
   - Automated tests run
   - Code review required

3. **Merge to Main**
   - Production build triggered
   - Database migrations run
   - Deploy to Vercel Edge
   - Run smoke tests

4. **Post-Deployment**
   - Monitor error rates
   - Check performance metrics
   - Verify key features
   - Rollback if needed

### Rollback Strategy

- Vercel instant rollback to previous deployment
- Database migration rollback scripts
- Feature flags for gradual rollout
- Blue-green deployment for major updates

---

## Architecture Decision Records

### ADR-001: Next.js App Router vs Pages Router

**Status**: Accepted
**Date**: 2025-10-28

**Context**: Need to choose routing architecture for Next.js application.

**Decision**: Use App Router (Next.js 14+)

**Rationale**:
- Server Components reduce client bundle size
- Better data fetching patterns (async/await)
- Improved layouts and nested routes
- Future-proof (official Next.js direction)
- Better TypeScript support

**Consequences**:
- Learning curve for team
- Some libraries not yet fully compatible
- Migration path if we need to revert

---

### ADR-002: PostgreSQL vs MongoDB

**Status**: Accepted
**Date**: 2025-10-28

**Context**: Need to choose primary database.

**Decision**: Use PostgreSQL

**Rationale**:
- Relational data (users, subscriptions, articles)
- ACID compliance for payments
- Better query capabilities for analytics
- Mature ecosystem (Prisma ORM)
- JSON support for flexible fields

**Consequences**:
- Need to manage schema migrations
- Vertical scaling limitations (mitigated by connection pooling)
- More complex than MongoDB for some use cases

---

### ADR-003: Resend vs SendGrid for Email

**Status**: Accepted
**Date**: 2025-10-28

**Context**: Need to choose email service provider.

**Decision**: Use Resend

**Rationale**:
- React Email integration
- Better developer experience
- Modern API design
- Competitive pricing
- Good deliverability

**Consequences**:
- Smaller company (less established than SendGrid)
- Fewer integrations
- Need to monitor deliverability closely

---

### ADR-004: Stripe vs Other Payment Processors

**Status**: Accepted
**Date**: 2025-10-28

**Context**: Need to choose payment processor.

**Decision**: Use Stripe

**Rationale**:
- Industry standard for subscriptions
- Excellent developer experience
- Comprehensive API and webhooks
- Built-in fraud protection (Radar)
- Customer portal for self-service
- International support

**Consequences**:
- 2.9% + 30¢ per transaction fee
- Vendor lock-in
- Need to handle webhooks reliably

---

### ADR-005: Self-Hosted vs SaaS Analytics

**Status**: Accepted
**Date**: 2025-10-28

**Context**: Need to choose analytics solution.

**Decision**: Use PostHog (self-hosted option) or Plausible

**Rationale**:
- Privacy-focused (GDPR compliant)
- Full feature set (funnels, cohorts, A/B testing)
- Affordable for startups
- Can self-host if needed

**Consequences**:
- Less mature than Google Analytics
- Requires integration work
- Need to manage data retention

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema and migrations
- [ ] Authentication system (NextAuth.js)
- [ ] API routes foundation
- [ ] Email service integration (Resend)
- [ ] Basic admin dashboard

### Phase 2: Payments (Week 2-3)
- [ ] Stripe integration (checkout, portal)
- [ ] Subscription management
- [ ] Webhook handlers
- [ ] Pricing pages
- [ ] Invoice generation

### Phase 3: Content (Week 3-4)
- [ ] Academic API integrations
- [ ] Content curation workflow
- [ ] Digest generation pipeline
- [ ] Email template enhancements
- [ ] Background job system

### Phase 4: User Experience (Week 4-5)
- [ ] Enhanced landing page
- [ ] User dashboard
- [ ] Onboarding flow
- [ ] Preference management
- [ ] Unsubscribe handling

### Phase 5: Analytics & Optimization (Week 5-6)
- [ ] Analytics integration (PostHog/Plausible)
- [ ] Admin analytics dashboard
- [ ] Performance monitoring (Sentry)
- [ ] A/B testing framework
- [ ] SEO optimization

### Phase 6: Polish & Launch (Week 6-7)
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Marketing site content
- [ ] Soft launch to beta users

---

## Conclusion

This architecture provides a solid foundation for building a production-ready subscription service. The design prioritizes:

1. **Scalability**: Can handle 10K+ users with current architecture
2. **Reliability**: 99.9% uptime target with monitoring and alerting
3. **Security**: Multiple layers of protection for user data and payments
4. **Developer Experience**: Modern tools and clear patterns
5. **Business Flexibility**: Easy to add new features and pricing tiers

The modular design allows for iterative development and easy testing. Each component can be developed and deployed independently while maintaining system integrity.

**Next Steps**: Begin Phase 1 implementation with database schema and authentication system.

---

**Document Owner**: System Architecture Team
**Last Updated**: 2025-10-28
**Version**: 1.0
**Status**: Approved for Implementation
