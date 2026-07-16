'use client';

import type { AIChatWrapperProps } from './AIChatWrapper';

export function HeavyAIChatCore({ mode = 'parent' }: AIChatWrapperProps) {
 return (
 <section className="rounded-lg border border-surface bg-bg-card p-6 shadow-md" aria-live="polite">
 <h2 className="text-xl font-semibold text-text-primary">Secure AI Support</h2>
 <p className="mt-2 text-sm text-text-secondary">
 AI support surface is ready for the {mode} experience.
 </p>
 </section>
 );
}
