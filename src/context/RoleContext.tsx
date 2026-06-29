'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';

export type UserRole = 'parent' | 'practitioner' | null;

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);
const STORAGE_KEY = 'userRole';
const STORAGE_EVENT = 'role-storage-change';

function getStoredRole(): UserRole {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedRole = localStorage.getItem(STORAGE_KEY) as UserRole;
    if (savedRole === 'parent' || savedRole === 'practitioner') {
      return savedRole;
    }
  } catch {
    // Ignore storage access issues and continue with in-memory role only.
  }

  return null;
}

function subscribeToRole(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };
  const handleRoleChange = () => onStoreChange();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(STORAGE_EVENT, handleRoleChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(STORAGE_EVENT, handleRoleChange);
  };
}

function subscribeToHydration(onStoreChange: () => void) {
  if (typeof window !== 'undefined') {
    queueMicrotask(onStoreChange);
  }

  return () => {};
}

function notifyRoleChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const persistedRole = useSyncExternalStore(subscribeToRole, getStoredRole, () => null);
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const role = persistedRole;
  const isLoading = !isHydrated;

  const setRole = (newRole: UserRole) => {
    try {
      if (newRole) {
        localStorage.setItem(STORAGE_KEY, newRole);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      notifyRoleChange();
    } catch {
      // Ignore storage access issues and keep role in memory.
    }
  };

  const clearRole = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      notifyRoleChange();
    } catch {
      // Ignore storage access issues and keep role cleared in memory.
    }
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
