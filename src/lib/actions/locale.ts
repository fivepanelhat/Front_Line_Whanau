'use server';

import { setUserLocale } from '@/lib/locale';
import { Locale } from '@/i18n';

/**
 * Server Action: persists the chosen locale to the NEXT_LOCALE cookie.
 * Called from the LanguageSwitcher client component.
 */
export async function switchLocale(locale: Locale): Promise<void> {
  await setUserLocale(locale);
}
