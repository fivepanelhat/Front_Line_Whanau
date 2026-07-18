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

      setMessage({
        type: 'success',
        text: 'Document uploaded and securely encrypted successfully.',
      });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bg-secondary border-border space-y-6 rounded-xl border p-5 sm:p-6"
    >
      <div>
        <h2 className="text-text-primary text-lg font-semibold sm:text-xl">
          Secure Document Upload
        </h2>
        <p className="text-text-muted mt-1 text-sm">
          Upload clinical guidelines, forms, or resources. Files are encrypted by default via the
          Taonga Vault.
        </p>
      </div>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={`rounded-lg p-4 text-sm ${message.type === 'success' ? 'bg-accent-success/10 text-accent-success border-accent-success/20 border' : 'border border-red-500/20 bg-red-500/10 text-red-400'}`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="file-upload" className="text-text-secondary mb-1 block text-sm font-medium">
          Select File *
        </label>
        <input
          id="file-upload"
          required
          name="file"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary file:text-text-primary w-full rounded-lg border px-4 py-2 transition outline-none file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-white/15 focus:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="filename-input"
          className="text-text-secondary mb-1 block text-sm font-medium"
        >
          Display Title (Optional)
        </label>
        <input
          id="filename-input"
          name="filename"
          type="text"
          className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
          placeholder="Leave blank to use original filename"
        />
      </div>

      <div className="border-border flex items-start space-x-3 rounded-lg border bg-white/[0.03] p-4">
        <div className="flex h-5 items-center">
          <input
            id="is_encrypted"
            defaultChecked
            name="is_encrypted"
            type="checkbox"
            className="border-border focus:ring-accent-primary h-4 w-4 rounded"
          />
        </div>
        <div className="flex-1 text-sm">
          <label htmlFor="is_encrypted" className="text-text-secondary font-medium">
            Apply Taonga Vault Encryption
          </label>
          <p className="text-text-muted">
            Encrypt this file securely at rest. Note: Encrypted files cannot be processed by the AI
            RAG pipeline.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-accent-success w-full rounded-lg py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? 'Uploading...' : 'Securely Upload Document'}
      </button>
    </form>
  );
}
