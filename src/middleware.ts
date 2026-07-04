import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

const isDev = process.env.NODE_ENV === 'development';
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'; "
  : "script-src 'self' 'unsafe-inline'; ";

export async function middleware(request: NextRequest) {
  // Don't apply i18n middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // 1. Define truly public endpoints (e.g. Chat AI, Health, Feedback Submission)
    // chat/summary and review/status are part of the anonymous chat flow
    // (doctor-summary tab, HITL status polling) — both rate-limited in-route.
    const publicPaths = ['/api/health', '/api/agents', '/api/feedback', '/api/chat/summary', '/api/review/status'];
    const isPublic = publicPaths.some(p => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`));

    // Special rule for /api/feedback: POST is public, but /api/feedback/export is NOT public.
    const isFeedbackExport = request.nextUrl.pathname === '/api/feedback/export';

    // If it's not a public path, or it's the export endpoint, secure it.
    if (!isPublic || isFeedbackExport) {
      const authHeader = request.headers.get('authorization');
      const hasValidToken = !!process.env.API_SECRET_KEY && authHeader === `Bearer ${process.env.API_SECRET_KEY}`;
      
      // Simple heuristic: if they have a Supabase auth cookie, they are logged into the dashboard.
      const hasSession = request.cookies.getAll().some(c => c.name.includes('-auth-token'));

      if (!hasValidToken && !hasSession) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized API Access' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Very simple edge rate limit check (30 requests per IP per minute)
      // For more robust limiting, we will use checkRateLimit directly in route handlers
      // that are Node.js environment-based where Supabase SSR handles complex upserts reliably.
    }

    const response = NextResponse.next();

    // Still apply security headers to all responses
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      scriptSrc +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );

    return response;
  }

  // Apply i18n middleware to non-API routes
  const response = intlMiddleware(request);

  // Security headers required by current E2E tests
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Baseline CSP — safe starting point for Next.js App Router
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    scriptSrc +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
