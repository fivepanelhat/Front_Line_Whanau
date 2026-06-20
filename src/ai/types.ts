export interface AgentResponse {
  content: string;
  confidence: number;
  sources?: string[];
  requiresHumanReview?: boolean;
  agentUsed?: string;
}

export interface OrchestrationContext {
  userQuery: string;
  familyContext?: Record<string, any>;
  previousMessages?: any[];
  consentGiven?: boolean;
  urgency?: 'low' | 'medium' | 'high';
}

export interface BaseAgent {
  name: string;
  description: string;
  process(query: string, context?: OrchestrationContext): Promise<AgentResponse>;
}
