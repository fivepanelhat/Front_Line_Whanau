'use client';

import { useState } from 'react';

export function AgentTestPanel() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, consentGiven: true }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            if (data.type === 'token') {
              setResponse((prev) => prev + data.content);
            }
            if (data.type === 'final') {
              console.log('Final state:', data);
            }
          }
        }
      }
    } catch (_error) {
      setResponse('Error occurred while contacting the agent.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h2 className="mb-4 text-xl font-semibold">Agent Test Panel</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the agent something..."
          className="flex-1 rounded border px-4 py-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-black px-6 text-white disabled:opacity-50"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>

      {response && (
        <div className="whitespace-pre-wrap rounded border bg-gray-50 p-4">
          {response}
        </div>
      )}
    </div>
  );
}
