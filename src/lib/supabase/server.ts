import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/env';

/**
 * Server-side Supabase client (anon key, respects RLS).
 * Use in Server Components, Server Actions, and Route Handlers
 * where the request acts on behalf of the authenticated user.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component - safe to ignore.
          // Middleware handles session refresh.
        }
      },
    },
  });
}

/**
 * Server-side Supabase admin client (service role key - bypasses RLS).
 * ONLY use in trusted server-side contexts (e.g. admin jobs, webhook handlers).
 * NEVER expose to the client or use in user-facing Server Components.
 */
export async function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Admin client is unavailable.');
  }

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component - safe to ignore.
        }
      },
    },
  });
}
