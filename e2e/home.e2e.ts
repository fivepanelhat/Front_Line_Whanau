import { test, expect } from '@playwright/test';

/**
 * E2E: Home page
 *
 * Verifies the role selector renders correctly and that navigating
 * to the app root (or /en-NZ) shows the entry point UI.
 */
test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en-NZ');
  });

  test('renders the role selector heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('renders Parent / Whānau link', async ({ page }) => {
    await expect(
      page.getByTestId('parent-role-btn')
    ).toBeVisible();
  });

  test('renders Practitioner / Organisation link', async ({ page }) => {
    await expect(
      page.getByTestId('practitioner-role-btn')
    ).toBeVisible();
  });

  test('page title contains Whānau Preterm Support Hub', async ({ page }) => {
    await expect(page).toHaveTitle(/Whānau Preterm Support Hub/i);
  });
});
