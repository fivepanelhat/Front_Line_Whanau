const features = [
  {
    icon: '🛤️',
    iconClass: 'feature-icon--pathway',
    title: 'Personalised pathways',
    description:
      'Practical routes through financial help, housing, health services, and everyday support — so you can spend more energy on your pēpi and the milestones that matter.',
  },
  {
    icon: '📝',
    iconClass: 'feature-icon--forms',
    title: 'Lighter admin load',
    description:
      'Assistance with WINZ and IRD-style forms (with your consent). Less time on paperwork, more room for rest, visitors, and small celebrations.',
  },
  {
    icon: '🔐',
    iconClass: 'feature-icon--vault',
    title: 'Taonga Vault',
    description:
      'A secure place for documents — and for the keepsakes of this chapter: notes, photos you choose to store, and records you control as taonga.',
  },
  {
    icon: '📋',
    iconClass: 'feature-icon--doc',
    title: 'Your private notes',
    description:
      'A quiet space to capture decisions, questions for the care team, and the wins worth remembering. Stays on your device unless you choose otherwise.',
  },
  {
    icon: '🗺️',
    iconClass: 'feature-icon--dir',
    title: 'Services directory',
    description:
      'Find neonatal, mental health, housing, financial, and community supports — including places that help whānau mark progress and stay connected.',
  },
  {
    icon: '🤖',
    iconClass: 'feature-icon--ai',
    title: 'Gentle AI guide',
    description:
      'Trauma-informed, draft-only assistance to navigate information. Never a doctor. Always transparent. Built to support, not to overshadow your joy or your care team.',
  },
];

export function Features() {
  return (
    <section className="max-w-site relative mx-auto overflow-hidden px-6 py-20" id="features">
      <div
        aria-hidden
        className="liquid-orb liquid-orb--teal pointer-events-none absolute top-0 -right-24 h-64 w-64 opacity-40"
      />
      <div className="relative mb-16 text-center">
        <p className="section-label">Key features</p>
        <h2 className="section-title">
          Built for the whole chapter —{' '}
          <span className="text-gradient">struggle and celebration</span>
        </h2>
        <p className="section-description">
          Cultural safety, privacy, and trauma-informed care — with room for hope, humour, and the
          moments you will tell for years.
        </p>
      </div>

      <div
        className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        id="features-grid"
      >
        {features.map((f, i) => (
          <article
            key={f.title}
            className="feature-card"
            id={`feature-${i}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
            <h3 className="mb-2 text-xl">{f.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
