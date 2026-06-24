import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock env so the health route doesn't need real Supabase keys
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    NODE_ENV: 'test',
  },
}));

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const { GET } = await import('../../app/api/health/route');
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it('returns JSON body with required fields', async () => {
    const { GET } = await import('../../app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.environment).toBeDefined();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('sets Cache-Control: no-store header', async () => {
    const { GET } = await import('../../app/api/health/route');
    const response = await GET();

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
