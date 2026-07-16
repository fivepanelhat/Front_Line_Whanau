import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './lib/locale';

export { locales, defaultLocale, localeNames } from './lib/locale-config';
export type { Locale } from './lib/locale-config';

export default getRequestConfig(async () => {
 const locale = await getUserLocale();

 // Load only required namespaces (split messages for smaller bundles + better Te Reo support)
 const common = (await import(`../messages/${locale}/common.json`)).default;
 const home = (await import(`../messages/${locale}/home.json`)).default;
 const directory = (await import(`../messages/${locale}/directory.json`)).default;
 const portal = (await import(`../messages/${locale}/portal.json`)).default;

 // Add more namespaces as you split (preterm-support, practitioner, taonga-vault, etc.)
 const messages = {
 ...common,
 ...home,
 ...directory,
 ...portal,
 };

 return {
 locale,
 messages,
 };
});
