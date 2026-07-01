import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export class RateLimiter {
  private store = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;
  private upstashRatelimit?: Ratelimit;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        // @ts-ignore - Upstash types might be strict about time units, 'ms' is supported
        this.upstashRatelimit = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
        });
      } catch (e) {
        console.warn('Failed to initialize Upstash Redis rate limiter, falling back to in-memory.', e);
      }
    }
  }

  async check(key: string): Promise<boolean> {
    if (this.upstashRatelimit) {
      try {
        const { success } = await this.upstashRatelimit.limit(key);
        return success;
      } catch (e) {
        console.error("Upstash Rate Limit error, falling back to in-memory", e);
      }
    }

    const now = Date.now();
    const timestamps = this.store.get(key) || [];
    const recent = timestamps.filter(ts => now - ts < this.windowMs);

    if (recent.length >= this.maxRequests) return false;

    recent.push(now);
    this.store.set(key, recent);
    return true;
  }
}
