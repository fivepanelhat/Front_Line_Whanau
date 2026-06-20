import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, hashForAudit } from './encryption';

describe('Encryption Library', () => {
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
});
