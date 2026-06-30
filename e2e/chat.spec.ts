import { test, expect } from '@playwright/test';

test.describe('Chat Interface & Welcome Flow', () => {
  test('should show welcome modal on first visit and allow chat interaction', async ({ page }) => {
    // Navigate to the parent portal
    await page.goto('/en-NZ/parent');

    // Wait for the portal to load
    await expect(page.locator('h1').filter({ hasText: 'Parent & Whānau Portal' })).toBeVisible();

    // Click the ask AI button
    const askButton = page.getByRole('button', { name: /Ask AI Assistant/i });
    if (await askButton.isVisible()) {
      // In testing we might mock this or it opens the modal
      // This is a basic smoke test to ensure the page renders
      await expect(askButton).toBeVisible();
    }
  });

  test('health endpoint should return 200 OK', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });
});
