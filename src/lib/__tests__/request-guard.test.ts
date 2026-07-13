import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { assertSameOrigin, clientIp } from '../request-guard';

function req(headers: Record<string, string>) {
  return new NextRequest('http://localhost:3000/api/summit', {
    method: 'POST',
    headers,
  });
}

describe('assertSameOrigin', () => {
  it('allows matching Origin + Host', () => {
    expect(
      assertSameOrigin(
        req({ origin: 'http://localhost:3000', host: 'localhost:3000' }),
      ),
    ).toBeNull();
  });

  it('rejects cross-origin browser requests', () => {
    const res = assertSameOrigin(
      req({ origin: 'https://evil.example', host: 'localhost:3000' }),
    );
    expect(res?.status).toBe(403);
  });

  it('rejects Sec-Fetch-Site: cross-site without Origin', () => {
    const res = assertSameOrigin(
      req({ 'sec-fetch-site': 'cross-site', host: 'localhost:3000' }),
    );
    expect(res?.status).toBe(403);
  });

  it('allows same-origin Sec-Fetch-Site without Origin', () => {
    expect(
      assertSameOrigin(
        req({ 'sec-fetch-site': 'same-origin', host: 'localhost:3000' }),
      ),
    ).toBeNull();
  });

  it('allows non-browser clients (no Origin, no Sec-Fetch-Site)', () => {
    expect(assertSameOrigin(req({ host: 'localhost:3000' }))).toBeNull();
  });
});

describe('clientIp', () => {
  it('uses first X-Forwarded-For hop', () => {
    expect(
      clientIp(req({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8', host: 'localhost' })),
    ).toBe('1.2.3.4');
  });

  it('falls back to unknown_ip', () => {
    expect(clientIp(req({ host: 'localhost' }))).toBe('unknown_ip');
  });
});
