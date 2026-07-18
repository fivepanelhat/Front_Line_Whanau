'use client';

import dynamic from 'next/dynamic';

/**
 * Code-split the large Whanau Hub dashboard (pathways, vault, journal, AI).
 * Keeps the resources route entry lightweight until the hub is needed.
 */
export const Dashboard = dynamic(() => import('./Dashboard').then((mod) => mod.Dashboard), {
  ssr: false,
  loading: () => (
    <div className="border-border bg-bg-secondary flex min-h-[50vh] w-full items-center justify-center rounded-xl border">
      <div className="text-center">
        <div className="border-accent-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-text-secondary mt-3 text-sm">Loading Whanau Hub...</p>
      </div>
    </div>
  ),
});
