'use client';

import { useState } from 'react';

export function DirectoryListingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/upload/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to submit listing');

      setMessage({ type: 'success', text: 'Directory listing submitted successfully for review.' });
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
          Submit Directory Listing
        </h2>
        <p className="text-text-muted mt-1 text-sm">
          Add your organisation's services to the national directory.
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

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="organisation-input"
            className="text-text-secondary mb-1 block text-sm font-medium"
          >
            Organisation Name *
          </label>
          <input
            id="organisation-input"
            required
            name="organisation"
            type="text"
            className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
            placeholder="e.g. Plunket"
          />
        </div>

        <div>
          <label
            htmlFor="service_type-input"
            className="text-text-secondary mb-1 block text-sm font-medium"
          >
            Service Type *
          </label>
          <input
            id="service_type-input"
            required
            name="service_type"
            type="text"
            className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
            placeholder="e.g. Antenatal Care"
          />
        </div>

        <div>
          <label
            htmlFor="region-input"
            className="text-text-secondary mb-1 block text-sm font-medium"
          >
            Region *
          </label>
          <input
            id="region-input"
            required
            name="region"
            type="text"
            className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
            placeholder="e.g. Auckland"
          />
        </div>

        <div>
          <label
            htmlFor="contact_email-input"
            className="text-text-secondary mb-1 block text-sm font-medium"
          >
            Contact Email
          </label>
          <input
            id="contact_email-input"
            name="contact_email"
            type="email"
            className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
            placeholder="hello@organisation.org.nz"
          />
        </div>

        <div>
          <label
            htmlFor="contact_phone-input"
            className="text-text-secondary mb-1 block text-sm font-medium"
          >
            Contact Phone
          </label>
          <input
            id="contact_phone-input"
            name="contact_phone"
            type="tel"
            className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
            placeholder="0800 123 456"
          />
        </div>

        <div>
          <label
            htmlFor="website_url-input"
            className="text-text-secondary mb-1 block text-sm font-medium"
          >
            Website URL
          </label>
          <input
            id="website_url-input"
            name="website_url"
            type="url"
            className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description-input"
          className="text-text-secondary mb-1 block text-sm font-medium"
        >
          Description *
        </label>
        <textarea
          id="description-input"
          required
          name="description"
          rows={4}
          className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 transition outline-none focus:ring-2"
          placeholder="Describe the services your organisation provides..."
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-accent-success w-full rounded-lg py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Listing'}
      </button>
    </form>
  );
}
