import { describe, it, expect, beforeEach } from 'vitest';
import {
  encrypt,
  decrypt,
  hashForAudit,
  generateSalt,
  generateIV,
  openVault,
  lockVault,
  encryptWithKey,
  decryptWithKey,
  bufferToBase64,
  base64ToBuffer,
  bufferToHex,
  encryptData,
  decryptData,
  generateKey,
} from '../../lib/encryption';

describe('Encryption Library', () => {
  it('should encrypt and decrypt using direct AES-GCM CryptoKey helper', async () => {
    const key = await generateKey();
    const secret = 'Direct cryptographic helper payload';
    const encrypted = await encryptData(secret, key);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(secret);

    const decrypted = await decryptData(encrypted, key);
    expect(decrypted).toBe(secret);
  });

  it('should hash audit logs deterministically', async () => {
    const input = 'consent:ai.process:true';
    const hash1 = await hashForAudit(input);
    const hash2 = await hashForAudit(input);
    
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex is 64 characters
  });

  it('should encrypt and decrypt a string successfully', async () => {
    const secretMessage = 'Hello, Sovereign Whānau Support Hub!';
    const passphrase = 'secure-whanau-passphrase';

    const payload = await encrypt(secretMessage, passphrase);
    
    expect(payload.ciphertext).toBeDefined();
    expect(payload.iv).toBeDefined();
    expect(payload.salt).toBeDefined();
    expect(payload.ciphertext).not.toBe(secretMessage);

    const decrypted = await decrypt(payload, passphrase);
    expect(decrypted).toBe(secretMessage);
  });

  it('should support vault-based encryption and decryption', async () => {
    const namespace = 'test-journal';
    const passphrase = 'vault-test-passphrase';
    
    // Open a new vault
    const vault = await openVault(namespace, passphrase);
    expect(vault.salt).toBeDefined();
    expect(vault.key).toBeDefined();

    // Re-opening vault with same namespace should return cached vault
    const cachedVault = await openVault(namespace, passphrase);
    expect(cachedVault).toBe(vault);

    // Encrypt some data
    const message = 'Keep this safe';
    const entry = await encryptWithKey(message, vault);
    expect(entry.ciphertext).toBeDefined();
    expect(entry.iv).toBeDefined();

    // Decrypt the data
    const decrypted = await decryptWithKey(entry, vault);
    expect(decrypted).toBe(message);

    // Lock vault (clears cache)
    lockVault(namespace);
    
    // Re-opening after lock with the same salt should give a new key (since cache was cleared)
    const newVault = await openVault(namespace, passphrase, vault.salt);
    expect(newVault).not.toBe(vault);
    
    // But it should still be able to decrypt the message encrypted with the old vault key (since key is derived from same passphrase & salt)
    const decryptedAfterLock = await decryptWithKey(entry, newVault);
    expect(decryptedAfterLock).toBe(message);
  });

  describe('Utilities', () => {
    it('should convert buffer to base64 and back', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const b64 = bufferToBase64(data);
      expect(b64).toBe('SGVsbG8=');

      const buffer = base64ToBuffer(b64);
      expect(Array.from(buffer)).toEqual([72, 101, 108, 108, 111]);
    });

    it('should convert buffer to hex string', () => {
      const data = new Uint8Array([0, 15, 16, 255]).buffer;
      const hex = bufferToHex(data);
      expect(hex).toBe('000f10ff');
    });

    it('should generate distinct salts and IVs', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(bufferToHex(salt1.buffer)).not.toBe(bufferToHex(salt2.buffer));

      const iv1 = generateIV();
      const iv2 = generateIV();
      expect(bufferToHex(iv1.buffer)).not.toBe(bufferToHex(iv2.buffer));
    });
  });

  describe('Encryption Utilities (User-Requested)', () => {
    let key: CryptoKey;

    beforeEach(async () => {
      key = await generateKey();
    });

    it('should encrypt data and return a base64 string', async () => {
      const testData = 'Sensitive whānau information';
      const encrypted = await encryptData(testData, key);

      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different encrypted output for same input (due to random IV)', async () => {
      const testData = 'Same data';
      const encrypted1 = await encryptData(testData, key);
      const encrypted2 = await encryptData(testData, key);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error with invalid key', async () => {
      const invalidKey = {} as CryptoKey;
      await expect(encryptData('test', invalidKey)).rejects.toThrow();
    });
  });
});

