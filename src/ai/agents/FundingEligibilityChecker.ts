import 'server-only';
import { BaseAgent } from './base';
import { getFundingInfoTool } from '../tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AgentConfig, AgentState } from '@/ai/types';
import { AgentResponse, OrchestrationContext } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

export class FundingEligibilityChecker extends BaseAgent {
  name = 'funding_eligibility_checker';

  private agent = createReactAgent({
    llm: new ChatGoogleGenerativeAI({ model: 'gemini-1.5-flash', temperature: 0.1 }),
    tools: [getFundingInfoTool],
    prompt: PROMPTS.fundingEligibilityChecker,
  });

  constructor() {
    const config: AgentConfig = {
      name: 'funding_eligibility_checker',
      description: 'Provides conservative funding guidance with mandatory escalation',
      systemPrompt: PROMPTS.fundingEligibilityChecker,
    };
    super(config);
  }

  getSystemPrompt(_state: AgentState): string {
    return this.config.systemPrompt;
  }

  async process(query: string, _state?: OrchestrationContext): Promise<AgentResponse> {
    const result = await this.agent.invoke({
      messages: [{ role: 'user', content: query }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const content = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

    return {
      content,
      confidence: 0.8,
      agentUsed: this.name,
      requiresHumanReview: true,
      sources: ['Funding Info Tool'],
    };
  }
}
