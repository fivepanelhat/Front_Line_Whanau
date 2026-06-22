import { LegacyBaseAgent, AgentResponse, OrchestrationContext } from './types';

export class WhanauPathwayArchitect implements LegacyBaseAgent {
  name = "Whānau Pathway Architect";
  description = "Designs clear, culturally safe support pathways";

  async process(query: string, context?: OrchestrationContext): Promise<AgentResponse> {
    return {
      content: `**Recommended Support Pathway**\n\n` +
               `1. Contact **Taranaki Base Hospital Neonatal Social Worker**: (06) 753 6139\n` +
               `2. Apply for **Preterm Baby Payment** + **Best Start** via myIR\n` +
               `3. Apply for **WINZ Home Help** (very useful for twins)\n` +
               `4. Check tenancy/housing rights if needed → 0800 836 262\n` +
               `5. Access emotional support → PlunketLine (0800 933 922) or 1737\n\n` +
               `Would you like a more detailed, personalised plan?`,
      confidence: 0.78,
      agentUsed: this.name,
      requiresHumanReview: true,
    };
  }
}
