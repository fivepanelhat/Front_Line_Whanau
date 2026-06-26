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
