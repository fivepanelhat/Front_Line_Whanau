import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { connection } from 'next/server';

export async function GET() {
  await connection();
  try {
    const authClient = await createClient();
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'practitioner' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // We use the admin client because we want to fetch all global feedback for the beta dashboard
    const supabase = await createAdminClient();

    const { data: feedback, error } = await supabase
      .from('ai_feedback')
      .select('id, thread_id, message_content, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

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
