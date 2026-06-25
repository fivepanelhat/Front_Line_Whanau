'use client';

import { Dashboard } from '@/components/Dashboard';
import { useRouter } from 'next/navigation';

export default function DirectoryPage() {
  const router = useRouter();

  return (
    <Dashboard 
      initialTab="directory" 
      onClose={() => router.push('/')} 
    />
  );
}
