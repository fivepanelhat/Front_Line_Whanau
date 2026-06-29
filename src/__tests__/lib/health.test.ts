import { describe, it, expect, vi, afterEach } from 'vitest';

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
  const originalPackageVersion = process.env.npm_package_version;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalPackageVersion === undefined) {
      delete process.env.npm_package_version;
    } else {
      process.env.npm_package_version = originalPackageVersion;
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

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

  it('returns version and environment from process.env when present', async () => {
    process.env.npm_package_version = '1.2.3';
    process.env.NODE_ENV = 'production';

    const { GET } = await import('../../app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(body.version).toBe('1.2.3');
    expect(body.environment).toBe('production');
  });

  it('falls back when version or environment are missing', async () => {
    delete process.env.npm_package_version;
    delete process.env.NODE_ENV;

    const { GET } = await import('../../app/api/health/route');
    const response = await GET();
    const body = await response.json();

    expect(body.version).toBe('0.0.0');
    expect(body.environment).toBe('development');
  });

  it('supports HEAD requests for lightweight health checks', async () => {
    const { HEAD } = await import('../../app/api/health/route');
    const response = await HEAD();

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
