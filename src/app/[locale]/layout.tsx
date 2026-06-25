import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { defaultLocale } from '@/i18n';
import { RoleProvider } from '@/context';
import { Header } from '@/components/Header';

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const { locale } = await props.params;
  const messages = await getMessages();

  return (
    <html lang={locale || defaultLocale}>
      <body>
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
