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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow border border-gray-100">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Secure Document Upload</h2>
        <p className="text-sm text-gray-500 mt-1">Upload clinical guidelines, forms, or resources. Files are encrypted by default via the Taonga Vault.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select File *</label>
        <input 
          required 
          name="file" 
          type="file" 
          accept=".pdf,.doc,.docx,.txt"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Display Title (Optional)</label>
        <input name="filename" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Leave blank to use original filename" />
      </div>

      <div className="flex items-start items-center space-x-3 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center h-5">
          <input defaultChecked name="is_encrypted" type="checkbox" className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
        </div>
        <div className="flex-1 text-sm">
          <label className="font-medium text-gray-700">Apply Taonga Vault Encryption</label>
          <p className="text-gray-500">Encrypt this file securely at rest. Note: Encrypted files cannot be processed by the AI RAG pipeline.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Uploading...' : 'Securely Upload Document'}
      </button>
    </form>
  );
}
