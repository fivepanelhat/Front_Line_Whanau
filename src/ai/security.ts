import { z } from 'zod';

const AgentInputSchema = z.object({
  query: z
    .string()
    .min(3, 'Query too short')
    .max(2000, 'Query too long')
    .trim(),
  consentGiven: z.boolean(),
  threadId: z.string().optional(),
});

export function validateAgentInput(input: unknown) {
  const result = AgentInputSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid input: ${result.error.issues[0].message}`);
  }
  return result.data;
}

export function sanitizeAgentOutput(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\b(system|ignore previous|jailbreak)\b/gi, '')
    .trim();
}

export function createAuditLog(event: string, metadata: Record<string, any> = {}) {
  // TODO: Replace with proper logger (e.g. Pino, Winston, or external service)
  console.log(`[AGENT_SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

// Rate limiting helper (simple in-memory version)
const requestLog = new Map<string, number[]>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(identifier) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    return false;
  }

  recent.push(now);
  requestLog.set(identifier, recent);
  return true;
}
