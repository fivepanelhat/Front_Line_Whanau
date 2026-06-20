import { TaongaKnowledgeWeaver } from "./knowledge-weaver";
import { WhanauPathwayArchitect } from "./pathway-architect";
import { SovereignExecutor } from "./executor";
import { AgentResponse, OrchestrationContext } from "./types";

export class AetherSummit {
  private knowledgeWeaver = new TaongaKnowledgeWeaver();
  private pathwayArchitect = new WhanauPathwayArchitect();
  private executor = new SovereignExecutor();

  async orchestrate(context: OrchestrationContext): Promise<AgentResponse> {
    const { userQuery, consentGiven = false } = context;

    if (!consentGiven) {
      return {
        content: "I cannot proceed without your explicit consent. Would you like to continue?",
        confidence: 1.0,
        requiresHumanReview: true,
        agentUsed: "Aether Summit",
      };
    }

    const query = userQuery.toLowerCase();

    if (this.isResearchQuery(query)) {
      return await this.knowledgeWeaver.process(userQuery, context);
    } 
    else if (this.isPlanningQuery(query)) {
      return await this.pathwayArchitect.process(userQuery, context);
    } 
    else if (this.isExecutionQuery(query)) {
      return await this.executor.process(userQuery, context);
    } 
    else {
      // Multi-agent synthesis for complex/general queries
      const research = await this.knowledgeWeaver.process(userQuery, context);
      const plan = await this.pathwayArchitect.process(userQuery, context);

      return {
        content: this.synthesize(research.content, plan.content),
        confidence: Math.min(research.confidence, plan.confidence),
        agentUsed: "Aether Summit (Multi-agent)",
        requiresHumanReview: true,
      };
    }
  }

  /**
   * Backward-compatible process method for components
   */
  async process(query: string, grantedScopes: any[] = []): Promise<any> {
    const consentGiven = grantedScopes.includes('ai.process') || grantedScopes.includes('ai.execute') || grantedScopes.length > 0;
    const response = await this.orchestrate({
      userQuery: query,
      consentGiven
    });
    return {
      agent: response.agentUsed || 'aether-summit',
      content: response.content,
      confidence: response.confidence,
      sources: response.sources?.map(s => ({ type: 'general', title: s, reference: '#' })) || [],
      suggestedActions: [],
      timestamp: new Date()
    };
  }

  private isResearchQuery(q: string): boolean {
    return q.includes("what is") || q.includes("how much") || q.includes("eligibility") || q.includes("amount");
  }

  private isPlanningQuery(q: string): boolean {
    return q.includes("plan") || q.includes("how do i") || q.includes("steps") || q.includes("advice");
  }

  private isExecutionQuery(q: string): boolean {
    return q.includes("apply") || q.includes("generate") || q.includes("template") || q.includes("fill");
  }

  private synthesize(research: string, plan: string): string {
    return `**Research Summary:**\n${research}\n\n**Recommended Pathway:**\n${plan}\n\nYour whānau’s informed decision is final and respected.`;
  }
}

export const aetherSummit = new AetherSummit();
