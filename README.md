# Bite Size Academic

> Stay current with academic research without the information overload.

**Live MVP**: [https://alexandria-s-design.github.io/bite-size-academic/](https://alexandria-s-design.github.io/bite-size-academic/)

Think **TikTok meets academia** — digestible scholarly content for busy academics, students, and lifelong learners.

## 🎯 Mission

Empowering academics to stay current without the overwhelm by delivering intelligent, time-efficient research summaries that respect both the complexity of scholarship and the constraints of busy schedules.

## 🎯 Target Audience

- **Busy Academics**: Professors and researchers staying current across multiple subfields
- **Graduate Students**: Building foundational knowledge while managing coursework
- **Lifelong Learners**: Professionals wanting access to cutting-edge research
- **Interdisciplinary Researchers**: Scholars bridging multiple fields

## 💡 What is "Bite-Size Academic"?

Short-form scholarly content delivered in digestible formats:

- **2-minute summaries** of research papers with key findings
- **Why it matters** analysis connecting research to broader implications
- **Weekly digests** of 3-5 papers (15 minutes total)
- **Premium podcast episodes** (8-15 minutes) for audio consumption
- **NotebookLM-style overviews** creating narrative connections

Like TikTok revolutionized video by making it snackable, we're doing the same for academic research — maintaining scholarly rigor while respecting time constraints.

## ✨ Key Features

### 📧 Free Tier
- Weekly email digest (3-5 curated papers)
- Smart summaries with key findings and methodology
- Reading time estimates (2-10 min per article)
- "Why This Matters" context and impact analysis
- 5 academic fields: Life Sciences, AI & Computing, Humanities & Culture, Policy & Governance, Climate & Earth Systems

### 🎧 Premium Tier (Coming Soon)
- Weekly podcast episodes (8-15 minutes)
- RSS feed for podcast apps
- NotebookLM-style narrative overviews
- Audio transcripts for reference

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Sources  │───▶│  Content Engine │───▶│  Delivery Layer │
│ • arXiv         │    │ • Curation      │    │ • Email Service │
│ • Crossref      │    │ • Summarization │    │ • RSS Feeds     │
│ • PubMed        │    │ • Audio Gen     │    │ • Web Interface │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### MVP (GitHub Pages)

```bash
# View the live site
https://alexandria-s-design.github.io/bite-size-academic/

# Local preview
open index.html  # macOS
start index.html # Windows
```

### Full Application

```bash
# Clone repository
git clone https://github.com/Alexandria-s-Design/bite-size-academic.git
cd bite-size-academic

# Install dependencies
pnpm install

# Start development
pnpm dev

# Access at http://localhost:3000
```

## 📊 Academic Fields

1. **Life Sciences** 🧬 - Genetics, neuroscience, immunology, biomedical research
2. **AI & Computing** 🤖 - Machine learning, NLP, computer vision, algorithms
3. **Humanities & Culture** 📚 - History, philosophy, linguistics, cultural studies
4. **Policy & Governance** 🏛️ - Public policy, economics, legal studies, ethics
5. **Climate & Earth Systems** 🌍 - Climate science, sustainability, ecology, oceanography

## 💰 Pricing Model Ideas

### Free Tier
- Weekly email digest (3-5 papers)
- 1 academic field
- Basic summaries

### Premium ($9.99/month)
- Podcast episodes
- Multiple field subscriptions
- Advanced search and archives

### Institutional (Custom)
- Bulk licenses
- Custom field curation
- Analytics dashboard

## 📁 Project Structure

```
bite-size-academic/
├── index.html          # MVP landing page (GitHub Pages)
├── apps/web/           # Next.js application
├── packages/core/      # Shared business logic
├── fixtures/           # Mock data sources
└── docs/               # Documentation
```

## 🚀 Deployment

### GitHub Pages (Current)
```bash
git add index.html README.md
git commit -m "Update landing page"
git push origin main
```

### Production (Future)
```bash
export NODE_ENV=production
export MOCK_MODE=0
docker build -t bite-size-academic .
docker run -p 3000:3000 bite-size-academic
```

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📞 Contact

- **Organization**: Alexandria's Design
- **GitHub**: https://github.com/Alexandria-s-Design/bite-size-academic
- **Live Site**: https://alexandria-s-design.github.io/bite-size-academic/

---

<div align="center">
  <p>Built with 🧠 for curious academics everywhere</p>
  <p>© 2024 Alexandria's Design. All rights reserved.</p>
</div>
