import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { RateLimiter } from '@/lib/rate-limit';

// 10 requests per minute - agent calls are expensive
const limiter = new RateLimiter(60_000, 10);

const AETHER_BASE_URL =
 process.env.AETHER_SUMMIT_URL ?? 'http://localhost:8000';

type Mode = 'review' | 'run';

const ALLOWED_MODES = new Set<Mode>(['review', 'run']);

export async function POST(request: NextRequest) {
 // -- Auth ------------------------------------------------------------------
 const auth = await requireAuth(request);
 if (auth instanceof NextResponse) return auth;

 // -- Rate limit ------------------------------------------------------------
 const allowed = await limiter.check(auth.user.id);
 if (!allowed) {
 return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 }

 // -- Parse & validate body -------------------------------------------------
 let body: Record<string, unknown>;
 try {
 body = await request.json();
 } catch {
 return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
 }

 const mode = (body.mode as Mode) ?? 'run';
 if (!ALLOWED_MODES.has(mode)) {
 return NextResponse.json(
 { error: `Invalid mode. Expected one of: ${[...ALLOWED_MODES].join(', ')}` },
 { status: 400 }
 );
 }

 const endpoint = mode === 'review' ? '/review' : '/run';

 // -- Proxy to Python FastAPI backend ---------------------------------------
 try {
 const upstream = await fetch(`${AETHER_BASE_URL}${endpoint}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body),
 });

 if (!upstream.ok) {
 const detail = await upstream.text();
 console.error(`[aether proxy] upstream ${upstream.status}:`, detail);
 return NextResponse.json(
 { error: 'Agent service error' },
 { status: upstream.status >= 500 ? 502 : upstream.status }
 );
 }

 const data = await upstream.json();
 return NextResponse.json(data);
 } catch (err) {
 console.error('[aether proxy] fetch failed:', err);
 return NextResponse.json(
 { error: 'Could not reach agent service. Is it running?' },
 { status: 502 }
 );
 }
}
