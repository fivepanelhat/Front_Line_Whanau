'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'parent' | 'practitioner' | null;

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persist role across sessions
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole === 'parent' || savedRole === 'practitioner') {
      setRoleState(savedRole);
    }
    setIsLoading(false);
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('userRole', newRole);
    } else {
      localStorage.removeItem('userRole');
    }
  };

  const clearRole = () => {
    setRoleState(null);
    localStorage.removeItem('userRole');
  };

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
