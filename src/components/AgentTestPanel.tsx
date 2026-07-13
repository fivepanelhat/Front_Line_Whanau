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

  const saveConversationToDb = useCallback(async (updatedMessages: Message[]) => {
    const inputs: MessageInput[] = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    await saveConversation(threadId, inputs);
    onConversationUpdated?.();
  }, [threadId, onConversationUpdated]);

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
              // New model call in the graph (classifier → agent steps):
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
                updated[lastIdx] = { ...updated[lastIdx], content: assistantResponse, agent: data.agent };
                return updated;
              });
            }
          } catch {
            // Ignore malformed SSE frames
          }
        }
      }

      // Auto-save after successful response
      const finalMessages: Message[] = [...newMessages, { role: 'assistant' as const, content: assistantResponse }];
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

  const submitFeedback = async (messageContent: string, rating: number, agent?: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: threadId || 'unknown-thread', messageContent, rating, agent })
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
        setSummaryMarkdown("Error generating summary: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setSummaryMarkdown("Network error while generating summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col px-2 py-2 sm:p-6">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-text-primary sm:text-2xl">Whānau Support</h2>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={generateSummary}
            disabled={messages.length === 0}
            className="rounded-xl border border-accent-primary/30 bg-accent-primary/15 px-3 py-2 text-sm text-accent-primary transition-colors hover:bg-accent-primary/25 disabled:opacity-50"
          >
            🩺 <span className="hidden sm:inline">Summary for Doctor</span>
            <span className="sm:hidden">Summary</span>
          </button>
          <button
            type="button"
            onClick={() =>
              alert(
                'Need help now?\n\n• Emergency: 111\n• Healthline (24/7 nurses): 0800 611 116\n• PlunketLine (24/7 baby & parenting): 0800 933 922\n• Need to Talk? (24/7 counsellors): call or text 1737',
              )
            }
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/10"
          >
            <span>🆘</span> Support
          </button>
          <button
            type="button"
            onClick={startNewConversation}
            className="rounded-xl bg-gradient-brand px-3 py-2 text-sm font-medium text-white shadow-glow transition hover:brightness-105"
          >
            + New
          </button>
        </div>
      </div>

      <div className="mb-4 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-black/15 p-4 shadow-glass backdrop-blur-xl">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-text-muted">Start a conversation...</p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
          >
            <div
              className={`group relative max-w-[80%] rounded-3xl px-5 py-4 ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-gradient-brand text-white shadow-glow'
                  : 'rounded-bl-sm border border-white/10 bg-white/5 text-text-primary shadow-glass backdrop-blur-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none break-words prose-p:my-1 prose-ul:my-1">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
              {msg.role === 'assistant' && msg.content && (
                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-bg-secondary border border-border rounded-full p-1">
                  <button
                    onClick={() => submitFeedback(msg.content, 1, msg.agent)}
                    className="hover:bg-white/10 rounded-full p-1 text-xs"
                    title="Helpful"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => submitFeedback(msg.content, -1, msg.agent)}
                    className="hover:bg-white/10 rounded-full p-1 text-xs"
                    title="Not Helpful"
                  >
                    👎
                  </button>
                  <button
                    onClick={() => copyToClipboard(msg.content, index)}
                    className="hover:bg-white/10 rounded-full p-1 text-xs"
                    title="Copy"
                  >
                    {copiedIndex === index ? '✓' : '📋'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-text-muted pl-4 py-2 animate-in fade-in duration-300">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm font-medium">Gathering thoughts...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
            <button onClick={() => setError(null)} className="font-semibold px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">Dismiss</button>
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
          className="glass-input flex-1 px-5 py-4 text-text-primary outline-none"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="shrink-0 rounded-2xl bg-gradient-brand px-5 font-semibold text-white shadow-glow transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 sm:px-8"
        >
          Send
        </button>
      </div>

      {/* Human Review Modal (Read-Only) */}
      {showReview && interruptData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 print:hidden">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-lg border border-border">
            <h3 className="font-semibold text-lg mb-4 text-accent-primary">Pending Practitioner Review</h3>
            <p className="text-sm text-text-secondary mb-4">
              To ensure cultural safety and accurate information, this response requires review by a practitioner before it can be provided to you.
            </p>

            <div className="flex gap-3">
              <button
                onClick={checkReviewStatus}
                disabled={isLoading}
                className="flex-1 bg-accent-success text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Refresh Status'}
              </button>
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 bg-accent-primary text-accent-ink py-2 rounded-lg hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col border border-border print:max-w-full print:shadow-none print:max-h-none print:h-auto print:bg-white print:border-none">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h3 className="font-semibold text-xl text-accent-primary">🩺 Clinical Summary</h3>
              <button onClick={() => setShowSummary(false)} className="text-text-muted hover:bg-white/10 p-2 rounded-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-bg-primary border border-border rounded-lg print:border-none print:bg-white print:p-0">
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center h-40 text-text-muted">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mr-3"></div>
                  Synthesizing conversation...
                </div>
              ) : (
                <div className="prose prose-sm prose-invert sm:prose-base max-w-none print:prose print:text-gray-800">
                  <ReactMarkdown>{summaryMarkdown || ""}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 print:hidden">
              <button
                onClick={() => {
                  if (summaryMarkdown) navigator.clipboard.writeText(summaryMarkdown);
                  alert("Copied to clipboard!");
                }}
                disabled={isGeneratingSummary}
                className="px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-white/5 font-medium"
              >
                📋 Copy
              </button>
              <button
                onClick={() => window.print()}
                disabled={isGeneratingSummary}
                className="px-4 py-2 bg-accent-primary text-accent-ink rounded-lg hover:opacity-90 font-medium transition"
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
