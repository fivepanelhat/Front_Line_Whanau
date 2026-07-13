'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="glass-nav mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-text-primary sm:text-xl"
          onClick={closeMenu}
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-sm text-white shadow-glow"
          >
            F
          </span>
          <span className="text-gradient font-heading">Front Line Whānau</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {[
            { href: `/${locale}/directory`, label: 'Directory' },
            { href: `/${locale}/resources`, label: 'Resources' },
            { href: `/${locale}/support`, label: 'Support' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-underline rounded-xl px-3.5 py-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-primary transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            Log in
          </button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            data-testid="mobile-menu-btn"
            ref={buttonRef}
            onClick={toggleMenu}
            className="rounded-xl p-2 transition-colors hover:bg-white/10"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div ref={menuRef} className="mx-auto mt-2 max-w-7xl md:hidden">
          <div className="glass-nav rounded-2xl px-5 py-5">
            <div className="flex flex-col space-y-1 text-base font-medium">
              {[
                { href: `/${locale}/directory`, label: 'Directory' },
                { href: `/${locale}/resources`, label: 'Resources' },
                { href: `/${locale}/support`, label: 'Support' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-3 transition-colors hover:bg-white/5 hover:text-accent-primary"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-white/10 pt-4">
                <LanguageSwitcher />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                  onClick={closeMenu}
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
