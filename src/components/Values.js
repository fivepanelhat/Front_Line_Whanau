export function Values() {
  const values = [
    {
      emoji: '👑',
      title: 'Rangatiratanga',
      description: 'Whānau retain authority and final decision-making over their data, care pathways, and consent.',
    },
    {
      emoji: '🛡️',
      title: 'Kaitiakitanga',
      description: 'Responsible guardianship of sensitive information as taonga — precious and protected.',
    },
    {
      emoji: '⚖️',
      title: 'Equity & Active Protection',
      description: 'Working to reduce disparities and proactively protect vulnerable whānau throughout their journey.',
    },
    {
      emoji: '🌏',
      title: 'Inclusivity',
      description: 'For all families, regardless of ethnicity, culture, religion, family structure, or background.',
    },
    {
      emoji: '👨‍👩‍👧‍👦',
      title: 'Extended Whānau',
      description: 'Recognising the vital role of grandparents, siblings, and chosen family in the care of preterm babies.',
    },
    {
      emoji: '🤝',
      title: 'Practitioner Safety',
      description: 'Balanced protection for practitioners — respecting professional autonomy and reducing administrative burden.',
    },
  ];

  return `
    <section class="values-section" id="values">
      <div class="container">
        <div class="section-header">
          <p class="section-label">Our Values</p>
          <h2 class="section-title">Grounded in <span class="text-gradient">Te Tiriti</span></h2>
          <p class="section-description">
            Aligned with Te Mana Raraunga and the principles of Te Tiriti o Waitangi — 
            Tino Rangatiratanga, Kaitiakitanga, and Equity.
          </p>
        </div>

        <div class="values-grid" id="values-grid">
          ${values
            .map(
              (v, i) => `
            <div class="value-item" id="value-${i}" style="animation-delay: ${i * 0.08}s">
              <h3><span>${v.emoji}</span> ${v.title}</h3>
              <p>${v.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}
