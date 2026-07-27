'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-text-primary mb-3 text-2xl font-bold">Something went wrong</h2>
      <p className="text-text-secondary mb-6 max-w-md text-sm leading-relaxed">
        We have been notified and are looking into it. You can try again without losing your place
        where possible.
      </p>
      <button
        type="button"
        className="bg-accent-primary text-accent-ink rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        onClick={() => reset()}
      >
        Try again
      </button>
      <p className="text-text-muted mt-10 max-w-sm text-xs leading-relaxed">
        Urgent support: Emergency <strong>111</strong> · Healthline <strong>0800 611 116</strong> ·
        PlunketLine <strong>0800 933 922</strong>
      </p>
    </div>
  );
}
