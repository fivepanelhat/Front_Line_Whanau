import { BaseMessage } from "@langchain/core/messages";

export type UserRole = "parent" | "practitioner" | "organisation";

export interface AgentState {
  messages: BaseMessage[];
  currentAgent?: string;
  userRole?: UserRole;
  query?: string;
  context?: string;
  results?: any[];
  needsHumanReview?: boolean;
  humanApproved?: boolean;
}

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
