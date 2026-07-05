'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames } from '@/lib/locale-config';

// Inline lightweight class join helper to replace external tailwind-merge dependency
function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
  <div
    id="language-switcher"
    data-testid="language-switcher"
    className="inline-flex rounded-xl border border-border bg-bg-primary p-1 shadow-sm"
  >
      {locales.map((loc) => {
        const isActive = locale === loc;
        return (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-accent-primary text-accent-ink shadow-sm'
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
            )}
            aria-pressed={isActive ? 'true' : 'false'}
            aria-label={`Switch to ${localeNames[loc]}`}
          >
            {localeNames[loc]}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
