# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: language-switcher.e2e.ts >> Language switcher >> EN button is marked active (aria-pressed=true) on en-NZ route
- Location: e2e\language-switcher.e2e.ts:18:7

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('#language-switcher').getByRole('button', { name: /en/i }).first()
Expected: "true"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('#language-switcher').getByRole('button', { name: /en/i }).first()

```

```yaml
- banner:
  - link "Front Line Whānau":
    - /url: /en-NZ
  - button "Open menu":
    - img
- main:
  - heading "Support for whānau of preterm twins" [level=1]
  - paragraph: Private. Culturally safe. Built for Aotearoa.
  - link "Browse Directory":
    - /url: /directory
  - link "View Resources & Guides":
    - /url: /resources
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * E2E: Language switcher
  5  |  *
  6  |  * Verifies the language switcher toggles locale in the URL and that
  7  |  * the interface reflects the new language without a full page reload crash.
  8  |  */
  9  | test.describe('Language switcher', () => {
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await page.goto('/en-NZ');
  12 |   });
  13 | 
  14 |   test('language switcher is visible on the home page', async ({ page }) => {
  15 |     await expect(page.locator('#language-switcher')).toBeVisible();
  16 |   });
  17 | 
  18 |   test('EN button is marked active (aria-pressed=true) on en-NZ route', async ({ page }) => {
  19 |     const enButton = page.locator('#language-switcher').getByRole('button', { name: /en/i }).first();
> 20 |     await expect(enButton).toHaveAttribute('aria-pressed', 'true');
     |                            ^ Error: expect(locator).toHaveAttribute(expected) failed
  21 |   });
  22 | 
  23 |   test('both locale buttons are present', async ({ page }) => {
  24 |     const switcher = page.locator('#language-switcher');
  25 |     await expect(switcher.getByRole('button', { name: /en/i })).toBeVisible();
  26 |     await expect(switcher.getByRole('button', { name: /te reo/i })).toBeVisible();
  27 |   });
  28 | 
  29 |   test('page is navigable at /mi route', async ({ page }) => {
  30 |     await page.goto('/mi');
  31 |     // Page should load without error — check a heading still renders
  32 |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  33 |   });
  34 | 
  35 |   test('mi route does not show English-only "Maori" text', async ({ page }) => {
  36 |     await page.goto('/mi');
  37 |     // Cultural safety: never render bare "Maori" without the macron
  38 |     const body = await page.locator('body').innerText();
  39 |     expect(body).not.toMatch(/\bMaori\b/);
  40 |   });
  41 | });
  42 | 
```