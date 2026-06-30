import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Simple query to verify DB connection
    const { data, error } = await supabase.from('organizations').select('id').limit(1);
    
    if (error) {
      console.error('Health check DB error:', error);
      return NextResponse.json({ status: 'unhealthy', reason: 'database_error' }, { status: 503 });
    }

    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    }, { status: 200 });

  } catch (err) {
    console.error('Health check exception:', err);
    return NextResponse.json({ status: 'unhealthy', reason: 'internal_error' }, { status: 500 });
  }
}

export const HEAD = GET;
