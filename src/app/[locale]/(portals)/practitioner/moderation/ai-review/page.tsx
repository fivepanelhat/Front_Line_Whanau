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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">AI Response Review Queue</h1>

      {isLoading ? (
        <div className="text-gray-500">Loading pending reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500">
          No agent responses pending review.
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Thread: {review.thread_id.split('_').pop()}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Suspended: {new Date(review.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">Pending Human-in-the-Loop</span>
                </div>
              </div>
              
              {editingId === review.id ? (
                <div className="mb-4">
                  <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-800 mb-4 font-serif italic border-l-4 border-gray-300">
                    <strong>User Asked:</strong> {review.query || "No query recorded"}
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Edit Proposed Response:</label>
                  <textarea
                    className="w-full border rounded-lg p-3 font-serif min-h-[150px]"
                    value={editedResponse}
                    onChange={(e) => setEditedResponse(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleReview(review, true, editedResponse)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Approve Edited Response
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-800 mb-4 font-serif italic border-l-4 border-gray-300">
                    <strong>User Asked:</strong> {review.query || "No query recorded"}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap mb-4 font-serif">
                    <strong>Proposed AI Response:</strong><br/>
                    {review.proposed_response}
                  </div>
                  <div className="flex gap-3 border-t pt-4">
                    <button 
                      onClick={() => handleReview(review, true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      Approve As-Is
                    </button>
                    <button 
                      onClick={() => {
                        setEditingId(review.id);
                        setEditedResponse(review.proposed_response);
                      }}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200"
                    >
                      Edit Response
                    </button>
                    <button 
                      onClick={() => handleReview(review, false)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200"
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
