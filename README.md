# Front_Line_Whanau

<!-- BEGIN CAT_CONGRUENCE_SNIPPET -->
## Coastal Alpine Tech portfolio

[![Stage](https://img.shields.io/badge/Stage-Pre--seed-8B5CF6)](https://github.com/fivepanelhat/fivepanelhat)
[![Hybrid](https://img.shields.io/badge/Hybrid-Edge%20%2B%20Multi--model-0f766e)](https://github.com/fivepanelhat/fivepanelhat)
[![HITL](https://img.shields.io/badge/HITL-Draft%2FPrepare%20only-dc2626)](./.github/agent-fleet/AGENTS.md)
[![Te Mana Raraunga](https://img.shields.io/badge/Te%20Mana%20Raraunga-Aligned-0f766e)](https://github.com/fivepanelhat/fivepanelhat)

**Part of the [Kiwi Edge AI Stack](https://github.com/fivepanelhat/fivepanelhat)** | Founder OS: [NZ-Start-Up](https://github.com/fivepanelhat/NZ-Start-Up) | Agent policy: [`.github/agent-fleet/`](./.github/agent-fleet/)

> Sovereign hybrid edge AI for NZ farms and founders - local-first + multi-model, Te Mana Raraunga aligned - collaborating with Venture Taranaki, startups.com investors and Kotahitanga Investment Fund (HITL + cultural advisory for formal approaches).

**Agents inform, draft, prepare, monitor, and remind. Humans advise, sign, file, send, and pay.** 
Anti-hallucination policy: [`.github/agent-fleet/anti-hallucination.md`](./.github/agent-fleet/anti-hallucination.md) | Congruence: [`CAT_CONGRUENCE.md`](./CAT_CONGRUENCE.md)
<!-- END CAT_CONGRUENCE_SNIPPET -->

![Banner](assets/social_preview.png)

> **Canonical product (2026-07-16 merge):** This repository is the **single** national platform. 
> The legacy scaffold [`whanau-preterm-support-hub`](https://github.com/fivepanelhat/whanau-preterm-support-hub) is redirected/archived. 
> Merge details: [docs/MERGE_FROM_WHANAU_PRETERM_SUPPORT_HUB.md](./docs/MERGE_FROM_WHANAU_PRETERM_SUPPORT_HUB.md) | Status: [REALITY.md](./REALITY.md)

Open-Source National Frontline Whanau Support Platform - Aotearoa New Zealand

A sovereign, privacy-first digital platform designed to support whanau of preterm twins and families navigating complex frontline services across Aotearoa New Zealand.

**Live: https://front-line-whanau.vercel.app**

## Demo

 | Platform | Link | Notes |
 | ---------- | ------ | ------- |
 | **Web** | [front-line-whanau.vercel.app](https://front-line-whanau.vercel.app) | Production deployment (Sydney region) |
 | **Mobile** | Same URL on any phone browser | Tap "Add to Home Screen" to install as a PWA |
 | **Desktop** | `npm run tauri:dev` (local) | Tauri 2 native app Windows (.msi) and Linux (.deb/.AppImage) |

### Quick demo walkthrough

1. Open the web link and choose **I am a Parent / Whanau"**
2. Try the **AI Assistant** (Support page) ask "What is CPAP?"
3. Open the **National Directory** search by region or service type
4. Check **Financial Support Checker** run an eligibility report
5. Open **Whanau Hub** (Resources) explore pathways, timers, and the Taonga Vault
6. Switch to **Practitioner** view via the portal switcher for moderation and feedback tools

## The 5 W's

**Who**
Whanau (parents, caregivers, and extended families), practitioners, doctors, midwives, social workers, and frontline organisations with a strong focus on Maori, Pacific, and rural communities.

**What**
A unified, searchable national platform that brings together information and services from multiple organisations into one place. It features role-based experiences (Parent/Whanau and Practitioner/Organisation portals), self-service uploads, encrypted local storage, and AI-assisted curation.

**Why**
Frontline whanau often face fragmented services, information overload, navigation fatigue, and equity gaps. This platform reduces complexity while prioritising cultural safety and data sovereignty.

**When**
MVP targeted for the next 48 weeks, with ongoing development toward national adoption.

**Where**
Nationwide across Aotearoa New Zealand, available as Web, Desktop (Tauri), and Progressive Web App (PWA).

## Problems We Are Solving

- Fragmented support across many organisations (Health NZ, Little Miracles Trust, Plunket, iwi providers, etc.)
- Information overload during high-stress periods (e.g. NICU journeys)
- Lack of role-specific experiences for parents vs practitioners
- No central, up-to-date searchable directory
- Difficulty for organisations to keep their information current
- Equity gaps for Maori, Pacific, and rural whanau
- Limited integration of lived experience with evidence-based resources

## Features

- **Dual Portals**: Tailored experiences for whanau/parents and practitioners/organisations
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

## Architecture Overview

Front Line Whanau is a **sovereign, privacy-first** multi-surface platform (web PWA, Tauri desktop) for whanau and frontline practitioners across Aotearoa, with optional LangGraph AI assist and strong data boundaries.

![Front Line Whanau architecture liquid glass overview](assets/architecture_overview.png)

### System map

```mermaid
%%{init: {
 "theme": "dark",
 "themeVariables": {
 "fontSize": "16px",
 "fontFamily": "Inter, ui-sans-serif, system-ui, sans-serif",
 "primaryColor": "#0ea5e9",
 "primaryTextColor": "#f8fafc",
 "primaryBorderColor": "#38bdf8",
 "lineColor": "#67e8f9",
 "secondaryColor": "#1e293b",
 "tertiaryColor": "#0f172a",
 "clusterBkg": "#0b1220cc",
 "clusterBorder": "#38bdf880",
 "titleColor": "#e2e8f0"
 },
 "flowchart": {
 "nodeSpacing": 40,
 "rankSpacing": 48,
 "padding": 20,
 "htmlLabels": true,
 "curve": "basis"
 }
}}%%
flowchart TB

 classDef sense fill:#052e16,stroke:#4ade80,stroke-width:2px,color:#f0fdf4
 classDef edge fill:#0c4a6e,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
 classDef core fill:#134e4a,stroke:#2dd4bf,stroke-width:2px,color:#f0fdfa
 classDef act fill:#422006,stroke:#fbbf24,stroke-width:2px,color:#fffbeb
 classDef store fill:#1e1b4b,stroke:#a5b4fc,stroke-width:2px,color:#eef2ff
 classDef ai fill:#3b0764,stroke:#e879f9,stroke-width:2px,color:#fdf4ff
 classDef app fill:#1e1b4b,stroke:#c4b5fd,stroke-width:2px,color:#eef2ff

 U["Whanau | practitioners | orgs"] --> WEB["Next.js web / PWA"]
 U --> DESK["Tauri 2 desktop"]
 WEB & DESK --> API["API + auth<br/>rate limits | CSP"]
 API --> DB["Supabase / data plane<br/>tenant boundaries"]
 API --> AI["Optional LangGraph assist"]
 AI --> LOCAL["Policy-bound tools<br/>no unrestricted PHI"]

 class U act
 class WEB,DESK,API core
 class DB,LOCAL store
 class AI ai
```

 | Layer | Components | Role |
 | :--- | :--- | :--- |
 | **Clients** | Web PWA + Tauri | Mobile & desktop |
 | **API** | Auth | CSP | rate limits | Hardened edge |
 | **Data** | Tenant boundaries | Privacy-first |
 | **AI** | LangGraph optional | Policy-bound assist |

*Full detail: [ARCHITECTURE.md](./ARCHITECTURE.md) | [AI-ARCHITECTURE.md](./AI-ARCHITECTURE.md)*

## Directory Structure

```text
Front_Line_Whanau/
|-- .github/workflows/ # CI/CD pipelines
|-- docs/ # Architecture, roadmap, guides
|-- agents/ # AI agent definitions
|-- src/
| |-- app/ # Next.js routes & pages
| |-- components/ # UI components
| |-- features/ # Domain features (directory, uploads, etc.)
| |-- lib/ # Utilities (encryption, consent, etc.)
| -- ai/ # AI agent logic
|-- supabase/ # Database schema & migrations
-- vitest.config.ts # Test configuration
```

## Requirements

- **Node.js** 22
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

# 1. Configure environment copy the template and fill in your Supabase keys
# (Supabase Dashboard -> Project Settings -> API). GOOGLE_API_KEY is optional;
# without it the AI agents run in stub mode.
cp .env.example .env.local

# 2. Apply database migrations to your Supabase project
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push

# 3. Run
npm run dev
```

The app starts at `http://localhost:3000`. Verify your database connection at `http://localhost:3000/api/health` it should return `{"status":"ok","database":"connected"}`.

### Tauri Desktop Commands

After setup, you can use these commands:

 | Command | Platform | What it does |
 | --------- | ---------- | -------------- |
 | `npm run tauri:dev` | Windows/Linux | Run desktop app in development mode |
 | `npm run tauri:build` | Current OS | Build for current operating system |
 | `npm run tauri:build:windows` | Any | Build Windows installer (.msi) |
 | `npm run tauri:build:linux` | Any | Build Linux AppImage + .deb |

## Security & Privacy

- **Security headers** enforced on all routes via the Next.js 16 proxy (`X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, baseline CSP)
- **Health check** at `/api/health` (verifies live database connectivity)
- **Privacy-by-design approach** no PHI stored without explicit consent

## Testing & Quality

 | Check | Status | Command |
 | -------------------------- | --------------------- | ---------------------------------- |
 | TypeScript | [OK] Passing | `npm run type-check` |
 | ESLint | [OK] Passing | `npm run lint` |
 | Unit Tests + Coverage | [OK] 94.95% | `npm run test:coverage` |
 | E2E Tests (Playwright) | [OK] **40/40 passing** | `npm run e2e` |

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
