'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function FeedbackCharts({ feedbacks }: { feedbacks: any[] }) {
  const agentStats = feedbacks.reduce((acc: any, fb: any) => {
    const agent = fb.agent || 'Unknown';
    if (!acc[agent]) {
      acc[agent] = { name: agent, positive: 0, negative: 0, total: 0 };
    }
    acc[agent].total += 1;
    if (fb.rating === 1 || fb.rating === 'positive') {
      acc[agent].positive += 1;
    } else {
      acc[agent].negative += 1;
    }
    return acc;
  }, {});

  const chartData = Object.values(agentStats);

  return (
    <div className="bg-bg-secondary border-border mb-8 rounded-lg border p-4 sm:p-6">
      <h2 className="text-text-primary mb-6 text-xl font-semibold">Feedback by Agent</h2>

      <div className="mb-8 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
            <YAxis tick={{ fill: '#94a3b8' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="positive" name="Positive" stackId="a" fill="#22c55e" />
            <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="divide-border min-w-full divide-y">
          <thead className="bg-bg-primary">
            <tr>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Agent
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Total Feedback
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Positive
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Negative
              </th>
              <th className="text-text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {chartData.map((stat: any) => (
              <tr key={stat.name}>
                <td className="text-text-primary px-6 py-4 text-sm font-medium whitespace-nowrap">
                  {stat.name}
                </td>
                <td className="text-text-secondary px-6 py-4 text-sm whitespace-nowrap">
                  {stat.total}
                </td>
                <td className="text-accent-success px-6 py-4 text-sm font-semibold whitespace-nowrap">
                  {stat.positive}
                </td>
                <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-red-400">
                  {stat.negative}
                </td>
                <td className="text-text-primary px-6 py-4 text-sm whitespace-nowrap">
                  {stat.total > 0 ? Math.round((stat.positive / stat.total) * 100) + '%' : '-'}
                </td>
              </tr>
            ))}
            {chartData.length === 0 && (
              <tr>
                <td colSpan={5} className="text-text-muted px-6 py-4 text-center">
                  No agent feedback data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
