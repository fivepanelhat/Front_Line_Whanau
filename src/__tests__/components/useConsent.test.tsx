import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConsent, useConsentManager } from '../../hooks/useConsent';

// Reset the singleton between tests by clearing localStorage
beforeEach(() => {
  localStorage.clear();
  // Force re-instantiation of the singleton
  vi.resetModules();
});

afterEach(() => {
  localStorage.clear();
});

describe('useConsent', () => {
  it('returns default consent state for a local-only scope', () => {
    const { result } = renderHook(() => useConsent('journal.read'));
    // journal.read is granted by default
    expect(result.current.hasConsent).toBe(true);
  });

  it('returns false for a server-sync scope by default', () => {
    const { result } = renderHook(() => useConsent('vault.sync'));
    expect(result.current.hasConsent).toBe(false);
  });

  it('grantConsent sets hasConsent to true', async () => {
    const { result } = renderHook(() => useConsent('ai.process'));

    expect(result.current.hasConsent).toBe(false);

    await act(async () => {
      await result.current.grantConsent();
    });

    expect(result.current.hasConsent).toBe(true);
  });

  it('revokeConsent sets hasConsent to false', async () => {
    const { result } = renderHook(() => useConsent('journal.read'));

    expect(result.current.hasConsent).toBe(true);

    await act(async () => {
      await result.current.revokeConsent();
    });

    expect(result.current.hasConsent).toBe(false);
  });

  it('auditTrail grows after grant and revoke', async () => {
    const { result } = renderHook(() => useConsent('directory.share'));

    await act(async () => {
      await result.current.grantConsent();
    });
    await act(async () => {
      await result.current.revokeConsent();
    });

    expect(result.current.auditTrail.length).toBe(2);
    expect(result.current.auditTrail[0].granted).toBe(true);
    expect(result.current.auditTrail[1].granted).toBe(false);
  });
});

describe('useConsentManager', () => {
  it('exposes grantedScopes list with at least the default granted scopes', async () => {
    const { result } = renderHook(() => useConsentManager());

    // Reset to defaults first — the singleton may be contaminated by earlier tests
    await act(async () => {
      await result.current.resetToDefaults();
    });

    // After reset, vault.store and journal.write are always default-granted
    expect(result.current.manager.getGrantedScopes()).toContain('journal.write');
    expect(result.current.manager.getGrantedScopes()).toContain('vault.store');
    // ai.process, vault.sync, directory.share are default-denied
    expect(result.current.manager.getGrantedScopes()).not.toContain('ai.process');
  });

  it('exportState returns valid JSON with version and consents', () => {
    const { result } = renderHook(() => useConsentManager());
    const exported = result.current.exportState();
    const parsed = JSON.parse(exported);
    expect(parsed.version).toBe(1);
    expect(parsed.consents).toBeDefined();
  });
});
