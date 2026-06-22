export * from "./types";
export * from "./graph";
export * from "./rag";
export * from "./tools";
export * from "./agents/base";
export * from "./agents/aether-summit";
export * from "./agents/kaitiaki-crawler";
export * from "./agents/rangahau-hauora";
export * from "./agents/mana-awhina";
export * from "./agents/aroha-tohunga";
export * from "./agents/tautoko-kaiwhina";

import { agentApp } from "./graph";
import { HumanMessage } from "@langchain/core/messages";
import { UserRole } from "./types";

export async function askAgent(query: string, userRole: UserRole) {
  const result = await agentApp.invoke({
    messages: [new HumanMessage(query)],
    userRole,
    query,
  }) as any;

  return result.messages[result.messages.length - 1].content;
}

export async function askAgentWithHITL(
  query: string, 
  userRole: "parent" | "practitioner"
) {
  const config = { 
    configurable: { thread_id: "user-session-123" } // Unique per user/session
  };

  let result = (await agentApp.invoke(
    {
      messages: [new HumanMessage(query)],
      userRole,
      query,
    },
    config
  )) as any;

  // Check if we hit a human review interrupt
  if (result.__interrupt__) {
    return {
      status: "needs_review",
      interrupt: result.__interrupt__[0].value,
      threadId: config.configurable.thread_id,
    };
  }

  return {
    status: "complete",
    response: result.messages[result.messages.length - 1].content,
  };
}

