'use client';

import { useState, useEffect } from 'react';
import { saveConversation, loadConversation } from '@/lib/conversation';
import type { MessageInput } from '@/lib/conversation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentTestPanelProps {
  initialThreadId?: string;
}

export function AgentTestPanel({ initialThreadId }: AgentTestPanelProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [threadId] = useState(() => initialThreadId || `thread_${Date.now()}`);

  const saveCurrentConversation = async (updatedMessages: Message[]) => {
    if (updatedMessages.length === 0) return;

    const messageInputs: MessageInput[] = updatedMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    await saveConversation(threadId, messageInputs);
  };

  useEffect(() => {
    const loadPrevious = async () => {
      const result = await loadConversation(threadId);
      if (result?.messages && result.messages.length > 0) {
        const loadedMessages: Message[] = result.messages.map((message) => ({
          role: message.role as 'user' | 'assistant',
          content: message.content,
        }));
        setMessages(loadedMessages);
      }
    };

    void loadPrevious();
  }, [threadId]);

  const copyToClipboard = (text: string, index: number) => {
    void navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          consentGiven: true,
          threadId,
          history: messages,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Request failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      const messagesWithAssistant = [...newMessages, { role: 'assistant' as const, content: '' }];
      setMessages(messagesWithAssistant);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.type === 'token') {
              assistantResponse += data.content;

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantResponse,
                };
                return updated;
              });
            }
          } catch {}
        }
      }

      const finalMessages = [...newMessages, { role: 'assistant' as const, content: assistantResponse }];
      await saveCurrentConversation(finalMessages);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get a response. Please try again.');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Multi-Turn Agent</h2>
        <button
          onClick={startNewConversation}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          + New Conversation
        </button>
      </div>

      <div className="mb-4 h-[520px] overflow-y-auto rounded-xl border bg-white p-4">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-medium">
              Dismiss
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <p className="mt-8 text-center text-gray-400">Start a conversation with the agent...</p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>

              {message.role === 'assistant' && message.content && (
                <button
                  onClick={() => copyToClipboard(message.content, index)}
                  className="absolute -right-2 -top-2 rounded-full border bg-white p-1 text-sm opacity-0 shadow-sm transition group-hover:opacity-100"
                >
                  {copiedIndex === index ? '✓' : '📋'}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 pl-2 text-gray-500">
            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask the agent anything..."
          className="flex-1 rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-black px-8 text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
