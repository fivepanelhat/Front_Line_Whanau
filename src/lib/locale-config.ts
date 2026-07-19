export const locales = ['en-NZ', 'mi', 'sm', 'to'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en-NZ';

export const localeNames: Record<Locale, string> = {
  'en-NZ': 'English (NZ)',
  mi: 'Te Reo Māori',
  sm: 'Gagana Samoa',
  to: 'Lea Faka-Tonga',
};
