'use client';

import PortalSwitcher from '@/components/PortalSwitcher';
import { useRole } from '@/context';
import { redirect } from 'next/navigation';

export default function PortalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!role) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-semibold text-xl">Front_Line_Whanau</div>
          <PortalSwitcher />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
