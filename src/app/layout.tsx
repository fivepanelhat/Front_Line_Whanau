import type { Metadata } from 'next';

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
  return children;
}
