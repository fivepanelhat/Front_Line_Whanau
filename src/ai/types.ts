/**
 * Front Line Whānau — AI Agent System Types
 *
 * Shared interfaces for the 1+3 agent architecture:
 * - Aether Summit (Orchestrator)
 * - Knowledge Weaver (Information)
 * - Pathway Architect (Planning)
 * - Executor (Action)
 */

// ── Agent Roles ─────────────────────────────────────────────

export enum AgentRole {
  Orchestrator = 'aether-summit',
  KnowledgeWeaver = 'knowledge-weaver',
  PathwayArchitect = 'pathway-architect',
  Executor = 'executor',
}

// ── Consent Scopes ──────────────────────────────────────────

export enum ConsentScope {
  JournalRead = 'journal.read',
  JournalWrite = 'journal.write',
  JournalSync = 'journal.sync',
  VaultStore = 'vault.store',
  VaultSync = 'vault.sync',
  AIProcess = 'ai.process',
  AIExecute = 'ai.execute',
  DirectoryShare = 'directory.share',
}

// ── Message Types ───────────────────────────────────────────

export interface AgentMessage {
  /** Unique message ID */
  id: string;
  /** The user's original query */
  content: string;
  /** Timestamp of the message */
  timestamp: Date;
  /** Consent scopes granted for this interaction */
  grantedScopes: ConsentScope[];
  /** Optional context from previous interactions */
  context?: AgentContext;
}

export interface AgentContext {
  /** Previous messages in the conversation */
  history: Array<{
    role: 'user' | 'agent';
    content: string;
    agent?: AgentRole;
    timestamp: Date;
  }>;
  /** User's current support pathway (if any) */
  activePathway?: SupportPathway;
  /** User's region for directory lookups */
  region?: string;
}

// ── Response Types ──────────────────────────────────────────

export interface AgentResponse {
  /** The agent that generated this response */
  agent: AgentRole;
  /** The response content (markdown-safe) */
  content: string;
  /** Sources cited in the response */
  sources: Source[];
  /** Suggested follow-up actions */
  suggestedActions?: SuggestedAction[];
  /** Whether this response triggered child protection guardrails */
  childProtectionTriggered?: boolean;
  /** Confidence level (0-1) */
  confidence: number;
  /** Timestamp */
  timestamp: Date;
}

export interface Source {
  /** Source type: guide, directory, statute, or general */
  type: 'guide' | 'directory' | 'statute' | 'general';
  /** Source title */
  title: string;
  /** URL or reference */
  reference: string;
}

export interface SuggestedAction {
  /** Action label (e.g. "Apply for Preterm Baby Payment") */
  label: string;
  /** Action type */
  type: 'navigate' | 'form' | 'call' | 'info';
  /** Target (URL, phone number, or form ID) */
  target: string;
  /** Consent scope required (if any) */
  requiredScope?: ConsentScope;
}

// ── Support Pathway ─────────────────────────────────────────

export type PathwayType = 'financial' | 'housing' | 'health' | 'mental-health' | 'practical';

export type PathwayStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';

export interface PathwayStep {
  /** Step ID */
  id: string;
  /** Step title */
  title: string;
  /** Detailed description */
  description: string;
  /** Step status */
  status: PathwayStatus;
  /** External resources for this step */
  resources: Source[];
  /** Estimated time to complete */
  estimatedMinutes?: number;
}

export interface SupportPathway {
  /** Pathway ID */
  id: string;
  /** Pathway type */
  type: PathwayType;
  /** Current status */
  status: PathwayStatus;
  /** Steps in the pathway */
  steps: PathwayStep[];
  /** Index of the current step */
  currentStep: number;
  /** When the pathway was created */
  createdAt: Date;
  /** When the pathway was last updated */
  updatedAt: Date;
}

// ── Agent Interface ─────────────────────────────────────────

export interface Agent {
  /** Agent role identifier */
  role: AgentRole;
  /** Process a message and return a response */
  process(message: AgentMessage): Promise<AgentResponse>;
  /** Check if this agent can handle the given query */
  canHandle(query: string): boolean;
}

// ── Guardrail Types ─────────────────────────────────────────

export interface GuardrailResult {
  /** Whether the response passed all checks */
  passed: boolean;
  /** Which checks failed */
  failures: GuardrailFailure[];
  /** Modified response (if guardrails adjusted it) */
  modifiedResponse?: string;
}

export interface GuardrailFailure {
  /** Which guardrail was triggered */
  guardrail: 'grounding' | 'hallucination' | 'cultural-safety' | 'child-protection' | 'trauma-informed';
  /** Human-readable reason */
  reason: string;
  /** Severity level */
  severity: 'warning' | 'block';
}
