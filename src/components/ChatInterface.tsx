'use client';

import { useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { AgentTestPanel } from './AgentTestPanel';

export function ChatInterface() {
  const [currentThreadId, setCurrentThreadId] = useState<string>(() => `thread_${Date.now()}`);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectConversation = (threadId: string) => {
    setCurrentThreadId(threadId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleNewConversation = () => {
    const newThreadId = `thread_${Date.now()}`;
    setCurrentThreadId(newThreadId);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-xl border bg-white">
      <ConversationSidebar
        currentThreadId={currentThreadId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      <div className="flex flex-1 flex-col">
        <AgentTestPanel key={refreshKey} initialThreadId={currentThreadId} />
      </div>
    </div>
  );
}