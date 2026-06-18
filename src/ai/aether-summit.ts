/**
 * Aether Summit — Lead Orchestrator
 *
 * The central intelligence of the 1+3 agent system.
 * Routes user queries to specialist agents, maintains conversation
 * context, and applies guardrails to all responses.
 *
 * Architecture:
 *   User → Aether Summit → [Knowledge Weaver | Pathway Architect | Executor]
 *                        → Guardrails → Response
 */

import type { AgentMessage, AgentResponse, AgentContext, ConsentScope } from './types';
import { AgentRole } from './types';
import { KnowledgeWeaver } from './knowledge-weaver';
import { PathwayArchitect } from './pathway-architect';
import { Executor } from './executor';
import { checkGuardrails } from './guardrails';

// ── Orchestrator ─────────────────────────────────────────────

export class AetherSummit {
  private knowledgeWeaver: KnowledgeWeaver;
  private pathwayArchitect: PathwayArchitect;
  private executor: Executor;
  private context: AgentContext;

  constructor() {
    this.knowledgeWeaver = new KnowledgeWeaver();
    this.pathwayArchitect = new PathwayArchitect();
    this.executor = new Executor();
    this.context = { history: [] };
  }

  /**
   * Process a user query by routing to the appropriate specialist agent.
   */
  async process(
    query: string,
    grantedScopes: ConsentScope[] = [],
  ): Promise<AgentResponse> {
    const message: AgentMessage = {
      id: this.generateId(),
      content: query,
      timestamp: new Date(),
      grantedScopes,
      context: this.context,
    };

    // Record user message in context
    this.context.history.push({
      role: 'user',
      content: query,
      timestamp: new Date(),
    });

    // Route to appropriate agent
    let response: AgentResponse;

    if (this.isGreeting(query)) {
      response = this.greetingResponse();
    } else if (this.executor.canHandle(query)) {
      response = await this.executor.process(message);
    } else if (this.pathwayArchitect.canHandle(query)) {
      response = await this.pathwayArchitect.process(message);
    } else if (this.knowledgeWeaver.canHandle(query)) {
      response = await this.knowledgeWeaver.process(message);
    } else {
      response = this.defaultResponse();
    }

    // Apply guardrails
    const guardrailResult = checkGuardrails(response);

    if (guardrailResult.modifiedResponse) {
      response = {
        ...response,
        content: guardrailResult.modifiedResponse,
        childProtectionTriggered: guardrailResult.failures.some(
          (f) => f.guardrail === 'child-protection',
        ),
      };
    }

    // Record agent response in context
    this.context.history.push({
      role: 'agent',
      content: response.content,
      agent: response.agent,
      timestamp: response.timestamp,
    });

    // Trim context to last 20 messages
    if (this.context.history.length > 20) {
      this.context.history = this.context.history.slice(-20);
    }

    return response;
  }

  /**
   * Reset the conversation context.
   */
  resetContext(): void {
    this.context = { history: [] };
  }

  /**
   * Set the user's region for directory lookups.
   */
  setRegion(region: string): void {
    this.context.region = region;
  }

  // ── Private Helpers ──────────────────────────────────────

  private isGreeting(query: string): boolean {
    const lower = query.toLowerCase().trim();
    const greetings = ['hi', 'hello', 'hey', 'kia ora', 'tēnā koe', 'good morning', 'good afternoon'];
    return greetings.some((g) => lower.startsWith(g));
  }

  private greetingResponse(): AgentResponse {
    return {
      agent: AgentRole.Orchestrator,
      content: `**Kia ora!** Welcome to Front Line Whānau. 💛

I'm here to help you navigate support services for your whānau. I can help with:

- **💰 Financial support** — WINZ payments, IRD tax credits, emergency assistance
- **🏠 Housing** — Tenancy rights, repairs, accommodation support
- **💚 Mental health** — Counselling, peer support, self-care resources
- **📋 Forms & documents** — Pre-fill applications, draft letters
- **🗺️ Services directory** — Find local and national support services

What would you like help with today? There's no rush — take your time.`,
      sources: [],
      suggestedActions: [
        { label: 'Financial Support', type: 'info', target: 'financial' },
        { label: 'Housing Help', type: 'info', target: 'housing' },
        { label: 'Mental Health', type: 'info', target: 'mental-health' },
        { label: 'Browse Directory', type: 'navigate', target: '/directory' },
      ],
      confidence: 1,
      timestamp: new Date(),
    };
  }

  private defaultResponse(): AgentResponse {
    return {
      agent: AgentRole.Orchestrator,
      content: `I'm not sure I can help with that specific topic yet, but I want to make sure you get the support you need.

**Here are some options:**
- Browse our **Services Directory** for Taranaki and national support
- Tell me about your situation in your own words, and I'll do my best to point you in the right direction
- Call **PlunketLine** (0800 933 922) for immediate parenting support

What area would you like help with? Financial, housing, health, or something else?`,
      sources: [
        { type: 'general', title: 'Front Line Whānau', reference: '/' },
      ],
      suggestedActions: [
        { label: 'Browse Directory', type: 'navigate', target: '/directory' },
        { label: 'Call PlunketLine', type: 'call', target: '0800933922' },
      ],
      confidence: 0.4,
      timestamp: new Date(),
    };
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}
