import { NextRequest, NextResponse } from 'next/server';
import { Riroriro } from '@/ai/agents/riroriro';
import { requireAuth } from '@/lib/api-auth';
import { RateLimiter } from '@/lib/rate-limit';

const limiter = new RateLimiter(60_000, 10);
const weaver = new Riroriro();

export async function POST(request: NextRequest) {
 const auth = await requireAuth(request);
 if (auth instanceof NextResponse) return auth;

 const allowed = await limiter.check(auth.user.id);
 if (!allowed) {
 return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 }

 try {
 const { query } = await request.json();
 const result = await weaver.process(query, {});
 return NextResponse.json(result);
 } catch (error: any) {
 console.error('Test agent error:', error);
 return NextResponse.json({ error: 'Agent processing failed' }, { status: 500 });
 }
}
