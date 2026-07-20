import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Suspense } from 'react';

import './globals.css';
import { cn } from '@/lib/utils';

// Optimised font loading with swap strategy for performance + accessibility
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

/** Keep in sync with THEME_SCRIPT_HASH in src/proxy.ts */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem('flw-theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){document.documentElement.classList.add('dark')}})()`;

export const metadata: Metadata = {
  metadataBase: new URL('https://frontline-whanau.nz'),
  title: {
    default: 'Whānau Preterm Support Hub | Aotearoa New Zealand',
    template: '%s | Whānau Preterm Support Hub',
  },
  description:
    'Sovereign, privacy-first digital platform supporting whānau of preterm twins and families navigating frontline services across Aotearoa New Zealand. Te Tiriti o Waitangi aligned.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Whānau Preterm Support Hub NZ',
    description:
      'Privacy-first support for whānau of preterm twins. Culturally safe, Te Tiriti aligned.',
    images: [{ url: '/og-image.png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3ea' },
    { media: '(prefers-color-scheme: dark)', color: '#131c17' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

/**
 * Nonce comes from headers() (request-time). With Cache Components enabled,
 * that uncached access must sit inside Suspense so static shells can still
 * prerender. The fallback uses the same script without a nonce - CSP allows
 * it via THEME_SCRIPT_HASH in proxy.ts.
 */
async function ThemeBootstrapScript() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />;
}

function ThemeBootstrapFallback() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, 'antialiased')} suppressHydrationWarning>
      <head>
        {/* Theme FOUC guard - hashed in CSP (see proxy.ts THEME_SCRIPT_HASH) */}
        <Suspense fallback={<ThemeBootstrapFallback />}>
          <ThemeBootstrapScript />
        </Suspense>
      </head>
      <body className="font-body min-h-screen text-slate-900 antialiased">
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Skip to main content
        </a>

        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
