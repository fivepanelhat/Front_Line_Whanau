'use client';

import dynamic from 'next/dynamic';

// Defers recharts (a large client-only lib) out of the initial admin bundle;
// charts hydrate after first paint. Same pattern as features/ai/AIChatWrapper.
export const FeedbackAnalysisDashboard = dynamic(
 () => import('./FeedbackAnalysisDashboard').then((mod) => mod.FeedbackAnalysisDashboard),
 {
 loading: () => (
 <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-bg-secondary">
 <p className="text-sm text-text-muted">Loading feedback analysis...</p>
 </div>
 ),
 ssr: false,
 }
);
