'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type DirectoryListing = {
  id: string;
  organisation: string;
  service_type: string;
  region: string;
  description: string;
  created_at: string;
};

export default function ModerationDashboard() {
  const [listings, setListings] = useState<DirectoryListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnverifiedListings();
  }, []);

  const fetchUnverifiedListings = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('directory_listings')
        .select('*')
        .eq('is_verified', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load listings or you do not have permission.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/directory/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to approve');

      // Remove from list
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading)
    return <div className="text-text-secondary p-8 text-center">Loading pending approvals...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-text-primary text-2xl font-bold sm:text-3xl">Moderation Dashboard</h1>
        <p className="text-text-secondary mt-2">
          Review and approve newly submitted directory listings.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="bg-bg-secondary border-border rounded-xl border p-8 text-center sm:p-12">
          <p className="text-text-muted">No pending listings to review. You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-bg-secondary border-border flex flex-col items-start justify-between gap-4 rounded-xl border p-4 sm:gap-6 sm:p-6 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-text-primary text-lg font-bold sm:text-xl">
                    {listing.organisation}
                  </h3>
                  <span className="rounded bg-yellow-500/15 px-2 py-1 text-xs font-semibold text-yellow-300">
                    Pending
                  </span>
                </div>
                <p className="text-text-muted mb-2 text-sm">
                  <span className="text-text-secondary font-semibold">Type:</span>{' '}
                  {listing.service_type} |
                  <span className="text-text-secondary ml-2 font-semibold">Region:</span>{' '}
                  {listing.region}
                </p>
                <p className="text-text-secondary mt-2 text-sm">{listing.description}</p>
                <p className="text-text-muted mt-3 text-xs sm:mt-4">
                  Submitted: {new Date(listing.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleApprove(listing.id)}
                className="bg-accent-success w-full shrink-0 rounded-lg px-6 py-2 font-medium text-white transition hover:opacity-90 md:w-auto"
              >
                Approve Listing
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
