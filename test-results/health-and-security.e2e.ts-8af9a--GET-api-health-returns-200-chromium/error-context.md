# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: health-and-security.e2e.ts >> Health check endpoint >> GET /api/health returns 200
- Location: e2e\health-and-security.e2e.ts:10:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * E2E: API health check + security headers
  5  |  *
  6  |  * Verifies the /api/health endpoint responds correctly and that
  7  |  * all required security headers are present on HTML responses.
  8  |  */
  9  | test.describe('Health check endpoint', () => {
  10 |   test('GET /api/health returns 200', async ({ request }) => {
  11 |     const response = await request.get('/api/health');
> 12 |     expect(response.status()).toBe(200);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  13 |   });
  14 | 
  15 |   test('health response body contains status: ok', async ({ request }) => {
  16 |     const response = await request.get('/api/health');
  17 |     const body = await response.json();
  18 |     expect(body.status).toBe('ok');
  19 |     expect(body.timestamp).toBeDefined();
  20 |   });
  21 | 
  22 |   test('health response has Cache-Control: no-store', async ({ request }) => {
  23 |     const response = await request.get('/api/health');
  24 |     expect(response.headers()['cache-control']).toBe('no-store');
  25 |   });
  26 | });
  27 | 
  28 | test.describe('Security headers', () => {
  29 |   test('X-Frame-Options is DENY', async ({ request }) => {
  30 |     const response = await request.get('/en-NZ');
  31 |     expect(response.headers()['x-frame-options']).toBe('DENY');
  32 |   });
  33 | 
  34 |   test('X-Content-Type-Options is nosniff', async ({ request }) => {
  35 |     const response = await request.get('/en-NZ');
  36 |     expect(response.headers()['x-content-type-options']).toBe('nosniff');
  37 |   });
  38 | 
  39 |   test('Referrer-Policy is set', async ({ request }) => {
  40 |     const response = await request.get('/en-NZ');
  41 |     expect(response.headers()['referrer-policy']).toBeDefined();
  42 |   });
  43 | 
  44 |   test('Content-Security-Policy header is present', async ({ request }) => {
  45 |     const response = await request.get('/en-NZ');
  46 |     expect(response.headers()['content-security-policy']).toBeDefined();
  47 |   });
  48 | });
  49 | 
```