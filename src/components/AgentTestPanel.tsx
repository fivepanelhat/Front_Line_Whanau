'use client';

import { useState, useEffect } from 'react';
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

      if (!res.ok || !res.body) throw new Error('connection_failed');

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
              // Final metadata received
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                updated[lastIdx] = { ...updated[lastIdx], agent: data.agent };
                return updated;
              });
            }
          } catch {}
        }
      }

      // Auto-save after successful response
      const finalMessages: Message[] = [...newMessages, { role: 'assistant' as const, content: assistantResponse }];
      await saveConversationToDb(finalMessages);
    } catch (err) {
      console.error(err);
      setError('I am currently experiencing connection issues. Please try again in a moment.');
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
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Multi-Turn Agent</h2>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={generateSummary}
            disabled={messages.length === 0}
            className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
          >
            🩺 Summary for Doctor
          </button>
          <button
            onClick={() => alert("Support Team Contact: support@frontlinewhanau.co.nz\nPhone: 0800 123 456")}
            className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <span>🆘</span> Support
          </button>
          <button
            onClick={startNewConversation}
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + New
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border rounded-xl p-4 overflow-y-auto mb-4 bg-white">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-8">Start a conversation...</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <div className={`group relative max-w-[80%] px-5 py-4 rounded-3xl shadow-sm ${
              msg.role === 'user' ? 'bg-gradient-to-r from-indigo-600 to-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' ? (
                // No whitespace-pre-wrap here: markdown newlines rendered as
                // paragraphs AND preserved literally doubles the spacing.
                <div className="prose prose-sm max-w-none break-words prose-p:my-1 prose-ul:my-1">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
              {msg.role === 'assistant' && msg.content && (
                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-white border rounded-full p-1 shadow-sm">
                  <button
                    onClick={() => submitFeedback(msg.content, 1, msg.agent)}
                    className="hover:bg-gray-100 rounded-full p-1 text-xs"
                    title="Helpful"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => submitFeedback(msg.content, -1, msg.agent)}
                    className="hover:bg-gray-100 rounded-full p-1 text-xs"
                    title="Not Helpful"
                  >
                    👎
                  </button>
                  <button
                    onClick={() => copyToClipboard(msg.content, index)}
                    className="hover:bg-gray-100 rounded-full p-1 text-xs"
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
          <div className="flex items-center gap-2 text-gray-500 pl-4 py-2 animate-in fade-in duration-300">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm font-medium">Gathering thoughts...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm flex justify-between items-center animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
            <button onClick={() => setError(null)} className="font-semibold px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">Dismiss</button>
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
          className="flex-1 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md active:scale-95"
        >
          Send
        </button>
      </div>

      {/* Human Review Modal (Read-Only) */}
      {showReview && interruptData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-semibold text-lg mb-4 text-indigo-700">Pending Practitioner Review</h3>
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
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col print:max-w-full print:shadow-none print:max-h-none print:h-auto">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h3 className="font-semibold text-xl text-indigo-700">🩺 Clinical Summary</h3>
              <button onClick={() => setShowSummary(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 border rounded-lg print:border-none print:bg-white print:p-0">
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                  Synthesizing conversation...
                </div>
              ) : (
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-800">
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
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                📋 Copy
              </button>
              <button
                onClick={() => window.print()}
                disabled={isGeneratingSummary}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition shadow"
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
