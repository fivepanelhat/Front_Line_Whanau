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
    <form onSubmit={handleSubmit} className="space-y-6 bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Submit Directory Listing</h2>
        <p className="text-sm text-text-muted mt-1">Add your organisation's services to the national directory.</p>
      </div>

      {message && (
        <div role="alert" aria-live="polite" className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-accent-success/10 text-accent-success border border-accent-success/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="organisation-input" className="block text-sm font-medium text-text-secondary mb-1">Organisation Name *</label>
          <input id="organisation-input" required name="organisation" type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="e.g. Plunket" />
        </div>

        <div>
          <label htmlFor="service_type-input" className="block text-sm font-medium text-text-secondary mb-1">Service Type *</label>
          <input id="service_type-input" required name="service_type" type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="e.g. Antenatal Care" />
        </div>

        <div>
          <label htmlFor="region-input" className="block text-sm font-medium text-text-secondary mb-1">Region *</label>
          <input id="region-input" required name="region" type="text" className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="e.g. Auckland" />
        </div>

        <div>
          <label htmlFor="contact_email-input" className="block text-sm font-medium text-text-secondary mb-1">Contact Email</label>
          <input id="contact_email-input" name="contact_email" type="email" className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="hello@organisation.org.nz" />
        </div>

        <div>
          <label htmlFor="contact_phone-input" className="block text-sm font-medium text-text-secondary mb-1">Contact Phone</label>
          <input id="contact_phone-input" name="contact_phone" type="tel" className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="0800 123 456" />
        </div>

        <div>
          <label htmlFor="website_url-input" className="block text-sm font-medium text-text-secondary mb-1">Website URL</label>
          <input id="website_url-input" name="website_url" type="url" className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="https://..." />
        </div>
      </div>

      <div>
        <label htmlFor="description-input" className="block text-sm font-medium text-text-secondary mb-1">Description *</label>
        <textarea id="description-input" required name="description" rows={4} className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary outline-none transition" placeholder="Describe the services your organisation provides..."></textarea>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent-success hover:opacity-90 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Listing'}
      </button>
    </form>
  );
}
