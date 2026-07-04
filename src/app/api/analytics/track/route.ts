import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { RateLimiter } from '@/lib/rate-limit';
import { AnalyticsEventSchema } from '@/lib/validations';

const rateLimiter = new RateLimiter(60000, 20); // 20 events per minute

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const isAllowed = await rateLimiter.check(`analytics_${ip}`);

    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many analytics requests' }, { status: 429 });
    }

    const parsed = AnalyticsEventSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { event_type, path, metadata } = parsed.data;

    // Generate a daily anonymised session hash based on IP
    // This allows us to track unique sessions per day without storing PII
    const dateSalt = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sessionHash = crypto.createHash('sha256').update(`${ip}-${dateSalt}`).digest('hex');

    const supabase = await createClient();

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        path,
        session_hash: sessionHash,
        metadata: metadata || {}
      });

    if (error) {
      console.error('Error tracking event:', error);
      // We don't want to break the app if analytics fails
      return NextResponse.json({ success: false }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics Route Error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
