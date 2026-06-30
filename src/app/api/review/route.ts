import { NextRequest, NextResponse } from "next/server";
import { agentApp } from "@/ai/graph";
import { Command } from "@langchain/langgraph";
import { requireAuth } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";
import { saveConversation } from "@/lib/conversation";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { threadId, approved, modifiedResponse } = await request.json();

  // Update DB status
  const supabase = await createClient();
  await supabase
    .from('ai_reviews')
    .update({ status: approved ? 'approved' : 'rejected' })
    .eq('thread_id', threadId)
    .eq('status', 'pending');

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
