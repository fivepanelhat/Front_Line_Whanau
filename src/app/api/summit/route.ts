import { NextRequest, NextResponse } from 'next/server';
import { aetherSummit } from '@/ai/aether-summit';
import { RateLimiter } from '@/lib/rate-limit';
import { SummitQuerySchema } from '@/lib/validations';
import { assertSameOrigin, clientIp } from '@/lib/request-guard';
import { routeLogger } from '@/lib/logger';

const limiter = new RateLimiter(60_000, 10);
const log = routeLogger('/api/summit');

// Anonymous endpoint: the dashboard AI panel runs without login (role lives
// in localStorage only), so this follows the same public + IP-rate-limited
// pattern as /api/agents. Must stay listed in proxy PUBLIC_API_EXACT.
export async function POST(request: NextRequest) {
  const originBlock = assertSameOrigin(request);
  if (originBlock) return originBlock;

  const ip = clientIp(request);
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

    const res = await aetherSummit.process(query, scopes || [], locale);

    return NextResponse.json(res);
  } catch (error) {
    log.error({ err: error }, 'Aether Summit API Error');
    return NextResponse.json(
      { error: 'Something went wrong running Aether Summit' },
      { status: 500 }
    );
  }
}
