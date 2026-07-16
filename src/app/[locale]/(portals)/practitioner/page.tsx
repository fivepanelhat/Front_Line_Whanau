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
 description: 'Update your organisation's information in the Taranaki Directory.',
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
 <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
 <div className="mb-6 sm:mb-10">
 <h1 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">Practitioner Hub</h1>
 <p className="text-base sm:text-lg text-text-secondary mt-2 sm:mt-3">Centralised tools and resources for professionals, clinicians, and services.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 {tools.map((tool) => (
 <Link
 key={tool.title}
 href={tool.href}
 className="group block bg-bg-secondary p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border hover:border-accent-primary/40 transition-all duration-300"
 >
 <div className="flex items-start gap-3 sm:gap-4">
 <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl bg-white/5 group-hover:scale-110 transition-transform duration-300 shrink-0">
 {tool.icon}
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-1 sm:mb-2 group-hover:text-accent-primary transition-colors">{tool.title}</h2>
 <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{tool.description}</p>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 );
}
