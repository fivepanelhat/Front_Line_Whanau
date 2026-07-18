'use client';

import type { AIChatWrapperProps } from './AIChatWrapper';

export function HeavyAIChatCore({ mode = 'parent' }: AIChatWrapperProps) {
  return (
    <section
      className="border-surface bg-bg-card rounded-lg border p-6 shadow-md"
      aria-live="polite"
    >
      <h2 className="text-text-primary text-xl font-semibold">Secure AI Support</h2>
      <p className="text-text-secondary mt-2 text-sm">
        AI support surface is ready for the {mode} experience.
      </p>
    </section>
  );
}
