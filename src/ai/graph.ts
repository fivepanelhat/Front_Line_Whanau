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
  const intent = await aetherSummit.classifyIntent(state.query);

  let nextAgent = 'knowledge_weaver';

  if (intent === 'RESEARCH') nextAgent = 'knowledge_weaver';
  if (intent === 'PLANNING') nextAgent = 'pathway_architect';
  if (intent === 'EXECUTION') nextAgent = 'sovereign_executor';

  // Cultural safety check runs early for sensitive topics
  if (
    state.query.toLowerCase().includes('cultural') ||
    state.query.toLowerCase().includes('marae') ||
    state.query.toLowerCase().includes('iwi')
  ) {
    nextAgent = 'cultural_safety_guardian';
  }

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

async function guardrailNode(state: AgentStateType) {
  if (!state.finalResponse) return {};
  const gate = checkGuardrails({ content: state.finalResponse, agentUsed: state.currentAgent });
  return {
    finalResponse: gate.modifiedResponse ?? state.finalResponse,
    showUrgentHelp: gate.showUrgentHelp,
    requiresHumanReview: !gate.passed || state.requiresHumanReview,
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

export const checkpointer = await createCheckpointSaver();

export const agentGraph = graph.compile({ checkpointer });

// Backward compatibility for existing imports
export const agentApp = agentGraph;
