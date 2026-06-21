import { TaongaKnowledgeWeaver } from "./knowledge-weaver";
import { WhanauPathwayArchitect } from "./pathway-architect";
import { SovereignExecutor } from "./executor";
import { AgentResponse, OrchestrationContext } from "./types";
import { checkGuardrails } from "./guardrails";

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
    let response: AgentResponse;

    if (this.isResearchQuery(query)) {
      response = await this.knowledgeWeaver.process(userQuery, context);
    } 
    else if (this.isPlanningQuery(query)) {
      response = await this.pathwayArchitect.process(userQuery, context);
    } 
    else if (this.isExecutionQuery(query)) {
      response = await this.executor.process(userQuery, context);
    } 
    else {
      // Multi-agent synthesis for complex/general queries
      const research = await this.knowledgeWeaver.process(userQuery, context);
      const plan = await this.pathwayArchitect.process(userQuery, context);

      response = {
        content: this.synthesize(research.content, plan.content),
        confidence: Math.min(research.confidence, plan.confidence),
        agentUsed: "Aether Summit (Multi-agent)",
        requiresHumanReview: true,
        sources: [...(research.sources || []), ...(plan.sources || [])],
      };
    }

    const gate = checkGuardrails(response);
    if (!gate.passed) {
      return {
        content:
          "I want to get this exactly right for you, so I won't give a number I can't " +
          'confirm. Here is the official source, and a social worker can confirm your ' +
          'specific situation.',
        confidence: 0.2,
        requiresHumanReview: true,
        agentUsed: response.agentUsed,
        showUrgentHelp: gate.showUrgentHelp,
      };
    }

    response.content = gate.modifiedResponse ?? response.content;
    response.showUrgentHelp = gate.showUrgentHelp;
    return response;
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
      sources: response.sources?.map(s => ({ type: 'general', title: s, reference: s })) || [],
      suggestedActions: [],
      timestamp: new Date(),
      showUrgentHelp: response.showUrgentHelp
    };
  }

  private isResearchQuery(q: string): boolean {
    return q.includes("what is") || q.includes("how much") || q.includes("eligibility") || q.includes("amount") || q.includes("preterm") || q.includes("best start") || q.includes("home help");
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
