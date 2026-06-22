import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

export type UserRole = 'parent' | 'practitioner' | 'organisation';

export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  currentAgent: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  userRole: Annotation<UserRole | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  query: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  context: Annotation<string | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  results: Annotation<any[] | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  needsHumanReview: Annotation<boolean | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
  humanApproved: Annotation<boolean | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
}

export interface AgentResponse {
  content: string;
  confidence: number;
  sources?: string[];
  requiresHumanReview?: boolean;
  agentUsed?: string;
  showUrgentHelp?: boolean;
}

export interface OrchestrationContext {
  userQuery: string;
  familyContext?: Record<string, any>;
  previousMessages?: any[];
  consentGiven?: boolean;
  urgency?: 'low' | 'medium' | 'high';
}

export interface LegacyBaseAgent {
  name: string;
  description: string;
  process(query: string, context?: OrchestrationContext): Promise<AgentResponse>;
}
