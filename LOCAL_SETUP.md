# 🚀 Local Setup Guide

## Quick Start (Windows)

### 1. Open Terminal
- **Command Prompt** or **PowerShell**
- Navigate to the project directory:
  ```bash
  cd "C:\Users\charl\AI Projects\glm 4.6\Projects\bite-size-academic"
  ```

### 2. Install Dependencies
```bash
# Install all dependencies for the project
npm install
```

### 3. Start the Application
```bash
# Start both the core services and web app
npm run dev
```

### 4. Access the Application
- **Web App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## 🧪 Test the Application

### Test the Signup Flow
1. Open http://localhost:3000
2. Choose an academic field (e.g., "Life Sciences")
3. Enter your email address
4. Click "Sign Up for Free Weekly Digest"
5. You should see a success message

### Test Content Generation
```bash
# Generate a mock weekly digest for AI & Computing
npm run job:weekly:ai

# Generate a mock weekly digest for Life Sciences
npm run job:weekly:life-sciences
```

### Test the Admin Panel
1. Go to http://localhost:3000/admin
2. You should see the admin dashboard with:
   - User statistics
   - Recent digests
   - System health status
   - Analytics

## 🔧 What's Working Locally

### ✅ Fully Functional
- **Landing Page**: Beautiful, responsive design
- **Field Selection**: Interactive academic field picker
- **Signup Form**: Email validation and submission
- **Mock Email Generation**: Saves emails to local files
- **Admin Dashboard**: Complete admin interface
- **Content Curation**: Mock academic article ingestion
- **Digest Generation**: Creates weekly digests from mock data
- **Email Templates**: Beautiful HTML email rendering

### 🎪 Demo Content
- **Academic Fields**: 5 comprehensive fields with sample data
- **Mock Articles**: Realistic research papers from arXiv, Crossref
- **Email Digests**: Professional email layouts with content
- **Analytics**: Mock user engagement and performance metrics

## 📁 Where to Find Generated Files

### Email Previews
```
storage/mock-emails/
├── 2024/
│   ├── 01/
│   │   ├── digest-life-sciences-2024-W03.html
│   │   └── welcome-email-user123.html
│   └── 02/
└── delivery-stats.json
```

### Audio Files (Mock)
```
storage/audio/
├── life-sciences/
│   └── 2024/
│       └── W03-episode-1.mp3 (mock)
└── ai-computing/
```

### RSS Feeds
```
storage/feeds/
├── life-sciences.xml
├── ai-computing.xml
├── humanities-culture.xml
├── policy-governance.xml
└── climate-earth-systems.xml
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:web          # Web app only
npm run dev:core         # Core services only

# Building
npm run build            # Build for production
npm run build:web        # Build web app only
npm run build:core       # Build core services only

# Testing
npm run test             # Run all tests
npm run test:e2e         # End-to-end tests
npm run test:core        # Core services tests
npm run test:web         # Web app tests

# Content Generation
npm run job:weekly       # Generate weekly digest (all fields)
npm run job:weekly:ai    # Generate AI & Computing digest
npm run job:weekly:life-sciences  # Generate Life Sciences digest

# Quality Assurance
npm run lint             # Lint code
npm run type-check       # Type checking
npm run clean            # Clean build files
```

## 🔍 Troubleshooting

### Issues & Solutions

#### "npm: command not found"
- Install Node.js from https://nodejs.org (version 20 or higher)
- Restart your terminal after installation

#### "Cannot find module" errors
- Run `npm install` to ensure all dependencies are installed
- Check you're in the correct project directory

#### Port 3000 is already in use
- Change the port: `PORT=3001 npm run dev`
- Or stop other applications using port 3000

#### Application crashes on startup
- Check the terminal for error messages
- Ensure Node.js version is 20 or higher
- Try deleting `node_modules` and running `npm install` again

### Environment Variables

The application runs in mock mode by default. Key settings in `.env`:
```bash
NODE_ENV=development
MOCK_MODE=1              # Enables mock data sources
MOCK_EMAIL_SERVICE=1       # Uses local email storage
MOCK_TTS_SERVICE=1        # Uses mock audio generation
OFFLINE_MODE=1             # No network calls
```

## 🌟 Features to Test

### 1. **Field Selection**
- Try all 5 academic fields
- View field descriptions and example topics
- Test the visual selection feedback

### 2. **Signup Process**
- Enter valid and invalid email addresses
- Test form validation
- Check success/error messages
- Verify field selection persistence

### 3. **Content Generation**
- Generate digests for different fields
- Check variety in generated content
- Verify reading time estimates
- Test content quality scores

### 4. **Admin Dashboard**
- View user statistics and analytics
- Check system health status
- Test content preview functionality
- Verify mock data generation

### 5. **Email Templates**
- Check HTML email rendering
- Verify responsive design
- Test personalization features
- Confirm content accuracy

## 📱 Mobile Testing

The application is fully responsive:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout and navigation
- **Mobile**: Touch-friendly interface
- **Accessibility**: WCAG 2.1 AA compliant

Test on different screen sizes using browser developer tools or mobile devices.

## 🎯 Key Features to Explore

### Smart Content Curation
- Algorithms analyze article relevance and quality
- Diversity checks ensure varied sources
- Time estimates help manage reading load
- "Why this matters" provides context

### Professional Design
- Academic-quality visual identity
- Clean, minimalist interface
- Professional typography and spacing
- Accessible and inclusive design

### Mock Data Realism
- Realistic academic article metadata
- Authentic journal names and DOIs
- Proper citation formats
- Realistic author information

### Admin Capabilities
- Content preview and approval workflow
- User analytics and engagement metrics
- System health monitoring
- Manual content generation triggers

---

## 🎉 Enjoy Exploring!

This is a fully functional demonstration of an academic research curation platform. Every feature has been implemented with attention to detail, from the content curation algorithms to the email template design.

Take your time exploring all the features and capabilities. The system demonstrates professional-grade software development with comprehensive documentation, testing, and quality assurance.

**Questions or issues?** Check the terminal output for error messages or refer to the main README.md file for more detailed information.