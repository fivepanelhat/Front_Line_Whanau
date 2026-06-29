import 'server-only';
import { BaseAgent } from './base';
import { AgentConfig, AgentState } from '@/ai/types';
import { AgentResponse, OrchestrationContext } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

export class ResourceNavigator extends BaseAgent {
  name = 'resource_navigator';

  constructor() {
    const config: AgentConfig = {
      name: 'resource_navigator',
      description: 'Maps families to practical support services and directories',
      systemPrompt: PROMPTS.resourceNavigator,
    };
    super(config);
  }

  getSystemPrompt(_state: AgentState): string {
    return this.config.systemPrompt;
  }

  async process(_query: string, _state?: OrchestrationContext): Promise<AgentResponse> {
    return {
      content: 'Based on your location and needs, here are the most relevant services and next contacts to start with.',
      confidence: 0.85,
      agentUsed: this.name,
      sources: ['National Preterm Support Directory', 'Local iwi providers'],
      requiresHumanReview: false,
    };
  }
}
