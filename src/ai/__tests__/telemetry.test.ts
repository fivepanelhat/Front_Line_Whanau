import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelemetryCallbackHandler } from '../telemetry';
import { logger } from '../../utils/logger';

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    metric: vi.fn(),
  },
}));

describe('TelemetryCallbackHandler', () => {
  let handler: TelemetryCallbackHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new TelemetryCallbackHandler();
    vi.useFakeTimers();
  });

  it('handles LLM start and end', async () => {
    const runId = 'test-run-1';
    await handler.handleLLMStart(
      { id: ['model', 'gemini-1.5-pro'] } as any,
      ['Hello'],
      runId,
      undefined,
      {},
      ['tag1'],
    );

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'LLM run started',
        runId,
        model: 'gemini-1.5-pro',
        tags: ['tag1'],
      }),
    );

    vi.advanceTimersByTime(1000);

    await handler.handleLLMEnd(
      {
        generations: [],
        llmOutput: { tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 } },
      } as any,
      runId,
    );

    expect(logger.metric).toHaveBeenCalledWith('llm_latency_ms', 1000, { runId });
    expect(logger.metric).toHaveBeenCalledWith('llm_prompt_tokens', 10, { runId });
    expect(logger.metric).toHaveBeenCalledWith('llm_completion_tokens', 20, { runId });
    expect(logger.metric).toHaveBeenCalledWith('llm_total_tokens', 30, { runId });

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'LLM run completed',
        runId,
        latencyMs: 1000,
      }),
    );
  });

  it('handles LLM end with missing start time and partial tokens', async () => {
    const runId = 'test-run-partial';
    await handler.handleLLMEnd(
      { generations: [], llmOutput: { tokenUsage: { promptTokens: 10 } } } as any,
      runId,
    );

    expect(logger.metric).toHaveBeenCalledWith('llm_latency_ms', 0, { runId });
    expect(logger.metric).toHaveBeenCalledWith('llm_prompt_tokens', 10, { runId });
    expect(logger.metric).not.toHaveBeenCalledWith(
      'llm_completion_tokens',
      expect.anything(),
      expect.anything(),
    );

    // Test entirely missing llmOutput
    await handler.handleLLMEnd({ generations: [] }, runId);
  });

  it('handles LLM error with missing start time', async () => {
    const runId = 'test-run-err-missing';
    const error = new Error('LLM failed');
    await handler.handleLLMError(error, runId);
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ latencyMs: 0 }), error);
  });

  it('handles LLM error', async () => {
    const runId = 'test-run-2';
    await handler.handleLLMStart({ id: ['model'] } as any, [], runId);

    vi.advanceTimersByTime(500);
    const error = new Error('LLM failed');
    await handler.handleLLMError(error, runId);

    expect(logger.metric).toHaveBeenCalledWith('llm_error', 1, { runId });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'LLM run failed',
        runId,
        latencyMs: 500,
      }),
      error,
    );
  });

  it('handles Tool start and end', async () => {
    const runId = 'tool-run-1';
    await handler.handleToolStart({ id: ['tool', 'search'] } as any, 'query', runId);

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Tool execution started',
        runId,
        toolName: 'search',
        input: 'query',
      }),
    );

    vi.advanceTimersByTime(200);
    await handler.handleToolEnd('result', runId);

    expect(logger.metric).toHaveBeenCalledWith('tool_latency_ms', 200, { runId });
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Tool execution completed',
        runId,
        latencyMs: 200,
      }),
    );
  });

  it('handles Tool error', async () => {
    const runId = 'tool-run-2';
    await handler.handleToolStart({ id: ['tool', 'search'] } as any, 'query', runId);

    vi.advanceTimersByTime(300);
    const error = new Error('Tool failed');
    await handler.handleToolError(error, runId);

    expect(logger.metric).toHaveBeenCalledWith('tool_error', 1, { runId });
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Tool execution failed',
        runId,
        latencyMs: 300,
      }),
      error,
    );
  });

  it('handles Tool end and error with missing start time', async () => {
    const runId = 'tool-run-missing';
    await handler.handleToolEnd('result', runId);
    expect(logger.metric).toHaveBeenCalledWith('tool_latency_ms', 0, { runId });

    await handler.handleToolError(new Error(), runId);
    expect(logger.metric).toHaveBeenCalledWith('tool_error', 1, { runId });
  });
});
