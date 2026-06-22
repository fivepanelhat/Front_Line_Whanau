import { BaseAgent } from "./base";
import { AgentState } from "../types";
import { KaitiakiCrawler } from "./kaitiaki-crawler";
import { RangahauHauora } from "./rangahau-hauora";
import { ManaAwhina } from "./mana-awhina";
import { ArohaTohunga } from "./aroha-tohunga";
import { TautokoKaiwhina } from "./tautoko-kaiwhina";

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
    const queryLower = state.query?.toLowerCase() || "";

    if (queryLower.includes("financial") || queryLower.includes("winz") || queryLower.includes("payment") || queryLower.includes("entitlement") || queryLower.includes("support")) {
      agentToUse = "tautoko_kaiwhina";
    } else if (queryLower.includes("medical") || queryLower.includes("health")) {
      agentToUse = state.userRole === "parent" ? "aroha_tohunga" : "rangahau_hauora";
    } else if (state.userRole === "parent" || queryLower.includes("cultural")) {
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
