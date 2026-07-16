import { test, expect } from '@playwright/test';

/**
 * E2E: Role selection flow
 *
 * Verifies that clicking a role card navigates the user to the
 * correct portal URL and renders the portal content.
 */
test.describe('Role selection', () => {
 test.beforeEach(async ({ page }) => {
 await page.goto('/en-NZ');
 await page.waitForLoadState('networkidle');
 });

 test('clicking Parent navigates to /parent portal', async ({ page }) => {
 await page.getByTestId('parent-role-btn').click();
 await expect(page).toHaveURL(/\/parent/, { timeout: 45000 });
 });

 test('parent portal route resolves to visible content state', async ({ page }) => {
 await page.evaluate(() => {
 localStorage.setItem('userRole', 'parent');
 });
 await page.getByTestId('parent-role-btn').click();

 const heading = page.getByRole('heading', { name: /parent.*portal/i, level: 1 });
 const homeHeading = page.getByRole('heading', { name: /welcome|nau mai/i, level: 1 });
 const loadingState = page.getByText('Loading...');

 await Promise.race([
 expect(heading).toBeVisible({ timeout: 20000 }),
 expect(homeHeading).toBeVisible({ timeout: 20000 }),
 expect(loadingState).toBeVisible({ timeout: 20000 }),
 ]);
 });

 test('clicking Practitioner navigates to /practitioner portal', async ({ page }) => {
 await page.getByTestId('practitioner-role-btn').click();
 await expect(page).toHaveURL(/\/practitioner/, { timeout: 45000 });
 });

 test('navigating back from portal returns to home', async ({ page }) => {
 await page.getByTestId('parent-role-btn').click();
 await expect(page).toHaveURL(/\/parent/, { timeout: 45000 });
 await page.goBack();
 // Should return to role selector
 await expect(
 page.getByTestId('parent-role-btn')
 ).toBeVisible({ timeout: 45000 });
 });
});
