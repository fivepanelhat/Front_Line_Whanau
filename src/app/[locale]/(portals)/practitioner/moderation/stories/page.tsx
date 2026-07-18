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
          setStories(
            data.stories.filter((s: any) => !s.is_approved || !s.cultural_safety_approved),
          );
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
        setStories((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to approve story', err);
    }
  };

  const handleReject = async (id: string) => {
    // Basic rejection: we can just leave it unapproved or delete it.
    // For now, let's just alert.
    alert('Rejection logic (e.g. deletion or flag) can be wired up here.');
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <h1 className="text-text-primary mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
        Peer Story Moderation
      </h1>

      {isLoading ? (
        <div className="text-text-muted">Loading pending stories...</div>
      ) : stories.length === 0 ? (
        <div className="bg-bg-secondary border-border text-text-muted rounded-xl border p-8 text-center sm:p-12">
          No stories pending review.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-bg-secondary border-border rounded-xl border p-4 sm:p-6"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-text-primary text-lg font-bold sm:text-xl">{story.title}</h3>
                  <div className="text-text-muted mt-1 text-sm">
                    Submitted: {new Date(story.created_at).toLocaleString()}
                  </div>
                </div>
                <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-300">
                  Pending Review
                </span>
              </div>

              <div className="bg-bg-primary text-text-secondary border-border mb-4 rounded-lg border p-3 font-serif whitespace-pre-wrap sm:p-4">
                {story.content}
              </div>

              <div className="mb-4 flex flex-wrap gap-2 sm:mb-6">
                {story.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-text-secondary rounded-full bg-white/10 px-2 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border-border flex flex-wrap gap-2 border-t pt-4 sm:gap-3">
                <button
                  onClick={() => handleApprove(story.id)}
                  className="bg-accent-success rounded-lg px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(story.id)}
                  className="rounded-lg bg-red-500/15 px-4 py-2 font-medium text-red-400 transition-colors hover:bg-red-500/25"
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
