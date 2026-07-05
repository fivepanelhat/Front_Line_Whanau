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
    // Don't change refreshKey here, just change the active thread
  };

  const handleNewConversation = () => {
    const newThreadId = `thread_${Date.now()}`;
    setCurrentThreadId(newThreadId);
  };

  const handleConversationUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full relative">
      <OnboardingWizard onComplete={() => console.log('User onboarded')} />
      {/* dvh (not vh) so the input row isn't hidden behind mobile browser
          chrome; the offset accounts for the sticky header height. */}
      <div className="flex h-[calc(100dvh-5rem)] overflow-hidden rounded-xl border border-border bg-bg-secondary">
        <ConversationSidebar
          currentThreadId={currentThreadId}
          refreshTrigger={refreshKey}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

        {/* min-w-0 lets the chat column shrink below its content's intrinsic
            width instead of overflowing off-screen (the mobile bug where the
            Send button sat ~200px past the right edge). */}
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
  );
}