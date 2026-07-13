const features = [
  {
    icon: '🛤️',
    iconClass: 'feature-icon--pathway',
    title: 'Personalised Pathways',
    description:
      'Guided support tailored to your whānau situation — financial assistance, housing, health services, and practical help, all in one place.',
  },
  {
    icon: '📝',
    iconClass: 'feature-icon--forms',
    title: 'Intelligent Form Pre-Fill',
    description:
      'Smart assistance for WINZ and IRD applications. Pre-fills forms with your consent, reducing stress during an already overwhelming time.',
  },
  {
    icon: '🔐',
    iconClass: 'feature-icon--vault',
    title: 'Taonga Vault',
    description:
      'Secure, encrypted multi-modal document storage. Your documents are treated as taonga — precious and protected, always under your control.',
  },
  {
    icon: '📋',
    iconClass: 'feature-icon--doc',
    title: 'Client-Side Documentor',
    description:
      'A private, independent space to record decisions, interactions, and notes. Everything stays on your device unless you choose otherwise.',
  },
  {
    icon: '🗺️',
    iconClass: 'feature-icon--dir',
    title: 'Services Directory',
    description:
      'Up-to-date directory of Taranaki and national services — neonatal support, mental health, housing, financial aid, and community resources.',
  },
  {
    icon: '🤖',
    iconClass: 'feature-icon--ai',
    title: 'Sovereign Edge AI',
    description:
      'Trauma-informed AI assistance that runs client-side first. Your data stays with you. Transparent consent for any server-side processing.',
  },
];

export function Features() {
  return (
    <section className="relative mx-auto max-w-site overflow-hidden px-6 py-20" id="features">
      <div
        aria-hidden
        className="liquid-orb liquid-orb--teal pointer-events-none absolute -right-24 top-0 h-64 w-64 opacity-40"
      />
      <div className="relative mb-16 text-center">
        <p className="section-label">Key Features</p>
        <h2 className="section-title">
          Built for Whānau, <span className="text-gradient">By Design</span>
        </h2>
        <p className="section-description">
          Every feature is designed with cultural safety, privacy, and trauma-informed care at its
          foundation.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8" id="features-grid">
        {features.map((f, i) => (
          <article
            key={f.title}
            className="feature-card"
            id={`feature-${i}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
            <h3 className="mb-2 text-xl">{f.title}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{f.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
