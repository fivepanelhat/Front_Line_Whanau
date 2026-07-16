import { NextIntlClientProvider } from 'next-intl';
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

 return (
 <NextIntlClientProvider locale={locale}>
 <RoleProvider>
 <Header />
 {children}
 </RoleProvider>
 </NextIntlClientProvider>
 );
}
