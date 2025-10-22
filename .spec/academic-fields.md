# Academic Fields and Tagging System

## Core Academic Fields

### 1. Life Sciences
**Description**: Research covering living organisms, biological processes, and health sciences from molecular to ecosystem levels.

**Subfields & Tags:**
- **Molecular Biology** (genetics, genomics, proteomics, CRISPR)
- **Cell Biology** (cell signaling, organelles, cellular processes)
- **Neuroscience** (brain function, neural circuits, cognition)
- **Immunology** (immune system, vaccines, autoimmune diseases)
- **Developmental Biology** (embryogenesis, stem cells, regeneration)
- **Ecology & Evolution** (biodiversity, adaptation, environmental interactions)
- **Biomedical Research** (disease mechanisms, therapeutics, clinical research)
- **Bioinformatics** (computational biology, data analysis, modeling)

**Key Venues**: Nature, Science, Cell, Nature Medicine, NEJM, Cell, PNAS, eLife

**Content Priorities**:
- Breakthrough discoveries with broad implications
- Novel methodologies and technologies
- Translational research with clinical relevance
- Cross-disciplinary findings bridging biology and other fields

---

### 2. AI & Computing
**Description**: Advances in artificial intelligence, computer science, and computational systems with focus on both theoretical foundations and practical applications.

**Subfields & Tags:**
- **Machine Learning** (deep learning, neural networks, reinforcement learning)
- **Natural Language Processing** (language models, translation, sentiment analysis)
- **Computer Vision** (image recognition, object detection, video analysis)
- **Robotics** (autonomous systems, human-robot interaction, manipulation)
- **Algorithms & Theory** (complexity theory, optimization, cryptography)
- **Systems & Architecture** (distributed systems, cloud computing, hardware)
- **Human-Computer Interaction** (UX design, accessibility, interface design)
- **AI Ethics & Safety** (bias, fairness, explainability, alignment)

**Key Venues**: NeurIPS, ICML, ICLR, AAAI, ACL, CVPR, IEEE/ACM journals, Nature Machine Intelligence

**Content Priorities**:
- Novel architectures and algorithms with performance breakthroughs
- Real-world applications with measurable impact
- Ethical considerations and societal implications
- Intersections with other scientific domains

---

### 3. Humanities & Culture
**Description**: Scholarly work exploring human expression, cultural phenomena, historical contexts, and interpretive frameworks across time and geography.

**Subfields & Tags:**
- **Literary Studies** (literary analysis, comparative literature, digital humanities)
- **History** (historical research, cultural history, historiography)
- **Philosophy** (ethics, epistemology, political philosophy, aesthetics)
- **Linguistics** (language structure, sociolinguistics, historical linguistics)
- **Cultural Studies** (media studies, popular culture, identity formation)
- **Archaeology** (material culture, excavation methods, heritage preservation)
- **Art History** (visual culture, museum studies, conservation)
- **Musicology** (music theory, ethnomusicology, performance studies)

**Key Venues**: PMLA, American Historical Review, Journal of Philosophy, Cultural Anthropology, Representations, New Literary History

**Content Priorities**:
- Digital humanities methodologies and tools
- Cross-cultural comparative studies
- Contemporary relevance of historical research
- Innovative approaches to traditional humanistic inquiry

---

### 4. Policy & Governance
**Description**: Research on public policy, governance systems, regulatory frameworks, and their impacts on society, economy, and individual welfare.

**Subfields & Tags:**
- **Public Policy** (policy analysis, evaluation, implementation)
- **Political Science** (governance, political behavior, institutions)
- **Economics Policy** (fiscal policy, monetary policy, development economics)
- **Environmental Policy** (climate policy, sustainability, conservation)
- **Health Policy** (healthcare systems, public health, medical regulation)
- **Technology Policy** (AI governance, data privacy, platform regulation)
- **Social Policy** (education, welfare, inequality, social justice)
- **International Relations** (diplomacy, global governance, conflict resolution)

**Key Venues**: Journal of Public Policy, American Political Science Review, Policy Sciences, Governance, World Development

**Content Priorities**:
- Evidence-based policy analysis with actionable insights
- Comparative studies across different governance systems
- Technology's impact on policy and governance
- Policy responses to global challenges

---

### 5. Climate & Earth Systems
**Description**: Integrated research on Earth's climate system, environmental changes, and sustainability solutions across atmospheric, oceanic, terrestrial, and cryospheric domains.

**Subfields & Tags:**
- **Climate Science** (climate modeling, atmospheric dynamics, paleoclimatology)
- **Oceanography** (marine ecosystems, ocean circulation, sea level change)
- **Earth Surface Processes** (geomorphology, soil science, hydrology)
- **Ecology & Biodiversity** (ecosystem services, conservation, species interactions)
- **Cryosphere Studies** (glaciers, ice sheets, permafrost)
- **Atmospheric Science** (air quality, weather patterns, atmospheric chemistry)
- **Sustainability Science** (renewable energy, sustainable development, resilience)
- **Climate Adaptation & Mitigation** (policy solutions, technology, social dimensions)

**Key Venues**: Nature Climate Change, Earth System Dynamics, Journal of Climate, Global Change Biology, Climate Policy

