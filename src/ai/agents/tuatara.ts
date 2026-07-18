import { buildAgentMessages } from './history';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAgentLLM } from '../llm';
import { PROMPTS } from '../prompts';
import { getCulturalResourcesTool } from '../tools';

const culturalLLM = createAgentLLM();

const culturalReactAgent = createReactAgent({
  llm: culturalLLM,
  tools: [getCulturalResourcesTool],
  prompt: PROMPTS.culturalSafetyGuardian,
});

export class Tuatara {
  name = 'tuatara';

  async process(query: string, state: any) {
    const result = await culturalReactAgent.invoke({
      messages: buildAgentMessages(query, state),
    });

    const finalMessage = result.messages[result.messages.length - 1];

    // Safety check for multi-modal list content from Gemini
    let content = finalMessage.content;
    if (Array.isArray(content)) {
      content = content.map((c: any) => c.text || JSON.stringify(c)).join(' ');
    } else if (typeof content !== 'string') {
      content = String(content);
    }

    return {
      content,
      agentUsed: this.name,
      requiresHumanReview: true,
    };
  }
}
