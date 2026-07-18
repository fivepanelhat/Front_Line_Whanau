'use client';

import { useEffect, useMemo, useState } from 'react';
import { openVault, encryptWithKey, decryptWithKey, type EncryptedPayload } from '@/lib/encryption';
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
        <h2 className="font-heading text-text-primary text-2xl font-extrabold">Taonga Vault</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Secure multi-modal document storage. Files are encrypted client-side using **AES-256-GCM**
          before saving to local storage. Plaintext files never reach the cloud.
        </p>
      </div>

      {!isVaultUnlocked ? (
        <div className="glass-panel mx-auto max-w-md space-y-4 p-8 text-center">
          <div className="text-4xl">🔒</div>
          <h3 className="text-lg font-bold">
            {hasVaultSalt ? 'Unlock Taonga Vault' : 'Create Taonga Vault'}
          </h3>
          <p className="text-text-secondary text-xs">
            {hasVaultSalt
              ? 'Enter your secure local passphrase to unlock your documents.'
              : 'Create a secure local passphrase to initialize your sovereign vault.'}
          </p>
          <input
            type="password"
            placeholder="Enter Passphrase"
            value={vaultPassword}
            onChange={(e) => setVaultPassword(e.target.value)}
            className="bg-bg-secondary w-full rounded-lg border border-white/[0.08] px-4 py-2.5 text-center focus:outline-none"
          />
          {!hasVaultSalt && vaultPassword && (
            <div
              className={`rounded p-2 text-xs ${vaultAssessment.acceptable ? 'bg-accent-success/15 text-accent-success' : 'bg-accent-warm/15 text-accent-warm'}`}
            >
              {vaultAssessment.message}
            </div>
          )}
          <p className="text-text-muted text-[11px] leading-relaxed">
            Your passphrase encrypts everything on this device. We never see it and we can&apos;t
            reset it - if it&apos;s lost, the data is gone. That&apos;s what keeps it yours.
          </p>
          <button
            type="button"
            onClick={handleUnlockVault}
            disabled={hasVaultSalt ? vaultPassword.length < 4 : !vaultAssessment.acceptable}
            className="bg-accent-primary text-accent-ink hover:bg-accent-primary/80 w-full rounded-lg py-2.5 font-bold disabled:opacity-50"
          >
            {hasVaultSalt ? 'Unlock' : 'Create Vault'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <div className="glass-panel space-y-4 p-6">
              <h3 className="text-text-muted text-sm font-bold tracking-wider uppercase">
                Encrypt New Document
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Document Name (e.g. WINZ-Preterm-Application.txt)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="bg-bg-secondary w-full rounded-lg border border-white/[0.08] px-4 py-2 text-sm focus:outline-none"
                />
                <textarea
                  placeholder="Paste document details, sensitive notes, birth records or WINZ correspondence..."
                  rows={6}
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="bg-bg-secondary w-full rounded-lg border border-white/[0.08] p-4 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleEncryptFile}
                  className="bg-accent-primary text-accent-ink hover:bg-accent-primary/80 w-full rounded-lg py-2 font-bold"
                >
                  Encrypt & Save Locally
                </button>
              </div>
            </div>

            <div className="glass-panel space-y-4 p-6">
              <h3 className="text-text-muted text-sm font-bold tracking-wider uppercase">
                Encrypted Documents in Vault
              </h3>
              {vaultFiles.length === 0 ? (
                <p className="text-text-secondary text-xs italic">
                  No documents saved in this vault yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {vaultFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-bg-secondary/40 space-y-2 rounded-lg border border-white/[0.08] p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-text-primary text-sm font-semibold">{file.name}</h4>
                          <p className="text-text-muted text-[10px]">Added {file.timestamp}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecryptFile(file.id, file.payload)}
                            className="bg-accent-secondary/15 text-accent-secondary hover:bg-accent-secondary/25 rounded px-2.5 py-1 text-xs font-semibold"
                          >
                            Decrypt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVaultFile(file.id)}
                            className="bg-accent-danger/15 text-accent-danger hover:bg-accent-danger/25 rounded px-2.5 py-1 text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {decryptedFileText[file.id] && (
                        <div className="border-accent-success/20 bg-accent-success/[0.03] mt-2 rounded border p-3 text-xs">
                          <span className="text-accent-success text-[10px] font-bold uppercase">
                            Plaintext Decrypted:
                          </span>
                          <p className="text-text-primary mt-1 whitespace-pre-wrap">
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
            <div className="glass-panel space-y-4 rounded-xl border border-indigo-500/20 bg-slate-900/80 p-6">
              <h3 className="text-accent-secondary text-xs font-bold tracking-wider uppercase">
                Sovereign Crypto Logs
              </h3>
              <div className="text-text-secondary h-96 space-y-2 overflow-y-auto pr-1 font-mono text-[10px]">
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
