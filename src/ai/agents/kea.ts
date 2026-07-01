import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createAgentLLM } from '../llm';
import { PROMPTS } from "../prompts";
import { getFundingInfoTool, getHospitalSocialWorkerInfoTool } from "../tools";

const fundingLLM = createAgentLLM();

const fundingReactAgent = createReactAgent({
  llm: fundingLLM,
  tools: [getFundingInfoTool, getHospitalSocialWorkerInfoTool],
  prompt: PROMPTS.fundingEligibilityChecker,
});

export class Kea {
  name = "kea";

  async process(query: string, state: any) {
    const messages: any[] = [];
    if (state?.locale) {
      if (state.locale === 'mi') messages.push({ role: 'system', content: "CRITICAL: The user has selected 'mi' (Te Reo Māori). You MUST respond entirely in Te Reo Māori." });
      else if (state.locale === 'sm') messages.push({ role: 'system', content: "CRITICAL: The user has selected 'sm' (Gagana Samoa). You MUST respond entirely in Gagana Samoa." });
      else if (state.locale === 'to') messages.push({ role: 'system', content: "CRITICAL: The user has selected 'to' (Lea Faka-Tonga). You MUST respond entirely in Lea Faka-Tonga." });
    }
    messages.push({ role: "user", content: query });

    const result = await fundingReactAgent.invoke({
      messages,
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
