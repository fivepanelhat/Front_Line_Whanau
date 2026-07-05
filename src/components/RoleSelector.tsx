'use client';

import { useRole } from '@/context';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function RoleSelector() {
  const { setRole } = useRole();
  const t = useTranslations('roleSelector');
  const locale = useLocale();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] w-full text-center">
      {/* Aurora glow — gives the glass panels something to refract */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 translate-x-1/2 rounded-full bg-accent-primary/20 blur-3xl" />
      </div>

      <h1 className="relative text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="relative text-xl text-gray-600 mb-10 max-w-md">
        {t('subtitle')}
      </p>

      <div className="relative flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Parent Portal */}
        <Link
          href={`/${locale}/parent`}
          onClick={() => setRole('parent')}
          data-testid="parent-role-btn"
          className="glass-card group w-full md:flex-1 p-8 rounded-2xl text-left block transition-all duration-250 hover:-translate-y-1 hover:shadow-glow"
        >
          <span
            aria-hidden
            className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/15 text-2xl"
          >
            🌱
          </span>
          <div className="text-2xl font-semibold mb-2 text-gray-900">{t('parentTitle')}</div>
          <p className="text-gray-600">{t('parentDescription')}</p>
          <span
            aria-hidden
            className="mt-6 inline-block text-xl text-gray-700 transition-all duration-250 group-hover:translate-x-1 group-hover:text-gray-900"
          >
            →
          </span>
        </Link>

        {/* Practitioner Portal */}
        <Link
          href={`/${locale}/practitioner`}
          onClick={() => setRole('practitioner')}
          data-testid="practitioner-role-btn"
          className="glass-card group w-full md:flex-1 p-8 rounded-2xl text-left block transition-all duration-250 hover:-translate-y-1 hover:shadow-glow"
        >
          <span
            aria-hidden
            className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-700/20 text-2xl"
          >
            🩺
          </span>
          <div className="text-2xl font-semibold mb-2 text-gray-900">{t('practitionerTitle')}</div>
          <p className="text-gray-600">{t('practitionerDescription')}</p>
          <span
            aria-hidden
            className="mt-6 inline-block text-xl text-gray-700 transition-all duration-250 group-hover:translate-x-1 group-hover:text-gray-900"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
