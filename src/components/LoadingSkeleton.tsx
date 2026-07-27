/**
 * Lightweight loading skeletons for trust during hydration / navigation.
 */
export function LoadingSkeleton({
  label = 'Loading…',
  variant = 'page',
}: {
  label?: string;
  variant?: 'page' | 'card' | 'chat';
}) {
  if (variant === 'chat') {
    return (
      <div className="space-y-3 p-4" role="status" aria-live="polite" aria-label={label}>
        <div className="bg-white/5 h-16 max-w-[70%] animate-pulse rounded-3xl" />
        <div className="bg-white/5 ml-auto h-12 max-w-[55%] animate-pulse rounded-3xl" />
        <div className="bg-white/5 h-20 max-w-[75%] animate-pulse rounded-3xl" />
        <p className="text-text-muted text-center text-sm">{label}</p>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-48 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="border-accent-primary h-9 w-9 animate-spin rounded-full border-4 border-t-transparent" />
      <p className="text-text-secondary text-sm">{label}</p>
    </div>
  );
}
