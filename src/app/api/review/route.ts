import { NextRequest, NextResponse } from "next/server";
import { agentApp } from "@/ai/graph";
import { Command } from "@langchain/langgraph";
import { requireAuth } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";
import { saveConversation } from "@/lib/conversation";
import { checkRateLimit, createAuditLog } from "@/ai/security";
import { ReviewSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
 const ip = request.headers.get('x-forwarded-for') || 'unknown_ip';
 const isAllowed = await checkRateLimit(ip, 30, 60000);
 if (!isAllowed) {
 return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
 }

 const auth = await requireAuth(request);
 if (auth instanceof NextResponse) return auth;

 const parsed = ReviewSchema.safeParse(await request.json());
 if (!parsed.success) {
 return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
 }
 const { threadId, approved, modifiedResponse } = parsed.data;

 createAuditLog('REVIEW_DECISION', { threadId, approved, ip });

 // Update DB status
 const supabase = await createClient();
 await supabase
 .from('ai_reviews')
 .update({ status: approved ? 'approved' : 'rejected' })
 .eq('thread_id', threadId)
 .eq('status', 'pending');

 if (!approved) {
 await supabase.from('analytics_events').insert({
 event_type: 'review_denied',
 path: '/api/review',
 session_hash: threadId,
 metadata: { reason: 'Practitioner modified or rejected response' }
 });
 }

 const result = await agentApp.invoke(
 new Command({ resume: { approved, modifiedResponse } }),
 { configurable: { thread_id: threadId } }
 ) as { messages: Array<{ role?: string; content?: string }> };

 const finalMessage = result.messages[result.messages.length - 1]?.content || "";

 // Optionally, save the finalized message to the conversation history
 if (finalMessage) {
 await saveConversation(threadId, [{ role: 'assistant', content: finalMessage }]);
 }

 return NextResponse.json({
 status: "complete",
 response: finalMessage,
 });
}
