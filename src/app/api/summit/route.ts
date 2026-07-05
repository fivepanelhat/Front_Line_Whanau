import { NextRequest, NextResponse } from 'next/server';
import { AetherSummit } from '@/ai/aether-summit';
import { RateLimiter } from '@/lib/rate-limit';
import { SummitQuerySchema } from '@/lib/validations';

const limiter = new RateLimiter(60_000, 10);

// Anonymous endpoint: the dashboard AI panel runs without login (role lives
// in localStorage only), so this follows the same public + IP-rate-limited
// pattern as /api/agents. Must stay listed in middleware publicPaths.
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown_ip';
  const allowed = await limiter.check(ip);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const parsed = SummitQuerySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid Input' },
        { status: 400 }
      );
    }

    const { query, scopes, locale } = parsed.data;

    const summitInstance = new AetherSummit();
    const res = await summitInstance.process(query, scopes || [], locale);

    return NextResponse.json(res);
  } catch (error) {
    console.error('Aether Summit API Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong running Aether Summit' },
      { status: 500 }
    );
  }
}
