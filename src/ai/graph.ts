import 'server-only';
import { StateGraph, END, START, interrupt } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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
const intentClassifier = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

async function classifyIntent(query: string): Promise<'RESEARCH' | 'PLANNING' | 'EXECUTION' | 'COMPLEX'> {
  const systemPrompt = `You are an intent classifier for a preterm whānau support system in Aotearoa New Zealand.

Classify the user's query into exactly one of these categories:
- RESEARCH: Questions about information, eligibility, definitions, or facts.
- PLANNING: Questions about steps, pathways, advice, or "how do I".
- EXECUTION: Requests to generate something, apply, or take concrete action.
- COMPLEX: Queries that combine multiple intents or are emotionally heavy.

Respond with ONLY one word: RESEARCH, PLANNING, EXECUTION, or COMPLEX.`;

  const response = await intentClassifier.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(query),
  ]);

  const intent = response.content.toString().trim().toUpperCase();

  if (["RESEARCH", "PLANNING", "EXECUTION", "COMPLEX"].includes(intent)) {
    return intent as any;
  }
  return "COMPLEX";
}

async function supervisorNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (!state.consentGiven) {
    return {
      intent: "RESEARCH",
      currentAgent: "knowledge_weaver", // Fallback, won't actually invoke LLM if we guard it
      messages: [new HumanMessage(state.query)],
    };
  }

  const intent = await classifyIntent(state.query);

  let nextAgent = "knowledge_weaver";

  if (intent === "EXECUTION") {
    nextAgent = "funding_eligibility_checker";
  } else if (intent === "PLANNING") {
    nextAgent = "trauma_informed_companion";
  } else if (intent === "RESEARCH") {
    if (
      state.query.toLowerCase().includes("cultural") ||
      state.query.toLowerCase().includes("marae") ||
      state.query.toLowerCase().includes("iwi")
    ) {
      nextAgent = "cultural_safety_guardian";
    } else {
      nextAgent = "knowledge_weaver";
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

async function knowledgeWeaverNode(state: AgentStateType) {
  if (!state.consentGiven) {
    return {
      finalResponse: "AI processing requires your explicit consent. Please enable AI processing in your settings or consent banner.",
      sources: [],
      requiresHumanReview: false,
    };
  }
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

  // Enhanced logging with agent context
  if (!gate.passed) {
    logAgentEvent("guardrail_intervened", {
      agent: state.currentAgent,
      reason: gate.reason || 'Unknown',
    });
  }

  return {
    finalResponse: gate.modifiedResponse ?? state.finalResponse,
    showUrgentHelp: gate.showUrgentHelp,
    requiresHumanReview: !gate.passed || state.requiresHumanReview,
  };
}

async function humanReviewNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
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

graph.addConditionalEdges("guardrails", (state) => {
  const highRiskAgents = ["funding_eligibility_checker", "cultural_safety_guardian"];

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

void createCheckpointSaver()
  .then((cp) => {
    checkpointer = cp;
    agentGraph = graph.compile({ checkpointer: cp });
    agentApp = agentGraph;
  })
  .catch((error) => {
    console.warn('Checkpointed graph initialization failed; continuing without persistence.', error);
  });
