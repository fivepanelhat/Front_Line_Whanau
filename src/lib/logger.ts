/**
 * Server-side structured logger — pino
 *
 * Usage (server components, API routes, middleware):
 *   import { logger } from '@/lib/logger';
 *   logger.info({ route: '/api/health' }, 'Health check called');
 *   logger.error({ err }, 'Unexpected error in agent route');
 *
 * Rules:
 *   - Never log: passphrases, encryption keys, journal content, health data
 *   - Only log: route names, error codes, timing, AI agent state transitions
 *   - Logs are structured JSON in production (parseable by Vercel / Datadog)
 *   - Logs are pretty-printed in development
 */

import pino from 'pino';

// Fire-and-forget webhook alert for catastrophic failures
const FIRE_WEBHOOK_ALERT = async (msg: string, obj: any) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *CRITICAL ALERT* 🚨\n${msg}\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``
      })
    });
  } catch (e) {
    console.error("Failed to fire alert webhook", e);
  }
};

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),

  // In development: pretty-print for human readability
  // In production: plain JSON for log aggregation services
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,

  hooks: {
    logMethod(inputArgs, method, level) {
      if (level === 50) { // Error level
        const [obj, msg] = inputArgs.length >= 2 ? [inputArgs[0], inputArgs[1]] : [{}, inputArgs[0]];
        if (typeof obj === 'object') {
          if (msg) console.error(msg, obj);
          else console.error(obj);
        } else {
          console.error(obj, msg);
        }
        
        // Trigger webhook on fatal errors or circuit breaker trips
        if (typeof msg === 'string' && (msg.toLowerCase().includes('fatal') || msg.toLowerCase().includes('circuit breaker'))) {
          FIRE_WEBHOOK_ALERT(msg, obj).catch(() => {});
        }
      }
      return method.apply(this, inputArgs as any);
    }
  },

  // Redact fields that must never appear in logs
  redact: {
    paths: [
      'passphrase',
      'password',
      'key',
      'secret',
      'token',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_API_KEY',
      'content',         // journal/vault content
      'plaintext',
      'ciphertext',
      'body.passphrase',
      'body.password',
    ],
    censor: '[REDACTED]',
  },

  // Base fields on every log line
  base: {
    app: 'front-line-whanau',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    env: process.env.NODE_ENV ?? 'development',
  },
});

/** Child logger for a specific route or module. */
export function routeLogger(route: string) {
  return logger.child({ route });
}

/** Child logger for AI agent operations. */
export function agentLogger(agentName: string) {
  return logger.child({ agent: agentName });
}

/**
 * Emit a structured metric line (latency, tokens, counters).
 * Prefer this over ad-hoc console logging so metrics share redaction + base fields.
 */
export function metric(
  name: string,
  value: number,
  tags: Record<string, unknown> = {},
) {
  logger.info(
    { metric_name: name, metric_value: value, ...tags },
    `Metric: ${name}`,
  );
}
