'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';

interface FeedbackStats {
  summary: {
    total: number;
    positive: number;
    negative: number;
    positiveRate: number;
  };
  byAgent: Array<{
    agent: string;
    up: number;
    down: number;
    total: number;
  }>;
  trend: Array<{
    date: string;
    up: number;
    down: number;
  }>;
  needsAttention: Array<{
    id: string;
    created_at: string;
    agent: string;
    query: string;
    response: string;
    review_status: string;
  }>;
}

export function FeedbackAnalysisDashboard() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    from: '',
    to: '',
    agent: '',
  });

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.agent) params.append('agent', filters.agent);

      const res = await fetch(`/api/feedback/stats?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load feedback data');

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load feedback analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  if (loading && !stats) {
    return <div className="p-8 text-text-muted">Loading feedback insights...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400">{error}</div>;
  }

  if (!stats) return null;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">Feedback Analysis</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-white/5 text-text-secondary transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-secondary p-4 sm:p-6 rounded-2xl border border-border">
          <div className="text-sm text-text-muted">Total Feedback</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2 text-text-primary">{stats.summary.total}</div>
        </div>
        <div className="bg-bg-secondary p-4 sm:p-6 rounded-2xl border border-border">
          <div className="text-sm text-text-muted">Positive Rate</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2 text-accent-success">
            {stats.summary.positiveRate}%
          </div>
        </div>
        <div className="bg-bg-secondary p-4 sm:p-6 rounded-2xl border border-border">
          <div className="text-sm text-text-muted">Positive</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2 text-text-primary">{stats.summary.positive}</div>
        </div>
        <div className="bg-bg-secondary p-4 sm:p-6 rounded-2xl border border-border">
          <div className="text-sm text-text-muted">Negative</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2 text-red-400">
            {stats.summary.negative}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Feedback by Agent */}
        <div className="bg-bg-secondary p-4 sm:p-6 rounded-2xl border border-border">
          <h3 className="font-semibold mb-4 text-text-primary">Feedback by Agent</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byAgent}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="agent" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="up" name="Positive" stackId="a" fill="#22c55e" />
                <Bar dataKey="down" name="Negative" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Trend Over Time */}
        <div className="bg-bg-secondary p-4 sm:p-6 rounded-2xl border border-border">
          <h3 className="font-semibold mb-4 text-text-primary">Trend Over Time</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="up" name="Positive" stroke="#22c55e" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="down" name="Negative" stroke="#ef4444" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Needs Attention */}
      <div className="bg-bg-secondary p-4 sm:p-6 rounded-2xl border border-border">
        <h3 className="font-semibold mb-4 text-text-primary">Needs Attention (Recent Negative Feedback)</h3>
        {stats.needsAttention.length > 0 ? (
          <div className="space-y-4">
            {stats.needsAttention.map((item) => (
              <div key={item.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <span className="font-semibold text-red-400">Agent: {item.agent || 'Unknown'}</span>
                  <span className="text-sm text-text-muted">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm text-text-secondary mb-2">
                  <strong>Query:</strong> {item.query || 'N/A'}
                </div>
                <div className="text-sm text-text-secondary">
                  <strong>Response:</strong> {item.response || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No negative feedback recently.</p>
        )}
      </div>
    </div>
  );
}
