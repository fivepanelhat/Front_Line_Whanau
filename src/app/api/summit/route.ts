import { NextRequest, NextResponse } from 'next/server';
import { AetherSummit } from '@/ai/aether-summit';
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
    const body = await request.json();
    const { query, scopes } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query' },
        { status: 400 }
      );
    }

    const summitInstance = new AetherSummit();
    const res = await summitInstance.process(query, scopes || []);

    return NextResponse.json(res);
  } catch (error) {
    console.error('Aether Summit API Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong running Aether Summit' },
      { status: 500 }
    );
  }
}
