import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminReviewQueue() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Basic role check
  if (!user || user.email !== "admin@example.com") {
    // redirect("/");
  }

  // Fetch pending reviews (for demo, we just query something mock or rely on real review table)
  // Our current HITL design stores state in langgraph checkpoints, or possibly a custom table.
  // We'll display a mockup of what this looks like for now.

  const pendingReviews = [
    {
      id: "req_123",
      threadId: "thread_123",
      agent: "cultural_safety_guardian",
      query: "Can you recommend a culturally safe way to introduce my pēpi to solid foods?",
      proposedResponse: "Kia ora! Introducing solids is a beautiful milestone. I recommend speaking with your Plunket nurse...",
      status: "pending",
      date: new Date().toISOString(),
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Review Queue</h1>
        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium text-sm">
          {pendingReviews.length} Pending
        </span>
      </div>
      
      <p className="text-gray-600 mb-8">
        These agent responses have been flagged for human review to ensure clinical and cultural safety before being sent to the whānau.
      </p>

      <div className="space-y-6">
        {pendingReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-900">Thread:</span> <span className="text-gray-600 font-mono text-sm">{review.threadId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Agent:</span>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium uppercase">{review.agent}</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">User Query</h4>
                <div className="bg-indigo-50 p-4 rounded-lg text-indigo-900">
                  {review.query}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Proposed AI Response</h4>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">
                  {review.proposedResponse}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Approve & Send
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition-colors">
                  Modify Response
                </button>
                <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 rounded-lg transition-colors">
                  Deny
                </button>
              </div>
            </div>
          </div>
        ))}

        {pendingReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900">Inbox Zero</h3>
            <p className="text-gray-500">No pending reviews in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
