export function Features() {
  const features = [
    {
      icon: '🛤️',
      iconClass: 'feature-icon--pathway',
      title: 'Personalised Pathways',
      description: 'Guided support tailored to your whānau situation — financial assistance, housing, health services, and practical help, all in one place.',
    },
    {
      icon: '📝',
      iconClass: 'feature-icon--forms',
      title: 'Intelligent Form Pre-Fill',
      description: 'Smart assistance for WINZ and IRD applications. Pre-fills forms with your consent, reducing stress during an already overwhelming time.',
    },
    {
      icon: '🔐',
      iconClass: 'feature-icon--vault',
      title: 'Taonga Vault',
      description: 'Secure, encrypted multi-modal document storage. Your documents are treated as taonga — precious and protected, always under your control.',
    },
    {
      icon: '📋',
      iconClass: 'feature-icon--doc',
      title: 'Client-Side Documentor',
      description: 'A private, independent space to record decisions, interactions, and notes. Everything stays on your device unless you choose otherwise.',
    },
    {
      icon: '🗺️',
      iconClass: 'feature-icon--dir',
      title: 'Services Directory',
      description: 'Up-to-date directory of Taranaki and national services — neonatal support, mental health, housing, financial aid, and community resources.',
    },
    {
      icon: '🤖',
      iconClass: 'feature-icon--ai',
      title: 'Sovereign Edge AI',
      description: 'Trauma-informed AI assistance that runs client-side first. Your data stays with you. Transparent consent for any server-side processing.',
    },
  ];

  return `
    <section class="features-section container" id="features">
      <div class="section-header">
        <p class="section-label">Key Features</p>
        <h2 class="section-title">Built for Whānau, <span class="text-gradient">By Design</span></h2>
        <p class="section-description">
          Every feature is designed with cultural safety, privacy, and trauma-informed care at its foundation.
        </p>
      </div>

      <div class="features-grid" id="features-grid">
        ${features
          .map(
            (f, i) => `
          <article class="feature-card" id="feature-${i}" style="animation-delay: ${i * 0.08}s">
            <div class="feature-icon ${f.iconClass}">${f.icon}</div>
            <h3>${f.title}</h3>
            <p>${f.description}</p>
          </article>
        `
          )
          .join('')}
      </div>
    </section>
  `;
}
