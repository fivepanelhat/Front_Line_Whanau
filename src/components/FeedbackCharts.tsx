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
  // Process data for Feedback by Agent
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
    <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold mb-6">Feedback by Agent</h2>
      
      <div className="h-80 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="positive" name="Positive" stackId="a" fill="#22c55e" />
            <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Feedback</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positive</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negative</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chartData.map((stat: any) => (
              <tr key={stat.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{stat.positive}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{stat.negative}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.total > 0 ? Math.round((stat.positive / stat.total) * 100) + '%' : '-'}
                </td>
              </tr>
            ))}
            {chartData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No agent feedback data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
