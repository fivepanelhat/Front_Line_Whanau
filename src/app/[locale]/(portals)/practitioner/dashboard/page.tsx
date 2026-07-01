'use client';

import { useState, useEffect } from 'react';
import { encrypt, decrypt } from '@/lib/encryption';

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
          encrypted_content: JSON.stringify(encryptedPayload)
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

  const DecryptedNote = ({ note }: { note: any }) => {
    const [decryptedText, setDecryptedText] = useState('Decrypting...');
    
    useEffect(() => {
      if (isUnlocked) {
        try {
          const payload = JSON.parse(note.encrypted_content);
          decrypt(payload, passphrase).then(setDecryptedText).catch(() => setDecryptedText('Decryption failed'));
        } catch (err) {
          setDecryptedText('Invalid encrypted payload');
        }
      }
    }, [note, isUnlocked]);

    return <p className="text-gray-700 whitespace-pre-wrap">{decryptedText}</p>;
  };

  if (!isUnlocked) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Practitioner Vault</h1>
        <p className="text-gray-600 mb-8">Enter your Taonga Vault passphrase to unlock and decrypt your patient notes locally. We never store this passphrase.</p>
        
        <form onSubmit={handleUnlock} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Passphrase</label>
            <input 
              type="password" 
              required
              value={passphrase} 
              onChange={e => setPassphrase(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700">
            Unlock Vault
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Patient Notes</h1>
        
        <form onSubmit={handleSaveNote} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">New Encrypted Note</h2>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Reference (Plaintext)</label>
            <input 
              type="text" 
              value={patientRef} 
              onChange={e => setPatientRef(e.target.value)}
              placeholder="e.g. Patient A"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Note (Encrypted locally)</label>
            <textarea 
              required
              rows={5}
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Encrypting & Saving...' : 'Save Securely'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved Notes</h2>
        {notes.length === 0 ? (
          <div className="text-gray-500">No notes found.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-900">{note.patient_reference || 'Unnamed Note'}</h3>
                <span className="text-xs text-gray-500">{new Date(note.created_at).toLocaleString()}</span>
              </div>
              <DecryptedNote note={note} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
