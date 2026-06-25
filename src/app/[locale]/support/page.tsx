'use client';

import { Dashboard } from '@/components/Dashboard';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();

  return (
    <Dashboard 
      initialTab="ai" 
      onClose={() => router.push('/')} 
    />
  );
}
