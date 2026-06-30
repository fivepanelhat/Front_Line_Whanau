import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PROMPTS } from "./prompts";
import { documentSearchTool, getFundingInfoTool } from "./tools";

const executorLLM = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.1,
});

const executorAgent = createReactAgent({
  llm: executorLLM,
  tools: [documentSearchTool, getFundingInfoTool],
  prompt: PROMPTS.executor,
});

export class SovereignExecutor {
  name = "sovereign_executor";

  async process(query: string, state: any) {
    const result = await executorAgent.invoke({
      messages: [{ role: "user", content: query }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    let content = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

    // Extract tool calls to flag for review if templates are generated
    const toolMessages = result.messages.filter((m: any) => m._getType && m._getType() === 'tool');

    return {
      content,
      agentUsed: this.name,
      requiresHumanReview: true, // We always flag execution for human review to ensure templates are safe
      confidence: 0.85,
      sources: [],
      metadata: {
        toolCalls: toolMessages.length > 0 ? toolMessages : [],
      },
    };
  }
}
