import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAgentLLM } from './llm';
import { webSearchTool } from './tools';
import { buildAgentMessages } from './agents/history';
import { LegacyBaseAgent, AgentResponse, OrchestrationContext } from './types';

// Previously a hardcoded stub that returned the same canned Taranaki
// checklist for every question (and, because it made no model call, the
// streaming UI showed only the classifier's intent label). Now a real
// planning agent.
const pathwayReactAgent = createReactAgent({
  llm: createAgentLLM({ temperature: 0.2, maxOutputTokens: 2048 }),
  tools: [webSearchTool],
  prompt: `You are the Whānau Pathway Architect for families of preterm babies in Aotearoa New Zealand.
Your job is to answer "how do I..." and "what are the steps..." questions with a clear, practical, step-by-step plan tailored to the user's situation.

Rules:
1. ALWAYS directly answer the question with concrete, ordered steps - never deflect to "visit the website" without also giving the actual steps.
2. Ground steps in current official New Zealand processes (Work and Income/MSD, IRD, Health NZ, myIR, hospital social workers). Use the web search tool when you need current process details, and cite sources.
3. Include real phone numbers, portals, and document checklists where relevant.
4. Keep the tone warm and clear (plain language, ~8th-grade reading level); this audience is exhausted and stressed.
5. Where a step differs by region, say so briefly rather than guessing.`,
});

export class WhanauPathwayArchitect implements LegacyBaseAgent {
  name = 'Whānau Pathway Architect';
  description = 'Designs clear, culturally safe support pathways';

  async process(query: string, context?: OrchestrationContext): Promise<AgentResponse> {
    const result = await pathwayReactAgent.invoke({
      messages: buildAgentMessages(query, context),
    });

    const finalMessage = result.messages[result.messages.length - 1];
    let content = finalMessage.content as any;
    if (Array.isArray(content)) {
      content = content.map((c: any) => c.text || JSON.stringify(c)).join(' ');
    } else if (typeof content !== 'string') {
      content = String(content);
    }

    return {
      content,
      confidence: 0.8,
      agentUsed: this.name,
      requiresHumanReview: false,
    };
  }
}
