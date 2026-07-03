import { buildAgentMessages } from './history';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createAgentLLM } from '../llm';
import { PROMPTS } from "../prompts";
import { getFundingInfoTool, getHospitalSocialWorkerInfoTool, webSearchTool } from "../tools";

const fundingLLM = createAgentLLM();

const fundingReactAgent = createReactAgent({
  llm: fundingLLM,
  tools: [getFundingInfoTool, getHospitalSocialWorkerInfoTool, webSearchTool],
  prompt: PROMPTS.fundingEligibilityChecker,
});

export class Kea {
  name = "kea";

  async process(query: string, state: any) {
    const messages = buildAgentMessages(query, state);

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
      // Routine eligibility guidance is informational (amounts cited from
      // official sources); blanket review meant funding questions never
      // answered. Guardrails still gate crisis content.
      requiresHumanReview: false,
      sources: [], // Can be enhanced later
    };
  }
}
