import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { FeedbackSchema } from '@/lib/validations';
import { RateLimiter } from '@/lib/rate-limit';
import { assertSameOrigin, clientIp } from '@/lib/request-guard';

const rateLimiter = new RateLimiter(60000, 10); // 10 feedback posts per minute

export async function POST(req: NextRequest) {
 try {
 const originBlock = assertSameOrigin(req);
 if (originBlock) return originBlock;

 const ip = clientIp(req);
 const isAllowed = await rateLimiter.check(`feedback_${ip}`);

 if (!isAllowed) {
 return NextResponse.json({ error: 'Too many feedback requests. Please try again later.' }, { status: 429 });
 }

 const parsed = FeedbackSchema.safeParse(await req.json());
 if (!parsed.success) {
 return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
 }
 const { threadId, messageContent, rating, comment, agent } = parsed.data;

 const supabase = await createAdminClient();

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
