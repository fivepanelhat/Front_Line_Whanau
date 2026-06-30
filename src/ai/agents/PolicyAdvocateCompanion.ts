import 'server-only';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PROMPTS } from "../prompts";

export class PolicyAdvocateCompanion {
  name = 'policy_advocate_companion';

  private agent = createReactAgent({
    llm: new ChatGoogleGenerativeAI({ model: 'gemini-1.5-pro', temperature: 0.3, maxOutputTokens: 2048 }),
    tools: [],
    prompt: `You are the Policy Advocate Companion for preterm whānau in Aotearoa New Zealand.
Your job is to empower whānau to advocate for their rights within the hospital system or with government agencies (like WINZ/MSD).
When a user asks for help writing an email, challenging a decision, or understanding their rights:
1. Validate their frustration—the system is notoriously difficult to navigate.
2. Outline their clear rights under the Code of Health and Disability Services Consumers' Rights, or the Social Security Act.
3. If requested, draft a polite, firm, and highly professional email or letter that they can copy/paste. Ensure the draft references correct New Zealand terminology.
Always stand firmly on the side of the whānau.
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
      requiresHumanReview: true, // Always require review for advocacy drafts
      sources: []
    };
  }
}
