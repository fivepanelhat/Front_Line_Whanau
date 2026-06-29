# Changelog

All notable changes to this project are documented in this file.

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
