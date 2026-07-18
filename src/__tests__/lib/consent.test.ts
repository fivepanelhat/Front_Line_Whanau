import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentManager, verifyAuditTrail } from '../../lib/consent';
import { deriveHmacKey, generateSalt } from '../../lib/encryption';

describe('Consent Manager', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should initialize with default consent states', () => {
    const manager = new ConsentManager();

    // Default allowed scopes
    expect(manager.hasConsent('journal.read')).toBe(true);
    expect(manager.hasConsent('journal.write')).toBe(true);
    expect(manager.hasConsent('vault.store')).toBe(true);

    // Default denied scopes
    expect(manager.hasConsent('journal.sync')).toBe(false);
    expect(manager.hasConsent('vault.sync')).toBe(false);
    expect(manager.hasConsent('ai.process')).toBe(false);
    expect(manager.hasConsent('ai.execute')).toBe(false);
    expect(manager.hasConsent('directory.share')).toBe(false);
  });

  it('should grant and revoke consent', async () => {
    const manager = new ConsentManager();

    expect(manager.hasConsent('journal.sync')).toBe(false);

    // Grant consent
    await manager.grantConsent('journal.sync');
    expect(manager.hasConsent('journal.sync')).toBe(true);
    expect(manager.getGrantedScopes()).toContain('journal.sync');

    // Revoke consent
    await manager.revokeConsent('journal.sync');
    expect(manager.hasConsent('journal.sync')).toBe(false);
    expect(manager.getGrantedScopes()).not.toContain('journal.sync');
  });

  it('should retrieve scope history and full audit trail', async () => {
    const manager = new ConsentManager();

    await manager.grantConsent('ai.process');
    await manager.revokeConsent('ai.process');

    const history = manager.getScopeHistory('ai.process');
    expect(history.length).toBe(2);
    expect(history[0].granted).toBe(true);
    expect(history[1].granted).toBe(false);

    const auditTrail = manager.getAuditTrail();
    expect(auditTrail.length).toBe(2);
  });

  it('should reset to default consents', async () => {
    const manager = new ConsentManager();

    await manager.grantConsent('ai.process');
    await manager.revokeConsent('journal.read');

    expect(manager.hasConsent('ai.process')).toBe(true);
    expect(manager.hasConsent('journal.read')).toBe(false);

    await manager.resetToDefaults();

    expect(manager.hasConsent('ai.process')).toBe(false);
    expect(manager.hasConsent('journal.read')).toBe(true);
  });

  it('should export consent state as JSON', () => {
    const manager = new ConsentManager();
    const exported = manager.exportState();

    const parsed = JSON.parse(exported);
    expect(parsed.version).toBe(1);
    expect(parsed.consents).toBeDefined();
    expect(parsed.auditTrail).toBeDefined();
  });

  describe('Cryptographic Audit Trail Validation', () => {
    let hmacKey: CryptoKey;

    beforeEach(async () => {
      const salt = generateSalt();
      hmacKey = await deriveHmacKey('audit-secret-passphrase', salt);
    });

    it('should verify a valid cryptographic audit trail', async () => {
      const manager = new ConsentManager();

      await manager.grantConsent('ai.process', hmacKey);
      await manager.grantConsent('vault.sync', hmacKey);
      await manager.revokeConsent('ai.process', hmacKey);

      const trail = manager.getAuditTrail();
      expect(trail.length).toBe(3);

      // Every record should have a valid signature (hash) instead of 'UNVERIFIED'
      for (const record of trail) {
        expect(record.hash).not.toBe('UNVERIFIED');
        expect(record.hash.length).toBe(64); // hex signature
      }

      const isValid = await verifyAuditTrail(hmacKey, trail);
      expect(isValid).toBe(true);
    });

    it('should fail verification if the audit trail is tampered with', async () => {
      const manager = new ConsentManager();

      await manager.grantConsent('ai.process', hmacKey);
      await manager.grantConsent('vault.sync', hmacKey);

      const trail = manager.getAuditTrail();

      // Verify first
      const beforeTamper = await verifyAuditTrail(hmacKey, trail);
      expect(beforeTamper).toBe(true);

      // Tamper: change consent value on a record
      trail[0].granted = false;

      const afterTamper = await verifyAuditTrail(hmacKey, trail);
      expect(afterTamper).toBe(false);
    });

    it('should fail verification if a record prevHash is corrupted', async () => {
      const manager = new ConsentManager();

      await manager.grantConsent('ai.process', hmacKey);
      await manager.grantConsent('vault.sync', hmacKey);

      const trail = manager.getAuditTrail();

      // Tamper: change prevHash link
      trail[1].prevHash = 'TAMPERED';

      const isValid = await verifyAuditTrail(hmacKey, trail);
      expect(isValid).toBe(false);
    });
  });
});
