import { BaseAgent } from './base';
import { AgentState } from '@/ai/types';

export class TautokoKaiwhina extends BaseAgent {
  constructor() {
    super({
      name: 'tautoko_kaiwhina',
      description:
        'Maintains knowledge of New Zealand support services, financial entitlements, and policy',
      systemPrompt: `You are Tautoko Kaiwhina. You are an expert on New Zealand government support, financial entitlements (WINZ, IRD, Best Start, Preterm Baby Payment), and frontline services for families with preterm babies.`,
    });
  }

  getSystemPrompt(state: AgentState): string {
    return this.config.systemPrompt;
  }
}
