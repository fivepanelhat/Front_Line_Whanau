import 'server-only';
import { StateGraph, END, START, MemorySaver } from '@langchain/langgraph';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

import { AetherSummit } from './aether-summit';
import { checkGuardrails } from './guardrails';
import { TaongaKnowledgeWeaver } from './knowledge-weaver';
import { WhanauPathwayArchitect } from './pathway-architect';
import { SovereignExecutor } from './executor';

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

const aetherSummit = new AetherSummit();
const knowledgeWeaver = new TaongaKnowledgeWeaver();
const pathwayArchitect = new WhanauPathwayArchitect();
const executor = new SovereignExecutor();

// === NODES ===
async function supervisorNode(state: AgentStateType) {
  const intent = await aetherSummit.classifyIntent(state.query);
  let nextAgent = 'knowledge_weaver';
  if (intent === 'PLANNING') nextAgent = 'pathway_architect';
  if (intent === 'EXECUTION') nextAgent = 'sovereign_executor';

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
  .addNode('guardrails', guardrailNode)
  .addNode('human_review', humanReviewNode);

graph.addEdge(START, 'supervisor');

graph.addConditionalEdges('supervisor', (state) => {
  if (state.currentAgent === 'knowledge_weaver') return 'knowledge_weaver';
  if (state.currentAgent === 'pathway_architect') return 'pathway_architect';
  if (state.currentAgent === 'sovereign_executor') return 'sovereign_executor';
  return 'knowledge_weaver';
});

graph.addEdge('knowledge_weaver', 'guardrails');
graph.addEdge('pathway_architect', 'guardrails');
graph.addEdge('sovereign_executor', 'guardrails');

graph.addConditionalEdges('guardrails', (state) =>
  state.requiresHumanReview ? 'human_review' : END
);

graph.addEdge('human_review', END);

const checkpointer = new MemorySaver(); // Swap with Postgres checkpointer later

export const agentGraph = graph.compile({ checkpointer });

// Backward compatibility for existing imports
export const agentApp = agentGraph;
