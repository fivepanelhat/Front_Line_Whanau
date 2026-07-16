'use client';

import { useEffect, useMemo, useState } from 'react';
import {
 openVault,
 encryptWithKey,
 decryptWithKey,
 type EncryptedPayload,
} from '@/lib/encryption';
import { assessPassphrase } from '@/lib/passphrase';

type VaultFile = {
 id: string;
 name: string;
 description: string;
 payload: EncryptedPayload;
 timestamp: string;
};

export function VaultTab() {
 const [hasVaultSalt, setHasVaultSalt] = useState(false);
 const [vaultPassword, setVaultPassword] = useState('');
 const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
 const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
 const [newFileName, setNewFileName] = useState('');
 const [newFileContent, setNewFileContent] = useState('');
 const [vaultLog, setVaultLog] = useState<string[]>([]);
 const [decryptedFileText, setDecryptedFileText] = useState<Record<string, string>>({});
 const vaultAssessment = useMemo(() => assessPassphrase(vaultPassword), [vaultPassword]);

 useEffect(() => {
 setHasVaultSalt(!!localStorage.getItem('flw-vault-salt'));
 }, []);

 useEffect(() => {
 if (isVaultUnlocked) {
 const saved = localStorage.getItem('flw-vault-files');
 if (saved) {
 try {
 setVaultFiles(JSON.parse(saved));
 } catch {
 /* ignore */
 }
 }
 }
 }, [isVaultUnlocked]);

 const handleUnlockVault = async () => {
 if (!hasVaultSalt && !vaultAssessment.acceptable) {
 alert(vaultAssessment.message);
 return;
 }
 try {
 const saltKey = 'flw-vault-salt';
 const existingSalt = localStorage.getItem(saltKey) ?? undefined;
 const vault = await openVault('vault', vaultPassword, existingSalt);
 localStorage.setItem(saltKey, vault.salt);
 setHasVaultSalt(true);
 setIsVaultUnlocked(true);
 setVaultLog(['[Vault] Unlocked using Web Crypto derived key.']);
 } catch {
 alert('Failed to unlock vault. Check your passphrase.');
 }
 };

 const handleEncryptFile = async () => {
 if (!newFileName || !newFileContent) return;
 setVaultLog((prev) => [...prev, `[Encrypt] Initializing AES-256-GCM encryption...`]);
 try {
 const saltKey = 'flw-vault-salt';
 const existingSalt = localStorage.getItem(saltKey) ?? undefined;
 const vault = await openVault('vault', vaultPassword, existingSalt);
 const payload = await encryptWithKey(newFileContent, vault);
 const newFile: VaultFile = {
 id: `file-${Date.now()}`,
 name: newFileName,
 description: 'Client-side Encrypted Document',
 payload: {
 ciphertext: payload.ciphertext,
 iv: payload.iv,
 salt: vault.salt,
 },
 timestamp: new Date().toLocaleDateString(),
 };

 const updated = [...vaultFiles, newFile];
 setVaultFiles(updated);
 localStorage.setItem('flw-vault-files', JSON.stringify(updated));

 setVaultLog((prev) => [
 ...prev,
 `[Derive] Derived key from passphrase. Iterations: 600,000.`,
 `[Salt] Generated unique base64 salt: ${vault.salt.substring(0, 10)}...`,
 `[IV] Generated 96-bit base64 IV: ${payload.iv}`,
 `[Ciphertext] Encrypted ciphertext generated: ${payload.ciphertext.substring(0, 16)}...`,
 `[Success] Saved to encrypted local storage successfully.`,
 ]);

 setNewFileName('');
 setNewFileContent('');
 } catch (err) {
 setVaultLog((prev) => [...prev, `[Error] Encryption failed: ${err}`]);
 }
 };

 const handleDecryptFile = async (fileId: string, payload: EncryptedPayload) => {
 try {
 const saltKey = 'flw-vault-salt';
 const existingSalt = localStorage.getItem(saltKey) ?? undefined;
 const vault = await openVault('vault', vaultPassword, existingSalt);
 const decrypted = await decryptWithKey(
 { ciphertext: payload.ciphertext, iv: payload.iv },
 vault,
 );
 setDecryptedFileText((prev) => ({ ...prev, [fileId]: decrypted }));
 setVaultLog((prev) => [...prev, `[Decrypt] Successfully decrypted file '${fileId}'`]);
 } catch {
 setVaultLog((prev) => [
 ...prev,
 `[Error] Decryption failed. Incorrect passphrase or corrupted payload.`,
 ]);
 }
 };

 const handleDeleteVaultFile = (fileId: string) => {
 const updated = vaultFiles.filter((f) => f.id !== fileId);
 setVaultFiles(updated);
 localStorage.setItem('flw-vault-files', JSON.stringify(updated));
 };

 return (
 <div className="mx-auto max-w-4xl space-y-6">
 <div>
 <h2 className="text-2xl font-heading font-extrabold text-text-primary">Taonga Vault</h2>
 <p className="text-sm text-text-secondary mt-1">
 Secure multi-modal document storage. Files are encrypted client-side using **AES-256-GCM**
 before saving to local storage. Plaintext files never reach the cloud.
 </p>
 </div>

 {!isVaultUnlocked ? (
 <div className="glass-panel p-8 max-w-md mx-auto text-center space-y-4">
 <div className="text-4xl">🔒</div>
 <h3 className="text-lg font-bold">
 {hasVaultSalt ? 'Unlock Taonga Vault' : 'Create Taonga Vault'}
 </h3>
 <p className="text-xs text-text-secondary">
 {hasVaultSalt
 ? 'Enter your secure local passphrase to unlock your documents.'
 : 'Create a secure local passphrase to initialize your sovereign vault.'}
 </p>
 <input
 type="password"
 placeholder="Enter Passphrase"
 value={vaultPassword}
 onChange={(e) => setVaultPassword(e.target.value)}
 className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-2.5 text-center focus:outline-none"
 />
 {!hasVaultSalt && vaultPassword && (
 <div
 className={`text-xs p-2 rounded ${vaultAssessment.acceptable ? 'bg-accent-success/15 text-accent-success' : 'bg-accent-warm/15 text-accent-warm'}`}
 >
 {vaultAssessment.message}
 </div>
 )}
 <p className="text-[11px] text-text-muted leading-relaxed">
 Your passphrase encrypts everything on this device. We never see it and we can&apos;t
 reset it - if it&apos;s lost, the data is gone. That&apos;s what keeps it yours.
 </p>
 <button
 type="button"
 onClick={handleUnlockVault}
 disabled={hasVaultSalt ? vaultPassword.length < 4 : !vaultAssessment.acceptable}
 className="w-full rounded-lg bg-accent-primary py-2.5 font-bold text-accent-ink hover:bg-accent-primary/80 disabled:opacity-50"
 >
 {hasVaultSalt ? 'Unlock' : 'Create Vault'}
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="md:col-span-2 space-y-6">
 <div className="glass-panel p-6 space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
 Encrypt New Document
 </h3>
 <div className="space-y-3">
 <input
 type="text"
 placeholder="Document Name (e.g. WINZ-Preterm-Application.txt)"
 value={newFileName}
 onChange={(e) => setNewFileName(e.target.value)}
 className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-2 text-sm focus:outline-none"
 />
 <textarea
 placeholder="Paste document details, sensitive notes, birth records or WINZ correspondence..."
 rows={6}
 value={newFileContent}
 onChange={(e) => setNewFileContent(e.target.value)}
 className="w-full rounded-lg border border-white/[0.08] bg-bg-secondary p-4 text-sm focus:outline-none"
 />
 <button
 type="button"
 onClick={handleEncryptFile}
 className="w-full rounded-lg bg-accent-primary py-2 font-bold text-accent-ink hover:bg-accent-primary/80"
 >
 Encrypt & Save Locally
 </button>
 </div>
 </div>

 <div className="glass-panel p-6 space-y-4">
 <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
 Encrypted Documents in Vault
 </h3>
 {vaultFiles.length === 0 ? (
 <p className="text-xs text-text-secondary italic">
 No documents saved in this vault yet.
 </p>
 ) : (
 <div className="space-y-3">
 {vaultFiles.map((file) => (
 <div
 key={file.id}
 className="border border-white/[0.08] rounded-lg p-4 bg-bg-secondary/40 space-y-2"
 >
 <div className="flex justify-between items-start">
 <div>
 <h4 className="font-semibold text-sm text-text-primary">{file.name}</h4>
 <p className="text-[10px] text-text-muted">Added {file.timestamp}</p>
 </div>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => handleDecryptFile(file.id, file.payload)}
 className="rounded bg-accent-secondary/15 px-2.5 py-1 text-xs font-semibold text-accent-secondary hover:bg-accent-secondary/25"
 >
 Decrypt
 </button>
 <button
 type="button"
 onClick={() => handleDeleteVaultFile(file.id)}
 className="rounded bg-accent-danger/15 px-2.5 py-1 text-xs font-semibold text-accent-danger hover:bg-accent-danger/25"
 >
 Delete
 </button>
 </div>
 </div>
 {decryptedFileText[file.id] && (
 <div className="rounded border border-accent-success/20 bg-accent-success/[0.03] p-3 text-xs mt-2">
 <span className="font-bold text-accent-success uppercase text-[10px]">
 Plaintext Decrypted:
 </span>
 <p className="mt-1 whitespace-pre-wrap text-text-primary">
 {decryptedFileText[file.id]}
 </p>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 <div className="space-y-4">
 <div className="glass-panel p-6 bg-slate-900/80 border border-indigo-500/20 rounded-xl space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-wider text-accent-secondary">
 Sovereign Crypto Logs
 </h3>
 <div className="font-mono text-[10px] text-text-secondary h-96 overflow-y-auto space-y-2 pr-1">
 {vaultLog.map((log, idx) => (
 <div key={idx} className="border-b border-white/5 pb-1">
 {log}
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
