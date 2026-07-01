import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockDatabaseError: any = null;
let mockDatabaseData: any = [{ id: 1 }];
let mockCreateClientError = false;

// Mock env so the health route doesn't need real Supabase keys
vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    NODE_ENV: 'test',
  },
}));

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    NODE_ENV: 'test',
  },
}));

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({
    getAll: () => [],
    set: () => {},
  }),
}));

// Mock @supabase/ssr so database connection returns success/error dynamically
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => {
    if (mockCreateClientError) {
      throw new Error('Supabase client creation failed');
    }
    return {
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: mockDatabaseData, error: mockDatabaseError }),
        }),
      }),
    };
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    mockDatabaseError = null;
    mockDatabaseData = [{ id: 1 }];
    mockCreateClientError = false;
  });

  it('returns 200 with status ok and database connected', async () => {
    const { GET } = await import('../../app/api/health/route');
    const response = await GET(new Request('http://localhost'));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
    expect(body.timestamp).toBeDefined();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns 503 when database returns an error', async () => {
    mockDatabaseError = { message: 'Database connection failed' };
    const { GET } = await import('../../app/api/health/route');
    const response = await GET(new Request('http://localhost'));

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('unhealthy');
    expect(body.reason).toBe('database_error');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns 500 when client creation throws an exception', async () => {
    mockCreateClientError = true;
    const { GET } = await import('../../app/api/health/route');
    const response = await GET(new Request('http://localhost'));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.status).toBe('unhealthy');
    expect(body.reason).toBe('internal_error');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('HEAD returns 200 status and no-store when healthy', async () => {
    const { HEAD } = await import('../../app/api/health/route');
    const response = await HEAD(new Request('http://localhost'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
