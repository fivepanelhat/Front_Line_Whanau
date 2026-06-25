'use client';

import { Dashboard } from '@/components/Dashboard';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const router = useRouter();

  return (
    <Dashboard 
      initialTab="pathways" 
      onClose={() => router.push('/')} 
    />
  );
}
