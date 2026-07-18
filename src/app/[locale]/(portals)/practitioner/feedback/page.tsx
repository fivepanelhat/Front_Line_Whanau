'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface FeedbackItem {
  id: string;
  thread_id: string;
  message_content: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function FeedbackDashboard() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch('/api/practitioner/feedback');
        if (!res.ok) throw new Error('Failed to fetch feedback');
        const data = await res.json();
        setFeedbackList(data.feedback || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const totalFeedback = feedbackList.length;
  const positiveFeedback = feedbackList.filter((f) => f.rating === 1).length;
  const negativeFeedback = feedbackList.filter((f) => f.rating === -1).length;
  const positivePercentage =
    totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="bg-accent-primary h-8 w-8 animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-text-primary text-2xl font-bold tracking-tight sm:text-4xl">
          Beta Feedback Analysis
        </h1>
        <p className="text-text-secondary mt-2 text-base sm:text-lg">
          Monitor AI performance and review user feedback in real-time.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-r-lg border-l-4 border-red-500 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-3 sm:gap-6">
        <div className="bg-bg-secondary border-border flex items-center justify-between rounded-2xl border p-5 sm:p-6">
          <div>
            <p className="text-text-muted text-xs font-medium tracking-wider uppercase sm:text-sm">
              Total Feedback
            </p>
            <p className="text-text-primary mt-2 text-3xl font-bold sm:text-4xl">{totalFeedback}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            📊
          </div>
        </div>

        <div className="bg-bg-secondary border-border flex items-center justify-between rounded-2xl border p-5 sm:p-6">
          <div>
            <p className="text-text-muted text-xs font-medium tracking-wider uppercase sm:text-sm">
              Positive Rating
            </p>
            <p className="text-accent-success mt-2 text-3xl font-bold sm:text-4xl">
              {positivePercentage}%
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            👍
          </div>
        </div>

        <div className="bg-bg-secondary border-border flex items-center justify-between rounded-2xl border p-5 sm:p-6">
          <div>
            <p className="text-text-muted text-xs font-medium tracking-wider uppercase sm:text-sm">
              Needs Improvement
            </p>
            <p className="mt-2 text-3xl font-bold text-red-400 sm:text-4xl">{negativeFeedback}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl sm:h-12 sm:w-12 sm:text-2xl">
            👎
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div>
        <h2 className="text-text-primary mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
          Recent User Feedback
        </h2>
        {feedbackList.length === 0 ? (
          <div className="bg-bg-secondary border-border rounded-2xl border border-dashed p-8 text-center sm:p-12">
            <p className="text-text-muted text-lg">No feedback has been submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {feedbackList.map((item) => (
              <div
                key={item.id}
                className="bg-bg-secondary border-border overflow-hidden rounded-2xl border"
              >
                <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b bg-white/[0.02] px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold sm:text-sm ${item.rating === 1 ? 'bg-accent-success/15 text-accent-success' : 'bg-red-500/15 text-red-400'}`}
                    >
                      {item.rating === 1 ? 'Helpful 👍' : 'Not Helpful 👎'}
                    </span>
                    <span className="text-text-muted hidden font-mono text-xs sm:inline sm:text-sm">
                      Thread: {item.thread_id.substring(0, 15)}...
                    </span>
                  </div>
                  <span className="text-text-muted text-xs sm:text-sm">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  {item.comment && (
                    <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 sm:p-4">
                      <p className="mb-1 text-sm font-semibold text-yellow-300">User Comment:</p>
                      <p className="text-sm text-yellow-200/80 italic">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-text-primary mb-2 text-sm font-semibold">
                      AI Response Context:
                    </p>
                    <div className="prose prose-sm prose-invert text-text-secondary bg-bg-primary border-border max-h-48 max-w-none overflow-y-auto rounded-xl border p-3 sm:p-4">
                      <ReactMarkdown>
                        {item.message_content || '*No content recorded*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
