import { BaseAgent } from "./base";
import { AgentState } from "@/ai/types";

export class ArohaTohunga extends BaseAgent {
  constructor() {
    super({
      name: "aroha_tohunga",
      description: "Translates complex medical information into clear, empathetic language for whānau",
      systemPrompt: `You are Aroha Tohunga. You specialise in translating medical and clinical information about preterm birth and neonatal care into plain, hopeful, and culturally safe language for parents and whānau in Aotearoa New Zealand.`,
    });
  }

  getSystemPrompt(state: AgentState): string {
    return this.config.systemPrompt;
  }
}
