# Front_Line_Whanau

![Banner](assets/social_preview.png)



Open-Source National Frontline Whānau Support Platform – Aotearoa New Zealand

A sovereign, privacy-first digital platform designed to support whānau of preterm twins and families navigating complex frontline services across Aotearoa New Zealand.

**🌐 Live: https://front-line-whanau.vercel.app**

## Demo

| Platform | Link | Notes |
|----------|------|-------|
| **Web** | [front-line-whanau.vercel.app](https://front-line-whanau.vercel.app) | Production deployment (Sydney region) |
| **Mobile** | Same URL on any phone browser | Tap "Add to Home Screen" to install as a PWA |
| **Desktop** | `npm run tauri:dev` (local) | Tauri 2 native app — Windows (.msi) and Linux (.deb/.AppImage) |

### Quick demo walkthrough

1. Open the web link and choose **"I am a Parent / Whanau"**
2. Try the **AI Assistant** (Support page) — ask "What is CPAP?"
3. Open the **National Directory** — search by region or service type
4. Check **Financial Support Checker** — run an eligibility report
5. Open **Whanau Hub** (Resources) — explore pathways, timers, and the Taonga Vault
6. Switch to **Practitioner** view via the portal switcher for moderation and feedback tools

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
- **Self-Service Uploads**: Organisations can submit directory listings and securely upload resources (Taonga Vault encryption)
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

## AI Architecture (LangGraph)

The platform features a multi-agent orchestrated backend using **LangGraph**. A single entry point analyzes the user's intent and dynamically routes them to specialized AI companions:

1. **Supervisor Node (`intentClassifier`)**: Routes queries based on intent (`RESEARCH`, `PLANNING`, `EXECUTION`, `CLINICAL`, `ADVOCACY`).
2. **Specialized Agents**:
   - `TraumaInformedCompanion`: Handles general research and planning with deep empathy.
   - `FundingEligibilityChecker`: Walks users through MSD/WINZ and clinical funding logic.
   - `ClinicalTriageCompanion`: Safely detects medical symptoms and escalates immediately based on severity (EMERGENCY/URGENT/INFO).
   - `PolicyAdvocateCompanion`: Drafts formal letters and empowers whānau to advocate for their rights.
3. **Guardrails & Human Review**: High-risk actions automatically hit a circuit-breaker and flag for human practitioner review before finalizing.

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

# 1. Configure environment — copy the template and fill in your Supabase keys
#    (Supabase Dashboard → Project Settings → API). GOOGLE_API_KEY is optional;
#    without it the AI agents run in stub mode.
cp .env.example .env.local

# 2. Apply database migrations to your Supabase project
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push

# 3. Run
npm run dev
```

The app starts at `http://localhost:3000`. Verify your database connection at `http://localhost:3000/api/health` — it should return `{"status":"ok","database":"connected"}`.

### Tauri Desktop Commands

After setup, you can use these commands:

| Command | Platform | What it does |
| --------- | ---------- | -------------- |
| `npm run tauri:dev` | Windows/Linux | Run desktop app in development mode |
| `npm run tauri:build` | Current OS | Build for current operating system |
| `npm run tauri:build:windows` | Any | Build Windows installer (.msi) |
| `npm run tauri:build:linux` | Any | Build Linux AppImage + .deb |

## 🔒 Security & Privacy

- **Security headers** enforced on all routes via middleware (`X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, baseline CSP)
- **Health check** at `/api/health` (verifies live database connectivity)
- **Privacy-by-design approach** — no PHI stored without explicit consent

## 🧪 Testing & Quality

| Check                    | Status              | Command                          |
|--------------------------|---------------------|----------------------------------|
| TypeScript               | ✅ Passing          | `npm run type-check`             |
| ESLint                   | ✅ Passing          | `npm run lint`                   |
| Unit Tests + Coverage    | ✅ 94.95%           | `npm run test:coverage`          |
| E2E Tests (Playwright)   | ✅ **40/40 passing**| `npm run e2e`                    |

### Running Tests

```bash
# Recommended before committing
npm run type-check && npm run lint && npm run test:coverage && npm run e2e

# E2E with visual debugger
npm run e2e:ui
```

## License

This project is licensed under the **Apache License 2.0**. See [LICENSE](./LICENSE).

---

## Project badges

Status badges for this repository (CI, security, license, and stack metadata):

[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)  
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)]()  
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript&logoColor=white)]()  
[![Te Tiriti](https://img.shields.io/badge/Te%20Tiriti-Aligned-00247D?style=flat-square)]()  
[![Te Mana Raraunga](https://img.shields.io/badge/Te%20Mana%20Raraunga-Data%20Sovereignty-005A9C?style=flat-square)]()  
[![Sovereignty](https://img.shields.io/badge/Sovereignty-NZ%20Data%20Bound-00247D?style=flat-square)]()  
[![CI](https://github.com/fivepanelhat/Front_Line_Whanau/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fivepanelhat/Front_Line_Whanau/actions/workflows/ci.yml)  
[![Accessibility](https://img.shields.io/badge/WCAG-2.2%20AA-success?style=flat-square)]()  
[![Dependabot](https://img.shields.io/badge/Dependencies-Monitored-brightgreen?style=flat-square&logo=dependabot)]()
