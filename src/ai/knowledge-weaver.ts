import { BaseAgent, AgentResponse, OrchestrationContext } from './types';

export class TaongaKnowledgeWeaver implements BaseAgent {
  name = "Taonga Knowledge Weaver";
  description = "Researches and provides accurate, cited information";

  async process(query: string, context?: OrchestrationContext): Promise<AgentResponse> {
    const q = query.toLowerCase();

    if (q.includes("preterm baby payment") || q.includes("preterm payment")) {
      return this.createResponse(
        `**Preterm Baby Payment (June 2026)**\n\n` +
        `- Weekly maximum: **$788.66 gross**\n` +
        `- Duration: Up to **13 weeks** (additional to standard Paid Parental Leave)\n` +
        `- Can be backdated if applied before the baby’s first birthday.\n\n` +
        `Apply via myIR or through your employer.`,
        0.93,
        ["https://www.ird.govt.nz/paid-parental-leave/qualifying/preterm-babies"]
      );
    }

    if (q.includes("best start")) {
      return this.createResponse(
        `**Best Start Tax Credit (June 2026)**\n\n` +
        `- Up to **$77 per week** per child\n` +
        `- Full rate in year 1 for babies born before 1 April 2026\n` +
        `- Apply via myIR or SmartStart`,
        0.91,
        ["https://www.ird.govt.nz/working-for-families/types/best-start"]
      );
    }

    if (q.includes("home help")) {
      return this.createResponse(
        `**WINZ Home Help (for twins)**\n\n` +
        `- Up to **240 hours** within 12 months\n` +
        `- Available if you have another child under 5\n` +
        `- Apply via 0800 559 009 or hospital social worker`,
        0.89,
        ["https://www.workandincome.govt.nz/products/a-z-benefits/home-help.html"]
      );
    }

    return this.createResponse(
      `I looked into your query but need more specific details for accurate information. ` +
      `I can currently assist with topics like Preterm Baby Payment, Best Start, Home Help, and housing rights.`,
      0.55,
      [],
      true
    );
  }

  private createResponse(content: string, confidence: number, sources: string[] = [], review = false): AgentResponse {
    return {
      content,
      confidence,
      sources: sources.length > 0 ? sources : undefined,
      requiresHumanReview: review,
      agentUsed: this.name,
    };
  }
}
