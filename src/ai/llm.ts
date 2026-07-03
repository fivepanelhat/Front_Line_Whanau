import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

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
  // Telemetry is attached per-invocation (see telemetryHandler in
  // telemetry.ts), NOT as a constructor callback: constructor-bound
  // callbacks force a callback-manager merge at every nesting level of the
  // react-agent subgraphs, which registered the stream handler multiple
  // times and made every streamed token reach clients 3x.
  return new ChatGoogleGenerativeAI({
    model: options.model || 'gemini-2.5-flash',
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.maxOutputTokens || 1024,
    maxRetries: options.maxRetries ?? 3,
  });
}
