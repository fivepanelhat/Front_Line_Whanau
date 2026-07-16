/**
 * Compatibility telemetry logger used by AI callbacks and a few routes.
 *
 * Server code should prefer `@/lib/logger` (pino). This module keeps a small
 * JSON-console surface for metric-heavy call sites and unit tests, while
 * forwarding to the structured logger when available on the server.
 */

import { logger as pinoLogger, metric as pinoMetric } from '@/lib/logger';

type LogLevel = 'info' | 'warn' | 'error' | 'metric';

interface LogPayload {
 message: string;
 [key: string]: unknown;
}

function toPayload(payload: LogPayload | string): LogPayload {
 return typeof payload === 'string' ? { message: payload } : payload;
}

function formatConsole(level: LogLevel, payload: LogPayload, error?: unknown): string {
 const base: Record<string, unknown> = {
 timestamp: new Date().toISOString(),
 level,
 environment: process.env.NODE_ENV || 'development',
 ...payload,
 };

 if (error !== undefined) {
 if (error instanceof Error) {
 base.error = {
 message: error.message,
 stack: error.stack,
 name: error.name,
 };
 } else {
 base.error = error;
 }
 }

 return JSON.stringify(base);
}

class TelemetryLogger {
 info(payload: LogPayload | string) {
 const data = toPayload(payload);
 // Keep console JSON for tests / log shippers that scrape stdout
 console.log(formatConsole('info', data));
 pinoLogger.info(data, data.message);
 }

 warn(payload: LogPayload | string) {
 const data = toPayload(payload);
 console.warn(formatConsole('warn', data));
 pinoLogger.warn(data, data.message);
 }

 error(payload: LogPayload | string, error?: unknown) {
 const data = toPayload(payload);
 console.error(formatConsole('error', data, error));
 if (error instanceof Error) {
 pinoLogger.error({ ...data, err: error }, data.message);
 } else if (error !== undefined) {
 pinoLogger.error({ ...data, err: error }, data.message);
 } else {
 pinoLogger.error(data, data.message);
 }
 }

 metric(name: string, value: number, tags: Record<string, unknown> = {}) {
 console.log(
 formatConsole('metric', {
 message: `Metric: ${name}`,
 metric_name: name,
 metric_value: value,
 ...tags,
 }),
 );
 pinoMetric(name, value, tags);
 }
}

export const logger = new TelemetryLogger();
