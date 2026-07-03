'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface FeedbackItem {
  id: string;
  thread_id: string;
  message_content: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function FeedbackDashboard() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch('/api/practitioner/feedback');
        if (!res.ok) throw new Error('Failed to fetch feedback');
        const data = await res.json();
        setFeedbackList(data.feedback || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const totalFeedback = feedbackList.length;
  const positiveFeedback = feedbackList.filter(f => f.rating === 1).length;
  const negativeFeedback = feedbackList.filter(f => f.rating === -1).length;
  const positivePercentage = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Beta Feedback Analysis</h1>
        <p className="text-lg text-gray-600 mt-2">Monitor AI performance and review user feedback in real-time.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Feedback</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{totalFeedback}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">
            📊
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Positive Rating</p>
            <p className="text-4xl font-bold text-emerald-600 mt-2">{positivePercentage}%</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
            👍
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Needs Improvement</p>
            <p className="text-4xl font-bold text-rose-600 mt-2">{negativeFeedback}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-2xl">
            👎
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent User Feedback</h2>
        {feedbackList.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-lg">No feedback has been submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbackList.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-50 px-6 py-4 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${item.rating === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.rating === 1 ? 'Helpful 👍' : 'Not Helpful 👎'}
                    </span>
                    <span className="text-sm text-gray-500 font-mono">Thread: {item.thread_id.substring(0, 15)}...</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="p-6">
                  {item.comment && (
                    <div className="mb-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <p className="text-sm font-semibold text-amber-900 mb-1">User Comment:</p>
                      <p className="text-amber-800 italic">"{item.comment}"</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">AI Response Context:</p>
                    <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-48 overflow-y-auto">
                      <ReactMarkdown>{item.message_content || '*No content recorded*'}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
