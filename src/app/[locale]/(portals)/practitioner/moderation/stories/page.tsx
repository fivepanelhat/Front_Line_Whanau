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
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-text-primary">Peer Story Moderation</h1>

      {isLoading ? (
        <div className="text-text-muted">Loading pending stories...</div>
      ) : stories.length === 0 ? (
        <div className="bg-bg-secondary p-8 sm:p-12 text-center rounded-xl border border-border text-text-muted">
          No stories pending review.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {stories.map(story => (
            <div key={story.id} className="bg-bg-secondary p-4 sm:p-6 rounded-xl border border-border">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary">{story.title}</h3>
                  <div className="text-sm text-text-muted mt-1">
                    Submitted: {new Date(story.created_at).toLocaleString()}
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-500/15 text-yellow-300 text-xs rounded-full font-medium">Pending Review</span>
              </div>

              <div className="p-3 sm:p-4 bg-bg-primary rounded-lg text-text-secondary whitespace-pre-wrap mb-4 font-serif border border-border">
                {story.content}
              </div>

              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {story.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-white/10 text-text-secondary text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 border-t border-border pt-4">
                <button
                  onClick={() => handleApprove(story.id)}
                  className="bg-accent-success text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(story.id)}
                  className="bg-red-500/15 text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-500/25 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
