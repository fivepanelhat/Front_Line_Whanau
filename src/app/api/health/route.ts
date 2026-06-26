import { NextResponse } from 'next/server';

/**
 * Platform health check endpoint.
 * Used by monitoring, load balancers, and E2E tests.
 *
 * Note: This reports on the technical health of the platform only.
 * It is not medical advice. Always consult qualified healthcare professionals
 * for preterm twin / whānau care decisions.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'whanau-preterm-support-hub-nz',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

// Lightweight HEAD support for some monitoring tools
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
