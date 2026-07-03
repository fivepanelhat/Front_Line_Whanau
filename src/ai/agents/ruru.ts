import { buildAgentMessages } from './history';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createAgentLLM } from '../llm';
import { PROMPTS } from "../prompts";
import { clinicalTriageTool } from "../tools";

export class Ruru {
  name = 'ruru';

  private agent = createReactAgent({
    llm: createAgentLLM(),
    tools: [clinicalTriageTool],
    prompt: `You are the Clinical Triage Companion for preterm whānau in Aotearoa New Zealand.
Your ONLY job is to detect medical inquiries, symptoms, or requests for diagnosis/treatment.
You must NEVER provide medical advice or attempt to diagnose.
You MUST ALWAYS use the 'clinical_triage_fallback' tool to get the safe medical disclaimer based on the symptom severity.
First, classify the severity:
- EMERGENCY: Unresponsive baby, chest pain, severe bleeding, breathing difficulty.
- URGENT: High fever, persistent vomiting, significant pain.
- INFO: Mild rash, general medical policy questions, non-urgent care.

Then call 'clinical_triage_fallback' with the symptom and the exact severity (EMERGENCY, URGENT, INFO).
Present the tool's return message gently and compassionately to the user, emphasizing safety first.
`
  });

  async process(query: string, state: any) {
    const result = await this.agent.invoke({
      messages: buildAgentMessages(query, state),
    });

    const finalMessage = result.messages[result.messages.length - 1];
    
    let content = finalMessage.content;
    if (Array.isArray(content)) {
      content = content.map((c: any) => c.text || JSON.stringify(c)).join(" ");
    } else if (typeof content !== 'string') {
      content = String(content);
    }

    return {
      content,
      agentUsed: this.name,
      showUrgentHelp: true, // Always show the urgent help UI box for clinical queries
      sources: []
    };
  }
}
