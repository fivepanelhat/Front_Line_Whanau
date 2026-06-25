import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { RoleProvider } from '@/context';
import Header from '@/components/Header';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <RoleProvider>
        <Header />
        {children}
      </RoleProvider>
    </NextIntlClientProvider>
  );
}
