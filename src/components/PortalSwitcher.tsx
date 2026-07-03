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
    <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 shadow-sm">
      <span className="text-sm text-gray-500">Switch to:</span>
      
      {role === 'parent' ? (
        <button
          onClick={() => switchRole('practitioner')}
          className="text-sm px-3 py-1 bg-cyan-100 text-cyan-800 rounded-md hover:bg-cyan-200 transition"
        >
          Practitioner View
        </button>
      ) : (
        <button
          onClick={() => switchRole('parent')}
          className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
        >
          Parent View
        </button>
      )}

      <button
        onClick={() => {
          clearRole();
          router.push('/');
        }}
        className="text-xs text-gray-500 hover:text-red-600 ml-2"
      >
        Change Role
      </button>
    </div>
  );
}
