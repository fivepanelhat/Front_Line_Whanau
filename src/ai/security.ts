import { z } from 'zod';
import { agentLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

const secLogger = agentLogger('Security');

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
  secLogger.info({
    event,
    ...metadata,
  }, `Security Audit Event: ${event}`);
}

// Rate limiting helper (simple in-memory version)
const requestLog = new Map<string, number[]>();

export async function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const now = Date.now();
    const resetTime = now + windowMs;

    // We use upsert to atomically create or update the rate limit record.
    // If reset_time has passed, we reset hits to 1. Otherwise, we increment hits.
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_ip: identifier,
      p_window_ms: windowMs,
      p_max_requests: maxRequests
    });

    if (error) {
      // Fallback if RPC doesn't exist (e.g. migration hasn't run)
      // We do a manual fetch + update as a fallback
      const { data: row } = await supabase.from('rate_limits').select('*').eq('ip', identifier).single();
      
      if (!row) {
        await supabase.from('rate_limits').insert({ ip: identifier, hits: 1, reset_time: resetTime });
        return true;
      }

      if (now > row.reset_time) {
        await supabase.from('rate_limits').update({ hits: 1, reset_time: resetTime }).eq('ip', identifier);
        return true;
      }

      if (row.hits >= maxRequests) {
        return false;
      }

      await supabase.from('rate_limits').update({ hits: row.hits + 1 }).eq('ip', identifier);
      return true;
    }

    // If RPC succeeds, it returns true if allowed, false if blocked
    return data;
  } catch (err) {
    secLogger.error({ err }, 'Failed to check rate limit, allowing by default');
    return true; // Fail open
  }
}
