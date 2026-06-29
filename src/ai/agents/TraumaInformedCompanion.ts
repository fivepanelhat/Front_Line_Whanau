import 'server-only';
import { BaseAgent } from './base';
import { AgentConfig, AgentState } from '@/ai/types';
import { AgentResponse, OrchestrationContext } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

export class TraumaInformedCompanion extends BaseAgent {
  name = 'trauma_informed_companion';

  constructor() {
    const config: AgentConfig = {
      name: 'trauma_informed_companion',
      description: 'Provides emotional validation and trauma-informed support language',
      systemPrompt: PROMPTS.traumaInformedCompanion,
    };
    super(config);
  }

  getSystemPrompt(_state: AgentState): string {
    return this.config.systemPrompt;
  }

  async process(_query: string, _state?: OrchestrationContext): Promise<AgentResponse> {
    return {
      content:
        "I hear this is a really difficult time for your whanau. You're not alone. Would you like me to help you find emotional support options alongside the practical information?",
      confidence: 0.9,
      agentUsed: this.name,
      requiresHumanReview: false,
    };
  }
}
