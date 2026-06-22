import type { Metadata } from 'next';
import { RoleProvider } from '@/context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Front_Line_Whanau',
  description: 'Supporting whānau of preterm twins in Aotearoa New Zealand',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          {children}
        </RoleProvider>
      </body>
    </html>
  );
}
