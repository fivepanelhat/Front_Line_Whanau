import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RateLimiter } from '@/lib/rate-limit';

const rateLimiter = new RateLimiter(60000, 30); // 30 health checks per minute

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const isAllowed = await rateLimiter.check(`health_${ip}`);
  if (!isAllowed) {
    return NextResponse.json({ status: 'rate_limited' }, { status: 429 });
  }

  const isE2E = process.env.PORTAL_E2E === 'true' || process.env.NEXT_PUBLIC_PORTAL_E2E === 'true';

  try {
    if (!isE2E) {
      const supabase = await createClient();
      // Probe a table that exists in the schema (001_core_rls_policies.sql);
      // RLS returning zero rows is fine — only a connection/schema error fails.
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        console.error('Health check DB error:', error);
        return NextResponse.json(
          { status: 'unhealthy', reason: 'database_error' },
          { 
            status: 503,
            headers: {
              'Cache-Control': 'no-store',
            }
          }
        );
      }
    }

    return NextResponse.json(
      { 
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: isE2E ? 'mocked' : 'connected'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );

  } catch (err) {
    console.error('Health check exception:', err);
    return NextResponse.json(
      { status: 'unhealthy', reason: 'internal_error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );
  }
}

export const HEAD = GET;
