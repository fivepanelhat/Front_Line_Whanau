'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-bg-primary text-text-primary">
        <h2 className="text-2xl font-semibold">Application Error</h2>
        <p className="mt-2">A critical error occurred. Our team has been notified.</p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-accent-primary px-6 py-2 text-white hover:opacity-90"
        >
          Reload Application
        </button>
      </body>
    </html>
  );
}
