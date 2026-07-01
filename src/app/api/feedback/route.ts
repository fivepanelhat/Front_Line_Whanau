import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { FeedbackSchema } from '@/lib/validations';
import { RateLimiter } from '@/lib/rate-limit';

const rateLimiter = new RateLimiter(60000, 10); // 10 feedback posts per minute

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const isAllowed = await rateLimiter.check(`feedback_${ip}`);
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many feedback requests. Please try again later.' }, { status: 429 });
    }

    const parsed = FeedbackSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
    }
    const { threadId, messageContent, rating, comment, agent } = parsed.data;

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
          comment,
          agent
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
