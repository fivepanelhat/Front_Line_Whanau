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

 if (isLoading) return <div className="p-8 text-center text-text-secondary">Loading pending approvals...</div>;
 if (error) return <div className="p-8 text-red-400 text-center">{error}</div>;

 return (
 <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
 <div className="mb-6 sm:mb-8">
 <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Moderation Dashboard</h1>
 <p className="text-text-secondary mt-2">Review and approve newly submitted directory listings.</p>
 </div>

 {listings.length === 0 ? (
 <div className="bg-bg-secondary p-8 sm:p-12 rounded-xl border border-border text-center">
 <p className="text-text-muted">No pending listings to review. You're all caught up!</p>
 </div>
 ) : (
 <div className="space-y-4">
 {listings.map(listing => (
 <div key={listing.id} className="bg-bg-secondary p-4 sm:p-6 rounded-xl border border-border flex flex-col md:flex-row gap-4 sm:gap-6 justify-between items-start md:items-center">
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
 <h3 className="text-lg sm:text-xl font-bold text-text-primary">{listing.organisation}</h3>
 <span className="px-2 py-1 bg-yellow-500/15 text-yellow-300 text-xs font-semibold rounded">Pending</span>
 </div>
 <p className="text-sm text-text-muted mb-2">
 <span className="font-semibold text-text-secondary">Type:</span> {listing.service_type} |
 <span className="font-semibold text-text-secondary ml-2">Region:</span> {listing.region}
 </p>
 <p className="text-sm text-text-secondary mt-2">{listing.description}</p>
 <p className="text-xs text-text-muted mt-3 sm:mt-4">Submitted: {new Date(listing.created_at).toLocaleString()}</p>
 </div>
 <button
 onClick={() => handleApprove(listing.id)}
 className="w-full md:w-auto bg-accent-success hover:opacity-90 text-white font-medium py-2 px-6 rounded-lg transition shrink-0"
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
