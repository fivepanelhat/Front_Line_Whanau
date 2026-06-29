import 'server-only';
import { BaseAgent } from './base';
import { AgentStateType } from '../graph';
import { AgentConfig, AgentState } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';

interface CulturalFlags {
  requiresReview: boolean;
  riskScore: number;
}

interface CulturalSafetyResult {
  content: string;
  confidence: number;
  agentUsed: string;
  requiresHumanReview: boolean;
  metadata: { culturalFlags: CulturalFlags };
}

export class CulturalSafetyGuardian extends BaseAgent {
  name = 'cultural_safety_guardian';

  constructor() {
    const config: AgentConfig = {
      name: 'cultural_safety_guardian',
      description: 'Detects cultural safety risks and escalates when needed',
      systemPrompt: PROMPTS.culturalSafetyGuardian,
    };
    super(config);
  }

  getSystemPrompt(_state: AgentState): string {
    return this.config.systemPrompt;
  }

  async process(query: string, state: AgentStateType): Promise<CulturalSafetyResult> {
    const culturalFlags = this.detectCulturalRisks(query, state.context);

    return {
      content: '',
      confidence: culturalFlags.riskScore > 0.7 ? 0.4 : 0.95,
      agentUsed: this.name,
      requiresHumanReview: culturalFlags.requiresReview,
      metadata: { culturalFlags },
    };
  }

  private detectCulturalRisks(query: string, _context: Record<string, any>): CulturalFlags {
    const lower = query.toLowerCase();

    const highRiskTerms = ['whakapapa', 'tapu', 'tikanga'];
    const reviewTerms = ['marae', 'iwi', 'hapu', 'whanau', 'whanau ora'];

    const hasHighRisk = highRiskTerms.some((term) => lower.includes(term));
    const requiresReview = hasHighRisk || reviewTerms.some((term) => lower.includes(term));

    return {
      requiresReview,
      riskScore: hasHighRisk ? 0.8 : requiresReview ? 0.6 : 0.1,
    };
  }
}
