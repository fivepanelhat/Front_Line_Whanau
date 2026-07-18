'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalSwitcher from '@/components/PortalSwitcher';
import { useRole } from '@/context';

export default function PortalsLayout({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useRole();
  const router = useRouter();
  const [localRole, setLocalRole] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userRole');
      if (saved) {
        setLocalRole(true);
      } else if (!isLoading && !role) {
        router.replace('/');
      }
    } catch {
      if (!isLoading && !role) router.replace('/');
    }
  }, [role, isLoading, router]);

  if (isLoading || (!role && !localRole)) {
    return (
      <div className="text-text-secondary flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen">
      {/* nav, not <header>: the site Header already provides the banner landmark */}
      <nav aria-label="Portal" className="border-border bg-bg-secondary/80 border-b backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="text-text-primary text-lg font-semibold sm:text-xl">
            Front Line Whanau
          </div>
          <PortalSwitcher />
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
