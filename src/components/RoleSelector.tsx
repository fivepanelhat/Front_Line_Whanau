'use client';

import { useRole } from '@/context';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function RoleSelector() {
  const { setRole } = useRole();
  const router = useRouter();
  const t = useTranslations('roleSelector');
  const locale = useLocale();

  const handleSelect = (role: 'parent' | 'practitioner') => {
    setRole(role);
    router.push(`/${locale}/${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-md">
        {t('subtitle')}
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Parent Portal */}
        <button
          onClick={() => handleSelect('parent')}
          className="flex-1 p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-200 shadow-lg text-left"
        >
          <div className="text-2xl font-semibold mb-2">{t('parentTitle')}</div>
          <p className="text-blue-100">{t('parentDescription')}</p>
        </button>

        {/* Practitioner Portal */}
        <button
          onClick={() => handleSelect('practitioner')}
          className="flex-1 p-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all duration-200 shadow-lg text-left"
        >
          <div className="text-2xl font-semibold mb-2">{t('practitionerTitle')}</div>
          <p className="text-emerald-100">{t('practitionerDescription')}</p>
        </button>
      </div>
    </div>
  );
}
