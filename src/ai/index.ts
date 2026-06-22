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

import { agentApp } from "./graph";
import { HumanMessage } from "@langchain/core/messages";

export async function askAgent(query: string, userRole: "parent" | "practitioner" | "organisation") {
  const result = (await agentApp.invoke({
    messages: [new HumanMessage(query)],
    userRole,
    query,
  })) as any;

  return result.messages[result.messages.length - 1].content;
}

