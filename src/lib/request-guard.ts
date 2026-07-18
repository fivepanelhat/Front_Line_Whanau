import { NextRequest, NextResponse } from 'next/server';

/**
 * Blocks cross-site browser POSTs against public (unauthenticated) API routes.
 *
 * - Browser same-origin fetch always sends matching Origin (or Sec-Fetch-Site: same-origin).
 * - Cross-site CSRF-style requests from other origins are rejected with 403.
 * - Non-browser clients without Origin still pass (rate limits remain the control).
 */
export function assertSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (host && !hostsMatch(originHost, host)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null;
  }

  const site = request.headers.get('sec-fetch-site');
  if (site === 'cross-site') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

function hostsMatch(originHost: string, requestHost: string): boolean {
  // Host may include port (localhost:3000); Origin host does too when non-default.
  return originHost.toLowerCase() === requestHost.toLowerCase();
}

/** Client IP for rate limiting (first X-Forwarded-For hop, else unknown). */
export function clientIp(request: NextRequest | Request): string {
  const forwarded =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  const first = forwarded.split(',')[0]?.trim();
  return first || 'unknown_ip';
}
