'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export function SystemMetricsCharts({ events }: { events: any[] }) {
  // Usage Spikes (Requests over time - grouped by hour)
  const usageMap: Record<string, number> = {};
  
  events.forEach(e => {
    if (e.created_at) {
      const date = new Date(e.created_at);
      // Format as "MM-DD HH:00"
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const key = `${month}-${day} ${hour}:00`;
      usageMap[key] = (usageMap[key] || 0) + 1;
    }
  });

  // Sort chronologically and take last 24 entries
  let usageData = Object.keys(usageMap)
    .sort()
    .map(key => ({ time: key, requests: usageMap[key] }))
    .slice(-24);

  // Fallback if no data
  if (usageData.length === 0) {
    usageData = [
      { time: 'No data', requests: 0 }
    ];
  }

  // Latency Monitoring (Average response time by agent)
  const latencyEvents = events.filter(e => e.event_type === 'agent_latency');
  const agentStats = latencyEvents.reduce((acc: any, ev: any) => {
    const agent = ev.metadata?.agent || 'Unknown';
    if (!acc[agent]) {
      acc[agent] = { name: agent, totalLatency: 0, count: 0 };
    }
    acc[agent].totalLatency += (ev.metadata?.durationMs || 0);
    acc[agent].count += 1;
    return acc;
  }, {});

  const latencyData = Object.values(agentStats).map((s: any) => ({
    name: s.name,
    avgLatency: Math.round(s.totalLatency / s.count)
  }));

  return (
    <div className="space-y-8">
      {/* Usage Chart */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6">Usage Spikes (Last 24 Hours)</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requests" name="Total Requests" stroke="#3b82f6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latency Chart */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6">Average Latency by Agent (ms)</h2>
        <div className="h-72 w-full">
          {latencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgLatency" name="Latency (ms)">
                  {
                    latencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avgLatency > 5000 ? '#ef4444' : '#8b5cf6'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No latency data recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
