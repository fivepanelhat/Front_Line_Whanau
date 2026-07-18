'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { saveConversation, loadConversation, MessageInput } from '@/lib/conversation';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
}

interface InterruptData {
  threadId: string;
  proposedResponse: string;
  message?: string;
}

export function AgentTestPanel({
  initialThreadId,
  onConversationUpdated,
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

  // Summary State
  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryMarkdown, setSummaryMarkdown] = useState<string | null>(null);

  // Cancel in-flight SSE / fetch when unmounting or sending a new message
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Load previous conversation
  useEffect(() => {
    let cancelled = false;
    const loadPrevious = async () => {
      const result = await loadConversation(threadId);
      if (cancelled) return;
      if (result?.messages?.length) {
        const loaded = result.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
        setMessages(loaded);
      }
    };
    loadPrevious();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const saveConversationToDb = useCallback(
    async (updatedMessages: Message[]) => {
      const inputs: MessageInput[] = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      await saveConversation(threadId, inputs);
      onConversationUpdated?.();
    },
    [threadId, onConversationUpdated],
  );

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Abort any previous stream before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: Message = { role: 'user', content: input };
    const historyForRequest = messages;
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
          query: userMessage.content,
          consentGiven: true,
          threadId,
          history: historyForRequest,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('connection_failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      let sseBuffer = '';

      // Add placeholder for assistant
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Buffer partial SSE frames across TCP chunks
        sseBuffer += decoder.decode(value, { stream: true });
        const frames = sseBuffer.split('\n\n');
        sseBuffer = frames.pop() ?? '';

        for (const line of frames) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;

          try {
            const data = JSON.parse(raw);

            if (data.type === 'reset') {
              // New model call in the graph (classifier -> agent steps):
              // discard interim output, keep only the final call's stream.
              assistantResponse = '';
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: '' };
                return updated;
              });
            }

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
              // Some graph nodes answer without streaming model tokens; in
              // that case the streamed buffer holds only the classifier's
              // intent label. Prefer the authoritative finalResponse then.
              if (data.finalResponse && assistantResponse.trim().length < 40) {
                assistantResponse = data.finalResponse;
              }
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: assistantResponse,
                  agent: data.agent,
                };
                return updated;
              });
            }
          } catch {
            // Ignore malformed SSE frames
          }
        }
      }

      // Auto-save after successful response
      const finalMessages: Message[] = [
        ...newMessages,
        { role: 'assistant' as const, content: assistantResponse },
      ];
      await saveConversationToDb(finalMessages);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      console.error(err);
      setError('I am currently experiencing connection issues. Please try again in a moment.');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
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
        alert('Your request is still pending review by a practitioner. Please check back later.');
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

  const submitFeedback = async (messageContent: string, rating: number, agent?: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: threadId || 'unknown-thread',
          messageContent,
          rating,
          agent,
        }),
      });
      alert('Thank you for your feedback!');
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    setShowSummary(true);
    setSummaryMarkdown(null);
    try {
      const res = await fetch('/api/chat/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setSummaryMarkdown(data.summary);
      } else {
        setSummaryMarkdown('Error generating summary: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setSummaryMarkdown('Network error while generating summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-2 py-2 sm:p-6">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-text-primary text-lg font-semibold sm:text-2xl">Whanau Support</h2>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={generateSummary}
            disabled={messages.length === 0}
            className="border-accent-primary/30 bg-accent-primary/15 text-accent-primary hover:bg-accent-primary/25 rounded-xl border px-3 py-2 text-sm transition-colors disabled:opacity-50"
          >
            🩺 <span className="hidden sm:inline">Summary for Doctor</span>
            <span className="sm:hidden">Summary</span>
          </button>
          <button
            type="button"
            onClick={() =>
              alert(
                'Need help now?\n\n- Emergency: 111\n- Healthline (24/7 nurses): 0800 611 116\n- PlunketLine (24/7 baby & parenting): 0800 933 922\n- Need to Talk? (24/7 counsellors): call or text 1737',
              )
            }
            className="text-text-secondary flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10"
          >
            <span>🆘</span> Support
          </button>
          <button
            type="button"
            onClick={startNewConversation}
            className="bg-gradient-brand shadow-glow rounded-xl px-3 py-2 text-sm font-medium text-white transition hover:brightness-105"
          >
            + New
          </button>
        </div>
      </div>

      <div className="shadow-glass mb-4 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-black/15 p-4 backdrop-blur-xl">
        {messages.length === 0 && (
          <p className="text-text-muted mt-8 text-center">Start a conversation...</p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
          >
            <div
              className={`group relative max-w-[80%] rounded-3xl px-5 py-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-brand shadow-glow rounded-br-sm text-white'
                  : 'text-text-primary shadow-glass rounded-bl-sm border border-white/10 bg-white/5 backdrop-blur-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 max-w-none break-words">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="break-words whitespace-pre-wrap">{msg.content}</div>
              )}
              {msg.role === 'assistant' && msg.content && (
                <div className="bg-bg-secondary border-border absolute -top-3 -right-2 flex gap-1 rounded-full border p-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => submitFeedback(msg.content, 1, msg.agent)}
                    className="rounded-full p-1 text-xs hover:bg-white/10"
                    title="Helpful"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => submitFeedback(msg.content, -1, msg.agent)}
                    className="rounded-full p-1 text-xs hover:bg-white/10"
                    title="Not Helpful"
                  >
                    👎
                  </button>
                  <button
                    onClick={() => copyToClipboard(msg.content, index)}
                    className="rounded-full p-1 text-xs hover:bg-white/10"
                    title="Copy"
                  >
                    {copiedIndex === index ? '[OK]' : '📋'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-text-muted animate-in fade-in flex items-center gap-2 py-2 pl-4 duration-300">
            <div className="flex gap-1">
              <div
                className="bg-accent-primary h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="bg-accent-primary h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="bg-accent-primary h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <span className="text-sm font-medium">Gathering thoughts...</span>
          </div>
        )}

        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 mt-4 flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 duration-300">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="rounded-lg bg-red-500/20 px-3 py-1 font-semibold transition-colors hover:bg-red-500/30"
            >
              Dismiss
            </button>
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
          className="glass-input text-text-primary flex-1 px-5 py-4 outline-none"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-gradient-brand shadow-glow shrink-0 rounded-2xl px-5 font-semibold text-white transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 sm:px-8"
        >
          Send
        </button>
      </div>

      {/* Human Review Modal (Read-Only) */}
      {showReview && interruptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:hidden">
          <div className="bg-bg-secondary border-border w-full max-w-lg rounded-xl border p-6">
            <h3 className="text-accent-primary mb-4 text-lg font-semibold">
              Pending Practitioner Review
            </h3>
            <p className="text-text-secondary mb-4 text-sm">
              To ensure cultural safety and accurate information, this response requires review by a
              practitioner before it can be provided to you.
            </p>

            <div className="flex gap-3">
              <button
                onClick={checkReviewStatus}
                disabled={isLoading}
                className="bg-accent-success flex-1 rounded-lg py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Refresh Status'}
              </button>
              <button
                onClick={() => setShowReview(false)}
                className="bg-accent-primary text-accent-ink flex-1 rounded-lg py-2 hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:bg-white print:p-0">
          <div className="bg-bg-secondary border-border flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border p-6 print:h-auto print:max-h-none print:max-w-full print:border-none print:bg-white print:shadow-none">
            <div className="mb-4 flex items-center justify-between print:hidden">
              <h3 className="text-accent-primary text-xl font-semibold">🩺 Clinical Summary</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-text-muted rounded-lg p-2 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="bg-bg-primary border-border flex-1 overflow-y-auto rounded-lg border p-4 print:border-none print:bg-white print:p-0">
              {isGeneratingSummary ? (
                <div className="text-text-muted flex h-40 items-center justify-center">
                  <div className="border-accent-primary mr-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  Synthesizing conversation...
                </div>
              ) : (
                <div className="prose prose-sm prose-invert sm:prose-base print:prose max-w-none print:text-gray-800">
                  <ReactMarkdown>{summaryMarkdown || ''}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  if (summaryMarkdown) navigator.clipboard.writeText(summaryMarkdown);
                  alert('Copied to clipboard!');
                }}
                disabled={isGeneratingSummary}
                className="border-border text-text-secondary rounded-lg border px-4 py-2 font-medium hover:bg-white/5"
              >
                📋 Copy
              </button>
              <button
                onClick={() => window.print()}
                disabled={isGeneratingSummary}
                className="bg-accent-primary text-accent-ink rounded-lg px-4 py-2 font-medium transition hover:opacity-90"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
