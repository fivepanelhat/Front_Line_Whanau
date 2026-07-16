import { BaseAgent } from "./base";
import { AgentState } from "@/ai/types";

export class RangahauHauora extends BaseAgent {
 constructor() {
 super({
 name: "rangahau_hauora",
 description: "Medical research and evidence synthesis",
 systemPrompt: `You are Rangahau Hauora. You synthesise medical evidence related to preterm birth and twin pregnancies in New Zealand.`,
 });
 }

 getSystemPrompt(state: AgentState): string {
 return this.config.systemPrompt;
 }
}
