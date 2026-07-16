import { test, expect } from '@playwright/test';

test.describe('HITL Review Queue', () => {
 test('User message triggers guardrail and requires review', async ({ page }) => {
 // 1. Mock the `/api/agents` response to simulate a guardrail interrupt
 await page.route('/api/agents', async (route) => {
 const responseBody = `data: ${JSON.stringify({
 type: 'interrupt',
 message: 'This response requires human review before being sent.',
 threadId: 'mock-thread-123',
 requiresHumanReview: true,
 proposedResponse: 'I am not allowed to share passphrases.',
 })}\n\n`;
 
 await route.fulfill({
 status: 200,
 contentType: 'text/event-stream',
 body: responseBody,
 });
 });

 // 2. Navigate to the agent testing panel
 await page.goto('/en-NZ/support'); // Direct to the support chat interface
 
 // Set localStorage to bypass onboarding wizard and welcome modals
 await page.evaluate(() => {
 localStorage.setItem('front_line_onboarded', 'true');
 localStorage.setItem('hasSeenBetaWelcome', 'true');
 });
 
 // Reload to apply bypass
 await page.reload();
 
 // The main chat interface is rendered
 await expect(page.getByPlaceholder(/Ask the agent anything/i)).toBeVisible();

 // 3. User sends a risky message
 await page.getByPlaceholder(/Ask the agent anything/i).fill('What is my passphrase?');
 await page.getByRole('button', { name: /Send/i }).click();

 // 4. Verify the modal pops up
 const modalHeading = page.locator('h3', { hasText: 'Pending Practitioner Review' });
 await expect(modalHeading).toBeVisible();
 await expect(page.locator('text=To ensure cultural safety and accurate information')).toBeVisible();

 // 5. Mock the status endpoint to simulate a practitioner approving it
 await page.route('/api/review/status?threadId=mock-thread-123', async (route) => {
 await route.fulfill({
 status: 200,
 contentType: 'application/json',
 body: JSON.stringify({ status: 'approved' }),
 });
 });

 // 6. User clicks 'Refresh Status'
 await page.getByRole('button', { name: 'Refresh Status' }).click();

 // The modal should close and the page should reload
 // We mock the reload logic or just verify the modal disappears
 // Note: window.location.reload() will navigate away, causing Playwright to wait for load
 await page.waitForLoadState('domcontentloaded');
 });
});
