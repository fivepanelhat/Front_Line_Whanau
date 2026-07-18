export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden pt-20 pb-8 text-center" id="site-footer">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <div className="max-w-site relative mx-auto px-6">
        <div className="glass-card mx-auto mb-10 max-w-2xl rounded-3xl px-6 py-8">
          <p className="font-heading text-text-secondary mb-2 text-lg italic">
            &ldquo;He aha te mea nui o te ao? He tangata, he tangata, he tangata.&rdquo;
          </p>
          <p className="text-text-muted text-sm">
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
                className="text-text-muted hover:text-text-primary rounded-full border border-transparent px-3 py-1.5 text-sm transition-all hover:border-white/10 hover:bg-white/5"
                id={link.id}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-text-muted text-xs">
          &copy; {year} Front Line Whanau. Apache-2.0. Built with aroha in Aotearoa.
        </p>
      </div>
    </footer>
  );
}
