'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalSwitcher from '@/components/PortalSwitcher';
import { useRole } from '@/context';

export default function PortalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useRole();
  const router = useRouter();

  // Check localStorage as fallback: setRole() writes to localStorage
  // synchronously, but the React context state may not have propagated
  // yet during the same navigation tick.
  useEffect(() => {
    if (!isLoading && !role) {
      try {
        const saved = localStorage.getItem('userRole');
        if (!saved) router.replace('/');
      } catch {
        router.replace('/');
      }
    }
  }, [role, isLoading, router]);

  const hasRole = role || (typeof window !== 'undefined' && !!localStorage.getItem('userRole'));

  if (isLoading || !hasRole) {
    return <div className="flex items-center justify-center min-h-screen text-text-secondary">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border bg-bg-secondary/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="font-semibold text-lg sm:text-xl text-text-primary">Front Line Whanau</div>
          <PortalSwitcher />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
