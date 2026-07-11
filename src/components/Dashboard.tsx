'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useConsent } from '@/hooks/useConsent';
import { CareTimers } from './CareTimers';
import { NAV_TABS, type DashboardTab } from './dashboard/types';

const tabLoading = (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-accent-primary border-t-transparent" />
      <p className="mt-3 text-sm text-text-secondary">Loading…</p>
    </div>
  </div>
);

const AiAssistantTab = dynamic(
  () => import('./dashboard/AiAssistantTab').then((m) => m.AiAssistantTab),
  { ssr: false, loading: () => tabLoading },
);
const PathwaysTab = dynamic(
  () => import('./dashboard/PathwaysTab').then((m) => m.PathwaysTab),
  { ssr: false, loading: () => tabLoading },
);
const VaultTab = dynamic(
  () => import('./dashboard/VaultTab').then((m) => m.VaultTab),
  { ssr: false, loading: () => tabLoading },
);
const JournalTab = dynamic(
  () => import('./dashboard/JournalTab').then((m) => m.JournalTab),
  { ssr: false, loading: () => tabLoading },
);
const DirectoryTab = dynamic(
  () => import('./dashboard/DirectoryTab').then((m) => m.DirectoryTab),
  { ssr: false, loading: () => tabLoading },
);

export function Dashboard({
  onClose,
  initialTab = 'ai',
}: {
  onClose: () => void;
  initialTab?: DashboardTab;
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    hasConsent: aiProcessGranted,
    grantConsent: grantAiProcess,
    revokeConsent: revokeAiProcess,
  } = useConsent('ai.process');
  const {
    hasConsent: aiExecuteGranted,
    grantConsent: grantAiExecute,
    revokeConsent: revokeAiExecute,
  } = useConsent('ai.execute');

  return (
    <div className="dark-space fixed inset-0 z-50 flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* div, not <header>: the site banner is still in the DOM under this overlay */}
      <div className="flex h-14 sm:h-16 items-center justify-between border-b border-white/[0.08] bg-bg-secondary px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="text-lg sm:text-xl font-heading font-extrabold text-gradient">
            Whānau Hub
          </span>
          <span className="hidden sm:inline rounded bg-accent-secondary/15 px-2.5 py-0.5 text-xs font-semibold text-accent-secondary">
            Sovereign Space
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          title="Exit Hub"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 md:z-auto w-64 h-[calc(100%-3.5rem)] sm:h-[calc(100%-4rem)] md:h-auto border-r border-white/[0.08] bg-bg-secondary md:bg-bg-secondary/40 p-4 flex flex-col justify-between transition-transform duration-200`}
        >
          <div className="space-y-1">
            {NAV_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-accent-primary text-accent-ink'
                    : 'hover:bg-white/5 text-text-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-bg-primary/50 p-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Consent Settings
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span>AI Processing:</span>
              <button
                type="button"
                onClick={() => (aiProcessGranted ? revokeAiProcess() : grantAiProcess())}
                className={`rounded px-1.5 py-0.5 font-bold ${aiProcessGranted ? 'bg-accent-success/20 text-accent-success' : 'bg-white/10 text-text-secondary'}`}
              >
                {aiProcessGranted ? 'Active' : 'Disabled'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Form Generation:</span>
              <button
                type="button"
                onClick={() => (aiExecuteGranted ? revokeAiExecute() : grantAiExecute())}
                className={`rounded px-1.5 py-0.5 font-bold ${aiExecuteGranted ? 'bg-accent-success/20 text-accent-success' : 'bg-white/10 text-text-secondary'}`}
              >
                {aiExecuteGranted ? 'Active' : 'Disabled'}
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1 pt-1 border-t border-white/[0.08]">
              Consent Log: a private log only you can verify with your passphrase — kept on your
              device.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-gradient-subtle">
          <Suspense fallback={tabLoading}>
            {activeTab === 'ai' && <AiAssistantTab onNavigateTab={setActiveTab} />}
            {activeTab === 'pathways' && <PathwaysTab />}
            {activeTab === 'vault' && <VaultTab />}
            {activeTab === 'journal' && <JournalTab />}
            {activeTab === 'directory' && <DirectoryTab />}
            {activeTab === 'timers' && (
              <div className="mx-auto max-w-4xl space-y-6">
                <CareTimers />
              </div>
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
