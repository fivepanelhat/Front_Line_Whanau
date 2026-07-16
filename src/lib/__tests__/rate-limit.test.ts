import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '../rate-limit';

const mockLimit = vi.fn();

vi.mock('@upstash/ratelimit', () => {
 return {
 Ratelimit: class {
 static slidingWindow = vi.fn();
 limit = mockLimit;
 }
 };
});
vi.mock('@upstash/redis', () => ({
 Redis: class {}
}));

describe('RateLimiter', () => {
 beforeEach(() => {
 vi.useFakeTimers();
 vi.clearAllMocks();
 delete process.env.UPSTASH_REDIS_REST_URL;
 delete process.env.UPSTASH_REDIS_REST_TOKEN;
 });
 
 afterEach(() => {
 vi.useRealTimers();
 });

 it('uses in-memory store and enforces limit', async () => {
 const limiter = new RateLimiter(1000, 2);
 
 expect(await limiter.check('user1')).toBe(true);
 expect(await limiter.check('user1')).toBe(true);
 expect(await limiter.check('user1')).toBe(false); // Hit limit

 vi.advanceTimersByTime(1001);
 expect(await limiter.check('user1')).toBe(true); // Reset
 });

 it('uses upstash if env vars are present', async () => {
 process.env.UPSTASH_REDIS_REST_URL = 'mock_url';
 process.env.UPSTASH_REDIS_REST_TOKEN = 'mock_token';
 mockLimit.mockResolvedValue({ success: true });

 const limiter = new RateLimiter(1000, 2);
 
 expect(await limiter.check('user2')).toBe(true);
 expect(mockLimit).toHaveBeenCalledWith('user2');
 });

 it('falls back to in-memory if upstash throws error during check', async () => {
 process.env.UPSTASH_REDIS_REST_URL = 'mock_url';
 process.env.UPSTASH_REDIS_REST_TOKEN = 'mock_token';
 mockLimit.mockRejectedValue(new Error('Network error'));
 
 const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

 const limiter = new RateLimiter(1000, 2);
 
 expect(await limiter.check('user3')).toBe(true); // Falls back to memory, returns true
 expect(consoleSpy).toHaveBeenCalled();
 });
});
