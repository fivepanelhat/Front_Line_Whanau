import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { connection } from 'next/server';

export async function GET() {
  try {
    await connection();

    // We use the admin client because we want to fetch all global feedback for the beta dashboard
    const supabase = await createAdminClient();

    const { data: feedback, error } = await supabase
      .from('ai_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ error }, 'Failed to fetch AI feedback');
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return NextResponse.json({ feedback });
  } catch (err: any) {
    logger.error({ err }, 'Error in feedback GET route');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
