import { StateGraph, END, START, interrupt, MemorySaver } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';
import { agentLogger } from '@/lib/logger';

const log = agentLogger('Graph');

import { AetherSummit } from './aether-summit';
import { checkGuardrails } from './guardrails';

// Existing agents
import { WhanauPathwayArchitect } from './pathway-architect';
import { SovereignExecutor } from './executor';

// New specialist agents
import { Tuatara } from './agents/tuatara';
import { Tiwaiwaka } from './agents/tiwaiwaka';
import { Kiwi } from './agents/kiwi';
import { Kea } from './agents/kea';
import { Ruru } from './agents/ruru';
import { Kahu } from './agents/kahu';
import { Tui } from './agents/tui';
import { Takahe } from './agents/takahe';
import { Toroa } from './agents/toroa';
import { Riroriro } from './agents/riroriro';
import { ActivationAuditor } from './agents/activation-auditor';
import { createCheckpointSaver } from './checkpointer';

const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  userRole: Annotation<'parent' | 'practitioner' | 'organisation' | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  query: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  intent: Annotation<Intent | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  currentAgent: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  context: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  consentGiven: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  humanApproved: Annotation<boolean | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  locale: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  requiresHumanReview: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  finalResponse: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  sources: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  showUrgentHelp: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  culturalSafetyScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
});

export type AgentStateType = typeof AgentState.State;

function logAgentEvent(event: string, data: Record<string, any>) {
  log.info({ event, ...data }, 'Agent event');
}

// === AGENT INSTANCES ===
const aetherSummit = new AetherSummit();
const riroriro = new Riroriro();
const pathwayArchitect = new WhanauPathwayArchitect();
const executor = new SovereignExecutor();

const tuatara = new Tuatara();
const tiwaiwaka = new Tiwaiwaka();
const kiwi = new Kiwi();
const kea = new Kea();
const ruru = new Ruru();
const kahu = new Kahu();
const tui = new Tui();
const takahe = new Takahe();
const toroa = new Toroa();
const activationAuditor = new ActivationAuditor();

// === NODES ===
// Shared with aether-summit (see classifier.ts) — re-exported for existing
// importers (tests) that pull classifyIntent from this module.
export { classifyIntent } from './classifier';
import { classifyIntent as classify, type Intent } from './classifier';

export async function supervisorNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  // NOTE: never return `messages` here — the messages reducer concats, and
  // the API routes already supply [...history, query]; returning the query
  // again duplicated it in every downstream agent's context.
  if (!state.consentGiven) {
    return {
      intent: "RESEARCH",
      currentAgent: "riroriro",
    };
  }

  // Activation requests route deterministically (no LLM round-trip):
  // a structured intake from the audit form, or open-ended
  // "where do I start" asks, both belong to the Activation Auditor.
  const q = state.query.toLowerCase();
  const wantsActivation =
    state.context?.auditInput !== undefined ||
    q.includes("playbook") ||
    q.includes("where do i start") ||
    q.includes("where do we start") ||
    q.includes("don't know where to begin") ||
    q.includes("dont know where to begin");

  if (wantsActivation) {
    logAgentEvent('supervisor_routed', {
      query: state.query,
      intent: 'PLANNING',
      agent: 'activation_auditor',
    });
    return {
      intent: 'PLANNING',
      currentAgent: 'activation_auditor',
    };
  }

  const intent = await classify(state.query, state.messages);

  let nextAgent = "riroriro";

  if (intent === "EXECUTION") {
    nextAgent = "kea";
  } else if (intent === "ADVOCACY") {
    nextAgent = "kahu";
  } else if (intent === "TRANSLATE") {
    nextAgent = "tui";
  } else if (intent === "CLINICAL") {
    nextAgent = "ruru";
  } else if (intent === "NUTRITION") {
    nextAgent = "takahe";
  } else if (intent === "CULTURAL") {
    nextAgent = "toroa";
  } else if (intent === "LOCAL_SERVICES") {
    nextAgent = "resource_navigator";
  } else if (intent === "PLANNING") {
    // How-do-I / step-by-step questions belong to the pathway planner;
    // this previously routed to kiwi (emotional support), which answered
    // practical questions with soft deflections instead of steps.
    nextAgent = "pathway_architect";
  } else if (intent === "COMPLEX") {
    // Emotionally heavy or multi-intent queries get the trauma-informed
    // companion (previously fell through to the research default).
    nextAgent = "kiwi";
  } else if (intent === "RESEARCH") {
    if (
      state.query.toLowerCase().includes("cultural") ||
      state.query.toLowerCase().includes("marae") ||
      state.query.toLowerCase().includes("iwi")
    ) {
      nextAgent = "tuatara";
    } else {
      nextAgent = "riroriro";
    }
  }

  logAgentEvent('supervisor_routed', {
    query: state.query,
    intent,
    agent: nextAgent,
  });

  return {
    intent,
    currentAgent: nextAgent,
  };
}

