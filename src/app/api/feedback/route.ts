import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { threadId, messageContent, rating, comment } = await req.json();

    if (!threadId || rating === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('ai_feedback')
      .insert([
        {
          thread_id: threadId,
          message_content: messageContent,
          rating,
          comment
        }
      ]);

    if (error) {
      logger.error({ error }, 'Failed to insert AI feedback');
      return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error({ err }, 'Error in feedback route');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
