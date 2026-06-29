import 'server-only';
import { StateGraph, END, START } from '@langchain/langgraph';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

import { AetherSummit } from './aether-summit';
import { checkGuardrails } from './guardrails';

// Existing agents
import { TaongaKnowledgeWeaver } from './knowledge-weaver';
import { WhanauPathwayArchitect } from './pathway-architect';
import { SovereignExecutor } from './executor';

// New specialist agents
import { CulturalSafetyGuardian } from './agents/CulturalSafetyGuardian';
import { ResourceNavigator } from './agents/ResourceNavigator';
import { TraumaInformedCompanion } from './agents/TraumaInformedCompanion';
import { FundingEligibilityChecker } from './agents/FundingEligibilityChecker';
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
  intent: Annotation<'RESEARCH' | 'PLANNING' | 'EXECUTION' | 'COMPLEX' | null>({
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
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...data,
    })
  );
}

// === AGENT INSTANCES ===
const aetherSummit = new AetherSummit();
const knowledgeWeaver = new TaongaKnowledgeWeaver();
const pathwayArchitect = new WhanauPathwayArchitect();
const executor = new SovereignExecutor();

const culturalGuardian = new CulturalSafetyGuardian();
const resourceNavigator = new ResourceNavigator();
const traumaCompanion = new TraumaInformedCompanion();
const fundingChecker = new FundingEligibilityChecker();

// === NODES ===
async function supervisorNode(state: AgentStateType) {
  const q = state.query.toLowerCase().trim();

  // === HIGH-CONFIDENCE ROUTING (checked in priority order) ===

  // 1. Funding / Financial / Best Start / WINZ
  if (
    q.includes('funding') ||
    q.includes('financial') ||
    q.includes('best start') ||
    q.includes('winz') ||
    q.includes('allowance') ||
    q.includes('payment')
  ) {
    logAgentEvent('supervisor_routed', {
      query: state.query,
      intent: 'EXECUTION',
      agent: 'funding_eligibility_checker',
    });
    return {
      intent: 'EXECUTION',
      currentAgent: 'funding_eligibility_checker',
      messages: [...state.messages, new HumanMessage(state.query)],
    };
  }

  // 2. Cultural Safety (Maori / Iwi)
  if (
    q.includes('cultural') ||
    q.includes('marae') ||
    q.includes('iwi') ||
    q.includes('kaumātua') ||
    q.includes('whakapapa') ||
    q.includes('māori')
  ) {
    logAgentEvent('supervisor_routed', {
      query: state.query,
      intent: 'RESEARCH',
      agent: 'cultural_safety_guardian',
    });
    return {
      intent: 'RESEARCH',
      currentAgent: 'cultural_safety_guardian',
      messages: [...state.messages, new HumanMessage(state.query)],
    };
  }

  // 3. Emotional / Trauma / Overwhelm
  if (
    q.includes('overwhelm') ||
    q.includes('emotional') ||
    q.includes('scared') ||
    q.includes('anxious') ||
    q.includes('grief') ||
    q.includes('feeling')
  ) {
    logAgentEvent('supervisor_routed', {
      query: state.query,
      intent: 'PLANNING',
      agent: 'trauma_informed_companion',
    });
    return {
      intent: 'PLANNING',
      currentAgent: 'trauma_informed_companion',
      messages: [...state.messages, new HumanMessage(state.query)],
    };
  }

  // 4. Regional / Local Support Services
  if (
    (q.includes('support') || q.includes('service')) &&
    (q.includes('taranaki') || q.includes('region') || q.includes('local') || q.includes('near'))
  ) {
    logAgentEvent('supervisor_routed', {
      query: state.query,
      intent: 'RESEARCH',
      agent: 'resource_navigator',
    });
    return {
      intent: 'RESEARCH',
      currentAgent: 'resource_navigator',
      messages: [...state.messages, new HumanMessage(state.query)],
    };
  }

  // 5. Preterm Care Topics (skin-to-skin, feeding, breathing, discharge, etc.)
  if (
    q.includes('skin to skin') ||
    q.includes('skin-to-skin') ||
    q.includes('kangaroo care') ||
    q.includes('feeding') ||
    q.includes('breastfeed') ||
    q.includes('breathing') ||
    q.includes('discharge') ||
    q.includes('preterm care')
  ) {
    logAgentEvent('supervisor_routed', {
      query: state.query,
      intent: 'RESEARCH',
      agent: 'knowledge_weaver',
    });
    return {
      intent: 'RESEARCH',
      currentAgent: 'knowledge_weaver',
      messages: [...state.messages, new HumanMessage(state.query)],
    };
  }

  // 6. General Service / Directory queries
  if (
    q.includes('support service') ||
    q.includes('where can i') ||
    q.includes('find support') ||
    q.includes('directory')
  ) {
    logAgentEvent('supervisor_routed', {
      query: state.query,
      intent: 'RESEARCH',
      agent: 'resource_navigator',
    });
    return {
      intent: 'RESEARCH',
      currentAgent: 'resource_navigator',
      messages: [...state.messages, new HumanMessage(state.query)],
    };
  }

  // === FALLBACK: Use LLM classification ===
  const intent = await aetherSummit.classifyIntent(state.query);

  let nextAgent = 'knowledge_weaver';

  if (intent === 'PLANNING') nextAgent = 'pathway_architect';
  if (intent === 'EXECUTION') nextAgent = 'sovereign_executor';

  logAgentEvent('supervisor_routed', {
    query: state.query,
    intent,
    agent: nextAgent,
  });

  return {
    intent,
    currentAgent: nextAgent,
    messages: [...state.messages, new HumanMessage(state.query)],
  };
}

