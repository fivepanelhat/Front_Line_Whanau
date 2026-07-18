import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryCache, aiToolCache } from '../cache';

vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('MemoryCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    aiToolCache.clear();
  });

  it('sets and gets a value', () => {
    aiToolCache.set('key1', 'value1');
    expect(aiToolCache.get('key1')).toBe('value1');
  });

  it('returns null for non-existent key', () => {
    expect(aiToolCache.get('nonexistent')).toBeNull();
  });

  it('expires items correctly', () => {
    aiToolCache.set('key2', 'value2', 100); // 100ms TTL
    expect(aiToolCache.get('key2')).toBe('value2');

    vi.advanceTimersByTime(101);
    expect(aiToolCache.get('key2')).toBeNull();
  });

  it('sweeps expired entries on set after the sweep interval', () => {
    const cache = new MemoryCache(1000);
    cache.set('stale', 'x', 100);
    cache.set('fresh', 'y', 60_000);

    // Past the stale TTL and the sweep interval - next set() evicts
    // 'stale' even though it is never read again.
    vi.advanceTimersByTime(1001);
    cache.set('trigger', 'z');

    const store = (cache as any).cache as Map<string, unknown>;
    expect(store.has('stale')).toBe(false);
    expect(store.has('fresh')).toBe(true);
    expect(cache.get('fresh')).toBe('y');
    expect(cache.get('trigger')).toBe('z');
  });

  it('deletes items manually', () => {
    aiToolCache.set('key3', 'value3');
    aiToolCache.delete('key3');
    expect(aiToolCache.get('key3')).toBeNull();
  });

  it('clears all items', () => {
    aiToolCache.set('key4', 'value4');
    aiToolCache.set('key5', 'value5');
    aiToolCache.clear();
    expect(aiToolCache.get('key4')).toBeNull();
    expect(aiToolCache.get('key5')).toBeNull();
  });

  it('withCache caches function results', async () => {
    const fn = vi.fn().mockResolvedValue('expensive_result');

    const res1 = await aiToolCache.withCache('expensive_call', fn);
    expect(res1).toBe('expensive_result');
    expect(fn).toHaveBeenCalledTimes(1);

    const res2 = await aiToolCache.withCache('expensive_call', fn);
    expect(res2).toBe('expensive_result');
    expect(fn).toHaveBeenCalledTimes(1); // Should hit cache
  });
});
