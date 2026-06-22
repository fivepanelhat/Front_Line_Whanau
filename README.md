# Front_Line_Whanau

**Open-Source National Frontline Whānau Support Platform – Aotearoa New Zealand**

A sovereign, privacy-first digital platform designed to support whānau of preterm twins and families navigating complex frontline services across Aotearoa New Zealand.

## The 5 W's

**Who**  
Whānau (parents, caregivers, and extended families), practitioners, doctors, midwives, social workers, and frontline organisations — with a strong focus on Māori, Pacific, and rural communities.

**What**  
A unified, searchable national platform that brings together information and services from multiple organisations into one place. It features role-based experiences (Parent/Whānau and Practitioner/Organisation portals), self-service uploads, encrypted local storage, and AI-assisted curation.

**Why**  
Frontline whānau often face fragmented services, information overload, navigation fatigue, and equity gaps. This platform reduces complexity while prioritising cultural safety and data sovereignty.

**When**  
MVP targeted for the next 4–8 weeks, with ongoing development toward national adoption.

**Where**  
Nationwide across Aotearoa New Zealand, available as Web, Desktop (Tauri), and Progressive Web App (PWA).

## Problems We Are Solving

- Fragmented support across many organisations (Health NZ, Little Miracles Trust, Plunket, iwi providers, etc.)
- Information overload during high-stress periods (e.g. NICU journeys)
- Lack of role-specific experiences for parents vs practitioners
- No central, up-to-date searchable directory
- Difficulty for organisations to keep their information current
- Equity gaps for Māori, Pacific, and rural whānau
- Limited integration of lived experience with evidence-based resources

## Features

- **Dual Portals**: Tailored experiences for whānau/parents and practitioners/organisations
- **Searchable National Directory**: Filter by region, organisation, service type, and role
- **Self-Service Uploads**: Organisations can submit and update their details (moderated)
- **Privacy-First Storage**: Client-side encryption (Taonga Vault) with consent-driven access
- **Cultural Safety**: Strong alignment with Te Tiriti o Waitangi and Te Mana Raraunga
- **AI Agent Support**: Specialised agents for research, translation, and curation

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Cross-Platform**: Tauri 2 (Desktop) + PWA (Mobile)
- **Backend & Data**: Supabase (Postgres + pgvector + Auth)
- **AI Agents**: LangGraph-powered multi-agent system
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions

## Directory Structure

```text
Front_Line_Whanau/
├── .github/workflows/     # CI/CD pipelines
├── docs/                  # Architecture, roadmap, guides
├── agents/                # AI agent definitions
├── src/
│   ├── app/               # Next.js routes & pages
│   ├── components/        # UI components
│   ├── features/          # Domain features (directory, uploads, etc.)
│   ├── lib/               # Utilities (encryption, consent, etc.)
│   └── ai/                # AI agent logic
├── supabase/              # Database schema & migrations
└── vitest.config.ts       # Test configuration
```

## Requirements

- **Node.js** ≥ 22
- npm (or pnpm/yarn)

We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.

```bash
nvm use
```

## Getting Started (Development)

### Installation & Run

```bash
git clone https://github.com/fivepanelhat/Front_Line_Whanau.git
cd Front_Line_Whanau
npm install
npm run dev
```
