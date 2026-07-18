'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ParentPortal() {
  const locale = useLocale();

  const tools = [
    {
      title: 'Ask the AI Assistant',
      description:
        'Plain-language answers about the NICU journey, entitlements, and local services - with a human safety net.',
      href: `/${locale}/support`,
      icon: '💬',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Financial Support Checker',
      description:
        'Check your eligibility for Best Start, Work and Income help, and the Disability Allowance.',
      href: `/${locale}/parent/financial`,
      icon: '💰',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'National Directory',
      description:
        'Verified support services, clinical organisations, and community groups across Aotearoa.',
      href: `/${locale}/directory`,
      icon: '📍',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Whanau Hub',
      description:
        'Your sovereign space: support pathways, checklists, and the encrypted Taonga Vault.',
      href: `/${locale}/resources`,
      icon: '🌿',
      color: 'bg-teal-50 text-teal-700',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-text-primary text-2xl font-bold tracking-tight sm:text-4xl">
          Parent & Whanau Portal
        </h1>
        <p className="text-text-secondary mt-2 text-base sm:mt-3 sm:text-lg">
          Support and information for families of preterm babies - nau mai, haere mai.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group bg-bg-secondary border-border hover:border-accent-primary/40 block rounded-xl border p-5 transition-all sm:p-6"
          >
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-2xl sm:mb-4">
              {tool.icon}
            </div>
            <h2 className="text-text-primary group-hover:text-accent-primary mb-1 font-semibold transition-colors">
              {tool.title}
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
