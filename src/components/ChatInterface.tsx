'use client';

import { useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { AgentTestPanel } from '@/components/AgentTestPanel';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function ChatInterface() {
 const [currentThreadId, setCurrentThreadId] = useState<string>(() => `thread_${Date.now()}`);
 const [refreshKey, setRefreshKey] = useState(0);

 const handleSelectConversation = (threadId: string) => {
 setCurrentThreadId(threadId);
 };

 const handleNewConversation = () => {
 const newThreadId = `thread_${Date.now()}`;
 setCurrentThreadId(newThreadId);
 };

 const handleConversationUpdated = () => {
 setRefreshKey((prev) => prev + 1);
 };

 return (
 <div className="relative flex h-full flex-col overflow-hidden">
 <div
 aria-hidden
 className="liquid-orb liquid-orb--teal pointer-events-none absolute -left-20 top-10 h-72 w-72 opacity-40"
 />
 <div
 aria-hidden
 className="liquid-orb liquid-orb--amber pointer-events-none absolute -right-16 bottom-10 h-64 w-64 opacity-35"
 />

 <OnboardingWizard onComplete={() => console.log('User onboarded')} />
 <div className="relative z-10 mx-3 mb-3 mt-2 flex h-[calc(100dvh-5.5rem)] overflow-hidden rounded-3xl border border-white/10 shadow-glass-lg sm:mx-4 sm:mb-4">
 <div className="flex min-h-0 w-full bg-bg-secondary/40 backdrop-blur-2xl">
 <ConversationSidebar
 currentThreadId={currentThreadId}
 refreshTrigger={refreshKey}
 onSelectConversation={handleSelectConversation}
 onNewConversation={handleNewConversation}
 />

 <div className="flex min-w-0 flex-1 flex-col">
 <ErrorBoundary>
 <AgentTestPanel
 key={currentThreadId}
 initialThreadId={currentThreadId}
 onConversationUpdated={handleConversationUpdated}
 />
 </ErrorBoundary>
 </div>
 </div>
 </div>
 </div>
 );
}