**Content Priorities**:
- Advances in climate modeling and prediction
- Climate change impacts and adaptation strategies
- Nature-based solutions and ecosystem restoration
- Intersection of climate science with policy and society

## Content Tagging Schema

### Primary Tags (Field-Specific)
Each field has 20-30 primary tags representing major subfields and research areas. Tags are hierarchical:

```
Field Level 1 (5 fields)
├── Subfield Level 2 (20-30 per field)
│   ├── Specialty Level 3 (50-100 per subfield)
│   └── Methodology Tags (10-15 per subfield)
```

### Cross-Cutting Tags
**Methodology Tags** (applicable across all fields):
- **Computational Methods** (simulation, modeling, data analysis)
- **Experimental Methods** (lab techniques, field studies)
- **Theoretical Frameworks** (mathematical models, conceptual frameworks)
- **Interdisciplinary Approaches** (cross-field collaboration)
- **Review & Meta-analysis** (systematic reviews, literature synthesis)
- **Case Studies** (in-depth analysis of specific instances)

**Impact Tags** (describing research significance):
- **Breakthrough** (fundamental paradigm shifts)
- **Methodological Innovation** (new tools or techniques)
- **Clinical Translation** (medical applications)
- **Policy Implications** (government or organizational impact)
- **Educational Impact** (teaching and learning applications)
- **Public Engagement** (science communication, outreach)

**Temporal Tags** (content freshness):
- **This Week** (published in last 7 days)
- **Recent** (published 8-14 days ago)
- **Emerging Trends** (multiple papers on similar topics)
- **Timeless Insights** (foundational research, reviews)

## Content Curation Heuristics

### Quality Indicators
1. **Venue Prestige**: Top-tier journals and conferences prioritized
2. **Author Reputation**: Established researchers and rising stars
3. **Citation Velocity**: Early citation indicators where available
4. **Methodological Rigor**: Sound experimental or analytical methods
5. **Novelty Score**: Originality and innovation assessment

### Relevance Scoring
Each article receives a relevance score (0-100) based on:

**Field Alignment (40 points)**
- Direct field relevance: 30-40 points
- Cross-field relevance: 15-25 points
- Peripheral interest: 5-10 points

**Impact Potential (25 points)**
- Paradigm-shifting potential: 20-25 points
- Significant advancement: 15-20 points
- Incremental improvement: 10-15 points
- Minor contribution: 5-10 points

**Accessibility (20 points)**
- Open access availability: 15-20 points
- Clear abstract and summary: 10-15 points
- Technical accessibility: 5-10 points

**Timeliness (15 points)**
- Published this week: 15 points
- Published 8-14 days ago: 10 points
- Preprint with high impact: 12 points

### Diversity Requirements
Each weekly digest must include:
- **Source Diversity**: Maximum 1 paper per journal/venue
- **Methodological Diversity**: Mix of experimental, theoretical, and review content
- **Geographic Diversity**: Authors from multiple regions when possible
- **Career Stage Diversity**: Mix of established and emerging researchers
- **Subfield Balance**: Representative sampling of field subdomains

## Content Filtering Rules

### Inclusion Criteria
- Published within last 14 days
- Meets minimum quality threshold (score ≥ 60)
- Available in English or with English abstract
- Has accessible summary or abstract
- Relevant to field definition

### Exclusion Criteria
- Duplicate content from same research group
- Preprints without peer review (unless exceptional)
- Retracted or corrected publications
- Content behind paywalls without open access alternative
- Conference abstracts without full papers

## Source Hierarchy

### Tier 1 Sources (Primary Focus)
- **Top Journals**: Nature, Science, Cell, Lancet, NEJM, PNAS
- **Field-Specific Top Journals**: 3-5 per academic field
- **Major Conferences**: Premier venues in computer science and related fields

### Tier 2 Sources (Secondary Focus)
- **Respected Specialty Journals**: Established venues in subfields
- **Society Publications**: Professional organization journals
- **Review Journals**: Annual Reviews, Nature Reviews, etc.

### Tier 3 Sources (Occasional)
- **Emerging Venues**: New journals with promising content
- **Regional Journals**: Important non-English publications with English content
- **Interdisciplinary Journals**: Publications spanning multiple fields

## Weekly Digest Composition

### Standard Format (3-5 items)
1. **Lead Story** (1 item): Highest impact, broadest relevance
2. **Research Highlights** (2-3 items): Significant advances in subfields
3. **Method Spotlight** (1 item): Novel techniques or tools

### Content Balance
- **Basic Research**: 60-70% of items
- **Applied Research**: 20-30% of items
- **Reviews/Meta-analyses**: 10-20% of items
- **Cross-disciplinary**: At least 1 item showing connections

### Reading Time Distribution
- **Short Items** (2-3 minutes): 1-2 items
- **Medium Items** (4-6 minutes): 2-3 items
- **Long Items** (7-10 minutes): 0-1 items
- **Total Reading Time**: 15-25 minutes per digest

This comprehensive field and tagging system ensures consistent, high-quality content that serves the diverse needs of academic subscribers while maintaining the editorial standards that make Bite Size Academic valuable.