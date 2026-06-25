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
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Front Line Whānau — Support Hub NZ',
    template: '%s | Front Line Whānau',
  },
  description: 'A sovereign, privacy-first platform supporting whānau of preterm twins in Aotearoa New Zealand.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.variable} ${outfit.variable} font-body antialiased bg-bg-primary text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
