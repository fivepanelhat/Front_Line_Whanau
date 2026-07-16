'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEncryptedStorage } from './useEncryptedStorage';

export interface DecryptedJournalEntry {
 id: string;
 plaintext: string;
 createdAt: string;
 updatedAt: string;
 tags?: string[];
 mood?: string;
}

export function useEncryptedJournal(passphrase: string | null) {
 const { entries, isLoading, save, load, update, remove } = useEncryptedStorage('journal', passphrase);
 const [decryptedEntries, setDecryptedEntries] = useState<DecryptedJournalEntry[]>([]);
 const [isDecrypting, setIsDecrypting] = useState(false);

 // Decrypt all entries when passphrase or stored entries list change
 useEffect(() => {
 let active = true;

 async function decryptAll() {
 if (!passphrase) {
 setDecryptedEntries([]);
 return;
 }

 setIsDecrypting(true);
 const list: DecryptedJournalEntry[] = [];

 for (const entry of entries) {
 const text = await load(entry.id);
 if (text !== null) {
 list.push({
 id: entry.id,
 plaintext: text,
 createdAt: entry.metadata.createdAt,
 updatedAt: entry.metadata.updatedAt,
 tags: entry.metadata.tags,
 mood: entry.metadata.mood,
 });
 }
 }

 if (active) {
 // Sort newest first
 list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
 setDecryptedEntries(list);
 setIsDecrypting(false);
 }
 }

 decryptAll();

 return () => {
 active = false;
 };
 }, [entries, passphrase, load]);

 const addEntry = useCallback(
 async (plaintext: string, metadata?: { tags?: string[]; mood?: string }) => {
 return await save(plaintext, metadata);
 },
 [save]
 );

 const editEntry = useCallback(
 async (id: string, plaintext: string, metadata?: { tags?: string[]; mood?: string }) => {
 return await update(id, plaintext, metadata);
 },
 [update]
 );

 const deleteEntry = useCallback(
 (id: string) => {
 remove(id);
 },
 [remove]
 );

 return {
 entries: decryptedEntries,
 rawCount: entries.length,
 isLoading: isLoading || isDecrypting,
 addEntry,
 editEntry,
 deleteEntry,
 };
}
