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

 this.upstashRatelimit = new Ratelimit({
 redis,
 // Upstash accepts duration strings like "60000 ms"
 limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms` as `${number} ms`),
 });
 } catch (e) {
 console.warn(
 'Failed to initialize Upstash Redis rate limiter, falling back to in-memory.',
 e,
 );
 }
 }
 }

 async check(key: string): Promise<boolean> {
 if (this.upstashRatelimit) {
 try {
 const { success } = await this.upstashRatelimit.limit(key);
 return success;
 } catch (e) {
 console.error('Upstash Rate Limit error, falling back to in-memory', e);
 }
 }

 const now = Date.now();
 this.sweep(now);

 const timestamps = this.store.get(key) || [];
 const recent = timestamps.filter((ts) => now - ts < this.windowMs);

 if (recent.length >= this.maxRequests) return false;

 recent.push(now);
 this.store.set(key, recent);
 return true;
 }

 /** Evict keys whose window has fully expired so the in-memory store
 * doesn't grow unbounded with one entry per unique IP/user. */
 private lastSweep = 0;
 private sweep(now: number) {
 if (now - this.lastSweep < this.windowMs) return;
 this.lastSweep = now;
 for (const [key, timestamps] of this.store) {
 if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] >= this.windowMs) {
 this.store.delete(key);
 }
 }
 }
}

/** Shared AI endpoint limiter (10 req / minute / key) for route handlers. */
export const aiRouteLimiter = new RateLimiter(60_000, 10);
