'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StoryModerationPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch('/api/stories'); // fetches all stories if admin/practitioner
        const data = await res.json();
        if (data.stories) {
          // Filter to only show pending stories
          setStories(data.stories.filter((s: any) => !s.is_approved || !s.cultural_safety_approved));
        }
      } catch (err) {
        console.error('Failed to fetch stories', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStories();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/stories/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_approved: true, cultural_safety_approved: true }),
      });
      if (res.ok) {
        setStories(prev => prev.filter(s => s.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to approve story', err);
    }
  };

  const handleReject = async (id: string) => {
    // Basic rejection: we can just leave it unapproved or delete it.
    // For now, let's just alert.
    alert("Rejection logic (e.g. deletion or flag) can be wired up here.");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Peer Story Moderation</h1>

      {isLoading ? (
        <div className="text-gray-500">Loading pending stories...</div>
      ) : stories.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 text-gray-500">
          No stories pending review.
        </div>
      ) : (
        <div className="grid gap-6">
          {stories.map(story => (
            <div key={story.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{story.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Submitted: {new Date(story.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Pending Review</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap mb-4 font-serif">
                {story.content}
              </div>

              <div className="flex gap-2 mb-6">
                {story.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 border-t pt-4">
                <button 
                  onClick={() => handleApprove(story.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                >
                  Approve (Safe for Publish)
                </button>
                <button 
                  onClick={() => handleReject(story.id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200"
                >
                  Reject / Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
