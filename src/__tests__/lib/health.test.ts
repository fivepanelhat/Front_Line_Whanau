import { describe, it, expect, vi } from 'vitest';

// Mock env so the health route doesn't need real Supabase keys
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    NODE_ENV: 'test',
  },
}));

// Mock @supabase/supabase-js so database connection returns success
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }),
}));

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const { GET } = await import('../../app/api/health/route');
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it('returns JSON body with required fields', async () => {
    const { GET } = await import('../../app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('sets Cache-Control: no-store header', async () => {
    const { GET } = await import('../../app/api/health/route');
    const response = await GET();

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('uses fallback version/environment when env vars are missing', async () => {
    const { GET } = await import('../../app/api/health/route');
    const env = process.env as Record<string, string | undefined>;
    const previousVersion = process.env.npm_package_version;
    const previousNodeEnv = process.env.NODE_ENV;

    delete env.npm_package_version;
    delete env.NODE_ENV;

    const response = await GET();
    const body = await response.json();

    expect(body.version).toBe('0.0.0');
    expect(body.environment).toBe('development');

    if (previousVersion === undefined) {
      delete env.npm_package_version;
    } else {
      env.npm_package_version = previousVersion;
    }

    if (previousNodeEnv === undefined) {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = previousNodeEnv;
    }
  });

  it('HEAD returns 200 with no-store cache header', async () => {
    const { HEAD } = await import('../../app/api/health/route');
    const response = await HEAD();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
