import { NextResponse } from 'next/server';
import { routeLogger } from '@/lib/logger';

const log = routeLogger('/api/health');

/**
 * GET /api/health
 * Lightweight health check endpoint for Docker, Railway, Kubernetes,
 * and the Vercel cron ping (see vercel.json).
 *
 * Returns 200 OK when the Next.js process is alive.
 * Extend this to check Supabase connectivity when needed.
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  log.debug({ timestamp }, 'Health check called');

  return NextResponse.json(
    {
      status: 'ok',
      timestamp,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.npm_package_version ?? 'unknown',
      environment: process.env.NODE_ENV,
    },
    {
      status: 200,
      headers: {
        // Prevent caching — health checks must always be fresh
        'Cache-Control': 'no-store',
      },
    }
  );
}
