import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminReviewQueue() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Basic role check
  if (!user || user.email !== 'admin@example.com') {
    // redirect("/");
  }

  // Fetch pending reviews (for demo, we just query something mock or rely on real review table)
  // Our current HITL design stores state in langgraph checkpoints, or possibly a custom table.
  // We'll display a mockup of what this looks like for now.

  const pendingReviews = [
    {
      id: 'req_123',
      threadId: 'thread_123',
      agent: 'cultural_safety_guardian',
      query: 'Can you recommend a culturally safe way to introduce my pēpi to solid foods?',
      proposedResponse:
        'Kia ora! Introducing solids is a beautiful milestone. I recommend speaking with your Plunket nurse...',
      status: 'pending',
      date: new Date().toISOString(),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-text-primary text-2xl font-bold sm:text-3xl">Review Queue</h1>
        <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm font-medium text-yellow-300">
          {pendingReviews.length} Pending
        </span>
      </div>

      <p className="text-text-secondary mb-8">
        These agent responses have been flagged for human review to ensure clinical and cultural
        safety before being sent to the whanau.
      </p>

      <div className="space-y-6">
        {pendingReviews.map((review) => (
          <div
            key={review.id}
            className="bg-bg-secondary border-border overflow-hidden rounded-xl border"
          >
            <div className="bg-bg-primary border-border flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <span className="text-text-primary font-semibold">Thread:</span>{' '}
                <span className="text-text-secondary font-mono text-sm">{review.threadId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Agent:</span>
                <span className="bg-accent-primary/15 text-accent-primary rounded px-2 py-1 text-xs font-medium uppercase">
                  {review.agent}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              <div>
                <h4 className="text-text-muted mb-2 text-sm font-semibold tracking-wider uppercase">
                  User Query
                </h4>
                <div className="bg-accent-primary/10 text-accent-primary rounded-lg p-3 sm:p-4">
                  {review.query}
                </div>
              </div>

              <div>
                <h4 className="text-text-muted mb-2 text-sm font-semibold tracking-wider uppercase">
                  Proposed AI Response
                </h4>
                <div className="bg-bg-primary border-border text-text-secondary rounded-lg border p-3 whitespace-pre-wrap sm:p-4">
                  {review.proposedResponse}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button className="bg-accent-success flex-1 rounded-lg py-3 font-semibold text-white transition-opacity hover:opacity-90">
                  Approve & Send
                </button>
                <button className="text-text-secondary flex-1 rounded-lg bg-white/10 py-3 font-semibold transition-colors hover:bg-white/15">
                  Modify Response
                </button>
                <button className="flex-1 rounded-lg bg-red-500/15 py-3 font-semibold text-red-400 transition-colors hover:bg-red-500/25">
                  Deny
                </button>
              </div>
            </div>
          </div>
        ))}

        {pendingReviews.length === 0 && (
          <div className="bg-bg-secondary border-border rounded-xl border py-12 text-center">
            <div className="mb-4 text-4xl">🎉</div>
            <h3 className="text-text-primary text-lg font-medium">Inbox Zero</h3>
            <p className="text-text-muted">No pending reviews in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
