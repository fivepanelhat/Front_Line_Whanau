import 'server-only';
import { TaongaKnowledgeWeaver } from "./knowledge-weaver";
import { WhanauPathwayArchitect } from "./pathway-architect";
import { SovereignExecutor } from "./executor";
import { AgentResponse, OrchestrationContext } from "./types";
import { checkGuardrails } from "./guardrails";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { buildSupervisorClassificationPrompt } from "./prompts";

export class AetherSummit {
  private knowledgeWeaver = new TaongaKnowledgeWeaver();
  private pathwayArchitect = new WhanauPathwayArchitect();
  private executor = new SovereignExecutor();

  async classifyIntent(query: string): Promise<'RESEARCH' | 'PLANNING' | 'EXECUTION' | 'COMPLEX'> {
    if (!process.env.GOOGLE_API_KEY) {
      // Stub mode / fallback
      if (this.isResearchQuery(query)) return 'RESEARCH';
      if (this.isPlanningQuery(query)) return 'PLANNING';
      if (this.isExecutionQuery(query)) return 'EXECUTION';
      return 'COMPLEX';
    }

    try {
      const llm = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        temperature: 0,
      });
      
      const prompt = buildSupervisorClassificationPrompt(query);
      
      const response = await llm.invoke(prompt);
      const text = (response.content as string).trim().toUpperCase();
      if (['RESEARCH', 'PLANNING', 'EXECUTION', 'COMPLEX'].includes(text)) {
        return text as any;
      }
      return 'COMPLEX';
    } catch (e) {
      return 'COMPLEX';
    }
  }

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

    const intent = await this.classifyIntent(query);

    if (intent === 'RESEARCH') {
      response = await this.knowledgeWeaver.process(userQuery, context);
    } 
    else if (intent === 'PLANNING') {
      response = await this.pathwayArchitect.process(userQuery, context);
    } 
    else if (intent === 'EXECUTION') {
      response = await this.executor.process(userQuery, context);
    } 
    else {
      // Multi-agent synthesis for complex/general queries
      const [research, plan] = await Promise.all([
        this.knowledgeWeaver.process(userQuery, context),
        this.pathwayArchitect.process(userQuery, context)
      ]);

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
    let cleanedContent = response.content;
    cleanedContent = cleanedContent.replace(/^(\s*)\*\s+/gm, '$1- ');
    cleanedContent = cleanedContent.replace(/\*/g, '');

    return {
      agent: response.agentUsed || 'aether-summit',
      content: cleanedContent,
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
    return `🔍 RESEARCH SUMMARY:\n${research}\n\n🗺️ RECOMMENDED PATHWAY:\n${plan}\n\nYour whānau’s informed decision is final and respected. 💛`;
  }
}

export const aetherSummit = new AetherSummit();
