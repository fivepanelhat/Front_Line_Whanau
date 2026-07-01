import 'server-only';
import { StateGraph, END, START, interrupt, MemorySaver } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { agentLogger } from '@/lib/logger';

const log = agentLogger('Graph');

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
import { ClinicalTriageCompanion } from './agents/ClinicalTriageCompanion';
import { PolicyAdvocateCompanion } from './agents/PolicyAdvocateCompanion';
import { MedicalJargonTranslator } from './agents/MedicalJargonTranslator';
import { FeedingNavigator } from './agents/FeedingNavigator';
import { CulturalNavigator } from './agents/CulturalNavigator';
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
const knowledgeWeaver = new TaongaKnowledgeWeaver();
const pathwayArchitect = new WhanauPathwayArchitect();
const executor = new SovereignExecutor();

const culturalGuardian = new CulturalSafetyGuardian();
const resourceNavigator = new ResourceNavigator();
const traumaCompanion = new TraumaInformedCompanion();
const fundingChecker = new FundingEligibilityChecker();
const clinicalTriage = new ClinicalTriageCompanion();
const policyAdvocate = new PolicyAdvocateCompanion();
const medicalTranslator = new MedicalJargonTranslator();
const feedingNavigator = new FeedingNavigator();
const culturalNavigator = new CulturalNavigator();

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
      currentAgent: "knowledge_weaver",
      messages: [new HumanMessage(state.query)],
    };
  }

  const intent = await classifyIntent(state.query);

  let nextAgent = "knowledge_weaver";

  if (intent === "EXECUTION") {
    nextAgent = "funding_eligibility_checker";
  } else if (intent === "ADVOCACY") {
    nextAgent = "policy_advocate_companion";
  } else if (intent === "TRANSLATE") {
    nextAgent = "medical_jargon_translator";
  } else if (intent === "CLINICAL") {
    nextAgent = "clinical_triage_companion";
  } else if (intent === "NUTRITION") {
    nextAgent = "feeding_navigator";
  } else if (intent === "CULTURAL") {
    nextAgent = "cultural_navigator";
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
  try {
    const result = await knowledgeWeaver.process(state.query, state as any);
    return {
      finalResponse: result.content,
      sources: (result as any).sources || [],
      requiresHumanReview: result.requiresHumanReview ?? false,
    };
  } catch (error) {
    log.error({ error }, 'knowledgeWeaverNode failed');
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

async function culturalSafetyGuardianNode(state: AgentStateType) {
  try {
    const result = await culturalGuardian.process(state.query, state);
    return {
      finalResponse: result.content,
      requiresHumanReview: result.requiresHumanReview ?? false,
    };
  } catch (error) {
    log.error({ error }, 'culturalSafetyGuardianNode failed');
    return { finalResponse: "Kia ora, I am having trouble connecting to my cultural safety systems right now. Please try again soon." };
  }
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
    sources: (result as any).sources || [],
  };
}

async function clinicalTriageCompanionNode(state: AgentStateType) {
  try {
    const result = await clinicalTriage.process(state.query, state as any);
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
  const result = await policyAdvocate.process(state.query, state as any);
  return {
    finalResponse: result.content,
    requiresHumanReview: true,
  };
}

async function medicalJargonTranslatorNode(state: AgentStateType) {
  const result = await medicalTranslator.process(state.query, state as any);
  return {
    finalResponse: result.content,
  };
}

async function feedingNavigatorNode(state: AgentStateType) {
  const result = await feedingNavigator.process(state.query, state as any);
  return {
    finalResponse: result.content,
  };
}

async function culturalNavigatorNode(state: AgentStateType) {
  const result = await culturalNavigator.process(state.query, state as any);
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

  return {
    finalResponse: gate.modifiedResponse ?? state.finalResponse,
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
  .addNode('knowledge_weaver', knowledgeWeaverNode)
  .addNode('pathway_architect', pathwayArchitectNode)
  .addNode('sovereign_executor', sovereignExecutorNode)
  .addNode('cultural_safety_guardian', culturalSafetyGuardianNode)
  .addNode('resource_navigator', resourceNavigatorNode)
  .addNode('trauma_informed_companion', traumaInformedCompanionNode)
  .addNode('funding_eligibility_checker', fundingEligibilityCheckerNode)
  .addNode('clinical_triage_companion', clinicalTriageCompanionNode)
  .addNode('policy_advocate_companion', policyAdvocateCompanionNode)
  .addNode('medical_jargon_translator', medicalJargonTranslatorNode)
  .addNode('feeding_navigator', feedingNavigatorNode)
  .addNode('cultural_navigator', culturalNavigatorNode)
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
    case 'clinical_triage_companion':
      return 'clinical_triage_companion';
    case 'policy_advocate_companion':
      return 'policy_advocate_companion';
    case 'medical_jargon_translator':
      return 'medical_jargon_translator';
    case 'feeding_navigator':
      return 'feeding_navigator';
    case 'cultural_navigator':
      return 'cultural_navigator';
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
graph.addEdge('clinical_triage_companion', 'guardrails');
graph.addEdge('policy_advocate_companion', 'guardrails');
graph.addEdge('medical_jargon_translator', 'guardrails');
graph.addEdge('feeding_navigator', 'guardrails');
graph.addEdge('cultural_navigator', 'guardrails');

graph.addConditionalEdges("guardrails", (state) => {
  const highRiskAgents = ["funding_eligibility_checker", "cultural_safety_guardian", "policy_advocate_companion"];

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
