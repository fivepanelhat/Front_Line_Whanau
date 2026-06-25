'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu when clicking outside
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
    <header className="sticky top-0 z-50 border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link 
          href={`/${locale}`} 
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-text-primary"
          onClick={closeMenu}
        >
          Front Line Whānau
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href={`/${locale}/directory`} className="hover:text-accent-primary transition-colors">
            Directory
          </Link>
          <Link href={`/${locale}/resources`} className="hover:text-accent-primary transition-colors">
            Resources
          </Link>
          <Link href={`/${locale}/support`} className="hover:text-accent-primary transition-colors">
            Support
          </Link>
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-bg-secondary transition-colors">
            Log in
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="md:hidden rounded-lg p-2 hover:bg-bg-secondary transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="md:hidden border-t border-border bg-bg-primary"
        >
          <div className="flex flex-col px-6 py-6 space-y-4 text-base font-medium">
            <Link 
              href={`/${locale}/directory`} 
              className="py-2 hover:text-accent-primary transition-colors"
              onClick={closeMenu}
            >
              Directory
            </Link>
            <Link 
              href={`/${locale}/resources`} 
              className="py-2 hover:text-accent-primary transition-colors"
              onClick={closeMenu}
            >
              Resources
            </Link>
            <Link 
              href={`/${locale}/support`} 
              className="py-2 hover:text-accent-primary transition-colors"
              onClick={closeMenu}
            >
              Support
            </Link>

            <div className="pt-4 border-t border-border">
              <LanguageSwitcher />
            </div>

            <div className="pt-2">
              <button 
                className="w-full rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-bg-secondary transition-colors"
                onClick={closeMenu}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
