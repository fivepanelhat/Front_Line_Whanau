# Testing & Quality Assurance

This document details the testing architecture, strategies, and commands for the **Whānau Preterm Support Hub NZ** platform.

---

## 🧪 Testing Strategy

We maintain high standards for reliability because this platform supports whānau during critical and vulnerable times. Our testing strategy consists of two main pillars:

1. **Unit & Integration Testing (Vitest)**: Focuses on core utility functions, client-side encryption layers, consent state hooks, and isolated React component behaviors.
2. **End-to-End Testing (Playwright)**: Focuses on user journey flows, portal navigation, internationalisation (Te Reo Māori / English switchers), security headers enforcement, and health endpoints.

---

## 🛠️ Test Stack & Infrastructure

- **Unit Testing**: [Vitest](https://vitest.dev/) + React Testing Library + jsdom
- **End-to-End Testing**: [Playwright](https://playwright.dev/)
- **Code Coverage**: `@vitest/coverage-v8`

---

## 🏃 Running Tests

### Unit Tests (Vitest)

Unit tests are located in `src/__tests__/` and target modular logic, encryption, and custom hooks.

```bash
# Run unit tests once
npm run test

# Run unit tests in watch mode (best for development)
npm run test:watch

# Run unit tests and generate a coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

E2E tests are located in the `e2e/` folder. Playwright is configured to automatically launch the Next.js dev server on port `3000` before running the suite.

```bash
# Run all E2E tests headlessly
npm run e2e

# Run E2E tests with the Playwright UI / Visual Debugger
npm run e2e:ui

# View the last E2E test run report
npm run e2e:report
```

---

## 📐 Writing Reliable Tests

To keep E2E tests robust and avoid brittle selectors (which can fail due to layout or text changes), we enforce the following practices:

### 1. Use `data-testid` Attributes

Always target interactive components using `data-testid` instead of raw CSS classes or position-based selectors.

**Example Component:**
```tsx
<button
  data-testid="role-parent-button"
  className="px-4 py-2 bg-teal-600 text-white rounded"
>
  Parent Portal
</button>
```

**Example Playwright Locator:**
```typescript
await page.getByTestId('role-parent-button').click();
```

### 2. Mocking Sensitive APIs

For unit tests involving cryptography (`crypto.subtle`) or window-level storage, use the setups provided in `vitest.setup.ts`. Avoid storing real private keys or unencrypted PHI in test fixtures.

### 3. Handle Prerendering & Hydration

Ensure components that read from `localStorage` or execute client-side-only encryption do not cause hydration mismatches or crash during static rendering. Tests should verify fallback states.
