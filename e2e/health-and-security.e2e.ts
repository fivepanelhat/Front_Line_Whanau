import { test, expect } from '@playwright/test';

/**
 * E2E: API health check + security headers
 *
 * Verifies the /api/health endpoint responds correctly and that
 * all required security headers are present on HTML responses.
 */
test.describe('Health check endpoint', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
  });

  test('health response body contains status: ok', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  test('health response has Cache-Control: no-store', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.headers()['cache-control']).toBe('no-store');
  });
});

test.describe('Security headers', () => {
  test('X-Frame-Options is DENY', async ({ request }) => {
    const response = await request.get('/en-NZ');
    expect(response.headers()['x-frame-options']).toBe('DENY');
  });

  test('X-Content-Type-Options is nosniff', async ({ request }) => {
    const response = await request.get('/en-NZ');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('Referrer-Policy is set', async ({ request }) => {
    const response = await request.get('/en-NZ');
    expect(response.headers()['referrer-policy']).toBeDefined();
  });

  test('Content-Security-Policy header is present', async ({ request }) => {
    const response = await request.get('/en-NZ');
    expect(response.headers()['content-security-policy']).toBeDefined();
  });
});
