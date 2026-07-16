'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AIReview {
 id: string;
 thread_id: string;
 query: string;
 proposed_response: string;
 status: string;
 created_at: string;
}

export default function AIReviewQueuePage() {
 const [reviews, setReviews] = useState<AIReview[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [editedResponse, setEditedResponse] = useState<string>('');
 const router = useRouter();

 useEffect(() => {
 async function fetchReviews() {
 try {
 const res = await fetch('/api/review/queue');
 const data = await res.json();
 if (data.reviews) {
 setReviews(data.reviews);
 }
 } catch (err) {
 console.error('Failed to fetch AI reviews', err);
 } finally {
 setIsLoading(false);
 }
 }
 fetchReviews();
 }, []);

 const handleReview = async (review: AIReview, approved: boolean, finalResponse?: string) => {
 try {
 const res = await fetch('/api/review', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 threadId: review.thread_id,
 approved,
 modifiedResponse: approved ? (finalResponse || review.proposed_response) : null,
 }),
 });

 if (res.ok) {
 setReviews(prev => prev.filter(r => r.id !== review.id));
 setEditingId(null);
 router.refresh();
 }
 } catch (err) {
 console.error('Failed to process AI review', err);
 }
 };

 return (
 <div className="p-4 sm:p-8 max-w-5xl mx-auto">
 <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-text-primary">AI Response Review Queue</h1>

 {isLoading ? (
 <div className="text-text-muted">Loading pending reviews...</div>
 ) : reviews.length === 0 ? (
 <div className="bg-bg-secondary p-8 sm:p-12 text-center rounded-xl border border-border text-text-muted">
 No agent responses pending review.
 </div>
 ) : (
 <div className="grid gap-4 sm:gap-6">
 {reviews.map(review => (
 <div key={review.id} className="bg-bg-secondary p-4 sm:p-6 rounded-xl border border-border">
 <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
 <div>
 <h3 className="text-lg sm:text-xl font-bold text-text-primary">Thread: {review.thread_id.split('_').pop()}</h3>
 <div className="text-sm text-text-muted mt-1">
 Suspended: {new Date(review.created_at).toLocaleString()}
 </div>
 </div>
 <span className="px-3 py-1 bg-accent-primary/15 text-accent-primary text-xs rounded-full font-medium">Pending HITL</span>
 </div>

 {editingId === review.id ? (
 <div className="mb-4">
 <div className="p-3 sm:p-4 bg-bg-primary rounded-lg text-sm text-text-secondary mb-4 font-serif italic border-l-4 border-border">
 <strong className="text-text-primary">User Asked:</strong> {review.query || "No query recorded"}
 </div>
 <label className="block text-sm font-medium text-text-secondary mb-2">Edit Proposed Response:</label>
 <textarea
 className="w-full border border-border rounded-lg p-3 font-serif min-h-[150px] bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
 value={editedResponse}
 onChange={(e) => setEditedResponse(e.target.value)}
 />
 <div className="flex flex-wrap gap-2 mt-2">
 <button
 onClick={() => handleReview(review, true, editedResponse)}
 className="bg-accent-success text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
 >
 Approve Edited
 </button>
 <button
 onClick={() => setEditingId(null)}
 className="bg-white/10 text-text-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : (
 <>
 <div className="p-3 sm:p-4 bg-bg-primary rounded-lg text-sm text-text-secondary mb-4 font-serif italic border-l-4 border-border">
 <strong className="text-text-primary">User Asked:</strong> {review.query || "No query recorded"}
 </div>
 <div className="p-3 sm:p-4 bg-bg-primary rounded-lg text-text-secondary whitespace-pre-wrap mb-4 font-serif border border-border">
 <strong className="text-text-primary">Proposed AI Response:</strong><br/>
 {review.proposed_response}
 </div>
 <div className="flex flex-wrap gap-2 sm:gap-3 border-t border-border pt-4">
 <button
 onClick={() => handleReview(review, true)}
 className="bg-accent-success text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
 >
 Approve
 </button>
 <button
 onClick={() => {
 setEditingId(review.id);
 setEditedResponse(review.proposed_response);
 }}
 className="bg-accent-primary/15 text-accent-primary px-4 py-2 rounded-lg font-medium hover:bg-accent-primary/25 transition-colors"
 >
 Edit
 </button>
 <button
 onClick={() => handleReview(review, false)}
 className="bg-red-500/15 text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-500/25 transition-colors"
 >
 Reject
 </button>
 </div>
 </>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
