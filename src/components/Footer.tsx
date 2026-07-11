export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden pb-8 pt-20 text-center" id="site-footer">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <div className="relative mx-auto max-w-site px-6">
        <div className="glass-card mx-auto mb-10 max-w-2xl rounded-3xl px-6 py-8">
          <p className="mb-2 font-heading text-lg italic text-text-secondary">
            &ldquo;He aha te mea nui o te ao? He tāngata, he tāngata, he tāngata.&rdquo;
          </p>
          <p className="text-sm text-text-muted">
            What is the most important thing in the world? It is people, it is people, it is people.
          </p>
        </div>

        <ul className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
          {[
            {
              href: 'https://www.temanararaunga.maori.nz/',
              label: 'Te Mana Raraunga',
              id: 'footer-link-tmr',
              external: true,
            },
            {
              href: 'https://github.com/fivepanelhat/Front_Line_Whanau',
              label: 'GitHub',
              id: 'footer-link-github',
              external: true,
            },
            { href: '#features', label: 'Features', id: 'footer-link-features' },
            { href: '#values', label: 'Values', id: 'footer-link-values' },
          ].map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="rounded-full border border-transparent px-3 py-1.5 text-sm text-text-muted transition-all hover:border-white/10 hover:bg-white/5 hover:text-text-primary"
                id={link.id}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs text-text-muted">
          &copy; {year} Front Line Whānau. Apache-2.0. Built with aroha in Aotearoa.
        </p>
      </div>
    </footer>
  );
}
