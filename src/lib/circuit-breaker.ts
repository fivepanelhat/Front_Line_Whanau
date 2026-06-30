import { logger } from './logger';

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  
  constructor(
    public name: string,
    public failureThreshold: number = 3,
    public resetTimeoutMs: number = 30000
  ) {}

  async fire<T>(action: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      logger.warn({ breaker: this.name }, 'Circuit breaker is OPEN. Failing fast.');
      throw new Error(`Circuit Breaker '${this.name}' is OPEN. Please try again later.`);
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private isOpen(): boolean {
    if (this.failureCount >= this.failureThreshold) {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime > this.resetTimeoutMs) {
        // Half-open: let the next request try
        logger.info({ breaker: this.name }, 'Circuit breaker transitioning to HALF-OPEN.');
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess() {
    if (this.failureCount > 0) {
      logger.info({ breaker: this.name }, 'Circuit breaker reset to CLOSED.');
    }
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    logger.error({ breaker: this.name, failures: this.failureCount }, 'Circuit breaker recorded failure.');
  }
}

// Global instance for the AI orchestrator
export const aiCircuitBreaker = new CircuitBreaker('ai_orchestrator', 3, 30000);
