import { BaseAgent } from './base';
import { AgentState } from '@/ai/types';

export class KaitiakiCrawler extends BaseAgent {
  constructor() {
    super({
      name: 'kaitiaki_crawler',
      description: 'Researches trusted New Zealand sources',
      systemPrompt: `You are Kaitiaki Crawler. You find accurate, up-to-date information from New Zealand government and trusted organisations for whanau of preterm twins.`,
    });
  }

  getSystemPrompt(state: AgentState): string {
    return this.config.systemPrompt;
  }
}
