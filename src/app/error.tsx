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
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-muted">We’ve logged the issue. Please try again.</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-accent-primary px-6 py-2 text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
