'use client';

import { useRole } from '@/context';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function RoleSelector() {
  const { setRole } = useRole();
  const t = useTranslations('roleSelector');
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-md">
        {t('subtitle')}
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Parent Portal */}
        <Link
          href={`/${locale}/parent`}
          onClick={() => setRole('parent')}
          data-testid="parent-role-btn"
          className="flex-1 p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-200 shadow-lg text-left block"
        >
          <div className="text-2xl font-semibold mb-2">{t('parentTitle')}</div>
          <p className="text-blue-100">{t('parentDescription')}</p>
        </Link>

        {/* Practitioner Portal */}
        <Link
          href={`/${locale}/practitioner`}
          onClick={() => setRole('practitioner')}
          data-testid="practitioner-role-btn"
          className="flex-1 p-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all duration-200 shadow-lg text-left block"
        >
          <div className="text-2xl font-semibold mb-2">{t('practitionerTitle')}</div>
          <p className="text-emerald-100">{t('practitionerDescription')}</p>
        </Link>
      </div>
    </div>
  );
}
