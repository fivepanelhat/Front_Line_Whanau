'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useConsent } from '@/hooks/useConsent';
import { CareTimers } from './CareTimers';
import { NAV_TABS, type DashboardTab } from './dashboard/types';

const tabLoading = (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="text-center">
      <div className="border-accent-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      <p className="text-text-secondary mt-3 text-sm">Loading...</p>
    </div>
  </div>
);

const AiAssistantTab = dynamic(
  () => import('./dashboard/AiAssistantTab').then((m) => m.AiAssistantTab),
  { ssr: false, loading: () => tabLoading },
);
const PathwaysTab = dynamic(() => import('./dashboard/PathwaysTab').then((m) => m.PathwaysTab), {
  ssr: false,
  loading: () => tabLoading,
});
const VaultTab = dynamic(() => import('./dashboard/VaultTab').then((m) => m.VaultTab), {
  ssr: false,
  loading: () => tabLoading,
});
const JournalTab = dynamic(() => import('./dashboard/JournalTab').then((m) => m.JournalTab), {
  ssr: false,
  loading: () => tabLoading,
});
const DirectoryTab = dynamic(() => import('./dashboard/DirectoryTab').then((m) => m.DirectoryTab), {
  ssr: false,
  loading: () => tabLoading,
});

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
    <div className="dark-space bg-bg-primary text-text-primary fixed inset-0 z-50 flex flex-col overflow-hidden">
      <div
        aria-hidden
        className="liquid-orb liquid-orb--teal pointer-events-none absolute top-10 -left-24 h-96 w-96 opacity-50"
      />
      <div
        aria-hidden
        className="liquid-orb liquid-orb--amber pointer-events-none absolute -right-20 bottom-0 h-80 w-80 opacity-40"
      />

      {/* div, not <header>: the site banner is still in the DOM under this overlay */}
      <div className="bg-bg-secondary/70 shadow-glass relative z-20 mx-3 mt-3 flex h-14 items-center justify-between rounded-2xl border border-white/10 px-4 backdrop-blur-2xl sm:mx-4 sm:mt-4 sm:h-16 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/10 md:hidden"
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
          <span className="font-heading text-gradient text-lg font-extrabold sm:text-xl">
            Whānau Hub
          </span>
          <span className="border-accent-secondary/25 bg-accent-secondary/15 text-accent-secondary hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:inline">
            Sovereign Space
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
          title="Exit Hub"
        >
          ✕
        </button>
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden p-3 pt-3 sm:p-4">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} glass-panel fixed z-50 flex h-[calc(100%-5.5rem)] w-64 flex-col justify-between p-4 transition-transform duration-200 md:relative md:z-auto md:h-auto md:translate-x-0`}
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-gradient-brand shadow-glow text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
            <h4 className="text-text-muted text-xs font-bold tracking-wider uppercase">
              Consent Settings
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span>AI Processing:</span>
              <button
                type="button"
                onClick={() => (aiProcessGranted ? revokeAiProcess() : grantAiProcess())}
                className={`rounded-lg px-2 py-0.5 font-bold ${aiProcessGranted ? 'bg-accent-success/20 text-accent-success' : 'text-text-secondary bg-white/10'}`}
              >
                {aiProcessGranted ? 'Active' : 'Disabled'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Form Generation:</span>
              <button
                type="button"
                onClick={() => (aiExecuteGranted ? revokeAiExecute() : grantAiExecute())}
                className={`rounded-lg px-2 py-0.5 font-bold ${aiExecuteGranted ? 'bg-accent-success/20 text-accent-success' : 'text-text-secondary bg-white/10'}`}
              >
                {aiExecuteGranted ? 'Active' : 'Disabled'}
              </button>
            </div>
            <p className="text-text-muted mt-1 border-t border-white/10 pt-1 text-[10px]">
              Consent Log: a private log only you can verify with your passphrase - kept on your
              device.
            </p>
          </div>
        </aside>

        <main className="shadow-glass ml-0 min-w-0 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-6 md:ml-4 md:p-8">
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
