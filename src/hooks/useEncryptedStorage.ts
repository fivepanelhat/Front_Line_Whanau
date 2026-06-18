'use client';

/**
 * useEncryptedStorage — Encrypt/decrypt/store flows for journal and vault.
 *
 * Wraps the encryption library with React state management
 * for seamless encrypted CRUD operations.
 *
 * Usage:
 *   const { entries, save, load, remove } = useEncryptedStorage('journal', passphrase);
 */

import { useState, useCallback, useEffect } from 'react';
import { encrypt, decrypt, type EncryptedPayload } from '@/lib/encryption';

export interface StoredEntry {
  id: string;
  encrypted: EncryptedPayload;
  metadata: {
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    mood?: string;
  };
}

export function useEncryptedStorage(namespace: string, passphrase: string | null) {
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const storageKey = `flw-${namespace}`;

  // Load entries from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch {
      // Corrupted data — start fresh
    }
    setIsLoading(false);
  }, [storageKey]);

  // Persist entries to localStorage
  const persistEntries = useCallback(
    (updated: StoredEntry[]) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Storage full
      }
    },
    [storageKey],
  );

  /**
   * Save a new encrypted entry.
   */
  const save = useCallback(
    async (
      plaintext: string,
      metadata?: { tags?: string[]; mood?: string },
    ): Promise<string | null> => {
      if (!passphrase) return null;

      try {
        const encrypted = await encrypt(plaintext, passphrase);
        const now = new Date().toISOString();
        const id = `${namespace}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        const entry: StoredEntry = {
          id,
          encrypted,
          metadata: {
            createdAt: now,
            updatedAt: now,
            ...metadata,
          },
        };

        const updated = [...entries, entry];
        setEntries(updated);
        persistEntries(updated);

        return id;
      } catch {
        return null;
      }
    },
    [passphrase, entries, namespace, persistEntries],
  );

  /**
   * Decrypt and load a single entry.
   */
  const load = useCallback(
    async (id: string): Promise<string | null> => {
      if (!passphrase) return null;

      const entry = entries.find((e) => e.id === id);
      if (!entry) return null;

      try {
        return await decrypt(entry.encrypted, passphrase);
      } catch {
        return null; // Wrong passphrase or corrupted data
      }
    },
    [passphrase, entries],
  );

  /**
   * Update an existing encrypted entry.
   */
  const update = useCallback(
    async (
      id: string,
      plaintext: string,
      metadata?: { tags?: string[]; mood?: string },
    ): Promise<boolean> => {
      if (!passphrase) return false;

      try {
        const encrypted = await encrypt(plaintext, passphrase);
        const updated = entries.map((e) =>
          e.id === id
            ? {
                ...e,
                encrypted,
                metadata: {
                  ...e.metadata,
                  ...metadata,
                  updatedAt: new Date().toISOString(),
                },
              }
            : e,
        );

        setEntries(updated);
        persistEntries(updated);
        return true;
      } catch {
        return false;
      }
    },
    [passphrase, entries, persistEntries],
  );

  /**
   * Remove an entry.
   */
  const remove = useCallback(
    (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      persistEntries(updated);
    },
    [entries, persistEntries],
  );

  return {
    entries,
    isLoading,
    save,
    load,
    update,
    remove,
    entryCount: entries.length,
  };
}
