'use client';

import { useState } from 'react';

export function OrganisationUploadForm() {
 const [isLoading, setIsLoading] = useState(false);
 const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsLoading(true);
 setMessage(null);

 const formData = new FormData(e.currentTarget);

 try {
 const res = await fetch('/api/upload/document', {
 method: 'POST',
 body: formData, // Sending raw FormData for multipart processing
 });

 if (!res.ok) throw new Error('Failed to upload document');

 setMessage({ type: 'success', text: 'Document uploaded and securely encrypted successfully.' });
 (e.target as HTMLFormElement).reset();
 } catch (err: any) {
 setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6 bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border">
 <div>
 <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Secure Document Upload</h2>
 <p className="text-sm text-text-muted mt-1">Upload clinical guidelines, forms, or resources. Files are encrypted by default via the Taonga Vault.</p>
 </div>

 {message && (
 <div role="alert" aria-live="polite" className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-accent-success/10 text-accent-success border border-accent-success/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
 {message.text}
 </div>
 )}

 <div>
 <label htmlFor="file-upload" className="block text-sm font-medium text-text-secondary mb-1">Select File *</label>
 <input
 id="file-upload"
 required
 name="file"
 type="file"
 accept=".pdf,.doc,.docx,.txt"
 className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-text-primary hover:file:bg-white/15"
 />
 </div>

 <div>
 <label htmlFor="filename-input" className="block text-sm font-medium text-text-secondary mb-1">Display Title (Optional)</label>
 <input id="filename-input" name="filename" type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="Leave blank to use original filename" />
 </div>

 <div className="flex items-start space-x-3 bg-white/[0.03] p-4 rounded-lg border border-border">
 <div className="flex items-center h-5">
 <input id="is_encrypted" defaultChecked name="is_encrypted" type="checkbox" className="w-4 h-4 rounded border-border focus:ring-accent-primary" />
 </div>
 <div className="flex-1 text-sm">
 <label htmlFor="is_encrypted" className="font-medium text-text-secondary">Apply Taonga Vault Encryption</label>
 <p className="text-text-muted">Encrypt this file securely at rest. Note: Encrypted files cannot be processed by the AI RAG pipeline.</p>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full bg-accent-success hover:opacity-90 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
 >
 {isLoading ? 'Uploading...' : 'Securely Upload Document'}
 </button>
 </form>
 );
}
