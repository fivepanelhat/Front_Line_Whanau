import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './lib/locale';

export const locales = ['en-NZ', 'mi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en-NZ';

export const localeNames: Record<Locale, string> = {
  'en-NZ': 'English (NZ)',
  mi: 'Te Reo Māori',
};

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
