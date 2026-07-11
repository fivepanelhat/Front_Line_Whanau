interface HeroProps {
  onLaunchHub?: () => void;
}

export function Hero({ onLaunchHub }: HeroProps) {
  return (
    <section
      className="hero-bg relative flex min-h-[88vh] items-center justify-center overflow-hidden px-6 pb-16 pt-[calc(72px+3rem)] text-center"
      id="hero"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="liquid-orb liquid-orb--teal left-[5%] top-[20%] h-96 w-96 opacity-80" />
        <div
          className="liquid-orb liquid-orb--amber right-[0%] top-[40%] h-80 w-80"
          style={{ animationDelay: '-8s' }}
        />
      </div>

      <div className="relative z-10 max-w-[820px]">
        <div className="privacy-badge mb-8 inline-flex animate-hero-fade-1 gap-2 normal-case tracking-normal">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Sovereign &amp; Privacy-First for Aotearoa
        </div>

        <h1 className="mb-6 animate-hero-fade-2 text-[clamp(1.875rem,5vw,3.25rem)] font-extrabold tracking-tight">
          Supporting <span className="text-gradient">Front Line Families</span> of Preterm Twins
        </h1>

        <p className="mx-auto mb-10 max-w-[600px] animate-hero-fade-3 text-lg leading-relaxed text-text-secondary">
          Clear, personalised, and culturally safe guidance through financial support, housing,
          health services, and mental wellbeing — before, during, and after the neonatal journey.
        </p>

        <div className="glass-card mx-auto mb-4 inline-flex animate-hero-fade-4 flex-wrap justify-center gap-3 rounded-3xl p-3 sm:gap-4 sm:p-4">
          <button
            type="button"
            onClick={onLaunchHub}
            className="btn btn-primary animate-pulse-glow"
            id="hero-cta-launch"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
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
