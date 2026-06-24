'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { locales, localeNames, Locale } from '@/lib/locale-config';
import { switchLocale } from '@/lib/actions/locale';

/**
 * LanguageSwitcher
 *
 * Renders a respectful toggle between English (NZ) and Te Reo Māori.
 * Design decisions:
 * - Both language names appear in their own language (never "Maori" in English
 *   mode — it's always "Te Reo Māori") to respect mana of te reo.
 * - Uses a pill toggle rather than a dropdown to keep it lightweight and
 *   accessible.
 * - Disabled during the transition to prevent double-clicks.
 * - aria-pressed reflects the active locale clearly for screen readers.
 */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations('languageSwitcher');
  const [isPending, startTransition] = useTransition();

  function handleSwitch(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await switchLocale(next);
    });
  }

  return (
    <div
      role="group"
      aria-label={t('label')}
      className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm"
      id="language-switcher"
    >
      {locales.map((l) => {
        const isActive = l === locale;
        return (
          <button
            key={l}
            onClick={() => handleSwitch(l)}
            disabled={isPending}
            aria-pressed={isActive}
            aria-label={l === 'mi' ? t('choosingMaori') : t('choosingEnglish')}
            className={[
              'rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary',
              isActive
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary disabled:opacity-50',
            ].join(' ')}
          >
            {/* Always display the language name in that language itself */}
            {l === 'mi' ? 'Te Reo' : 'EN'}
            <span className="sr-only"> — {localeNames[l]}</span>
          </button>
        );
      })}
    </div>
  );
}
