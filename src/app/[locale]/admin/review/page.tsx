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
 query: "Can you recommend a culturally safe way to introduce my pepi to solid foods?",
 proposedResponse: "Kia ora! Introducing solids is a beautiful milestone. I recommend speaking with your Plunket nurse...",
 status: "pending",
 date: new Date().toISOString(),
 }
 ];

 return (
 <div className="p-4 sm:p-8 max-w-6xl mx-auto">
 <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
 <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Review Queue</h1>
 <span className="bg-yellow-500/15 text-yellow-300 px-3 py-1 rounded-full font-medium text-sm">
 {pendingReviews.length} Pending
 </span>
 </div>

 <p className="text-text-secondary mb-8">
 These agent responses have been flagged for human review to ensure clinical and cultural safety before being sent to the whanau.
 </p>

 <div className="space-y-6">
 {pendingReviews.map((review) => (
 <div key={review.id} className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
 <div className="bg-bg-primary px-4 sm:px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
 <div>
 <span className="font-semibold text-text-primary">Thread:</span> <span className="text-text-secondary font-mono text-sm">{review.threadId}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-sm text-text-muted">Agent:</span>
 <span className="bg-accent-primary/15 text-accent-primary px-2 py-1 rounded text-xs font-medium uppercase">{review.agent}</span>
 </div>
 </div>

 <div className="p-4 sm:p-6 space-y-4">
 <div>
 <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">User Query</h4>
 <div className="bg-accent-primary/10 p-3 sm:p-4 rounded-lg text-accent-primary">
 {review.query}
 </div>
 </div>

 <div>
 <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Proposed AI Response</h4>
 <div className="bg-bg-primary border border-border p-3 sm:p-4 rounded-lg text-text-secondary whitespace-pre-wrap">
 {review.proposedResponse}
 </div>
 </div>

 <div className="pt-4 flex flex-col sm:flex-row gap-3">
 <button className="flex-1 bg-accent-success hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-opacity">
 Approve & Send
 </button>
 <button className="flex-1 bg-white/10 hover:bg-white/15 text-text-secondary font-semibold py-3 rounded-lg transition-colors">
 Modify Response
 </button>
 <button className="flex-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-semibold py-3 rounded-lg transition-colors">
 Deny
 </button>
 </div>
 </div>
 </div>
 ))}

 {pendingReviews.length === 0 && (
 <div className="text-center py-12 bg-bg-secondary rounded-xl border border-border">
 <div className="text-4xl mb-4">🎉</div>
 <h3 className="text-lg font-medium text-text-primary">Inbox Zero</h3>
 <p className="text-text-muted">No pending reviews in the queue.</p>
 </div>
 )}
 </div>
 </div>
 );
}
