export function Hero() {
  return `
    <section class="hero" id="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Sovereign &amp; Privacy-First for Aotearoa
        </div>

        <h1>
          Supporting <span class="text-gradient">Front Line Families</span> of Preterm Twins
        </h1>

        <p class="hero-description">
          Clear, personalised, and culturally safe guidance through financial support, 
          housing, health services, and mental wellbeing — before, during, and after 
          the neonatal journey.
        </p>

        <div class="hero-actions">
          <a href="#features" class="btn btn-primary" id="hero-cta-features">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 16 16 12 12 8"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Explore Features
          </a>
          <a href="#values" class="btn btn-secondary" id="hero-cta-values">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Our Values
          </a>
        </div>
      </div>
    </section>
  `;
}
