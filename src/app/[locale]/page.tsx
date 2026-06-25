import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-text-primary">
        {t('heroTitle')}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-text-secondary">
        {t('heroSubtitle')}
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="/directory"
          className="rounded-xl bg-accent-primary px-6 py-3 text-white hover:opacity-90 transition"
        >
          {t('ctaDirectory')}
        </a>
        <a
          href="/resources"
          className="rounded-xl border border-border px-6 py-3 hover:bg-bg-secondary transition"
        >
          {t('ctaResources')}
        </a>
      </div>
    </main>
  );
}
