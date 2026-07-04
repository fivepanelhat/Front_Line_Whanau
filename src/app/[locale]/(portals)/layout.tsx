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

  // Redirect in an effect, not during render: a render-time redirect() races
  // the RoleSelector's setRole(): the click's context update and the Link
  // navigation land in different passes, so this layout could render with the
  // stale null role and bounce straight back to the home page.
  useEffect(() => {
    if (!isLoading && !role) {
      router.replace('/');
    }
  }, [role, isLoading, router]);

  if (isLoading || !role) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
