import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { defaultLocale } from '@/i18n';
import { RoleProvider } from '@/context';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap', weight: ['400','500','600','700'] });

export const metadata: Metadata = {
  title: 'Front Line Whānau — Support Hub NZ',
  description: 'A sovereign, privacy-first platform supporting whānau of preterm twins in Aotearoa New Zealand.',
};

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const { locale } = await props.params;
  const messages = await getMessages();

  return (
    <html lang={locale || defaultLocale}>
      <body className={`${inter.variable} ${outfit.variable} font-body antialiased min-h-screen overflow-x-hidden bg-bg-primary text-base leading-relaxed text-text-primary`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RoleProvider>
            <Header />
            <div className="pt-[72px]">
              {children}
            </div>
          </RoleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
