import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './lib/locale';
import type { Locale } from './lib/locale-config';

export { locales, defaultLocale, localeNames } from './lib/locale-config';
export type { Locale } from './lib/locale-config';

/**
 * Namespace loaders — each returns only the message slice needed by a route.
 *
 * Usage in a Server Component or layout:
 *
 *   import { loadMessages } from '@/i18n';
 *   const messages = await loadMessages(locale, ['common', 'directory']);
 *
 * The root locale layout loads 'common' for every page (shared UI strings,
 * navigation, language switcher, errors, footer). Route-specific namespaces
 * (home, directory, portal) are loaded only where needed.
 */
export const NAMESPACES = ['common', 'home', 'directory', 'portal'] as const;
export type MessageNamespace = (typeof NAMESPACES)[number];

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
  const locale = await getUserLocale();
  const messages = await loadMessages(locale as Locale, [...NAMESPACES]);
  return { locale, messages };
});
