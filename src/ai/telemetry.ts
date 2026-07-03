import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { LLMResult } from '@langchain/core/outputs';
import { Serialized } from '@langchain/core/load/serializable';
import { logger } from '../utils/logger';

export class TelemetryCallbackHandler extends BaseCallbackHandler {
  name = 'TelemetryCallbackHandler';
  
  private runStartTimes: Map<string, number> = new Map();

  async handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>,
    tags?: string[],
    metadata?: Record<string, unknown>
  ) {
    this.runStartTimes.set(runId, Date.now());
    logger.info({
      message: 'LLM run started',
      runId,
      model: llm.id[llm.id.length - 1],
      tags,
      metadata
    });
  }

  async handleLLMEnd(
    output: LLMResult,
    runId: string,
    parentRunId?: string,
    tags?: string[]
  ) {
    const startTime = this.runStartTimes.get(runId);
    const latencyMs = startTime ? Date.now() - startTime : 0;
    this.runStartTimes.delete(runId);

    // Langchain LLMResult usually has llmOutput with tokenUsage
    const tokenUsage = output.llmOutput?.tokenUsage || output.llmOutput?.estimatedTokenUsage || null;
    
    logger.metric('llm_latency_ms', latencyMs, { runId });
    
    if (tokenUsage) {
      if (tokenUsage.promptTokens) logger.metric('llm_prompt_tokens', tokenUsage.promptTokens, { runId });
      if (tokenUsage.completionTokens) logger.metric('llm_completion_tokens', tokenUsage.completionTokens, { runId });
      if (tokenUsage.totalTokens) logger.metric('llm_total_tokens', tokenUsage.totalTokens, { runId });
    }

    logger.info({
      message: 'LLM run completed',
      runId,
      latencyMs,
      tokenUsage
    });
  }

  async handleLLMError(
    err: Error,
    runId: string,
    parentRunId?: string,
    tags?: string[]
  ) {
    const startTime = this.runStartTimes.get(runId);
    const latencyMs = startTime ? Date.now() - startTime : 0;
    this.runStartTimes.delete(runId);

    logger.metric('llm_error', 1, { runId });
    logger.error({
      message: 'LLM run failed',
      runId,
      latencyMs,
      tags
    }, err);
  }

  async handleToolStart(
    tool: Serialized,
    input: string,
    runId: string
  ) {
    this.runStartTimes.set(runId, Date.now());
    logger.info({
      message: 'Tool execution started',
      runId,
      toolName: tool.id[tool.id.length - 1],
      input
    });
  }

  async handleToolEnd(
    output: string,
    runId: string
  ) {
    const startTime = this.runStartTimes.get(runId);
    const latencyMs = startTime ? Date.now() - startTime : 0;
    this.runStartTimes.delete(runId);
    
    logger.metric('tool_latency_ms', latencyMs, { runId });
    logger.info({
      message: 'Tool execution completed',
      runId,
      latencyMs
    });
  }

  async handleToolError(
    err: Error,
    runId: string
  ) {
    const startTime = this.runStartTimes.get(runId);
    const latencyMs = startTime ? Date.now() - startTime : 0;
    this.runStartTimes.delete(runId);
    
    logger.metric('tool_error', 1, { runId });
    logger.error({
      message: 'Tool execution failed',
      runId,
      latencyMs
    }, err);
  }
}

// Shared singleton for per-invocation attachment (config.callbacks) — state
// is keyed by runId so a single instance is safe across concurrent requests.
export const telemetryHandler = new TelemetryCallbackHandler();
