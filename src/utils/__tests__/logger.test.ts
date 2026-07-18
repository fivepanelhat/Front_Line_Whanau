import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';

describe('TelemetryLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('formats and logs info string correctly', () => {
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalled();
    const logCall = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test info message');
    expect(parsed).toHaveProperty('timestamp');
  });

  it('formats and logs info object correctly', () => {
    logger.info({ message: 'Test object', customData: 123 });
    const logCall = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test object');
    expect(parsed.customData).toBe(123);
  });

  it('formats and logs warn correctly', () => {
    logger.warn('Test warning');
    expect(console.warn).toHaveBeenCalled();
    const logCall = (console.warn as any).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.level).toBe('warn');
    expect(parsed.message).toBe('Test warning');
  });

  it('formats and logs error with Error instance', () => {
    const err = new Error('Something broke');
    logger.error('Test error', err);
    expect(console.error).toHaveBeenCalled();
    const logCall = (console.error as any).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('Test error');
    expect(parsed.error.message).toBe('Something broke');
    expect(parsed.error.name).toBe('Error');
    expect(parsed.error).toHaveProperty('stack');
  });

  it('formats and logs error with non-Error instance', () => {
    logger.error('Test error', { some: 'error object' });
    const logCall = (console.error as any).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.error).toEqual({ some: 'error object' });
  });

  it('formats and logs metrics correctly', () => {
    logger.metric('cpu_usage', 99, { host: 'server-1' });
    expect(console.log).toHaveBeenCalled();
    const logCall = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(logCall);
    expect(parsed.level).toBe('metric');
    expect(parsed.metric_name).toBe('cpu_usage');
    expect(parsed.metric_value).toBe(99);
    expect(parsed.host).toBe('server-1');
  });
});
