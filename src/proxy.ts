import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

/**
 * Next.js 16 network-boundary proxy (formerly middleware.ts).
 * Handles locale routing, API auth gates, and baseline security headers.
 */

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

const isDev = process.env.NODE_ENV === 'development';

/** Paths that do not require auth cookies or API_SECRET_KEY. */
const PUBLIC_API_PATHS = [
  '/api/health',
  '/api/agents',
  '/api/feedback',
  '/api/chat/summary',
  '/api/review/status',
  '/api/summit',
] as const;

function buildCsp(): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', buildCsp());
  return response;
}

function isPublicApiPath(pathname: string): boolean {
  if (pathname === '/api/feedback/export') return false;
  return PUBLIC_API_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function hasApiAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const hasValidToken =
    !!process.env.API_SECRET_KEY && authHeader === `Bearer ${process.env.API_SECRET_KEY}`;
  // Supabase SSR auth cookie heuristic for dashboard sessions
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.includes('-auth-token'));
  return hasValidToken || hasSession;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes: auth gate + security headers (no i18n rewrite)
  if (pathname.startsWith('/api/')) {
    if (!isPublicApiPath(pathname) && !hasApiAuth(request)) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized API Access' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // App routes: locale routing + security headers
  const response = intlMiddleware(request);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
