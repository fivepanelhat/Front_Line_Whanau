import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function FeedbackDashboard() {
  const supabase = await createClient();
  
  // We don't have RLS strictly configured for this route yet, so we just fetch it securely server-side.
  const { data: feedbacks, error } = await supabase
    .from('ai_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback:', error);
    return <div>Failed to load feedback.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-semibold text-gray-900">AI Feedback Dashboard</h1>
        <div className="flex space-x-4 items-center">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
            Helpful: {feedbacks?.filter(f => f.rating === 1).length || 0}
          </div>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
            Not Helpful: {feedbacks?.filter(f => f.rating === -1).length || 0}
          </div>
          <a 
            href="/api/feedback/export"
            download
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thread ID</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbacks?.map((fb) => (
              <tr key={fb.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(fb.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {fb.rating === 1 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      👍 Helpful
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      👎 Not Helpful
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="line-clamp-3 hover:line-clamp-none max-w-xl cursor-pointer">
                    {fb.message_content}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {fb.thread_id.substring(0, 8)}...
                </td>
              </tr>
            ))}
            {(!feedbacks || feedbacks.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No feedback collected yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
