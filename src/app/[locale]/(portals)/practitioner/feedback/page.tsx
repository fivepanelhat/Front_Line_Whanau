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
 <div className="w-8 h-8 bg-accent-primary rounded-full animate-pulse" />
 </div>
 );
 }

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
 <div className="mb-6 sm:mb-10">
 <h1 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">Beta Feedback Analysis</h1>
 <p className="text-base sm:text-lg text-text-secondary mt-2">Monitor AI performance and review user feedback in real-time.</p>
 </div>

 {error && (
 <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
 <p className="text-red-400">{error}</p>
 </div>
 )}

 {/* Metrics Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
 <div className="bg-bg-secondary p-5 sm:p-6 rounded-2xl border border-border flex items-center justify-between">
 <div>
 <p className="text-xs sm:text-sm font-medium text-text-muted uppercase tracking-wider">Total Feedback</p>
 <p className="text-3xl sm:text-4xl font-bold text-text-primary mt-2">{totalFeedback}</p>
 </div>
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl sm:text-2xl">
 📊
 </div>
 </div>

 <div className="bg-bg-secondary p-5 sm:p-6 rounded-2xl border border-border flex items-center justify-between">
 <div>
 <p className="text-xs sm:text-sm font-medium text-text-muted uppercase tracking-wider">Positive Rating</p>
 <p className="text-3xl sm:text-4xl font-bold text-accent-success mt-2">{positivePercentage}%</p>
 </div>
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl sm:text-2xl">
 👍
 </div>
 </div>

 <div className="bg-bg-secondary p-5 sm:p-6 rounded-2xl border border-border flex items-center justify-between">
 <div>
 <p className="text-xs sm:text-sm font-medium text-text-muted uppercase tracking-wider">Needs Improvement</p>
 <p className="text-3xl sm:text-4xl font-bold text-red-400 mt-2">{negativeFeedback}</p>
 </div>
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl sm:text-2xl">
 👎
 </div>
 </div>
 </div>

 {/* Feedback List */}
 <div>
 <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">Recent User Feedback</h2>
 {feedbackList.length === 0 ? (
 <div className="bg-bg-secondary border border-dashed border-border rounded-2xl p-8 sm:p-12 text-center">
 <p className="text-text-muted text-lg">No feedback has been submitted yet.</p>
 </div>
 ) : (
 <div className="space-y-4 sm:space-y-6">
 {feedbackList.map((item) => (
 <div key={item.id} className="bg-bg-secondary rounded-2xl border border-border overflow-hidden">
 <div className="border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2 bg-white/[0.02]">
 <div className="flex items-center gap-2 sm:gap-3">
 <span className={`px-2.5 py-1 text-xs sm:text-sm font-bold rounded-full ${item.rating === 1 ? 'bg-accent-success/15 text-accent-success' : 'bg-red-500/15 text-red-400'}`}>
 {item.rating === 1 ? 'Helpful 👍' : 'Not Helpful 👎'}
 </span>
 <span className="text-xs sm:text-sm text-text-muted font-mono hidden sm:inline">Thread: {item.thread_id.substring(0, 15)}...</span>
 </div>
 <span className="text-xs sm:text-sm text-text-muted">
 {new Date(item.created_at).toLocaleString()}
 </span>
 </div>

 <div className="p-4 sm:p-6">
 {item.comment && (
 <div className="mb-4 bg-yellow-500/10 p-3 sm:p-4 rounded-xl border border-yellow-500/20">
 <p className="text-sm font-semibold text-yellow-300 mb-1">User Comment:</p>
 <p className="text-yellow-200/80 italic text-sm">&ldquo;{item.comment}&rdquo;</p>
 </div>
 )}

 <div>
 <p className="text-sm font-semibold text-text-primary mb-2">AI Response Context:</p>
 <div className="prose prose-sm prose-invert max-w-none text-text-secondary bg-bg-primary p-3 sm:p-4 rounded-xl border border-border max-h-48 overflow-y-auto">
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
