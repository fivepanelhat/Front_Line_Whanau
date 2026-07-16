import { logger } from './logger';

interface CacheEntry<T> {
 value: T;
 expiry: number;
}

export class MemoryCache {
 private cache = new Map<string, CacheEntry<any>>();

 constructor(private defaultTTLMs: number = 3600000) {} // Default 1 hour TTL

 get<T>(key: string): T | null {
 const entry = this.cache.get(key);
 if (!entry) return null;

 if (Date.now() > entry.expiry) {
 this.cache.delete(key);
 return null;
 }
 return entry.value as T;
 }

 set<T>(key: string, value: T, ttlMs?: number): void {
 const now = Date.now();
 // Expired entries are otherwise only removed when re-read, so sweep
 // periodically to keep the process-lifetime cache from growing unbounded.
 if (now - this.lastSweep > this.defaultTTLMs) {
 this.lastSweep = now;
 for (const [k, entry] of this.cache) {
 if (now > entry.expiry) this.cache.delete(k);
 }
 }
 this.cache.set(key, { value, expiry: now + (ttlMs || this.defaultTTLMs) });
 }

 private lastSweep = Date.now();

 delete(key: string): void {
 this.cache.delete(key);
 }

 clear(): void {
 this.cache.clear();
 }

 /**
 * Helper to wrap an async function with caching
 */
 async withCache<T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T> {
 const cached = this.get<T>(key);
 if (cached !== null) {
 logger.info({ cacheKey: key }, 'Cache HIT');
 return cached;
 }
 logger.info({ cacheKey: key }, 'Cache MISS. Executing function.');
 const result = await fn();
 this.set(key, result, ttlMs);
 return result;
 }
}

// Global cache instance
export const aiToolCache = new MemoryCache();
