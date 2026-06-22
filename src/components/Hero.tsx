interface HeroProps {
  onLaunchHub?: () => void;
}

export function Hero({ onLaunchHub }: HeroProps) {
  return (
    <section
      className="hero-bg relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-[calc(72px+4rem)] text-center"
      id="hero"
    >
      <div className="relative z-10 max-w-[800px]">
        {/* Badge */}
        <div className="mb-8 inline-flex animate-hero-fade-1 items-center gap-2 rounded-full border border-accent-secondary/20 bg-accent-secondary/10 px-5 py-2 text-sm font-medium text-accent-secondary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Sovereign &amp; Privacy-First for Aotearoa
        </div>

        {/* Heading */}
        <h1 className="mb-6 animate-hero-fade-2 text-[clamp(1.875rem,5vw,3rem)] font-extrabold">
          Supporting <span className="text-gradient">Front Line Families</span> of Preterm Twins
        </h1>

        {/* Description */}
        <p className="mx-auto mb-12 max-w-[600px] animate-hero-fade-3 text-lg leading-relaxed text-text-secondary">
          Clear, personalised, and culturally safe guidance through financial support, housing,
          health services, and mental wellbeing — before, during, and after the neonatal journey.
        </p>

        {/* Actions */}
        <div className="flex animate-hero-fade-4 flex-wrap justify-center gap-4">
          <button onClick={onLaunchHub} className="btn btn-primary animate-pulse-glow" id="hero-cta-launch">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 16 16 12 12 8" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Launch Sovereign Hub
          </button>
          <a href="#features" className="btn btn-secondary" id="hero-cta-features">
            Explore Features
          </a>
        </div>
      </div>
    </section>
  );
}

