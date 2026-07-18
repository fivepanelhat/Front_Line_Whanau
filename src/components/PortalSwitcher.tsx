'use client';

import { useRole } from '@/context';
import { useRouter } from 'next/navigation';

export default function PortalSwitcher() {
  const { role, setRole, clearRole } = useRole();
  const router = useRouter();

  const switchRole = (newRole: 'parent' | 'practitioner') => {
    setRole(newRole);
    router.push(`/${newRole}`);
  };

  if (!role) return null;

  return (
    <div className="bg-bg-secondary border-border flex items-center gap-2 rounded-lg border px-2 py-1.5 sm:px-3">
      <span className="text-text-muted hidden text-xs sm:inline sm:text-sm">Switch to:</span>

      {role === 'parent' ? (
        <button
          onClick={() => switchRole('practitioner')}
          className="bg-accent-secondary/15 text-accent-secondary hover:bg-accent-secondary/25 rounded-md px-2 py-1 text-xs transition sm:px-3 sm:text-sm"
        >
          Practitioner
        </button>
      ) : (
        <button
          onClick={() => switchRole('parent')}
          className="bg-accent-primary/15 text-accent-primary hover:bg-accent-primary/25 rounded-md px-2 py-1 text-xs transition sm:px-3 sm:text-sm"
        >
          Parent
        </button>
      )}

      <button
        onClick={() => {
          clearRole();
          router.push('/');
        }}
        className="text-text-muted ml-1 text-xs hover:text-red-400 sm:ml-2"
      >
        Exit
      </button>
    </div>
  );
}
