import { StateGraph, END, START, interrupt, MemorySaver } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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
  intent: Annotation<'RESEARCH' | 'PLANNING' | 'EXECUTION' | 'CLINICAL' | 'ADVOCACY' | 'TRANSLATE' | 'NUTRITION' | 'CULTURAL' | 'COMPLEX' | null>({
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

// === NODES ===
const intentClassifier = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  maxOutputTokens: 1024,
});

export async function classifyIntent(query: string): Promise<'RESEARCH' | 'PLANNING' | 'EXECUTION' | 'COMPLEX' | 'CLINICAL' | 'ADVOCACY' | 'TRANSLATE' | 'NUTRITION' | 'CULTURAL'> {
  const systemPrompt = `You are an intent classifier for a preterm whānau support system in Aotearoa New Zealand.

Classify the user's query into exactly one of these categories:
- RESEARCH: Questions about information, eligibility, definitions, or facts.
- PLANNING: Questions about steps, pathways, advice, or "how do I".
- EXECUTION: Requests to generate something, apply, or take concrete action.
- CLINICAL: Questions about medical symptoms, diagnosis, sickness, or medical advice.
- ADVOCACY: Requests to draft emails, challenge decisions, or learn about legal/hospital rights.
- TRANSLATE: Requests to explain or translate complex medical jargon or reports into simple English.
- NUTRITION: Questions specifically about feeding, tube feeding, breastfeeding, breastmilk, expressing, or solids.
- CULTURAL: Questions specifically about tikanga, karakia, marae, iwi, whenua, or Māori cultural practices.
- COMPLEX: Queries that combine multiple intents or are emotionally heavy.

Respond with ONLY one word: RESEARCH, PLANNING, EXECUTION, CLINICAL, ADVOCACY, TRANSLATE, NUTRITION, CULTURAL, or COMPLEX.`;

  const response = await intentClassifier.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(query),
  ]);

  const intent = response.content.toString().trim().toUpperCase();

  if (["RESEARCH", "PLANNING", "EXECUTION", "COMPLEX", "CLINICAL", "ADVOCACY", "TRANSLATE", "NUTRITION", "CULTURAL"].includes(intent)) {
    return intent as any;
  }
  return "COMPLEX";
}

export async function supervisorNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (!state.consentGiven) {
    return {
      intent: "RESEARCH",
      currentAgent: "riroriro",
      messages: [new HumanMessage(state.query)],
    };
  }

  const intent = await classifyIntent(state.query);

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
  } else if (intent === "PLANNING") {
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
    messages: [new HumanMessage(state.query)],
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
    requiresHumanReview: true,
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

graph.addConditionalEdges("guardrails", (state) => {
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
