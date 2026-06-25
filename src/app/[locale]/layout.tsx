import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { defaultLocale } from '@/i18n';
import { RoleProvider } from '@/context';
import Header from '@/components/Header';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';

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

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const { locale } = await props.params;
  const messages = await getMessages();

  return (
    <html lang={locale || defaultLocale}>
      <body className={`${inter.variable} ${outfit.variable} font-body antialiased bg-bg-primary text-text-primary min-h-screen`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RoleProvider>
            <Header />
            <main>{children}</main>
          </RoleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