async function riroriroNode(state: AgentStateType) {
  if (!state.consentGiven) {
    return {
      finalResponse: "AI processing requires your explicit consent. Please enable AI processing in your settings or consent banner.",
      sources: [],
      requiresHumanReview: false,
    };
  }
  try {
    const result = await riroriro.process(state.query, state as any);
    return {
      finalResponse: result.content,
      sources: (result as any).sources || [],
      requiresHumanReview: result.requiresHumanReview ?? false,
    };
  } catch (error) {
    log.error({ error }, 'riroriroNode failed');
    return { finalResponse: "I'm currently experiencing high demand and cannot answer your query right now. Please try again shortly." };
  }
}

async function pathwayArchitectNode(state: AgentStateType) {
  try {
    const result = await pathwayArchitect.process(state.query, state as any);
    return {
      finalResponse: result.content,
      sources: (result as any).sources || [],
      requiresHumanReview: result.requiresHumanReview ?? false,
    };
  } catch (error) {
    log.error({ error }, 'pathwayArchitectNode failed');
    return { finalResponse: "I encountered an error planning this pathway. Please try again or rephrase your request." };
  }
}

async function sovereignExecutorNode(state: AgentStateType) {
  const result = await executor.process(state.query, state as any);
  return {
    finalResponse: result.content,
    sources: (result as any).sources || [],
    requiresHumanReview: result.requiresHumanReview ?? true,
    context: {
      toolCalls: result.metadata?.toolCalls || [],
    },
  };
}

async function tuataraNode(state: AgentStateType) {
  try {
    const result = await tuatara.process(state.query, state);
    return {
      finalResponse: result.content,
      requiresHumanReview: result.requiresHumanReview ?? false,
    };
  } catch (error) {
    log.error({ error }, 'tuataraNode failed');
    return { finalResponse: "Kia ora, I am having trouble connecting to my cultural safety systems right now. Please try again soon." };
  }
}

async function tiwaiwakaNode(state: AgentStateType) {
  const result = await tiwaiwaka.process(state.query, state as any);
  return { finalResponse: result.content, sources: result.sources || [] };
}

async function traumaInformedCompanionNode(state: AgentStateType) {
  const result = await kiwi.process(state.query, state as any);
  return { finalResponse: result.content };
}

async function fundingEligibilityCheckerNode(state: AgentStateType) {
  const result = await kea.process(state.query, state as any);
  return {
    finalResponse: result.content,
    requiresHumanReview: true,
    sources: (result as any).sources || [],
  };
}

async function clinicalTriageCompanionNode(state: AgentStateType) {
  try {
    const result = await ruru.process(state.query, state as any);
    return {
      finalResponse: result.content,
      showUrgentHelp: true,
    };
  } catch (error) {
    log.error({ error }, 'clinicalTriageCompanionNode failed');
    return { 
      finalResponse: "I am having technical issues processing this medical query. If this is an emergency, please call 111 or seek immediate medical attention.",
      showUrgentHelp: true 
    };
  }
}

