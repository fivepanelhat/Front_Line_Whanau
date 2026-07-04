'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ParentPortal() {
  const locale = useLocale();

  const tools = [
    {
      title: 'Ask the AI Assistant',
      description:
        'Plain-language answers about the NICU journey, entitlements, and local services — with a human safety net.',
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
      title: 'Whānau Hub',
      description:
        'Your sovereign space: support pathways, checklists, and the encrypted Taonga Vault.',
      href: `/${locale}/resources`,
      icon: '🌿',
      color: 'bg-teal-50 text-teal-700',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">Parent & Whanau Portal</h1>
        <p className="text-base sm:text-lg text-text-secondary mt-2 sm:mt-3">
          Support and information for families of preterm babies — nau mai, haere mai.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border hover:border-accent-primary/40 transition-all block"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-2xl mb-3 sm:mb-4 bg-white/5">
              {tool.icon}
            </div>
            <h3 className="font-semibold text-text-primary mb-1 group-hover:text-accent-primary transition-colors">
              {tool.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
