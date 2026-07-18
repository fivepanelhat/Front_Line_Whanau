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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-text-secondary mt-2">We've logged this issue.</p>
      <button
        onClick={() => reset()}
        className="bg-accent-primary text-accent-ink mt-6 rounded-lg px-6 py-2"
      >
        Try again
      </button>
    </div>
  );
}
