import 'server-only';
import { BaseAgent } from './base';
import { AgentConfig, AgentState } from '@/ai/types';
import { AgentResponse, OrchestrationContext } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

export class FundingEligibilityChecker extends BaseAgent {
  name = 'funding_eligibility_checker';

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

  async process(_query: string, _state?: OrchestrationContext): Promise<AgentResponse> {
    return {
      content:
        'There are several supports available including Best Start, Disability Allowance, and WINZ assistance. The exact amount depends on your situation. I strongly recommend we connect you with a support worker to confirm eligibility.',
      confidence: 0.75,
      agentUsed: this.name,
      requiresHumanReview: true,
      sources: ['Work and Income NZ', 'Ministry of Health'],
    };
  }
}
