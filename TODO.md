# TODO & Active Tasks - Whānau Preterm Support Hub NZ

## High Priority (This Week)

- [x] Stabilise E2E tests for role selection buttons on home page
- [x] Stabilise language switcher E2E tests (visibility + active state)
- [x] Add `data-testid` attributes to:
 - Parent / Practitioner role buttons
 - Language switcher component
- [x] Update E2E selectors to be more resilient
- [x] Rename `middleware.ts` to `proxy.ts` for Next.js 16 convention compliance

## Medium Priority

- [x] Create `.github/workflows/ci.yml` with full Playwright support
- [x] Write `docs/testing.md` contributor guide for E2E tests
- [x] Improve mobile viewport E2E coverage
- [ ] Add proper loading states / hydration handling for better E2E reliability

## Documentation & Open Source Readiness

- [x] Finalise `CONTRIBUTING.md` (include cultural safety review process)
- [x] Add status badges to `README.md` (E2E suite is now green)
- [x] Create `SECURITY.md`
- [ ] Prepare initial GitHub release checklist and tagging strategy

## Completed (Do Not Re-open)

- [x] Implement `webServer` in `playwright.config.ts`
- [x] Add security headers via middleware
- [x] Create production-ready `/api/health` endpoint
- [x] All infrastructure E2E tests passing

_Last updated: 29 June 2026_
