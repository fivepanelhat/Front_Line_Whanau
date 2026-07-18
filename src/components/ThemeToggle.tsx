'use client';

import { useEffect, useState } from 'react';

/**
 * Light/dark switch. Dark is the app default (set pre-paint by the inline
 * script in the root layout); an explicit choice is persisted to
 * localStorage under `flw-theme`.
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('flw-theme', next ? 'dark' : 'light');
    } catch {
      // Storage unavailable - theme still applies for this session.
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="shadow-glass flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg transition-all hover:-translate-y-0.5 hover:bg-white/10"
    >
      {isDark === null ? (
        <span className="h-4 w-4" />
      ) : isDark ? (
        <span aria-hidden>🌙</span>
      ) : (
        <span aria-hidden>☀️</span>
      )}
    </button>
  );
}
