# Roadmap

## Phase 0: Foundation (Current)

**Status**: In Progress

### Completed Today (2026-06-29)

- [x] Merged multi-turn AI orchestration and chat interface improvements into `main`
- [x] Added deployment workflow for `preview`, `staging`, and `production` environments
- [x] Hardened deployment workflow with manual dispatch and fail-fast secret validation
- [x] Added deployment protection and trigger guidance to deployment documentation
- [x] Published v0.3 release notes and validated full CI checks locally (type-check, lint, tests)
- [x] Integrated specialist LangGraph agents (Funding, Cultural Safety, Trauma-Informed)
- [x] Implemented end-to-end Human-in-the-Loop (HITL) review system with SSE streaming
- [x] Optimised Next.js bundle size with per-route message loading (next-intl)
- [x] Project scaffolding & documentation
- [x] Privacy-first encryption layer (Taonga Vault)
- [x] Basic AI agent structure (`src/ai/`)
- [x] Vitest + CI setup
- [x] Consistent Node.js 22 enforcement
- [x] Dual Portal UI (Parent vs Practitioner)
- [x] Organisation self-service upload flow
- [x] Connect Supabase (optional sync)

## Phase 1: MVP (Target: July – August 2026)

**Status**: Completed

**Goal**: Usable national directory with role-based experiences

- [x] Implement one-click role selector + dual portals
- [x] Build searchable unified directory (with filters)
- [x] Organisation/Practitioner submission + moderation workflow
- [x] Expand AI agent system to full 11 agents (LangGraph)
- [x] Basic RAG pipeline (Supabase pgvector)
- [x] Add Tauri desktop support
- [x] Improve test coverage (>60%)
- [x] Accessibility audit (WCAG 2.2 AA)

## Phase 2: Beta & Hardening (September – October 2026)

**Status**: Completed

- [x] Live AI agent reasoning (with consent)
- [x] Peer support features (moderated stories)
- [x] Financial tools & eligibility checker
- [x] Practitioner dashboard (resource export, notes)
- [x] Full cultural safety review process
- [x] Performance optimisation & offline support
- [x] Public beta launch

## Phase 3: National Scale (Q4 2026 – 2027)

- [ ] Partnerships with Health NZ, Little Miracles Trust, Plunket, iwi
- [ ] Advanced analytics & outcome tracking (anonymised)
- [ ] Multi-language support (Te Reo Māori + Pacific languages)
- [ ] Community governance model
- [ ] Sustainable funding & operations model
- [ ] Potential integration with national health systems (with consent)

## Key Milestones

| Milestone              | Target Date  | Status      |
|------------------------|--------------|-------------|
| Dual Portals MVP       | July 2026    | In Progress |
| Full Agent Swarm + RAG | August 2026  | Planned     |
| Public Beta            | October 2026 | Planned     |
| National Partnerships  | Q1 2027      | Planned     |
