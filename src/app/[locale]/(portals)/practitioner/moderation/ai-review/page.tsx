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
          modifiedResponse: approved ? finalResponse || review.proposed_response : null,
        }),
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
        setEditingId(null);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to process AI review', err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="text-text-primary mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
        AI Response Review Queue
      </h1>

      {isLoading ? (
        <div className="text-text-muted">Loading pending reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-bg-secondary border-border text-text-muted rounded-xl border p-8 text-center sm:p-12">
          No agent responses pending review.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-bg-secondary border-border rounded-xl border p-4 sm:p-6"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-text-primary text-lg font-bold sm:text-xl">
                    Thread: {review.thread_id.split('_').pop()}
                  </h3>
                  <div className="text-text-muted mt-1 text-sm">
                    Suspended: {new Date(review.created_at).toLocaleString()}
                  </div>
                </div>
                <span className="bg-accent-primary/15 text-accent-primary rounded-full px-3 py-1 text-xs font-medium">
                  Pending HITL
                </span>
              </div>

              {editingId === review.id ? (
                <div className="mb-4">
                  <div className="bg-bg-primary text-text-secondary border-border mb-4 rounded-lg border-l-4 p-3 font-serif text-sm italic sm:p-4">
                    <strong className="text-text-primary">User Asked:</strong>{' '}
                    {review.query || 'No query recorded'}
                  </div>
                  <label className="text-text-secondary mb-2 block text-sm font-medium">
                    Edit Proposed Response:
                  </label>
                  <textarea
                    className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary min-h-[150px] w-full rounded-lg border p-3 font-serif focus:ring-2"
                    value={editedResponse}
                    onChange={(e) => setEditedResponse(e.target.value)}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleReview(review, true, editedResponse)}
                      className="bg-accent-success rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Approve Edited
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-text-secondary rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/15"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-bg-primary text-text-secondary border-border mb-4 rounded-lg border-l-4 p-3 font-serif text-sm italic sm:p-4">
                    <strong className="text-text-primary">User Asked:</strong>{' '}
                    {review.query || 'No query recorded'}
                  </div>
                  <div className="bg-bg-primary text-text-secondary border-border mb-4 rounded-lg border p-3 font-serif whitespace-pre-wrap sm:p-4">
                    <strong className="text-text-primary">Proposed AI Response:</strong>
                    <br />
                    {review.proposed_response}
                  </div>
                  <div className="border-border flex flex-wrap gap-2 border-t pt-4 sm:gap-3">
                    <button
                      onClick={() => handleReview(review, true)}
                      className="bg-accent-success rounded-lg px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(review.id);
                        setEditedResponse(review.proposed_response);
                      }}
                      className="bg-accent-primary/15 text-accent-primary hover:bg-accent-primary/25 rounded-lg px-4 py-2 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleReview(review, false)}
                      className="rounded-lg bg-red-500/15 px-4 py-2 font-medium text-red-400 transition-colors hover:bg-red-500/25"
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
