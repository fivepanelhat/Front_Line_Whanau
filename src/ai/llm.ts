import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { TelemetryCallbackHandler } from './telemetry';

export interface AgentLLMOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  maxRetries?: number;
}

/**
 * Centralised factory for generating LLM instances across all agents.
 * Ensures consistent API calling limits, tokenisation caps, and retry resilience.
 */
export function createAgentLLM(options: AgentLLMOptions = {}) {
  return new ChatGoogleGenerativeAI({
    model: options.model || 'gemini-2.5-flash',
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.maxOutputTokens || 1024,
    maxRetries: options.maxRetries ?? 3,
    callbacks: [new TelemetryCallbackHandler()],
  });
}
