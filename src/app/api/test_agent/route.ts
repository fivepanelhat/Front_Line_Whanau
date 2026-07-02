import { NextRequest, NextResponse } from 'next/server';
import { Riroriro } from '@/ai/agents/riroriro';
import { requireAuth } from '@/lib/api-auth';
import { RateLimiter } from '@/lib/rate-limit';

const limiter = new RateLimiter(60_000, 10);

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const allowed = await limiter.check(auth.user.id);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { query } = await request.json();
    const weaver = new Riroriro();
    const result = await weaver.process(query, {});
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
