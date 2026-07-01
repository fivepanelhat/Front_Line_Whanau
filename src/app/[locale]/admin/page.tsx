import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedbackCharts } from "@/components/FeedbackCharts";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Basic role check. For a real app, use a proper role column or JWT claim
  if (!user || user.email !== "admin@example.com") {
    // redirect("/"); // Uncomment in production to restrict access
  }

  const { data: feedbacks } = await supabase
    .from("ai_feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const totalFeedback = feedbacks?.length || 0;
  const positiveFeedback = feedbacks?.filter(f => f.rating === 'positive').length || 0;
  const negativeFeedback = feedbacks?.filter(f => f.rating === 'negative').length || 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Beta Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Feedback</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalFeedback}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Positive Reviews</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{positiveFeedback}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Areas to Improve</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{negativeFeedback}</p>
        </div>
      </div>

      <FeedbackCharts feedbacks={feedbacks || []} />

      <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Recent Beta Feedback</h2>
        
        {feedbacks && feedbacks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbacks.map((fb: any) => (
                  <tr key={fb.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fb.rating === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {fb.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {fb.comment || "No comment provided"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No feedback submitted yet.</p>
        )}
      </div>
    </div>
  );
}
