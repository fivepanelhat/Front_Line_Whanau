import { z } from 'zod';
import { agentLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { RateLimiter } from '@/lib/rate-limit';

const secLogger = agentLogger('Security');

/**
 * Distributed rate limit via Supabase RPC when available.
 * Falls back to Upstash/in-memory RateLimiter so serverless instances
 * still share a process-local budget when the DB is unavailable.
 */
const localFallback = new RateLimiter(60_000, 10);

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

export function createAuditLog(event: string, metadata: Record<string, unknown> = {}) {
 secLogger.info(
 {
 event,
 ...metadata,
 },
 `Security Audit Event: ${event}`,
 );
}

export async function checkRateLimit(
 identifier: string,
 maxRequests = 10,
 windowMs = 60000,
): Promise<boolean> {
 try {
 const supabase = await createClient();
 const now = Date.now();
 const resetTime = now + windowMs;

 const { data, error } = await supabase.rpc('increment_rate_limit', {
 p_ip: identifier,
 p_window_ms: windowMs,
 p_max_requests: maxRequests,
 });

 if (error) {
 // Fallback if RPC doesn't exist (e.g. migration hasn't run)
 const { data: row } = await supabase
 .from('rate_limits')
 .select('*')
 .eq('ip', identifier)
 .single();

 if (!row) {
 await supabase
 .from('rate_limits')
 .insert({ ip: identifier, hits: 1, reset_time: resetTime });
 return true;
 }

 if (now > row.reset_time) {
 await supabase
 .from('rate_limits')
 .update({ hits: 1, reset_time: resetTime })
 .eq('ip', identifier);
 return true;
 }

 if (row.hits >= maxRequests) {
 return false;
 }

 await supabase
 .from('rate_limits')
 .update({ hits: row.hits + 1 })
 .eq('ip', identifier);
 return true;
 }

 return data as boolean;
 } catch (err) {
 secLogger.error({ err }, 'Failed to check rate limit, using local fallback');
 // Prefer fail-closed-ish local limiter over unrestricted traffic
 return localFallback.check(`${identifier}:${maxRequests}:${windowMs}`);
 }
}
