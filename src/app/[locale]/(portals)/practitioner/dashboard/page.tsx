'use client';

import { useState, useEffect } from 'react';
import { encrypt, decrypt } from '@/lib/encryption';

// Module scope, not inside the dashboard render: defining this inline created
// a new component type every render, remounting every note card (and
// re-running decryption) whenever any dashboard state changed.
function DecryptedNote({
  note,
  passphrase,
  isUnlocked,
}: {
  note: any;
  passphrase: string;
  isUnlocked: boolean;
}) {
  const [decryptedText, setDecryptedText] = useState('Decrypting...');

  useEffect(() => {
    if (isUnlocked) {
      try {
        const payload = JSON.parse(note.encrypted_content);
        decrypt(payload, passphrase)
          .then(setDecryptedText)
          .catch(() => setDecryptedText('Decryption failed'));
      } catch (err) {
        setDecryptedText('Invalid encrypted payload');
      }
    }
  }, [note, isUnlocked, passphrase]);

  return <p className="text-text-secondary whitespace-pre-wrap">{decryptedText}</p>;
}

export default function PractitionerDashboard() {
  const [notes, setNotes] = useState<any[]>([]);
  const [patientRef, setPatientRef] = useState('');
  const [content, setContent] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch encrypted notes on mount
  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch('/api/practitioner/notes');
        const data = await res.json();
        if (data.notes) {
          setNotes(data.notes);
        }
      } catch (err) {
        console.error('Failed to fetch notes', err);
      }
    }
    fetchNotes();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Attempt to decrypt the first note as a test
      if (notes.length > 0) {
        const testNote = notes[0];
        const payload = JSON.parse(testNote.encrypted_content);
        await decrypt(payload, passphrase);
      }
      setIsUnlocked(true);
    } catch (err) {
      setError('Invalid passphrase. Unable to decrypt notes.');
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUnlocked) return;
    setIsLoading(true);
    setError('');

    try {
      // Encrypt the content locally
      const encryptedPayload = await encrypt(content, passphrase);

      const res = await fetch('/api/practitioner/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_reference: patientRef,
          encrypted_content: JSON.stringify(encryptedPayload),
        }),
      });

      if (!res.ok) throw new Error('Failed to save note');

      const { note } = await res.json();
      setNotes([note, ...notes]);
      setPatientRef('');
      setContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="mx-auto max-w-xl p-4 sm:p-8">
        <h1 className="text-text-primary mb-4 text-2xl font-bold sm:text-3xl">
          Practitioner Vault
        </h1>
        <p className="text-text-secondary mb-6 sm:mb-8">
          Enter your Taonga Vault passphrase to unlock and decrypt your patient notes locally. We
          never store this passphrase.
        </p>

        <form
          onSubmit={handleUnlock}
          className="bg-bg-secondary border-border rounded-xl border p-5 sm:p-6"
        >
          {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
          <div className="mb-4">
            <label className="text-text-secondary mb-1 block text-sm font-medium">Passphrase</label>
            <input
              type="password"
              required
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="bg-accent-primary text-accent-ink w-full rounded-lg py-3 font-medium transition-opacity hover:opacity-90"
          >
            Unlock Vault
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 sm:gap-8 sm:p-8 md:grid-cols-2">
      <div>
        <h1 className="text-text-primary mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
          Patient Notes
        </h1>

        <form
          onSubmit={handleSaveNote}
          className="bg-bg-secondary border-border mb-8 rounded-xl border p-5 sm:p-6"
        >
          <h2 className="text-text-primary mb-4 text-lg font-bold sm:text-xl">
            New Encrypted Note
          </h2>
          {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

          <div className="mb-4">
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Patient Reference (Plaintext)
            </label>
            <input
              type="text"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              placeholder="e.g. Patient A"
              className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 focus:ring-2"
            />
          </div>

          <div className="mb-4">
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Clinical Note (Encrypted locally)
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-accent-primary text-accent-ink w-full rounded-lg py-3 font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Encrypting & Saving...' : 'Save Securely'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-text-primary mb-2 text-xl font-bold sm:text-2xl">Saved Notes</h2>
        {notes.length === 0 ? (
          <div className="text-text-muted">No notes found.</div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-bg-secondary border-border rounded-xl border p-5 sm:p-6"
            >
              <div className="border-border mb-4 flex items-center justify-between border-b pb-2">
                <h3 className="text-text-primary font-bold">
                  {note.patient_reference || 'Unnamed Note'}
                </h3>
                <span className="text-text-muted text-xs">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
              <DecryptedNote note={note} passphrase={passphrase} isUnlocked={isUnlocked} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
