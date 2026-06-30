'use client';

import { useState, useEffect } from 'react';
import { saveConversation, loadConversation, MessageInput } from '@/lib/conversation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterruptData {
  threadId: string;
  proposedResponse: string;
  message?: string;
}

export function AgentTestPanel({ 
  initialThreadId,
  onConversationUpdated 
}: { 
  initialThreadId?: string;
  onConversationUpdated?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [threadId] = useState(() => initialThreadId || `thread_${Date.now()}`);

  // HITL State
  const [showReview, setShowReview] = useState(false);
  const [interruptData, setInterruptData] = useState<InterruptData | null>(null);

  // Load previous conversation
  useEffect(() => {
    const loadPrevious = async () => {
      const result = await loadConversation(threadId);
      if (result?.messages?.length) {
        const loaded = result.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
        setMessages(loaded);
      }
    };
    loadPrevious();
  }, [threadId]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const saveConversationToDb = async (updatedMessages: Message[]) => {
    const inputs: MessageInput[] = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    await saveConversation(threadId, inputs);
    if (onConversationUpdated) {
      onConversationUpdated();
    }
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

      if (!res.ok || !res.body) throw new Error('Failed to connect');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      // Add placeholder for assistant
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
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
                updated[updated.length - 1] = { role: 'assistant', content: assistantResponse };
                return updated;
              });
            }

            if (data.type === 'interrupt') {
              setInterruptData({
                threadId: data.threadId,
                proposedResponse: data.proposedResponse || '',
                message: data.message,
              });
              setShowReview(true);
              setIsLoading(false);
              return;
            }

            if (data.type === 'final') {
              // Final metadata received
            }
          } catch {}
        }
      }

      // Auto-save after successful response
      const finalMessages: Message[] = [...newMessages, { role: 'assistant' as const, content: assistantResponse }];
      await saveConversationToDb(finalMessages);
    } catch (err) {
      console.error(err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkReviewStatus = async () => {
    if (!interruptData?.threadId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/review/status?threadId=${interruptData.threadId}`);
      const data = await res.json();
      if (data.status === 'approved' || data.status === 'rejected') {
        setShowReview(false);
        setInterruptData(null);
        window.location.reload();
      } else {
        alert("Your request is still pending review by a practitioner. Please check back later.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Multi-Turn Agent</h2>
        <button
          onClick={startNewConversation}
          className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          + New Conversation
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border rounded-xl p-4 overflow-y-auto mb-4 bg-white">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-8">Start a conversation...</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`group relative max-w-[80%] px-4 py-3 rounded-2xl ${
              msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.role === 'assistant' && msg.content && (
                <button
                  onClick={() => copyToClipboard(msg.content, index)}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition bg-white border rounded-full p-1 text-sm"
                >
                  {copiedIndex === index ? '✓' : '📋'}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 pl-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
            <span>Thinking...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex justify-between">
            {error}
            <button onClick={() => setError(null)} className="font-medium">Dismiss</button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask the agent anything..."
          className="flex-1 border rounded-lg px-4 py-3"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-black text-white px-8 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {/* Human Review Modal (Read-Only) */}
      {showReview && interruptData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-semibold text-lg mb-4 text-purple-700">Pending Practitioner Review</h3>
            <p className="text-sm text-gray-600 mb-4">
              To ensure cultural safety and accurate information, this response requires review by a practitioner before it can be provided to you.
            </p>

            <div className="flex gap-3">
              <button
                onClick={checkReviewStatus}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400"
              >
                {isLoading ? 'Checking...' : 'Refresh Status'}
              </button>
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
