'use client';

import { useEffect, useState } from 'react';
import { listRecentConversations } from '@/lib/conversation';
import type { Conversation } from '@/lib/conversation';

interface ConversationSidebarProps {
  currentThreadId: string;
  refreshTrigger: number;
  onSelectConversation: (threadId: string) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  currentThreadId,
  refreshTrigger,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void listRecentConversations(30).then((list) => {
      if (cancelled) return;
      setConversations(list);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  return (
    <div className="hidden w-72 flex-col border-r bg-gray-50 p-4 md:flex">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Conversations</h3>
        <button
          onClick={onNewConversation}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
        >
          + New
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-sm text-gray-500">No conversations yet.</div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.thread_id)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                conv.thread_id === currentThreadId
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-white hover:shadow-sm'
              }`}
            >
              <div className="truncate font-medium">{conv.title || 'Untitled conversation'}</div>
              <div
                className={`mt-1 text-xs ${
                  conv.thread_id === currentThreadId ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {new Date(conv.updated_at).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
