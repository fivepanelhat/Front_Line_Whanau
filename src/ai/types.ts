import { BaseMessage } from '@langchain/core/messages';

export interface AgentResponse {
  content: string;
  confidence: number;
  agentUsed: string;
  sources?: string[];
  requiresHumanReview?: boolean;
  showUrgentHelp?: boolean;
}

export interface OrchestrationContext {
  userQuery: string;
  consentGiven?: boolean;
  userId?: string;
  locale?: string;
  culturalContext?: Record<string, any>;
  familyContext?: Record<string, any>;
  previousMessages?: any[];
  urgency?: 'low' | 'medium' | 'high';
}

export const AgentStateAnnotation = {
  messages: [] as BaseMessage[],
  userRole: undefined as UserRole | undefined,
  query: '' as string,
  intent: null as 'RESEARCH' | 'PLANNING' | 'EXECUTION' | 'COMPLEX' | null,
  currentAgent: '' as string,
  context: {} as Record<string, any>,
  consentGiven: false as boolean,
  humanApproved: null as boolean | null,
  requiresHumanReview: false as boolean,
  finalResponse: null as string | null,
  sources: [] as string[],
  showUrgentHelp: false as boolean,
  culturalSafetyScore: 0 as number,
  checkpointId: null as string | null,
};

export type AgentState = typeof AgentStateAnnotation;

// Backward compatibility for existing call sites
export type UserRole = 'parent' | 'practitioner' | 'organisation';

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
}

export interface LegacyBaseAgent {
  name: string;
  description: string;
  process(query: string, context?: OrchestrationContext): Promise<AgentResponse>;
}
