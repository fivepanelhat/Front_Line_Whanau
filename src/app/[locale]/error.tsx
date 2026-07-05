"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Something went wrong!</h2>
      <p className="mb-6 text-text-secondary">We&apos;ve been notified and are looking into it.</p>
      <button
        className="px-4 py-2 bg-accent-primary text-accent-ink rounded-lg hover:opacity-90 transition-opacity"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
