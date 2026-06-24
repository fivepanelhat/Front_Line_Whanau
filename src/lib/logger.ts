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

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),

  // In development: pretty-print for human readability
  // In production: plain JSON for log aggregation services
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,

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
