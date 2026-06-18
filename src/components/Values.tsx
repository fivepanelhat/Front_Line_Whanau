const values = [
  {
    emoji: '👑',
    title: 'Rangatiratanga',
    description:
      'Whānau retain authority and final decision-making over their data, care pathways, and consent.',
  },
  {
    emoji: '🛡️',
    title: 'Kaitiakitanga',
    description:
      'Responsible guardianship of sensitive information as taonga — precious and protected.',
  },
  {
    emoji: '⚖️',
    title: 'Equity & Active Protection',
    description:
      'Working to reduce disparities and proactively protect vulnerable whānau throughout their journey.',
  },
  {
    emoji: '🌏',
    title: 'Inclusivity',
    description:
      'For all families, regardless of ethnicity, culture, religion, family structure, or background.',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: 'Extended Whānau',
    description:
      'Recognising the vital role of grandparents, siblings, and chosen family in the care of preterm babies.',
  },
  {
    emoji: '🤝',
    title: 'Practitioner Safety',
    description:
      'Balanced protection for practitioners — respecting professional autonomy and reducing administrative burden.',
  },
];

export function Values() {
  return (
    <section className="bg-gradient-subtle py-16" id="values">
      <div className="mx-auto max-w-site px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="section-label">Our Values</p>
          <h2 className="section-title">
            Grounded in <span className="text-gradient">Te Tiriti</span>
          </h2>
          <p className="section-description">
            Aligned with Te Mana Raraunga and the principles of Te Tiriti o Waitangi — Tino
            Rangatiratanga, Kaitiakitanga, and Equity.
          </p>
        </div>

        {/* Values Grid */}
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          id="values-grid"
        >
          {values.map((v, i) => (
            <div
              key={v.title}
              className="value-item"
              id={`value-${i}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <h3 className="mb-2 flex items-center gap-2 text-lg">
                <span>{v.emoji}</span> {v.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
