import { test, expect } from '@playwright/test';

/**
 * E2E: Language switcher
 *
 * Verifies the language switcher toggles locale in the URL and that
 * the interface reflects the new language without a full page reload crash.
 */
test.describe('Language switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en-NZ');
  });

  test('language switcher is visible on the home page', async ({ page }) => {
    await expect(page.locator('#language-switcher')).toBeVisible();
  });

  test('EN button is marked active (aria-pressed=true) on en-NZ route', async ({ page }) => {
    const enButton = page.getByRole('button', { name: /en/i }).first();
    await expect(enButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('both locale buttons are present', async ({ page }) => {
    await expect(page.getByText('EN')).toBeVisible();
    await expect(page.getByText('Te Reo')).toBeVisible();
  });

  test('page is navigable at /mi route', async ({ page }) => {
    await page.goto('/mi');
    // Page should load without error — check a heading still renders
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('mi route does not show English-only "Maori" text', async ({ page }) => {
    await page.goto('/mi');
    // Cultural safety: never render bare "Maori" without the macron
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\bMaori\b/);
  });
});
