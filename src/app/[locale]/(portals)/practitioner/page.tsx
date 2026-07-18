import Link from 'next/link';

export default async function PractitionerPortal({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Locale-aware links: these were hardcoded to /en/... while the app's
  // locales are en-NZ/mi/sm/to, so every card 404'd through the middleware.
  const { locale } = await params;

  const tools = [
    {
      title: 'Directory Management',
      description: "Update your organisation's information in the Taranaki Directory.",
      href: `/${locale}/practitioner/upload`,
      icon: '📁',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Encrypted Patient Notes',
      description: 'Secure local vault for patient references and clinical notes.',
      href: `/${locale}/practitioner/dashboard`,
      icon: '🔒',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'HITL Moderation',
      description: 'Review flagged interactions for cultural and clinical safety.',
      href: `/${locale}/practitioner/moderation`,
      icon: '🛡️',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Feedback Analysis',
      description: 'Monitor AI beta performance and analyze user feedback.',
      href: `/${locale}/practitioner/feedback`,
      icon: '📈',
      color: 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-text-primary text-2xl font-bold tracking-tight sm:text-4xl">
          Practitioner Hub
        </h1>
        <p className="text-text-secondary mt-2 text-base sm:mt-3 sm:text-lg">
          Centralised tools and resources for professionals, clinicians, and services.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group bg-bg-secondary border-border hover:border-accent-primary/40 block rounded-2xl border p-5 transition-all duration-300 sm:rounded-3xl sm:p-8"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl sm:text-3xl">
                {tool.icon}
              </div>
              <div>
                <h2 className="text-text-primary group-hover:text-accent-primary mb-1 text-lg font-bold transition-colors sm:mb-2 sm:text-xl">
                  {tool.title}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed sm:text-base">
                  {tool.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
