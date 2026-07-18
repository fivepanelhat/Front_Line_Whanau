'use client';

import { useState } from 'react';

export default function FinancialEligibilityPage() {
  const [income, setIncome] = useState('');
  const [gestation, setGestation] = useState('');
  const [support, setSupport] = useState('');
  const [region, setRegion] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<{
    content: string;
    note?: string;
    sources?: string[];
  } | null>(null);
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
    <div className="bg-bg-primary min-h-screen pb-20">
      <div className="bg-accent-primary px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-accent-ink mb-3 text-2xl font-bold sm:mb-4 sm:text-4xl">
            Financial Support Eligibility
          </h1>
          <p className="text-accent-ink/80 text-base sm:text-lg">
            Use our AI-assisted tool to figure out which grants and funding pathways (WINZ, Best
            Start, Disability Allowance) your whanau might be eligible for.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-6 grid max-w-4xl gap-6 px-4 py-8 sm:-mt-8 sm:gap-8 sm:px-6 sm:py-12 md:grid-cols-2">
        <div className="bg-bg-secondary border-border rounded-xl border p-5 sm:p-6">
          <h2 className="text-text-primary mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
            Your Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-text-secondary mb-1 block text-sm font-medium">
                Household Income Bracket
              </label>
              <select
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 focus:ring-2"
              >
                <option value="">Select...</option>
                <option value="Under $50k">Under $50,000</option>
                <option value="$50k - $90k">$50,000 - $90,000</option>
                <option value="$90k - $140k">$90,000 - $140,000</option>
                <option value="Over $140k">Over $140,000</option>
              </select>
            </div>

            <div>
              <label className="text-text-secondary mb-1 block text-sm font-medium">
                Gestation at birth (weeks)
              </label>
              <input
                type="number"
                value={gestation}
                onChange={(e) => setGestation(e.target.value)}
                placeholder="e.g. 28"
                className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 focus:ring-2"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-1 block text-sm font-medium">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Waikato"
                className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 focus:ring-2"
              />
            </div>

            <div>
              <label className="text-text-secondary mb-1 block text-sm font-medium">
                Current Support (Optional)
              </label>
              <input
                type="text"
                value={support}
                onChange={(e) => setSupport(e.target.value)}
                placeholder="e.g. Paid Parental Leave"
                className="border-border bg-bg-primary text-text-primary focus:ring-accent-primary w-full rounded-lg border px-4 py-2 focus:ring-2"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-accent-primary text-accent-ink mt-4 w-full rounded-lg py-3 font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Analysing Eligibility...' : 'Check Eligibility'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              {error}
            </div>
          )}
        </div>

        <div>
          {report ? (
            <div className="bg-bg-secondary border-accent-success/30 rounded-xl border p-5 sm:p-6">
              <h2 className="text-text-primary mb-4 text-xl font-bold">Eligibility Report</h2>

              {report.note && (
                <div className="mb-4 rounded border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-300">
                  {report.note}
                </div>
              )}

              <div className="prose prose-sm prose-invert text-text-secondary mb-6 max-w-none whitespace-pre-wrap">
                {report.content}
              </div>

              {report.sources && report.sources.length > 0 && (
                <div className="border-border border-t pt-4">
                  <h4 className="text-text-primary mb-2 text-sm font-bold">Sources Consulted:</h4>
                  <ul className="text-text-muted list-disc space-y-1 pl-4 text-xs">
                    {report.sources.map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-accent-success/5 border-accent-success/20 text-text-secondary flex h-full flex-col items-center justify-center rounded-xl border p-6 text-center sm:p-8">
              <p>
                Fill out your details to receive a personalised AI report on financial support
                pathways for preterm whanau.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
