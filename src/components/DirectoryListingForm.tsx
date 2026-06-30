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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow border border-gray-100">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Submit Directory Listing</h2>
        <p className="text-sm text-gray-500 mt-1">Add your organisation's services to the national directory.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name *</label>
          <input required name="organisation" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="e.g. Plunket" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
          <input required name="service_type" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="e.g. Antenatal Care" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
          <input required name="region" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="e.g. Auckland" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
          <input name="contact_email" type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="hello@organisation.org.nz" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
          <input name="contact_phone" type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="0800 123 456" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <input name="website_url" type="url" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea required name="description" rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Describe the services your organisation provides..."></textarea>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Listing'}
      </button>
    </form>
  );
}
