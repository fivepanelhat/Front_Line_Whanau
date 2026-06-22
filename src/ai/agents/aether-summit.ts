import { BaseAgent } from "./base";
import { AgentState } from "../types";
import { KaitiakiCrawler } from "./kaitiaki-crawler";
import { RangahauHauora } from "./rangahau-hauora";
import { ManaAwhina } from "./mana-awhina";

export class AetherSummit extends BaseAgent {
  private agents = {
    kaitiaki_crawler: new KaitiakiCrawler(),
    rangahau_hauora: new RangahauHauora(),
    mana_awhina: new ManaAwhina(),
  };

  constructor() {
    super({
      name: "aether_summit",
      description: "Main orchestrator",
      systemPrompt: "You are Aether Summit, the lead orchestrator.",
    });
  }

  getSystemPrompt(state: AgentState): string {
    return this.config.systemPrompt;
  }

  async invoke(state: AgentState): Promise<Partial<AgentState>> {
    // Simple routing logic (can be made smarter later)
    let agentToUse = "kaitiaki_crawler";

    if (state.query?.toLowerCase().includes("medical") || state.query?.toLowerCase().includes("health")) {
      agentToUse = "rangahau_hauora";
    }

    if (state.userRole === "parent" || state.query?.toLowerCase().includes("cultural")) {
      agentToUse = "mana_awhina";
    }

    const selectedAgent = this.agents[agentToUse as keyof typeof this.agents];
    const result = await selectedAgent.invoke(state);

    return {
      ...result,
      currentAgent: "aether_summit",
    };
  }
}
