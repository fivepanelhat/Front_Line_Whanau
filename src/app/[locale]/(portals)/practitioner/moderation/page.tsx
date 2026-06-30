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
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading pending approvals...</div>;
  if (error) return <div className="p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moderation Dashboard</h1>
        <p className="text-gray-600 mt-2">Review and approve newly submitted directory listings.</p>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No pending listings to review. You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{listing.organisation}</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">Pending</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-gray-700">Type:</span> {listing.service_type} | 
                  <span className="font-semibold text-gray-700 ml-2">Region:</span> {listing.region}
                </p>
                <p className="text-sm text-gray-700 mt-2">{listing.description}</p>
                <p className="text-xs text-gray-400 mt-4">Submitted: {new Date(listing.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleApprove(listing.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition shrink-0"
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
