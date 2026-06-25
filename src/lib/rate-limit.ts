export class RateLimiter {
  private store = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const timestamps = this.store.get(key) || [];
    const recent = timestamps.filter(ts => now - ts < this.windowMs);

    if (recent.length >= this.maxRequests) return false;

    recent.push(now);
    this.store.set(key, recent);
    return true;
  }
}
