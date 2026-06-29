import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './lib/locale';
import { locales, defaultLocale, type Locale } from './lib/locale-config';

export { locales, defaultLocale, localeNames } from './lib/locale-config';
export type { Locale } from './lib/locale-config';

/**
 * Namespace-first loading keeps messages split and easy to evolve.
 */
export const NAMESPACES = ['common', 'home', 'directory', 'portal'] as const;
export type MessageNamespace = (typeof NAMESPACES)[number];

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export async function loadMessages(
  locale: Locale,
  namespaces: MessageNamespace[]
): Promise<Record<string, unknown>> {
  const chunks = await Promise.all(
    namespaces.map((ns) =>
      import(`../messages/${locale}/${ns}.json`).then((m) => m.default)
    )
  );
  return Object.assign({}, ...chunks);
}

/**
 * next-intl request config.
 *
 * Loads ALL namespaces so NextIntlClientProvider in the root locale layout
 * has the full message set for Client Components. Server Components that
 * want to be leaner can call loadMessages() directly instead of getMessages().
 */
export default getRequestConfig(async () => {
  const requestedLocale = await getUserLocale();
  const locale: Locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  // Load baseline namespaces used across shared layouts and portal/home routes.
  // As route-level message loading matures, this can be narrowed further.
  const messages = await loadMessages(locale, [...NAMESPACES]);
  return { locale, messages };
});
