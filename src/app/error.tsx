'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h2 className="text-text-primary text-2xl font-semibold">Something went wrong</h2>
      <p className="text-text-secondary mt-3 max-w-md text-sm leading-relaxed">
        We could not finish loading this page. Your data is safe. Try again, or come back in a
        moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="bg-accent-primary text-accent-ink mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:opacity-90"
      >
        Try again
      </button>
      <p className="text-text-muted mt-8 max-w-sm text-xs leading-relaxed">
        Need help now? Emergency <strong>111</strong>. Healthline <strong>0800 611 116</strong>.
        PlunketLine <strong>0800 933 922</strong>.
      </p>
    </div>
  );
}
