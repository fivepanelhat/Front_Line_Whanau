import { LegacyBaseAgent, AgentResponse, OrchestrationContext } from './types';
import { getEntitlement, describeEntitlement } from '@/data/entitlements';

export class TaongaKnowledgeWeaver implements LegacyBaseAgent {
  name = 'Taonga Knowledge Weaver';
  description = 'Surfaces dated, officially-sourced entitlement information';

  async process(query: string, context?: OrchestrationContext): Promise<AgentResponse> {
    const q = query.toLowerCase();

    const match =
      q.includes('preterm') ? 'ppl-preterm-cap'
      : q.includes('best start') ? 'best-start'
      : q.includes('home help') ? 'winz-home-help'
      : null;

    if (match) {
      const status = getEntitlement(match);
      if (status) {
        const { text, confident } = describeEntitlement(status);
        return {
          content: text,
          // confidence reflects *data freshness*, not a guess about correctness
          confidence: confident ? 0.9 : 0.4,
          sources: [status.entitlement.source],
          requiresHumanReview: !confident,
          agentUsed: this.name,
        };
      }
    }

    return {
      content:
        'I can point you to official information on Preterm Baby Payment, Best Start, ' +
        'and WINZ Home Help. For your exact entitlement, a neonatal social worker can confirm.',
      confidence: 0.5,
      requiresHumanReview: true,
      agentUsed: this.name,
    };
  }
}
