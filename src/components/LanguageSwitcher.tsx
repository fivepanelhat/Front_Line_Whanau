'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames } from '@/lib/locale-config';

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
 className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-xl"
 >
 {locales.map((loc) => {
 const isActive = locale === loc;
 return (
 <button
 key={loc}
 type="button"
 onClick={() => handleLocaleChange(loc)}
 className={cn(
 'rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-250',
 isActive
 ? 'bg-gradient-brand text-white shadow-md'
 : 'text-text-secondary hover:bg-white/10 hover:text-text-primary',
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
