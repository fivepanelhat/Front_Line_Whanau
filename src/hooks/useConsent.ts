'use client';

/**
 * useConsent — React hook for consent management.
 *
 * Usage:
 *   const { hasConsent, grantConsent, revokeConsent } = useConsent('journal.write');
 */

import { useState, useCallback, useEffect } from 'react';
import { ConsentManager, type ConsentScope } from '@/lib/consent';

// Singleton instance (shared across all hook users)
let managerInstance: ConsentManager | null = null;

function getManager(): ConsentManager {
  if (!managerInstance) {
    managerInstance = new ConsentManager();
  }
  return managerInstance;
}

export function useConsent(scope: ConsentScope) {
  const manager = getManager();
  const [granted, setGranted] = useState<boolean>(manager.hasConsent(scope));

  // Re-check on mount (handles SSR → client hydration)
  useEffect(() => {
    setGranted(manager.hasConsent(scope));
  }, [scope, manager]);

  const grantConsent = useCallback(async () => {
    await manager.grantConsent(scope);
    setGranted(true);
  }, [scope, manager]);

  const revokeConsent = useCallback(async () => {
    await manager.revokeConsent(scope);
    setGranted(false);
  }, [scope, manager]);

  return {
    hasConsent: granted,
    grantConsent,
    revokeConsent,
    auditTrail: manager.getScopeHistory(scope),
  };
}

/**
 * useConsentManager — access the full consent manager.
 */
export function useConsentManager() {
  const manager = getManager();

  return {
    manager,
    grantedScopes: manager.getGrantedScopes(),
    auditTrail: manager.getAuditTrail(),
    resetToDefaults: () => manager.resetToDefaults(),
    exportState: () => manager.exportState(),
  };
}
