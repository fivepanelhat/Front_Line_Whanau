'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useConsent } from '@/hooks/useConsent';
import { ConsentScope } from '@/lib/consent';
import { cleanAsterisks, type DashboardTab } from './types';

type ChatMessage = {
  sender: 'user' | 'agent';
  text: string;
  agent?: string;
  sources?: Array<{ title: string; reference: string }>;
  suggestedActions?: Array<{ label: string; type: string; target: string }>;
};

const WELCOME: ChatMessage = {
  sender: 'agent',
  agent: 'aether-summit',
  text: `Kia ora! Welcome to your private, sovereign support hub dashboard. 💛\n\nI can help you look up NZ health and financial services, design pathways, and draft WINZ or tenancy templates. All interactions are protected under NZ Privacy policies.`,
  suggestedActions: [
    { label: 'Explore Financial Support', type: 'info', target: 'preterm baby payment' },
    { label: 'Get Housing Help', type: 'info', target: 'healthy homes' },
    { label: 'Browse Directory', type: 'navigate_tab', target: 'directory' },
  ],
};

export function AiAssistantTab({ onNavigateTab }: { onNavigateTab: (tab: DashboardTab) => void }) {
  const locale = useLocale();
  const { hasConsent: aiProcessGranted, grantConsent: grantAiProcess } = useConsent('ai.process');
  const { hasConsent: aiExecuteGranted, grantConsent: grantAiExecute } = useConsent('ai.execute');

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isAiLoading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setChatMessages((prev) => [...prev, { sender: 'user', text: queryText }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const scopes: ConsentScope[] = [];
      if (aiProcessGranted) scopes.push('ai.process');
      if (aiExecuteGranted) scopes.push('ai.execute');

      const response = await fetch('/api/summit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, scopes, locale }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('API call failed');
      const res = await response.json();

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: cleanAsterisks(res.content),
          agent: res.agent,
          sources: res.sources,
          suggestedActions: res.suggestedActions,
        },
      ]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          agent: 'aether-summit',
          text: 'Sorry, I encountered an error routing your request. Please try again.',
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setIsAiLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-6">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-accent-primary text-accent-ink'
                  : 'shadow-glass border border-white/10 bg-white/5 backdrop-blur-md'
              }`}
            >
              {msg.agent && (
                <div className="text-accent-secondary mb-1 text-xs font-bold tracking-wider uppercase">
                  {msg.agent.replace('-', ' ')}
                </div>
              )}
              <p className="text-sm whitespace-pre-line">{msg.text}</p>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 border-t border-white/[0.08] pt-2">
                  <span className="text-text-muted text-[11px] font-bold uppercase">Sources:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {msg.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.reference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-secondary flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[11px] hover:bg-white/10"
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.suggestedActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (action.type === 'navigate_tab') {
                        onNavigateTab(action.target as DashboardTab);
                      } else if (action.type === 'info' || action.type === 'form') {
                        handleSendQuery(action.target);
                      } else if (action.type === 'call') {
                        alert(`Calling ${action.target} (Simulated)`);
                      } else if (action.type === 'navigate') {
                        window.open(action.target, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="border-accent-secondary/20 bg-accent-secondary/5 text-accent-secondary hover:bg-accent-secondary hover:text-accent-ink rounded-full border px-3 py-1 text-xs transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isAiLoading && (
          <div className="text-text-secondary flex items-center gap-2 text-sm italic">
            <span className="animate-pulse">●</span> Orchestrator matching inputs...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {(!aiProcessGranted || !aiExecuteGranted) && (
        <div className="border-accent-warm/20 bg-accent-warm/5 mb-4 flex items-center justify-between gap-4 rounded-xl border p-4">
          <div className="text-text-secondary text-xs">
            💡 Informed Consent Notice: Some AI pathways or document generation capabilities require
            active consent scopes for local processing.
          </div>
          <button
            type="button"
            onClick={() => {
              if (!aiProcessGranted) grantAiProcess();
              if (!aiExecuteGranted) grantAiExecute();
            }}
            className="bg-accent-warm/15 text-accent-warm hover:bg-accent-warm/25 rounded px-3 py-1.5 text-xs font-bold"
          >
            Quick Enable All
          </button>
        </div>
      )}

      <div className="border-t border-white/[0.08] pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(chatInput);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask about financial support, healthy homes, WINZ/IRD applications, or local services..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="glass-input flex-1 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="bg-gradient-brand shadow-glow rounded-2xl px-6 py-3 font-semibold text-white transition hover:brightness-105"
          >
            Send
          </button>
        </form>
        <p className="text-text-muted/80 mt-3 text-center text-[11px]">
          <span className="text-accent-warm font-semibold">Disclaimer:</span> Whilst our AI is a
          trained guidance tool that navigates this space to tautoko whānau, remember to practice
          discernment and due diligence. It is{' '}
          <strong>not a registered medical, financial or cultural advisor</strong>. Always consult a
          registered practitioner for professional advice.
        </p>
      </div>
    </div>
  );
}
