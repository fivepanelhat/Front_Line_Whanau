# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: role-selection.e2e.ts >> Role selection >> clicking Practitioner navigates to /practitioner portal
- Location: e2e\role-selection.e2e.ts:26:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /practitioner/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Front Line Whānau" [ref=e4] [cursor=pointer]:
        - /url: /en-NZ
      - button "Open menu" [ref=e5] [cursor=pointer]:
        - img [ref=e6]
  - main [ref=e8]:
    - heading "Support for whānau of preterm twins" [level=1] [ref=e9]
    - paragraph [ref=e10]: Private. Culturally safe. Built for Aotearoa.
    - generic [ref=e11]:
      - link "Browse Directory" [ref=e12] [cursor=pointer]:
        - /url: /directory
      - link "View Resources & Guides" [ref=e13] [cursor=pointer]:
        - /url: /resources
  - button "Open Next.js Dev Tools" [ref=e19] [cursor=pointer]:
    - img [ref=e20]
  - alert [ref=e23]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * E2E: Role selection flow
  5  |  *
  6  |  * Verifies that clicking a role card navigates the user to the
  7  |  * correct portal URL and renders the portal content.
  8  |  */
  9  | test.describe('Role selection', () => {
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await page.goto('/en-NZ');
  12 |   });
  13 | 
  14 |   test('clicking Parent navigates to /parent portal', async ({ page }) => {
  15 |     await page.getByRole('button', { name: /parent/i }).click();
  16 |     await page.waitForURL(/\/parent/);
  17 |     expect(page.url()).toContain('/parent');
  18 |   });
  19 | 
  20 |   test('parent portal page renders a heading', async ({ page }) => {
  21 |     await page.getByRole('button', { name: /parent/i }).click();
  22 |     await page.waitForURL(/\/parent/);
  23 |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  24 |   });
  25 | 
  26 |   test('clicking Practitioner navigates to /practitioner portal', async ({ page }) => {
> 27 |     await page.getByRole('button', { name: /practitioner/i }).click();
     |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  28 |     await page.waitForURL(/\/practitioner/);
  29 |     expect(page.url()).toContain('/practitioner');
  30 |   });
  31 | 
  32 |   test('navigating back from portal returns to home', async ({ page }) => {
  33 |     await page.getByRole('button', { name: /parent/i }).click();
  34 |     await page.waitForURL(/\/parent/);
  35 |     await page.goBack();
  36 |     // Should return to role selector
  37 |     await expect(
  38 |       page.getByRole('button', { name: /parent/i })
  39 |     ).toBeVisible();
  40 |   });
  41 | });
  42 | 
```