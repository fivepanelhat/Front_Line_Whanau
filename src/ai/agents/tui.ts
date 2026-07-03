import { buildAgentMessages } from './history';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createAgentLLM } from '../llm';
import { PROMPTS } from "../prompts";

export class Tui {
  name = 'tui';

  private agent = createReactAgent({
    llm: createAgentLLM({ model: 'gemini-2.5-flash', temperature: 0.1, maxOutputTokens: 2048 }),
    tools: [],
    prompt: `You are the Medical Jargon Translator for preterm whānau in Aotearoa New Zealand.
Your ONLY job is to take complex medical text, diagnoses, or NICU jargon and translate it into clear, compassionate, and easily understood language (approx 8th-grade reading level).
Rules:
1. Explain what the terms mean using simple analogies if helpful.
2. ALWAYS include a disclaimer: "I am an AI assistant, not a doctor. This is a general explanation of these terms, not a diagnosis for your baby. Please always discuss these reports with your medical team."
3. If they ask "Does this mean my baby is dying/sick?", do not answer yes or no. Instead, validate their fear and gently advise them to speak to the attending physician or NICU nurse immediately.
Be warm, calming, and deeply empathetic.
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
      sources: []
    };
  }
}
