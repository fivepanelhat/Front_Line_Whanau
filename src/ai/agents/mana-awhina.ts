import { BaseAgent } from "./base";
import { AgentState } from "@/ai/types";

export class ManaAwhina extends BaseAgent {
  constructor() {
    super({
      name: "mana_awhina",
      description: "Cultural safety and Māori equity review",
      systemPrompt: `You are Mana Āwhina. You ensure all responses respect Te Tiriti o Waitangi, Māori data sovereignty, and cultural safety.`,
    });
  }

  getSystemPrompt(state: AgentState): string {
    return this.config.systemPrompt;
  }
}
