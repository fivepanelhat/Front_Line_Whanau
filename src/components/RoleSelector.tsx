'use client';

import { useRole } from '@/context';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function RoleSelector() {
  const { setRole } = useRole();
  const t = useTranslations('roleSelector');
  const locale = useLocale();

  return (
    <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden text-center">
      {/* Liquid orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="liquid-orb liquid-orb--teal animate-liquid-float top-[12%] left-[8%] h-72 w-72" />
        <div
          className="liquid-orb liquid-orb--amber right-[6%] bottom-[10%] h-80 w-80"
          style={{ animationDelay: '-6s' }}
        />
        <div
          className="liquid-orb liquid-orb--seafoam top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 opacity-70"
          style={{ animationDelay: '-12s' }}
        />
      </div>

      <div className="relative z-10 mb-10 max-w-xl px-2">
        <p className="section-label mb-3">Kia ora | Welcome</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-lg text-gray-600 sm:text-xl">{t('subtitle')}</p>
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-5 px-1 md:flex-row md:gap-6">
        <Link
          href={`/${locale}/parent`}
          onClick={() => setRole('parent')}
          data-testid="parent-role-btn"
          className="glass-card group block w-full rounded-3xl p-8 text-left md:flex-1"
        >
          <span
            aria-hidden
            className="shadow-glass mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-indigo-600/15 text-2xl"
          >
            🌱
          </span>
          <div className="mb-2 text-2xl font-semibold text-gray-900">{t('parentTitle')}</div>
          <p className="text-gray-600">{t('parentDescription')}</p>
          <span
            aria-hidden
            className="mt-6 inline-flex items-center gap-1 text-lg font-medium text-gray-700 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-gray-900"
          >
            Enter portal
            <span aria-hidden>{'->'}</span>
          </span>
        </Link>

        <Link
          href={`/${locale}/practitioner`}
          onClick={() => setRole('practitioner')}
          data-testid="practitioner-role-btn"
          className="glass-card group block w-full rounded-3xl p-8 text-left md:flex-1"
        >
          <span
            aria-hidden
            className="shadow-glass mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-cyan-700/20 text-2xl"
          >
            🩺
          </span>
          <div className="mb-2 text-2xl font-semibold text-gray-900">{t('practitionerTitle')}</div>
          <p className="text-gray-600">{t('practitionerDescription')}</p>
          <span
            aria-hidden
            className="mt-6 inline-flex items-center gap-1 text-lg font-medium text-gray-700 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-gray-900"
          >
            Enter portal
            <span aria-hidden>{'->'}</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
