'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HeavyAIChatCore = dynamic(
  () => import('./HeavyAIChatCore').then((mod) => mod.HeavyAIChatCore),
  {
    loading: () => (
      <div className="bg-bg-glass flex h-96 w-full items-center justify-center rounded-lg border">
        <div className="text-center">
          <div className="border-accent-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-text-secondary mt-3 text-sm">Loading secure AI support...</p>
        </div>
      </div>
    ),
    ssr: false,
  },
);

export interface AIChatWrapperProps {
  mode?: 'parent' | 'practitioner';
}

export function AIChatWrapper(props: AIChatWrapperProps) {
  return (
    <Suspense fallback={<div className="bg-bg-glass h-96 animate-pulse rounded-lg" />}>
      <HeavyAIChatCore {...props} />
    </Suspense>
  );
}
