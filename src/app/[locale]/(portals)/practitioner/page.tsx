import Link from 'next/link';

export default async function PractitionerPortal({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Locale-aware links: these were hardcoded to /en/… while the app's
  // locales are en-NZ/mi/sm/to, so every card 404'd through the middleware.
  const { locale } = await params;

  const tools = [
    {
      title: 'Directory Management',
      description: 'Update your organisation’s information in the Taranaki Directory.',
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
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Practitioner & Organisation Hub</h1>
        <p className="text-lg text-gray-600 mt-3">Centralised tools and resources for professionals, clinicians, and services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.title} 
            href={tool.href}
            className="group block bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                {tool.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{tool.title}</h3>
                <p className="text-gray-600 leading-relaxed">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
