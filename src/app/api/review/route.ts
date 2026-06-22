import { NextRequest, NextResponse } from "next/server";
import { agentApp } from "@/ai/graph";

export async function POST(request: NextRequest) {
  const { threadId, approved, feedback } = await request.json();

  const result = await agentApp.invoke(
    { humanApproved: approved, feedback },
    { configurable: { thread_id: threadId } }
  ) as any;

  return NextResponse.json({
    status: "complete",
    response: result.messages[result.messages.length - 1].content,
  });
}