async function policyAdvocateCompanionNode(state: AgentStateType) {
  const result = await kahu.process(state.query, state as any);
  return {
    finalResponse: result.content,
    // Respect the agent's own flag (drafts are user-sent templates);
    // forcing true here routed every advocacy answer to the unstaffed
    // human-review queue via the guardrails edge.
    requiresHumanReview: result.requiresHumanReview ?? false,
  };
}

async function tuiNode(state: AgentStateType) {
  const result = await tui.process(state.query, state as any);
  return {
    finalResponse: result.content,
  };
}

async function takaheNode(state: AgentStateType) {
  const result = await takahe.process(state.query, state as any);
  return {
    finalResponse: result.content,
  };
}

async function toroaNode(state: AgentStateType) {
  const result = await toroa.process(state.query, state as any);
  return {
    finalResponse: result.content,
  };
}

async function activationAuditorNode(state: AgentStateType) {
  try {
    const result = await activationAuditor.process(state.query, state as any);
    return {
      finalResponse: result.content,
      sources: result.sources || [],
      requiresHumanReview: result.requiresHumanReview ?? false,
      showUrgentHelp: result.showUrgentHelp ?? false,
      context: {
        playbook: result.metadata?.playbook ?? null,
      },
    };
  } catch (error) {
    log.error({ error }, 'activationAuditorNode failed');
    return {
      finalResponse:
        "I couldn't build your playbook just now. Please try again shortly, or tell me a little about your situation and I'll help directly.",
    };
  }
}

export async function guardrailNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (!state.finalResponse) {
    return {};
  }

  const gate = checkGuardrails({
    content: state.finalResponse,
    agentUsed: state.currentAgent,
  });

  // Enhanced logging with agent context
  if (!gate.passed) {
    logAgentEvent("guardrail_intervened", {
      agent: state.currentAgent,
      reason: gate.reason || 'Unknown',
    });
  }

  let finalResponse = gate.modifiedResponse ?? state.finalResponse;

  // Universally append medical disclaimer for clinical/knowledge agents
  const disclaimerAgents = [
    'ruru',
    'tui', 
    'takahe',
    'riroriro',
    'kiwi'
  ];

  if (disclaimerAgents.includes(state.currentAgent) && !finalResponse.includes('medical advice')) {
    finalResponse += "\n\n> [!CAUTION]\n> **Disclaimer:** Whilst our AI is a trained guidance tool that navigates this space to tautoko whānau, remember to practice discernment and due diligence. It is **not a registered medical, financial or cultural advisor**. Always consult a registered practitioner for professional advice.";
  }

  // Multilingual dialect disclaimer
  if (state.locale && state.locale !== 'en' && !finalResponse.includes('cultural dialect')) {
    finalResponse += "\n\n> [!NOTE]\n> **Translation Disclaimer:** Please accept that as an AI, not all cultural dialect and translation is absolutely perfect, and we tautoko that.";
  }

  return {
    finalResponse,
    showUrgentHelp: gate.showUrgentHelp,
    requiresHumanReview: !gate.passed || state.requiresHumanReview,
  };
}

export async function humanReviewNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  // If already approved, continue
  if (state.humanApproved === true) {
    return {};
  }

  // Pause execution and wait for human input
  const reviewResult = interrupt({
    message: "This response requires human review before being sent to the user.",
    agent: state.currentAgent,
    proposedResponse: state.finalResponse,
    query: state.query,
  }) as any;

  // When resumed, reviewResult will contain the human decision
  if (reviewResult?.approved === true) {
    return {
      humanApproved: true,
      requiresHumanReview: false,
    };
  } else {
    // If rejected or modified
    return {
      finalResponse: reviewResult?.modifiedResponse || 
        "This response has been reviewed and requires further clarification.",
      requiresHumanReview: true,
      humanApproved: false,
    };
  }
}

