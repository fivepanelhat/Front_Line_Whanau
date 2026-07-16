import { BaseAgent } from "./base";
import { AgentState } from "@/ai/types";

export class ManaAwhina extends BaseAgent {
 constructor() {
 super({
 name: "mana_awhina",
 description: "Cultural safety and Maori equity review",
 systemPrompt: `You are Mana Awhina. You ensure all responses respect Te Tiriti o Waitangi, Maori data sovereignty, and cultural safety.`,
 });
 }

 getSystemPrompt(state: AgentState): string {
 return this.config.systemPrompt;
 }
}
