import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers before importing env (env.ts calls parse at module load time)
vi.mock('next/headers', () => ({ cookies: vi.fn() }));

describe('env validation', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('exports env object when required vars are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-value';

    const { env } = await import('../../lib/env');

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('anon-key-value');
  });

  it('defaults NODE_ENV to development when unset', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-value';
    delete process.env.NODE_ENV;

    const { env } = await import('../../lib/env');
    expect(env.NODE_ENV).toBe('development');
  });

  it('throws a descriptive error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-value';

    await expect(import('../../lib/env')).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/
    );
  });

  it('throws a descriptive error when NEXT_PUBLIC_SUPABASE_URL is not a URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-value';

    await expect(import('../../lib/env')).rejects.toThrow();
  });

  it('throws a descriptive error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await expect(import('../../lib/env')).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY/
    );
  });

  it('accepts optional vars when present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-value';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.GOOGLE_API_KEY = 'google-key';

    const { env } = await import('../../lib/env');

    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe('service-role-key');
    expect(env.GOOGLE_API_KEY).toBe('google-key');
  });
});
