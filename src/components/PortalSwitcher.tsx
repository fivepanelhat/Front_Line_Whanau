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
    <div className="flex items-center gap-2 bg-bg-secondary border border-border rounded-lg px-2 sm:px-3 py-1.5">
      <span className="text-xs sm:text-sm text-text-muted hidden sm:inline">Switch to:</span>

      {role === 'parent' ? (
        <button
          onClick={() => switchRole('practitioner')}
          className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-accent-secondary/15 text-accent-secondary rounded-md hover:bg-accent-secondary/25 transition"
        >
          Practitioner
        </button>
      ) : (
        <button
          onClick={() => switchRole('parent')}
          className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-accent-primary/15 text-accent-primary rounded-md hover:bg-accent-primary/25 transition"
        >
          Parent
        </button>
      )}

      <button
        onClick={() => {
          clearRole();
          router.push('/');
        }}
        className="text-xs text-text-muted hover:text-red-400 ml-1 sm:ml-2"
      >
        Exit
      </button>
    </div>
  );
}
