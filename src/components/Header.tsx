import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-bg-primary/85 backdrop-blur-xl transition-colors duration-250"
      id="site-header"
    >
      <div className="mx-auto flex h-[72px] max-w-site items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-text-primary hover:text-text-primary"
          id="logo-link"
        >
          <Image
            src="/favicon.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          <span>
            Front Line <span className="text-gradient">Whānau</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Main navigation">
          <ul className="hidden list-none gap-8 md:flex">
            <li>
              <a
                href="#features"
                className="nav-underline relative pb-1 text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary"
                id="nav-features"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="#values"
                className="nav-underline relative pb-1 text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary"
                id="nav-values"
              >
                Values
              </a>
            </li>
            <li>
              <a
                href="#getting-started"
                className="nav-underline relative pb-1 text-sm font-medium tracking-wide text-text-secondary hover:text-text-primary"
                id="nav-start"
              >
                Get Started
              </a>
            </li>
          </ul>
        </nav>

        {/* Privacy Badge */}
        <div className="privacy-badge" id="privacy-badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Privacy-First
        </div>
      </div>
    </header>
  );
}
