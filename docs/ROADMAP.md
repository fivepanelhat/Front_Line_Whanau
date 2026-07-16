# Roadmap - Whanau Preterm Support Hub NZ

## [OK] Recently Completed

- [x] Phase 3 Beta Readiness (caching layer, error boundaries, consent modals, and Policy Advocate Agent)
- [x] Phase 4 Beta Operations (health check APIs, Medical Jargon Translator, Playwright E2E suite, and markdown display)
- [x] Phase 5 Production Readiness (Supabase rate limits, load tests, Slack logging integrations, and OnboardingWizard)
- [x] API Security Hardening (secured Next.js route handlers with strict JWT token validations and middleware guards)
- [x] E2E Resiliency (implemented data-testid hooks and refactored tests for role selection and language features)
- [x] Stabilise full E2E test suite (**42/42 passing**)
- [x] Resolve rebase conflicts and sync repository to remote
- [x] Improve component semantics and mobile test reliability
- [x] Merge multi-turn AI orchestration and chat interface improvements into `main`
- [x] Add GitHub deployment workflow for `preview`, `staging`, and `production`
- [x] Harden deployment workflow with manual dispatch and fail-fast secret validation
- [x] Publish v0.3 release notes and deployment protection guidance

## Current Priorities (in order)

- [ ] Update project documentation and status (in progress)
- [ ] Begin Aether Summit integration
- [ ] Start development of Parent and Practitioner portals
- [ ] Accessibility improvements and audit

## [OK] Foundation (Completed Earlier)

- Core Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui foundation
- Internationalisation support via `next-intl`
- Playwright E2E test infrastructure with automatic dev server startup
- Security headers middleware (production-grade defaults)
- Robust `/api/health` endpoint (GET + HEAD, no database dependency)
- 94.95% unit test coverage with passing type checking and linting

## Next Milestones (Q3 2026)

- Role-based portals (`/parent` and `/practitioner`) with full navigation flows
- Resource directory and culturally safe peer support features (MVP)
- WCAG 2.2 AA accessibility audit and improvements
- Open-source repository public launch with contribution guidelines
- Initial community and iwi engagement documentation

## Long-term Vision (2026-2027)

- National platform for preterm twin and whanau support across Aotearoa New Zealand
- Strong alignment with Maori data sovereignty (Te Mana Raraunga) and Te Tiriti o Waitangi
- Integration pathways with Mana Kai and community resilience initiatives
- Scalable, accessible, family-centred digital support infrastructure
