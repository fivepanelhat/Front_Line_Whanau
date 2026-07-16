'use client';

import { useEffect, useState } from 'react';
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
 return <div className="flex items-center justify-center min-h-screen text-text-secondary">Loading...</div>;
 }

 return (
 <div className="min-h-screen bg-bg-primary">
 {/* nav, not <header>: the site Header already provides the banner landmark */}
 <nav aria-label="Portal" className="border-b border-border bg-bg-secondary/80 backdrop-blur">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
 <div className="font-semibold text-lg sm:text-xl text-text-primary">Front Line Whanau</div>
 <PortalSwitcher />
 </div>
 </nav>
 <main>{children}</main>
 </div>
 );
}
