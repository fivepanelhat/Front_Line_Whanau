import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const isE2E = process.env.PORTAL_E2E === 'true' || process.env.NEXT_PUBLIC_PORTAL_E2E === 'true';

  try {
    if (!isE2E) {
      const supabase = await createClient();
      // Simple query to verify DB connection
      const { error } = await supabase.from('organizations').select('id').limit(1);
      
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
