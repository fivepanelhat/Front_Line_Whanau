'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HeavyAIChatCore = dynamic(
  () => import('./HeavyAIChatCore').then((mod) => mod.HeavyAIChatCore),
  {
    loading: () => (
      <div className="flex h-96 w-full items-center justify-center rounded-lg border bg-bg-glass">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-accent-primary border-t-transparent" />
          <p className="mt-3 text-sm text-text-secondary">Loading secure AI support...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export interface AIChatWrapperProps {
  mode?: 'parent' | 'practitioner';
}

export function AIChatWrapper(props: AIChatWrapperProps) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-bg-glass" />}>
      <HeavyAIChatCore {...props} />
    </Suspense>
  );
}
