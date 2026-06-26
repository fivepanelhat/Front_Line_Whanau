# Testing Guide — Whānau Preterm Support Hub NZ

## Philosophy

We write tests to build trust. Families using this platform deserve reliable, secure, and accessible software.

## Test Pyramid

- **Unit Tests** — Jest + React Testing Library (fast feedback)
- **E2E Tests** — Playwright (critical user journeys)
- **Manual + Accessibility** — Screen readers, keyboard navigation, cultural review

## Running Tests

```bash
npm run test:coverage
npm run e2e
npm run e2e:ui          # Visual debugger (recommended for debugging)
```

## E2E Testing Guidelines

- Use `getByRole` and `getByTestId` as primary selectors
- Add `data-testid` to all interactive components
- Tests must work with both English and Te Reo Māori routes where applicable
- Always use `await page.waitForLoadState('networkidle')` or explicit waits when needed
- Never rely on fixed timeouts — use Playwright’s auto-waiting

## Adding New E2E Tests

- Create file in `e2e/` folder (e.g. `parent-portal.e2e.ts`)
- Follow existing patterns in `health-and-security.e2e.ts`
- Run with `npm run e2e:ui` during development
- Ensure tests pass in both desktop and mobile projects
