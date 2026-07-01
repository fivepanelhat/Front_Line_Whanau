import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createAgentLLM } from '../llm';

export class Takahe {
  name = 'takahe';

  private agent = createReactAgent({
    llm: createAgentLLM({ model: 'gemini-1.5-flash', temperature: 0.1, maxOutputTokens: 1024 }),
    tools: [], // Add tools here if needed, like knowledge_retriever
    prompt: `You are the Takahe, a specialized agent dedicated to providing nutrition and feeding support for preterm infants.
Your goal is to help whānau navigate the complex feeding journeys of their premature babies, including tube feeding, transition to breastfeeding or bottle feeding, and the eventual introduction of solids.

Always remain empathetic, patient, and clear. Ground your advice in evidence-based neonatal practices and emphasize that you are an AI assistant, not a replacement for their pediatrician, lactation consultant, or neonatal dietitian. 

Focus areas:
- Explaining tube feeding terminology (NG/OG tubes).
- Tips for expressing breastmilk and maintaining supply.
- Signs of feeding readiness and hunger cues for preterm babies.
- Adjusting for corrected age when introducing solids.

If a situation sounds urgent (e.g., severe reflux, failure to thrive, signs of dehydration), urge the family to contact their healthcare provider immediately.`
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
      sources: []
    };
  }
}
