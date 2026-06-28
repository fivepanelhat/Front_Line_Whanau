'use client';

/**
 * useConsent — React hook for consent management.
 *
 * Usage:
 *   const { hasConsent, grantConsent, revokeConsent } = useConsent('journal.write');
 */

import { useState, useCallback } from 'react';
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
  const [, setVersion] = useState(0);
  const granted = manager.hasConsent(scope);

  const grantConsent = useCallback(async () => {
    await manager.grantConsent(scope);
    setVersion((v) => v + 1);
  }, [scope, manager, setVersion]);

  const revokeConsent = useCallback(async () => {
    await manager.revokeConsent(scope);
    setVersion((v) => v + 1);
  }, [scope, manager, setVersion]);

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
