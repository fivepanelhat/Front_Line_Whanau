/**
 * Encryption Library - Client-Side AES-256-GCM
 *
 * All encryption happens in the browser using the Web Crypto API.
 * No plaintext sensitive data ever leaves the client.
 *
 * Key derivation: PBKDF2 (passphrase + salt -> AES key)
 * Encryption: AES-256-GCM (authenticated encryption)
 * Hashing: SHA-256 (for consent audit trails)
 */

// -- Types ----------------------------------------------------

export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded initialisation vector */
  iv: string;
  /** Base64-encoded salt used for key derivation */
  salt: string;
}

/** A vault = one derived key + one salt, opened once per session, held in memory only. */
export interface VaultKey {
  key: CryptoKey;
  salt: string; // base64, persisted per-vault (NOT per-entry)
}

export interface EntryPayload {
  ciphertext: string; // base64
  iv: string; // base64 - UNIQUE per entry (never reused with this key)
}

// -- Constants ------------------------------------------------

const PBKDF2_ITERATIONS = 600_000; // OWASP recommended minimum
const KEY_LENGTH = 256; // AES-256
const SALT_LENGTH = 16; // 128-bit salt
const IV_LENGTH = 12; // 96-bit IV for GCM

const cache = new Map<string, VaultKey>(); // namespace -> key (cleared on lock/unload)

// -- Key Derivation -------------------------------------------

/**
 * Derive an AES-256 key from a passphrase using PBKDF2.
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toCryptoBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Derive an HMAC key from a passphrase using PBKDF2.
 */
export async function deriveHmacKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toCryptoBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign', 'verify'],
  );
}

/**
 * Generate a random salt for key derivation.
 */
export function generateSalt(): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(SALT_LENGTH);
  const bytes = new Uint8Array(buffer);
  return crypto.getRandomValues(bytes);
}

/**
 * Generate a random initialisation vector for AES-GCM.
 */
export function generateIV(): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(IV_LENGTH);
  const bytes = new Uint8Array(buffer);
  return crypto.getRandomValues(bytes);
}

// -- Vault Management -----------------------------------------

export async function openVault(
  namespace: string,
  passphrase: string,
  existingSaltB64?: string,
): Promise<VaultKey> {
  const cached = cache.get(namespace);
  if (cached) return cached;

  const salt = existingSaltB64 ? base64ToBuffer(existingSaltB64) : generateSalt();
  const key = await deriveKey(passphrase, salt); // PBKDF2 600k - ONCE
  const vault: VaultKey = { key, salt: bufferToBase64(salt) };
  cache.set(namespace, vault);
  return vault;
}

export function lockVault(namespace: string) {
  cache.delete(namespace); // forget the key; passphrase is never stored
}

export async function encryptWithKey(data: string, vault: VaultKey): Promise<EntryPayload> {
  const iv = generateIV(); // fresh per call - critical for GCM
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    vault.key,
    new TextEncoder().encode(data),
  );
  return { ciphertext: bufferToBase64(ct), iv: bufferToBase64(iv) };
}

export async function decryptWithKey(payload: EntryPayload, vault: VaultKey): Promise<string> {
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toCryptoBuffer(base64ToBuffer(payload.iv)) },
    vault.key,
    toCryptoBuffer(base64ToBuffer(payload.ciphertext)),
  );
  return new TextDecoder().decode(pt);
}

// -- Encryption -----------------------------------------------

/**
 * Encrypt data using AES-256-GCM.
 *
 * @param data - The plaintext string to encrypt
 * @param passphrase - The user's passphrase
 * @returns Encrypted payload with ciphertext, IV, and salt (all base64)
 */
export async function encrypt(data: string, passphrase: string): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(passphrase, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data),
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
}

/**
 * Decrypt data using AES-256-GCM.
 *
 * @param payload - The encrypted payload (ciphertext, IV, salt)
 * @param passphrase - The user's passphrase
 * @returns The decrypted plaintext string
 */
export async function decrypt(payload: EncryptedPayload, passphrase: string): Promise<string> {
  const decoder = new TextDecoder();
  const salt = base64ToBuffer(payload.salt);
  const iv = toCryptoBuffer(base64ToBuffer(payload.iv));
  const ciphertext = toCryptoBuffer(base64ToBuffer(payload.ciphertext));
  const key = await deriveKey(passphrase, salt);

  const plaintextBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);

  return decoder.decode(plaintextBuffer);
}

// -- Hashing --------------------------------------------------

/**
 * Hash data using SHA-256 for consent audit trails.
 * Not for password storage - only for verifiable audit records.
 */
export async function hashForAudit(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return bufferToHex(hashBuffer);
}

// -- Utilities ------------------------------------------------

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toCryptoBuffer(buffer: Uint8Array): ArrayBuffer {
  if (
    buffer.buffer instanceof ArrayBuffer &&
    buffer.byteOffset === 0 &&
    buffer.byteLength === buffer.buffer.byteLength
  ) {
    return buffer.buffer;
  }

  const bytes = new Uint8Array(buffer.byteLength);
  bytes.set(buffer);
  return bytes.buffer;
}

// -- Added Encryption Helpers ---------------------------------

export async function encryptData(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedData);

  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv);
  result.set(encryptedArray, iv.length);

  return btoa(String.fromCharCode(...result));
}

export async function decryptData(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const binaryString = atob(encryptedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}
