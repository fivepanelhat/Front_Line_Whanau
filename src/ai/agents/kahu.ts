import { buildAgentMessages } from './history';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAgentLLM } from '../llm';
import { PROMPTS } from '../prompts';
import { webSearchTool } from '../tools';

export class Kahu {
  name = 'kahu';

  private agent = createReactAgent({
    llm: createAgentLLM({ model: 'gemini-2.5-flash', temperature: 0.3, maxOutputTokens: 2048 }),
    tools: [webSearchTool],
    prompt: `You are the Policy Advocate Companion for preterm whanau in Aotearoa New Zealand.
Your job is to empower whanau to advocate for their rights within the hospital system or with government agencies (like WINZ/MSD).
When a user asks for help writing an email, challenging a decision, or understanding their rights:
1. Validate their frustration-the system is notoriously difficult to navigate.
2. Outline their clear rights under the Code of Health and Disability Services Consumers' Rights, or the Social Security Act.
3. If requested, draft a polite, firm, and highly professional email or letter that they can copy/paste. Ensure the draft references correct New Zealand terminology.
Always stand firmly on the side of the whanau.
`,
  });

  async process(query: string, state: any) {
    const result = await this.agent.invoke({
      messages: buildAgentMessages(query, state),
    });

    const finalMessage = result.messages[result.messages.length - 1];

    let content = finalMessage.content;
    if (Array.isArray(content)) {
      content = content.map((c: any) => c.text || JSON.stringify(c)).join(' ');
    } else if (typeof content !== 'string') {
      content = String(content);
    }

    return {
      content,
      agentUsed: this.name,
      // Drafts are copy/paste templates the user sends themselves; holding every
      // draft for an unstaffed practitioner queue meant advocacy questions
      // never got answers. Crisis content is still gated by guardrails.
      requiresHumanReview: false,
      sources: [],
    };
  }
}
