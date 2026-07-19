import { BaseAgent } from './base';
import { AgentState } from '@/ai/types';
import { PROMPTS } from '@/ai/prompts';
import { KaitiakiCrawler } from './kaitiaki-crawler';
import { RangahauHauora } from './rangahau-hauora';
import { ManaAwhina } from './mana-awhina';
import { ArohaTohunga } from './aroha-tohunga';
import { TautokoKaiwhina } from './tautoko-kaiwhina';

export class AetherSummit extends BaseAgent {
  private agents = {
    kaitiaki_crawler: new KaitiakiCrawler(),
    rangahau_hauora: new RangahauHauora(),
    mana_awhina: new ManaAwhina(),
    aroha_tohunga: new ArohaTohunga(),
    tautoko_kaiwhina: new TautokoKaiwhina(),
  };

  constructor() {
    super({
      name: 'aether_summit',
      description: 'Kaitiaki Activation Orchestrator for the Front_Line_Whanau agent system',
      systemPrompt: PROMPTS.supervisor,
    });
  }

  getSystemPrompt(state: AgentState): string {
    return this.config.systemPrompt;
  }

  async invoke(state: AgentState): Promise<Partial<AgentState>> {
    const query = state.query?.toLowerCase() || '';

    let selectedAgent = 'kaitiaki_crawler'; // default

    if (query.includes('medical') || query.includes('health') || query.includes('preterm')) {
      selectedAgent = 'rangahau_hauora';
    }

    if (
      query.includes('support') ||
      query.includes('financial') ||
      query.includes('winz') ||
      query.includes('payment')
    ) {
      selectedAgent = 'tautoko_kaiwhina';
    }

    if (query.includes('cultural') || query.includes('māori') || query.includes('tikanga')) {
      selectedAgent = 'mana_awhina';
    }

    if (
      state.userRole === 'parent' ||
      query.includes('explain') ||
      query.includes('what does it mean')
    ) {
      selectedAgent = 'aroha_tohunga';
    }

    const agent = this.agents[selectedAgent as keyof typeof this.agents];
    const result = await agent.invoke(state);

    // Optional: Add role context to final response
    return {
      ...result,
      currentAgent: 'aether_summit',
      // You can store role-specific metadata here if needed
    };
  }
}
