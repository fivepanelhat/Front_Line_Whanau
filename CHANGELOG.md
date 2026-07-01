# Changelog

All notable changes to this project are documented in this file.

## [0.4.0] - 2026-07-01

### Added
- **Phase 3 (Beta Readiness)**: Added React ErrorBoundary wrapper, WelcomeModal beta consent dialog, PolicyAdvocateCompanion agent, and robust client/server caching layer.
- **Phase 4 (Beta Operations)**: Added Medical Jargon Translator agent, resilient health check API (`/api/health`), and custom Playwright E2E test coverage.
- **Phase 5 (Production Readiness)**: Added OnboardingWizard, Supabase rate limit migration, load testing scripts, and pino/logger webhook alerting.
- **API Security Hardening**: Secured Next.js routes using JWT token validation, CORS, and origin verification checks in `middleware.ts`.
- **E2E Resiliency**: Added `data-testid` properties to role selection and language switcher controls, refactoring tests to use them.

### Changed
- Re-implemented the `/api/health` check to verify database connectivity, bypassing check during tests via the `PORTAL_E2E` flag.

### Fixed
- Fixed Vitest mock paths for Next.js cookies context and `@supabase/ssr` client validation under unit test environments.

## [0.3.0] - 2026-06-29

### Added
- Cross-platform analyze script support via `cross-env`.
- Extra unit coverage for locale cookie behavior and health endpoint fallback branches.

### Changed
- Strengthened i18n request config locale validation and default fallback behavior in `src/i18n.ts`.
- Updated Next.js config for dev/test stability with `allowedDevOrigins` and retained performance-oriented settings.
- Updated analyze workflow to run with `next build --webpack` so bundle analyzer reports are generated.
- Improved role-selection E2E assertion reliability for current portal/home rendering behavior.

### Fixed
- Removed route segment config incompatibility in health route under `cacheComponents`.
- Resolved Windows analyze command failure (`ANALYZE=true` syntax) by using cross-platform env tooling.
- Restored and validated green E2E execution after role-selection and web server startup issues.

### Validation
- `npm run validate` passes.
- `npm run e2e -- --reporter=line` passes (40/40).
- `npm run analyze` passes and emits reports to `.next/analyze/`.
