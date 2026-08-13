const values = [
  {
    emoji: '👑',
    title: 'Rangatiratanga',
    description:
      'Whānau retain authority and final decision-making over their data, care pathways, and consent — including how their story is told.',
  },
  {
    emoji: '🛡️',
    title: 'Kaitiakitanga',
    description:
      'Responsible guardianship of sensitive information as taonga — precious and protected, in hard seasons and in happy ones.',
  },
  {
    emoji: '💛',
    title: 'Aroha & celebration',
    description:
      'We make space for joy: first cuddles, growth charts that turn a corner, siblings meeting pēpi, and discharge day. Hardship is real; so is happiness.',
  },
  {
    emoji: '⚖️',
    title: 'Equity & active protection',
    description:
      'Working to reduce disparities and proactively protect vulnerable whānau throughout their journey.',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: 'Extended whānau',
    description:
      'Recognising grandparents, siblings, and chosen family — the people who bring meals, jokes, and the photos you will treasure.',
  },
  {
    emoji: '🤝',
    title: 'Practitioner partnership',
    description:
      'Respect for professional autonomy and less admin burden — so clinicians and support workers can focus on care and encouragement.',
  },
];

export function Values() {
  return (
    <section className="relative overflow-hidden py-20" id="values">
      <div
        aria-hidden
        className="liquid-orb liquid-orb--seafoam pointer-events-none absolute top-10 -left-20 h-72 w-72 opacity-50"
      />
      <div className="max-w-site relative mx-auto px-6">
        <div className="mb-16 text-center">
          <p className="section-label">Our values</p>
          <h2 className="section-title">
            Grounded in <span className="text-gradient">Te Tiriti</span> and lived reality
          </h2>
          <p className="section-description">
            Designed in accordance with Te Mana Raraunga and Te Tiriti principles — holding both
            the weight of the neonatal journey and the right to celebrate progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" id="values-grid">
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
              <p className="text-text-secondary text-sm leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
