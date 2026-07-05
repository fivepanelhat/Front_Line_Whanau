'use client';

import { useState } from 'react';

export default function FinancialEligibilityPage() {
  const [income, setIncome] = useState('');
  const [gestation, setGestation] = useState('');
  const [support, setSupport] = useState('');
  const [region, setRegion] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<{ content: string; note?: string; sources?: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setReport(null);

    try {
      const res = await fetch('/api/financial/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, gestation, support, region }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report');

      setReport({
        content: data.report,
        note: data.note,
        sources: data.sources,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <div className="bg-accent-primary py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-accent-ink mb-3 sm:mb-4">Financial Support Eligibility</h1>
          <p className="text-accent-ink/80 text-base sm:text-lg">
            Use our AI-assisted tool to figure out which grants and funding pathways (WINZ, Best Start, Disability Allowance) your whanau might be eligible for.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 -mt-6 sm:-mt-8 relative z-10 grid gap-6 sm:gap-8 md:grid-cols-2">
        <div className="bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">Your Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Household Income Bracket</label>
              <select
                value={income}
                onChange={e => setIncome(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">Select...</option>
                <option value="Under $50k">Under $50,000</option>
                <option value="$50k - $90k">$50,000 - $90,000</option>
                <option value="$90k - $140k">$90,000 - $140,000</option>
                <option value="Over $140k">Over $140,000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Gestation at birth (weeks)</label>
              <input
                type="number"
                value={gestation}
                onChange={e => setGestation(e.target.value)}
                placeholder="e.g. 28"
                className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Region</label>
              <input
                type="text"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="e.g. Waikato"
                className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Current Support (Optional)</label>
              <input
                type="text"
                value={support}
                onChange={e => setSupport(e.target.value)}
                placeholder="e.g. Paid Parental Leave"
                className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent-primary text-accent-ink font-medium py-3 rounded-lg hover:opacity-90 disabled:opacity-50 mt-4 transition-opacity"
            >
              {isLoading ? 'Analysing Eligibility...' : 'Check Eligibility'}
            </button>
          </form>

          {error && <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}
        </div>

        <div>
          {report ? (
            <div className="bg-bg-secondary p-5 sm:p-6 rounded-xl border border-accent-success/30">
              <h2 className="text-xl font-bold text-text-primary mb-4">Eligibility Report</h2>

              {report.note && (
                <div className="mb-4 bg-yellow-500/10 text-yellow-300 text-sm p-3 rounded border border-yellow-500/20">
                  {report.note}
                </div>
              )}

              <div className="prose prose-sm prose-invert text-text-secondary whitespace-pre-wrap max-w-none mb-6">
                {report.content}
              </div>

              {report.sources && report.sources.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-bold text-text-primary mb-2">Sources Consulted:</h4>
                  <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                    {report.sources.map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-accent-success/5 h-full p-6 sm:p-8 rounded-xl border border-accent-success/20 flex flex-col items-center justify-center text-center text-text-secondary">
              <p>Fill out your details to receive a personalised AI report on financial support pathways for preterm whanau.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
