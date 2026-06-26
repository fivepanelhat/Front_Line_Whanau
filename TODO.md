# TODO & Open Tasks

## High Priority (This Week)

- [ ] Fix E2E failures for role selection buttons on home page (`e2e/home.e2e.ts`)
- [ ] Fix language switcher visibility and active state tests
- [ ] Add `data-testid` attributes to:
  - Role selection buttons (Parent / Practitioner)
  - Language switcher component
- [ ] Update E2E tests to use more resilient selectors where needed

## Medium Priority

- [ ] Create `.github/workflows/ci.yml` with proper Playwright setup
- [ ] Add E2E test documentation in `docs/testing.md`
- [ ] Review and improve mobile E2E test coverage
- [ ] Ensure all pages have proper loading states for E2E reliability

## Documentation & Open Source Readiness

- [ ] Finalise `CONTRIBUTING.md` (include cultural review process)
- [ ] Update `README.md` badges once full E2E suite is green
- [ ] Create `SECURITY.md` and `CODE_OF_CONDUCT.md`
- [ ] Prepare initial GitHub release checklist

## Notes

- Security headers and health endpoint infrastructure is complete and stable.
- All infrastructure-related E2E tests are now passing.
- Focus is currently on making the UI components testable and the E2E suite reliable.
