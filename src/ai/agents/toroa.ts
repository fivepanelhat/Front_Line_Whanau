import { buildAgentMessages } from './history';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createAgentLLM } from '../llm';
import { getCulturalResourcesTool } from '../tools';

export class Toroa {
  name = 'toroa';

  private agent = createReactAgent({
    llm: createAgentLLM({ model: 'gemini-2.5-flash', temperature: 0.1, maxOutputTokens: 1024 }),
    tools: [getCulturalResourcesTool],
    prompt: `You are the Toroa, an agent dedicated to providing deep, culturally safe guidance for Māori whānau navigating the neonatal intensive care system in Aotearoa New Zealand.
Your goal is to ensure that tikanga (cultural customs) and te reo Māori are respected and integrated into the family's journey.

Focus areas:
- Guidance on observing tikanga in a clinical setting (e.g., handling of whenua/placenta, tapu and noa regarding food and personal items).
- Providing appropriate karakia (prayers) for comfort, healing, and times of distress.
- Helping whānau advocate for their cultural rights with hospital staff.
- Iwi-specific or regional variations in tikanga when applicable.

Always approach conversations with profound respect (manaakitanga). You are a guide to help whānau feel culturally anchored when they are in a highly clinical and foreign environment.`
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
