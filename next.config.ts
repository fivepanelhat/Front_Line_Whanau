import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

// Note: createNextIntlPlugin only accepts one argument in next-intl v4+
// The experimental.precompile option has been removed from the plugin API.
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compress: true,
  poweredByHeader: false,

  // Fix workspace-root inference when parent dir has a package-lock.json
  turbopack: {
    root: process.cwd(),
  },

  // Note: 'cacheComponents' replaces 'experimental.ppr' in Next.js 16+
  cacheComponents: true,

  // Prevent blocked HMR requests in Playwright/dev runs using 127.0.0.1
  allowedDevOrigins: ['127.0.0.1'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**supabase.co' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    // Note: 'optimizePackageImports' must be inside 'experimental' (not top-level)
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*', 'date-fns'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
