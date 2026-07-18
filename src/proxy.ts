import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

/**
 * Next.js 16 network-boundary proxy (formerly middleware.ts).
 * Handles locale routing, API auth gates, and nonce-based CSP.
 */

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

const isDev = process.env.NODE_ENV === 'development';

/**
 * Exact public paths only - no prefix matching.
 * Previously `/api/feedback/*` was accidentally public via startsWith.
 */
const PUBLIC_API_EXACT = new Set([
  '/api/health',
  '/api/agents',
  '/api/feedback', // POST submission only; /export and /stats require auth
  '/api/chat/summary',
  '/api/review/status',
  '/api/summit',
]);

/** SHA-256 of THEME_BOOTSTRAP_SCRIPT in app/layout.tsx */
const THEME_SCRIPT_HASH = "'sha256-8AqMNYztgE7KtoWtQQ/SWbghK4gDAXo7YFW6zvVmlPM='";

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function buildCsp(nonce: string): string {
  // Production: nonce + strict-dynamic (unsafe-inline ignored when nonce present)
  // Dev: unsafe-eval for Turbopack/HMR
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' ${THEME_SCRIPT_HASH} 'unsafe-eval' 'strict-dynamic'`
    : `script-src 'self' 'nonce-${nonce}' ${THEME_SCRIPT_HASH} 'strict-dynamic'`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function applySecurityHeaders(response: NextResponse, nonce: string, csp: string): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  return response;
}

function withNonceRequest(request: NextRequest, nonce: string, csp: string): NextRequest {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  // Next.js can extract script nonces from a request CSP header
  requestHeaders.set('Content-Security-Policy', csp);
  return new NextRequest(request, { headers: requestHeaders });
}

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_EXACT.has(pathname);
}

function hasApiAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const hasValidToken =
    !!process.env.API_SECRET_KEY && authHeader === `Bearer ${process.env.API_SECRET_KEY}`;
  const hasSession = request.cookies.getAll().some((c) => c.name.includes('-auth-token'));
  return hasValidToken || hasSession;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createNonce();
  const csp = buildCsp(nonce);
  const req = withNonceRequest(request, nonce, csp);

  if (pathname.startsWith('/api/')) {
    if (!isPublicApiPath(pathname) && !hasApiAuth(request)) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized API Access' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = NextResponse.next({
      request: { headers: req.headers },
    });
    return applySecurityHeaders(response, nonce, csp);
  }

  const response = intlMiddleware(req);
  return applySecurityHeaders(response, nonce, csp);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
