import { logger } from './logger';

/**
 * Simple three-state circuit breaker (closed -> open -> half-open).
 * In half-open, only one trial request is admitted; concurrent callers still fail fast.
 */
export class CircuitBreaker {
 private failureCount = 0;
 private lastFailureTime: number | null = null;
 private halfOpenTrial = false;

 constructor(
 public name: string,
 public failureThreshold: number = 3,
 public resetTimeoutMs: number = 30000,
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
 if (this.failureCount < this.failureThreshold) return false;

 const now = Date.now();
 const cooledDown =
 this.lastFailureTime !== null && now - this.lastFailureTime > this.resetTimeoutMs;

 if (!cooledDown) return true;

 // Half-open: admit exactly one trial request
 if (!this.halfOpenTrial) {
 this.halfOpenTrial = true;
 logger.info({ breaker: this.name }, 'Circuit breaker transitioning to HALF-OPEN.');
 return false;
 }

 return true;
 }

 private onSuccess() {
 if (this.failureCount > 0 || this.halfOpenTrial) {
 logger.info({ breaker: this.name }, 'Circuit breaker reset to CLOSED.');
 }
 this.failureCount = 0;
 this.lastFailureTime = null;
 this.halfOpenTrial = false;
 }

 private onFailure() {
 this.failureCount++;
 this.lastFailureTime = Date.now();
 this.halfOpenTrial = false;
 logger.error(
 { breaker: this.name, failures: this.failureCount },
 'Circuit breaker recorded failure.',
 );
 }
}

// Global instance for the AI orchestrator
export const aiCircuitBreaker = new CircuitBreaker('ai_orchestrator', 3, 30000);
