'use client';

import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'parent' | 'practitioner' | null;

interface RoleContextType {
 role: UserRole;
 setRole: (role: UserRole) => void;
 clearRole: () => void;
 isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
 const [role, setRoleState] = useState<UserRole>(() => {
 if (typeof window === 'undefined') return null;

 try {
 const savedRole = localStorage.getItem('userRole') as UserRole;
 if (savedRole === 'parent' || savedRole === 'practitioner') {
 return savedRole;
 }
 } catch {
 // Ignore storage access issues and continue with in-memory role only.
 }

 return null;
 });
 const isLoading = false;

 const setRole = (newRole: UserRole) => {
 setRoleState(newRole);
 try {
 if (newRole) {
 localStorage.setItem('userRole', newRole);
 } else {
 localStorage.removeItem('userRole');
 }
 } catch {
 // Ignore storage access issues and keep role in memory.
 }
 };

 const clearRole = () => {
 setRoleState(null);
 try {
 localStorage.removeItem('userRole');
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