async function knowledgeWeaverNode(state: AgentStateType) {
  const result = await knowledgeWeaver.process(state.query, state as any);
  return {
    finalResponse: result.content,
    sources: result.sources || [],
    requiresHumanReview: result.requiresHumanReview ?? false,
  };
}

async function pathwayArchitectNode(state: AgentStateType) {
  const result = await pathwayArchitect.process(state.query, state as any);
  return {
    finalResponse: result.content,
    sources: result.sources || [],
    requiresHumanReview: result.requiresHumanReview ?? false,
  };
}

async function sovereignExecutorNode(state: AgentStateType) {
  const result = await executor.process(state.query, state as any);
  return {
    finalResponse: result.content,
    sources: result.sources || [],
    requiresHumanReview: result.requiresHumanReview ?? true,
    context: {
      toolCalls: result.metadata?.toolCalls || [],
    },
  };
}

async function culturalSafetyGuardianNode(state: AgentStateType) {
  const result = await culturalGuardian.process(state.query, state);
  return {
    finalResponse: result.content,
    requiresHumanReview: result.requiresHumanReview ?? false,
  };
}

async function resourceNavigatorNode(state: AgentStateType) {
  const result = await resourceNavigator.process(state.query, state as any);
  return { finalResponse: result.content, sources: result.sources || [] };
}

async function traumaInformedCompanionNode(state: AgentStateType) {
  const result = await traumaCompanion.process(state.query, state as any);
  return { finalResponse: result.content };
}

async function fundingEligibilityCheckerNode(state: AgentStateType) {
  const result = await fundingChecker.process(state.query, state as any);
  return {
    finalResponse: result.content,
    requiresHumanReview: true,
    sources: result.sources || [],
  };
}

async function guardrailNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (!state.finalResponse) {
    return {};
  }

  const gate = checkGuardrails({
    content: state.finalResponse,
    agentUsed: state.currentAgent,
  });

  if (!gate.passed) {
    logAgentEvent('guardrail_intervened', {
      agent: state.currentAgent,
      reason: gate.reason,
    });
  }

  return {
    finalResponse: gate.modifiedResponse ?? state.finalResponse,
    showUrgentHelp: gate.showUrgentHelp,
    requiresHumanReview: !gate.passed || state.requiresHumanReview,
    // Optional: store reason in state for debugging/observability
    // context: { ...state.context, guardrailReason: gate.reason }
  };
}

async function humanReviewNode(state: AgentStateType) {
  if (state.humanApproved === true) return {};
  return { requiresHumanReview: true };
}

// === GRAPH ===
const graph = new StateGraph(AgentState)
  .addNode('supervisor', supervisorNode)
  .addNode('knowledge_weaver', knowledgeWeaverNode)
  .addNode('pathway_architect', pathwayArchitectNode)
  .addNode('sovereign_executor', sovereignExecutorNode)
  .addNode('cultural_safety_guardian', culturalSafetyGuardianNode)
  .addNode('resource_navigator', resourceNavigatorNode)
  .addNode('trauma_informed_companion', traumaInformedCompanionNode)
  .addNode('funding_eligibility_checker', fundingEligibilityCheckerNode)
  .addNode('guardrails', guardrailNode)
  .addNode('human_review', humanReviewNode);

graph.addEdge(START, 'supervisor');

graph.addConditionalEdges('supervisor', (state) => {
  switch (state.currentAgent) {
    case 'knowledge_weaver':
      return 'knowledge_weaver';
    case 'pathway_architect':
      return 'pathway_architect';
    case 'sovereign_executor':
      return 'sovereign_executor';
    case 'cultural_safety_guardian':
      return 'cultural_safety_guardian';
    case 'resource_navigator':
      return 'resource_navigator';
    case 'trauma_informed_companion':
      return 'trauma_informed_companion';
    case 'funding_eligibility_checker':
      return 'funding_eligibility_checker';
    default:
      return 'knowledge_weaver';
  }
});

// All agents flow through guardrails
graph.addEdge('knowledge_weaver', 'guardrails');
graph.addEdge('pathway_architect', 'guardrails');
graph.addEdge('sovereign_executor', 'guardrails');
graph.addEdge('cultural_safety_guardian', 'guardrails');
graph.addEdge('resource_navigator', 'guardrails');
graph.addEdge('trauma_informed_companion', 'guardrails');
graph.addEdge('funding_eligibility_checker', 'guardrails');

graph.addConditionalEdges('guardrails', (state) =>
  state.requiresHumanReview ? 'human_review' : END
);

graph.addEdge('human_review', END);

export let checkpointer: Awaited<ReturnType<typeof createCheckpointSaver>> | null = null;

// Provide an immediately usable graph, then upgrade to persistent checkpointing when available.
export let agentGraph = graph.compile();

// Backward compatibility for existing imports
export let agentApp = agentGraph;

void createCheckpointSaver()
  .then((cp) => {
    checkpointer = cp;
    agentGraph = graph.compile({ checkpointer: cp });
    agentApp = agentGraph;
  })
  .catch((error) => {
    console.warn('Checkpointed graph initialization failed; continuing without persistence.', error);
  });
