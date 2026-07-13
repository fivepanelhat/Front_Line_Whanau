import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export interface AgentLLMOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  maxRetries?: number;
}

/**
 * Resolve Google Generative AI key without crashing Next.js builds.
 *
 * Vercel `next build` imports API/agent modules while collecting page data.
 * If GOOGLE_API_KEY is unset (common on preview/dependabot builds), the
 * LangChain constructor throws and the whole deployment fails.
 *
 * We allow a non-secret placeholder at construct time so builds succeed.
 * Runtime handlers should still check env and refuse real model calls when
 * the key is missing (see aether-summit / API routes).
 */
export function resolveGoogleApiKey(): string | undefined {
  return (
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    undefined
  );
}

export function hasGoogleApiKey(): boolean {
  return Boolean(resolveGoogleApiKey());
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
  const apiKey = resolveGoogleApiKey() ?? 'BUILD_TIME_PLACEHOLDER';

  return new ChatGoogleGenerativeAI({
    model: options.model || 'gemini-2.5-flash',
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.maxOutputTokens || 1024,
    maxRetries: options.maxRetries ?? 3,
    apiKey,
  });
}
