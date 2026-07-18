import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, routeLogger, agentLogger } from '../logger';

// Mock fetch for webhook
global.fetch = vi.fn();

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SLACK_WEBHOOK_URL = 'http://mock.webhook';
  });

  afterEach(() => {
    delete process.env.SLACK_WEBHOOK_URL;
  });

  it('creates route logger', () => {
    const rLogger = routeLogger('/api/test');
    expect(rLogger).toBeDefined();
    expect(rLogger.bindings()).toHaveProperty('route', '/api/test');
  });

  it('creates agent logger', () => {
    const aLogger = agentLogger('mock_agent');
    expect(aLogger).toBeDefined();
    expect(aLogger.bindings()).toHaveProperty('agent', 'mock_agent');
  });

  it('triggers webhook on fatal error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error({ fatal: true }, 'This is a fatal error');

    // Wait for async fetch to fire
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://mock.webhook',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('does not trigger webhook on normal error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error({ info: 'just an error' }, 'This is a normal error');

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles error hook with string only', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Just a string error with fatal in it');

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalled();
  });
});
