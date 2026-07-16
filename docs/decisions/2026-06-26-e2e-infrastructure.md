# ADR 001: E2E Testing Infrastructure

* **Status:** Approved
* **Date:** 2026-06-26
* **Decider(s):** Development Team

---

## Context & Problem Statement

The platform is designed to support families during highly critical periods, necessitating high software reliability and robust regression prevention. We needed an End-to-End (E2E) testing framework to validate full user journeys, role-based entry gates (Parent/Practitioner portals), internationalisation switching (Te Reo Maori/English), and critical API/security infrastructure (headers and health endpoints).

## Decision Drivers

* **Next.js App Router Support**: Needs to handle dynamic layouts, locale-based routing (`/[locale]`), and client-side hydration without complexity.
* **Security Verification**: Needs to support checking HTTP response headers (such as CSP, X-Frame-Options) as part of the test suite.
* **Ease of CI Setup**: The framework must support headless runs, automatic server startup/cleanup, and detailed report generation for CI/CD runs.
* **Cross-viewport Validation**: Needs to easily simulate mobile viewports (e.g., Mobile Chrome) to ensure accessibility for mobile whanau users.

## Considered Options

1. **Cypress**: Popular E2E tool, but runs inside the browser context, making header testing and raw network intercepts more complex.
2. **Playwright**: Highly resilient, excellent multi-browser support, native mobile emulation, powerful codegen/UI mode, and trivial response-header assertions.
3. **Puppeteer**: Low-level browser automation, but lacks built-in test runners and assertions, requiring heavy boilerplate.

## Decision Outcome

We selected **Playwright** as the primary E2E testing framework.

### Implementation Details:
* **Configuration (`playwright.config.ts`)**: Configured to run tests in parallel, target `chromium` and `Mobile Chrome` viewports, and automatically launch `npm run dev` as the webServer on port `3000`.
* **Basic Checks Coverage**: E2E checks enforce security response headers on all main routes and ensure the lightweight `/api/health` endpoint responds with standard success codes.
* **Reports**: Playwright generates full HTML reports and video/screenshot recordings on failure, allowing detailed debugging of frontend components.

## Consequences

* **Good**: Automated E2E verification is lightweight, running locally without manual server starts.
* **Good**: Direct verification of middleware logic (e.g., checking for `X-Frame-Options: DENY`).
* **Bad/Neutral**: Requires a one-time playwright browser binary installation step (`npm run e2e:install`) on developer machines and runners.
* **Mitigations**: Interactive UI elements are being progressively outfitted with `data-testid` tags to prevent selector fragility.
