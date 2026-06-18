import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Front Line Whānau — Support Hub NZ',
    template: '%s | Front Line Whānau',
  },
  description:
    'A sovereign, privacy-first platform supporting whānau of preterm twins in Aotearoa New Zealand. Personalised pathways, secure document storage, and culturally safe guidance.',
  keywords: [
    'neonatal',
    'preterm twins',
    'whānau support',
    'New Zealand',
    'WINZ',
    'IRD',
    'privacy-first',
    'sovereign AI',
    'Taranaki',
  ],
  authors: [{ name: 'Front Line Whānau' }],
  openGraph: {
    title: 'Front Line Whānau — Support Hub NZ',
    description:
      'Personalised, culturally safe support for families of preterm twins in Aotearoa.',
    locale: 'en_NZ',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-bg-primary font-body text-base leading-relaxed text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
