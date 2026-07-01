/**
 * Centralized structured logger for production monitoring.
 * Outputs JSON so it can be easily ingested by Datadog, CloudWatch, Vercel, or Sentry.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'metric';

interface LogPayload {
  message: string;
  [key: string]: any;
}

class TelemetryLogger {
  private format(level: LogLevel, payload: LogPayload | string, error?: unknown) {
    const timestamp = new Date().toISOString();
    
    let base: any = {
      timestamp,
      level,
      environment: process.env.NODE_ENV || 'development'
    };

    if (typeof payload === 'string') {
      base.message = payload;
    } else {
      base = { ...base, ...payload };
    }

    if (error) {
      if (error instanceof Error) {
        base.error = {
          message: error.message,
          stack: error.stack,
          name: error.name
        };
      } else {
        base.error = error;
      }
    }

    return JSON.stringify(base);
  }

  info(payload: LogPayload | string) {
    console.log(this.format('info', payload));
  }

  warn(payload: LogPayload | string) {
    console.warn(this.format('warn', payload));
  }

  error(payload: LogPayload | string, error?: unknown) {
    console.error(this.format('error', payload, error));
  }

  metric(name: string, value: number, tags: Record<string, any> = {}) {
    console.log(this.format('metric', { message: `Metric: ${name}`, metric_name: name, metric_value: value, ...tags }));
  }
}

export const logger = new TelemetryLogger();
