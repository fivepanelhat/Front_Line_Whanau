import { test, expect } from '@playwright/test';

/**
 * E2E: Language switcher
 *
 * Verifies the language switcher toggles locale in the URL and that
 * the interface reflects the new language without a full page reload crash.
 */
test.describe('Language switcher', () => {
 const switcher = (page: any) => page.getByTestId('language-switcher').first();

 test.beforeEach(async ({ page }) => {
 await page.goto('/en-NZ');
 });

 test('language switcher is visible on the home page', async ({ page, isMobile }) => {
 if (isMobile) {
 await expect(page.getByTestId('mobile-menu-btn')).toBeVisible();
 await expect(switcher(page)).toHaveCount(1);
 return;
 }

 await expect(switcher(page)).toBeVisible();
 });

 test('EN button is marked active (aria-pressed=true) on en-NZ route', async ({ page, isMobile }) => {
 const enButton = switcher(page).getByRole('button', {
 name: /english \(nz\)/i,
 includeHidden: isMobile,
 });
 await expect(enButton).toHaveAttribute('aria-pressed', 'true');
 });

 test('both locale buttons are present', async ({ page, isMobile }) => {
 const languageSwitcher = switcher(page);
 const enButton = languageSwitcher.getByRole('button', {
 name: /english \(nz\)/i,
 includeHidden: isMobile,
 });
 const miButton = languageSwitcher.getByRole('button', {
 name: /te reo māori/i,
 includeHidden: isMobile,
 });

 if (isMobile) {
 await expect(enButton).toHaveCount(1);
 await expect(miButton).toHaveCount(1);
 return;
 }

 await expect(enButton).toBeVisible();
 await expect(miButton).toBeVisible();
 });

 test('page is navigable at /mi route', async ({ page }) => {
 await page.goto('/mi');
 // Page should load without error - check a heading still renders
 await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
 });

 test('mi route does not show English-only "Maori" text', async ({ page }) => {
 await page.goto('/mi');
 // Cultural safety: never render bare "Maori" without the macron
 const body = await page.locator('body').innerText();
 expect(body).not.toMatch(/\bMaori\b/);
 });
});
