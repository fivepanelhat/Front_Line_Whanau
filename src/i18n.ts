import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './lib/locale';

export { locales, defaultLocale, localeNames } from './lib/locale-config';
export type { Locale } from './lib/locale-config';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
