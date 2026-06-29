import { LegacyBaseAgent, AgentResponse, OrchestrationContext } from './types';
import { runToolLayer } from './tool-calling';

export class SovereignExecutor implements LegacyBaseAgent {
  name = "Sovereign Executor";
  description = "Generates templates and supports execution of actions";

  async process(query: string, context?: OrchestrationContext): Promise<AgentResponse> {
    const toolLayer = await runToolLayer(query);

    if (toolLayer.calls.length) {
      const toolSummary = toolLayer.calls
        .map((call, index) => `${index + 1}. ${call.tool}: ${call.output}`)
        .join('\n');

      return {
        content:
          `Tool-assisted execution plan:\n\n${toolSummary}\n\n` +
          `I can draft the next action if you share which pathway you want to proceed with.`,
        confidence: 0.74,
        agentUsed: this.name,
        requiresHumanReview: toolLayer.requiresHumanReview,
        sources: toolLayer.sources,
        metadata: {
          toolCalls: toolLayer.calls,
        },
      };
    }

    return {
      content: `📝 Execution Support\n\n` +
               `I can help with the following (in future versions) ⚙️:\n\n` +
               `- Pre-filled WINZ application templates 📋\n` +
               `- IRD Preterm Baby Payment request letters ✉️\n` +
               `- Tenancy repair notice templates 🏠\n` +
               `- Consent recording templates for the Documentor 🛡️\n\n` +
               `What specific document or action would you like help with? ✨`,
      confidence: 0.68,
      agentUsed: this.name,
      requiresHumanReview: true,
    };
  }
}
