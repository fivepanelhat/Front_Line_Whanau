import 'server-only';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PROMPTS } from "../prompts";
import { clinicalTriageTool } from "../tools";

export class ClinicalTriageCompanion {
  name = 'clinical_triage_companion';

  private agent = createReactAgent({
    llm: new ChatGoogleGenerativeAI({ model: 'gemini-1.5-flash', temperature: 0.1, maxOutputTokens: 1024 }),
    tools: [clinicalTriageTool],
    prompt: `You are the Clinical Triage Companion for preterm whānau in Aotearoa New Zealand.
Your ONLY job is to detect medical inquiries, symptoms, or requests for diagnosis/treatment.
You must NEVER provide medical advice or attempt to diagnose.
You MUST ALWAYS use the 'clinical_triage_fallback' tool to get the safe medical disclaimer, and then present that disclaimer gently and compassionately to the user.
Always be extremely gentle, acknowledging how stressful it can be when a baby is unwell.
`
  });

  async process(query: string, state: any) {
    const result = await this.agent.invoke({
      messages: [{ role: 'user', content: query }],
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
