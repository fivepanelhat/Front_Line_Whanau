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
  });

  test('clicking Parent navigates to /parent portal', async ({ page }) => {
    await page.getByRole('button', { name: /parent/i }).click();
    await page.waitForURL(/\/parent/);
    expect(page.url()).toContain('/parent');
  });

  test('parent portal page renders a heading', async ({ page }) => {
    await page.getByRole('button', { name: /parent/i }).click();
    await page.waitForURL(/\/parent/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('clicking Practitioner navigates to /practitioner portal', async ({ page }) => {
    await page.getByRole('button', { name: /practitioner/i }).click();
    await page.waitForURL(/\/practitioner/);
    expect(page.url()).toContain('/practitioner');
  });

  test('navigating back from portal returns to home', async ({ page }) => {
    await page.getByRole('button', { name: /parent/i }).click();
    await page.waitForURL(/\/parent/);
    await page.goBack();
    // Should return to role selector
    await expect(
      page.getByRole('button', { name: /parent/i })
    ).toBeVisible();
  });
});
