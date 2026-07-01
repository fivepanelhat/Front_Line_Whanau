import RoleSelector from '@/components/RoleSelector';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

export default async function HomePage() {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <main className="flex min-h-[80vh] flex-col items-center justify-center px-6">
        <RoleSelector />
      </main>
    </NextIntlClientProvider>
  );
}
