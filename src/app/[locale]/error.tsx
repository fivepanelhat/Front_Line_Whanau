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
      <h2 className="text-text-primary mb-4 text-2xl font-bold">Something went wrong!</h2>
      <p className="text-text-secondary mb-6">We&apos;ve been notified and are looking into it.</p>
      <button
        className="bg-accent-primary text-accent-ink rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
