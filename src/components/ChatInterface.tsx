'use client';

import { useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { AgentTestPanel } from './AgentTestPanel';

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
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-xl border bg-white">
      <ConversationSidebar
        currentThreadId={currentThreadId}
        refreshTrigger={refreshKey}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      <div className="flex flex-1 flex-col">
        <AgentTestPanel 
          key={currentThreadId} 
          initialThreadId={currentThreadId} 
          onConversationUpdated={handleConversationUpdated}
        />
      </div>
    </div>
  );
}