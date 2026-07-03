'use client';

import { useEffect, useState } from 'react';

/**
 * Light/dark switch. Dark is the app default (set pre-paint by the inline
 * script in the root layout); an explicit choice is persisted to
 * localStorage under `flw-theme`.
 */
export default function ThemeToggle() {
  // null until mounted so SSR markup never disagrees with the client
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
      // Storage unavailable — theme still applies for this session.
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-white/10 transition-colors"
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
