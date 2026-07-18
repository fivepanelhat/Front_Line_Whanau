import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for Front Line Whanau.
 *
 * Runs against a local dev server on port 3000.
 * Critical flows tested:
 * - Home page renders correctly
 * - Role selection navigates to correct portal
 * - Language switcher persists locale
 * - Health check endpoint responds
 * - Security headers are present
 */
// Overridable so E2E can run when something else occupies 3000
const PORT = process.env.E2E_PORT || '3000';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',

  // Run tests in parallel in CI, sequentially locally for dev speed
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],

  use: {
    // Base URL - tests use relative paths like '/en-NZ'
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to expand browser matrix:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // === KEY FIX: Automatically start Next.js dev server ===
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      PORTAL_E2E: 'true',
    },
  },
});
