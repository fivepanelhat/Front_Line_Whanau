import { createClient } from "@/lib/supabase/server";
import { SystemMetricsCharts } from "@/components/SystemMetricsChartsLazy";

export default async function SystemHealthDashboard() {
  const supabase = await createClient();

  const [{ data: events }, { count: totalReviews }] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("ai_reviews")
      .select("*", { count: 'exact', head: true })
      .neq('status', 'pending'),
  ]);

  const safeEvents = events || [];

  // Calculate Error Rate (agent errors)
  const totalAgentRequests = safeEvents.filter(e => e.event_type === 'agent_latency' || e.event_type === 'agent_error').length;
  const agentErrors = safeEvents.filter(e => e.event_type === 'agent_error').length;
  const errorRate = totalAgentRequests > 0 ? ((agentErrors / totalAgentRequests) * 100).toFixed(1) : "0.0";

  // Calculate Failed Reviews
  const reviewDecisions = safeEvents.filter(e => e.event_type === 'review_denied').length;

  const rejectionRate = (totalReviews && totalReviews > 0) ? ((reviewDecisions / totalReviews) * 100).toFixed(1) : "0.0";

  // Active Alerts Generation (Last 24 hours of data roughly, from the 500 limit)
  const activeAlerts = safeEvents.filter(e => {
    if (e.event_type === 'agent_error') return true;
    if (e.event_type === 'agent_latency' && e.metadata?.durationMs && e.metadata.durationMs > 8000) return true;
    return false;
  }).slice(0, 10); // top 10 most recent

  const formatAlertTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-text-primary">System Health</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 border border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-text-muted uppercase">Agent Error Rate</h3>
            <p className="text-3xl font-bold text-text-primary mt-2">{errorRate}%</p>
          </div>
          <div className="text-4xl">{parseFloat(errorRate) > 5 ? '⚠️' : '✅'}</div>
        </div>
        <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 border border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-text-muted uppercase">Review Rejection Rate</h3>
            <p className="text-3xl font-bold text-text-primary mt-2">{rejectionRate}%</p>
          </div>
          <div className="text-4xl">{parseFloat(rejectionRate) > 20 ? '⚠️' : '✅'}</div>
        </div>
      </div>

      <SystemMetricsCharts events={safeEvents} />

      <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 border border-border mt-8">
        <h2 className="text-xl font-semibold mb-6 text-red-400 flex items-center gap-2">
          <span>🚨</span> Active System Alerts
        </h2>
        {activeAlerts.length > 0 ? (
          <div className="space-y-4">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-red-400">
                    {alert.event_type === 'agent_error' ? 'Critical Agent Error' : 'High Latency Detected'}
                  </h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Agent: <strong>{alert.metadata?.agent || 'Unknown'}</strong>
                    {alert.event_type === 'agent_latency' && ` took ${alert.metadata?.durationMs}ms to respond.`}
                    {alert.event_type === 'agent_error' && ` encountered an error: ${alert.metadata?.errorMessage || 'Unknown error'}`}
                  </p>
                </div>
                <div className="text-xs text-text-muted whitespace-nowrap">
                  {formatAlertTime(alert.created_at)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No active alerts at this time. Systems operating normally.</p>
        )}
      </div>
    </div>
  );
}
