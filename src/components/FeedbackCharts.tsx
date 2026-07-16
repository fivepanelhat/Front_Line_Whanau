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
 <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 mb-8 border border-border">
 <h2 className="text-xl font-semibold mb-6 text-text-primary">Feedback by Agent</h2>

 <div className="h-80 w-full mb-8">
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
 <table className="min-w-full divide-y divide-border">
 <thead className="bg-bg-primary">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Agent</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Total Feedback</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Positive</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Negative</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Score</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {chartData.map((stat: any) => (
 <tr key={stat.name}>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{stat.name}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{stat.total}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-success font-semibold">{stat.positive}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-semibold">{stat.negative}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
 {stat.total > 0 ? Math.round((stat.positive / stat.total) * 100) + '%' : '-'}
 </td>
 </tr>
 ))}
 {chartData.length === 0 && (
 <tr>
 <td colSpan={5} className="px-6 py-4 text-center text-text-muted">No agent feedback data available</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
}
