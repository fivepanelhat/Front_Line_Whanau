export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] pb-6 pt-16 text-center" id="site-footer">
      <div className="mx-auto max-w-site px-6">
        {/* Whakataukī */}
        <p className="mb-2 font-heading text-lg italic text-text-secondary">
          &ldquo;He aha te mea nui o te ao? He tāngata, he tāngata, he tāngata.&rdquo;
        </p>
        <p className="mb-12 text-sm text-text-muted">
          What is the most important thing in the world? It is people, it is people, it is people.
        </p>

        {/* Links */}
        <ul className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <li>
            <a
              href="https://www.temanararaunga.maori.nz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted hover:text-text-primary"
              id="footer-link-tmr"
            >
              Te Mana Raraunga
            </a>
          </li>
          <li>
            <a
              href="https://github.com/fivepanelhat/Front_Line_Whanau"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted hover:text-text-primary"
              id="footer-link-github"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="#features"
              className="text-sm text-text-muted hover:text-text-primary"
              id="footer-link-features"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#values"
              className="text-sm text-text-muted hover:text-text-primary"
              id="footer-link-values"
            >
              Values
            </a>
          </li>
        </ul>

        {/* Copyright */}
        <p className="text-xs text-text-muted">
          &copy; {year} Front Line Whānau. MIT Licence. Built with aroha in Aotearoa.
        </p>
      </div>
    </footer>
  );
}
