import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/env';

/**
 * Browser (client-side) Supabase client.
 * Uses the public anon key — always subject to RLS policies.
 * Safe to call in Client Components and browser hooks.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
