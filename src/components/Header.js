export function Header() {
  return `
    <header class="site-header" id="site-header">
      <div class="container header-inner">
        <a href="/" class="logo" id="logo-link">
          <img src="/favicon.svg" alt="" class="logo-icon" />
          <span>Front Line <span class="text-gradient">Whānau</span></span>
        </a>

        <nav aria-label="Main navigation">
          <ul class="nav-links">
            <li><a href="#features" id="nav-features">Features</a></li>
            <li><a href="#values" id="nav-values">Values</a></li>
            <li><a href="#getting-started" id="nav-start">Get Started</a></li>
          </ul>
        </nav>

        <div class="privacy-badge" id="privacy-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Privacy-First
        </div>
      </div>
    </header>
  `;
}
