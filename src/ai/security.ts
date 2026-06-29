import { z } from 'zod';

const AgentInputSchema = z.object({
  query: z.string().min(3).max(2000).trim(),
  consentGiven: z.boolean(),
  threadId: z.string().optional(),
});

export function validateAgentInput(input: unknown) {
  const result = AgentInputSchema.safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid agent input: ${result.error.message}`);
  }

  return result.data;
}

export function sanitizeAgentOutput(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\b(execute|run|delete|drop)\b/gi, '')
    .trim();
}

export function createAuditLog(event: string, metadata: Record<string, any> = {}) {
  // In production, replace with secure logging (e.g. to a SIEM or database)
  console.log(`[AGENT_SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}
