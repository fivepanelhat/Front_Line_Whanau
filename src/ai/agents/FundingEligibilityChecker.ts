import 'server-only';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PROMPTS } from "../prompts";
import { getFundingInfoTool } from "../tools";

const fundingLLM = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.1,
  maxOutputTokens: 1024,
});

const fundingReactAgent = createReactAgent({
  llm: fundingLLM,
  tools: [getFundingInfoTool],
  prompt: PROMPTS.fundingEligibilityChecker,
});

export class FundingEligibilityChecker {
  name = "funding_eligibility_checker";

  async process(query: string, state: any) {
    const result = await fundingReactAgent.invoke({
      messages: [{ role: "user", content: query }],
    });

    const finalMessage = result.messages[result.messages.length - 1];
    
    // Safety check for multi-modal list content from Gemini
    let content = finalMessage.content;
    if (Array.isArray(content)) {
      content = content.map((c: any) => c.text || JSON.stringify(c)).join(" ");
    } else if (typeof content !== 'string') {
      content = String(content);
    }

    return {
      content,
      agentUsed: this.name,
      requiresHumanReview: true,
      sources: [], // Can be enhanced later
    };
  }
}
