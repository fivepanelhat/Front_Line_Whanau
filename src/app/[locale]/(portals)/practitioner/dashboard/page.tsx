'use client';

import { useState, useEffect } from 'react';
import { encrypt, decrypt } from '@/lib/encryption';

// Module scope, not inside the dashboard render: defining this inline created
// a new component type every render, remounting every note card (and
// re-running decryption) whenever any dashboard state changed.
function DecryptedNote({ note, passphrase, isUnlocked }: { note: any; passphrase: string; isUnlocked: boolean }) {
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

 if (!isUnlocked) {
 return (
 <div className="p-4 sm:p-8 max-w-xl mx-auto">
 <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-text-primary">Practitioner Vault</h1>
 <p className="text-text-secondary mb-6 sm:mb-8">Enter your Taonga Vault passphrase to unlock and decrypt your patient notes locally. We never store this passphrase.</p>

 <form onSubmit={handleUnlock} className="bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border">
 {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
 <div className="mb-4">
 <label className="block text-sm font-medium text-text-secondary mb-1">Passphrase</label>
 <input
 type="password"
 required
 value={passphrase}
 onChange={e => setPassphrase(e.target.value)}
 className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
 />
 </div>
 <button type="submit" className="w-full bg-accent-primary text-accent-ink font-medium py-3 rounded-lg hover:opacity-90 transition-opacity">
 Unlock Vault
 </button>
 </form>
 </div>
 );
 }

 return (
 <div className="p-4 sm:p-8 max-w-5xl mx-auto grid gap-6 sm:gap-8 md:grid-cols-2">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-text-primary">Patient Notes</h1>

 <form onSubmit={handleSaveNote} className="bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border mb-8">
 <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-4">New Encrypted Note</h2>
 {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

 <div className="mb-4">
 <label className="block text-sm font-medium text-text-secondary mb-1">Patient Reference (Plaintext)</label>
 <input
 type="text"
 value={patientRef}
 onChange={e => setPatientRef(e.target.value)}
 placeholder="e.g. Patient A"
 className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
 />
 </div>

 <div className="mb-4">
 <label className="block text-sm font-medium text-text-secondary mb-1">Clinical Note (Encrypted locally)</label>
 <textarea
 required
 rows={5}
 value={content}
 onChange={e => setContent(e.target.value)}
 className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
 />
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full bg-accent-primary text-accent-ink font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
 >
 {isLoading ? 'Encrypting & Saving...' : 'Save Securely'}
 </button>
 </form>
 </div>

 <div className="space-y-6">
 <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Saved Notes</h2>
 {notes.length === 0 ? (
 <div className="text-text-muted">No notes found.</div>
 ) : (
 notes.map(note => (
 <div key={note.id} className="bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border">
 <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
 <h3 className="font-bold text-text-primary">{note.patient_reference || 'Unnamed Note'}</h3>
 <span className="text-xs text-text-muted">{new Date(note.created_at).toLocaleString()}</span>
 </div>
 <DecryptedNote note={note} passphrase={passphrase} isUnlocked={isUnlocked} />
 </div>
 ))
 )}
 </div>
 </div>
 );
}
