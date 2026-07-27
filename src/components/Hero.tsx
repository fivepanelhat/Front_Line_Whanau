interface HeroProps {
  onLaunchHub?: () => void;
}

export function Hero({ onLaunchHub }: HeroProps) {
  return (
    <section
      className="hero-bg relative flex min-h-[88vh] items-center justify-center overflow-hidden px-6 pt-[calc(72px+3rem)] pb-16 text-center"
      id="hero"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="liquid-orb liquid-orb--teal top-[20%] left-[5%] h-96 w-96 opacity-80" />
        <div
          className="liquid-orb liquid-orb--amber top-[40%] right-[0%] h-80 w-80"
          style={{ animationDelay: '-8s' }}
        />
      </div>

      <div className="relative z-10 max-w-[820px]">
        <div className="privacy-badge animate-hero-fade-1 mb-8 inline-flex gap-2 tracking-normal normal-case">
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
          Built with aroha · Privacy-first for Aotearoa
        </div>

        <h1 className="animate-hero-fade-2 mb-6 text-[clamp(1.875rem,5vw,3.25rem)] font-extrabold tracking-tight">
          For the hard days — and the{' '}
          <span className="text-gradient">moments worth celebrating</span>
        </h1>

        <p className="animate-hero-fade-3 text-text-secondary mx-auto mb-6 max-w-[640px] text-lg leading-relaxed">
          Preterm and frontline journeys can be exhausting, uncertain, and full of paperwork. They
          are also full of first holds, weight-gain stickers, quiet laughs in the family room, and
          the day you finally go home.
        </p>

        <p className="animate-hero-fade-3 text-text-secondary mx-auto mb-10 max-w-[600px] text-base leading-relaxed">
          Front Line Whānau helps you navigate services, finances, and care pathways with dignity —
          while making space for joy, milestones, and the celebration of your pēpi and your
          strength as whānau.
        </p>

        <div className="glass-card animate-hero-fade-4 mx-auto mb-4 inline-flex flex-wrap justify-center gap-3 rounded-3xl p-3 sm:gap-4 sm:p-4">
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
            Enter your hub
          </button>
          <a href="#features" className="btn btn-secondary" id="hero-cta-features">
            See how we support you
          </a>
        </div>
      </div>
    </section>
  );
}