// === GRAPH ===
const graph = new StateGraph(AgentState)
  .addNode('supervisor', supervisorNode)
  .addNode('riroriro', riroriroNode)
  .addNode('pathway_architect', pathwayArchitectNode)
  .addNode('sovereign_executor', sovereignExecutorNode)
  .addNode('tuatara', tuataraNode)
  .addNode('resource_navigator', tiwaiwakaNode)
  .addNode('kiwi', traumaInformedCompanionNode)
  .addNode('kea', fundingEligibilityCheckerNode)
  .addNode('ruru', clinicalTriageCompanionNode)
  .addNode('kahu', policyAdvocateCompanionNode)
  .addNode('tui', tuiNode)
  .addNode('takahe', takaheNode)
  .addNode('toroa', toroaNode)
  .addNode('activation_auditor', activationAuditorNode)
  .addNode('guardrails', guardrailNode)
  .addNode('human_review', humanReviewNode);

graph.addEdge(START, 'supervisor');

graph.addConditionalEdges('supervisor', (state) => {
  switch (state.currentAgent) {
    case 'riroriro':
      return 'riroriro';
    case 'pathway_architect':
      return 'pathway_architect';
    case 'sovereign_executor':
      return 'sovereign_executor';
    case 'tuatara':
      return 'tuatara';
    case 'resource_navigator':
      return 'resource_navigator';
    case 'kiwi':
      return 'kiwi';
    case 'kea':
      return 'kea';
    case 'ruru':
      return 'ruru';
    case 'kahu':
      return 'kahu';
    case 'tui':
      return 'tui';
    case 'takahe':
      return 'takahe';
    case 'toroa':
      return 'toroa';
    case 'activation_auditor':
      return 'activation_auditor';
    default:
      return 'riroriro';
  }
});

// All agents flow through guardrails
graph.addEdge('riroriro', 'guardrails');
graph.addEdge('pathway_architect', 'guardrails');
graph.addEdge('sovereign_executor', 'guardrails');
graph.addEdge('tuatara', 'guardrails');
graph.addEdge('resource_navigator', 'guardrails');
graph.addEdge('kiwi', 'guardrails');
graph.addEdge('kea', 'guardrails');
graph.addEdge('ruru', 'guardrails');
graph.addEdge('kahu', 'guardrails');
graph.addEdge('tui', 'guardrails');
graph.addEdge('takahe', 'guardrails');
graph.addEdge('toroa', 'guardrails');
graph.addEdge('activation_auditor', 'guardrails');

graph.addConditionalEdges("guardrails", (state) => {
  // activation_auditor is intentionally NOT here: its playbooks flag
  // financial/cultural plays requiresHumanReview for the async review
  // queue and render per-play "will be confirmed" notices, but blocking
  // delivery behind the interrupt queue would also hold back urgent
  // crisis contacts (same reasoning as the kahu note above).
  const highRiskAgents = ["kea", "tuatara", "kahu"];

  if (highRiskAgents.includes(state.currentAgent) && state.requiresHumanReview) {
    return "human_review";
  }
  return END;
});

graph.addEdge("human_review", END);

export let checkpointer: Awaited<ReturnType<typeof createCheckpointSaver>> | null = null;

// Provide an immediately usable graph, then upgrade to persistent checkpointing when available.
export let agentGraph = graph.compile();

// Backward compatibility for existing imports
export let agentApp = agentGraph;

(async () => {
  try {
    checkpointer = await createCheckpointSaver();
    agentGraph = graph.compile({ checkpointer });
    agentApp = agentGraph;
  } catch (error) {
    log.warn({ err: error }, 'Checkpointed graph initialization failed; continuing without persistence.');
    checkpointer = new MemorySaver();
    agentGraph = graph.compile({ checkpointer });
    agentApp = agentGraph;
  }
})();
