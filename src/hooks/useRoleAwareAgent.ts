'use client';

import { useRole } from '@/context';

export function useRoleAwareAgent() {
  const { role } = useRole();

  const ask = async (query: string): Promise<string> => {
    if (!role) {
      throw new Error('User role is not set. Please select a role first.');
    }

    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        userRole: role,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get response from AI assistant');
    }

    const data = await res.json();
    return data.response;
  };

  return { ask, role };
}
