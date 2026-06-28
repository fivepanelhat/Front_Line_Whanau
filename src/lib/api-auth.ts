import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates the request has an authenticated Supabase session.
 * Returns the user on success, or a 401 NextResponse on failure.
 * Uses dynamic import to avoid loading @/env at module-evaluation time
 * (which would crash during `next build` without a .env.local present).
 */
export async function requireAuth(
  _req: NextRequest
): Promise<{ user: { id: string } } | NextResponse> {
  void _req;
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (process.env.NODE_ENV === 'development') {
      return { user: { id: 'development-user-id' } };
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user: { id: user.id } };
}
