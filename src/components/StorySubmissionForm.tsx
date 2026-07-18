'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StorySubmissionForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit story');
      }

      setSuccess(true);
      setTitle('');
      setContent('');
      setTags('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-accent-success/10 text-accent-success border-accent-success/20 rounded-xl border p-6 text-center">
        <h3 className="mb-2 text-xl font-bold">Thank you for sharing your story.</h3>
        <p className="text-text-secondary">
          Your story has been submitted and is pending review by our moderation team to ensure
          cultural safety and appropriateness. It will appear here once approved.
        </p>
        <button onClick={() => setSuccess(false)} className="text-accent-primary mt-4 underline">
          Submit another story
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-secondary border-border rounded-xl border p-6">
      <h3 className="text-text-primary mb-4 text-2xl font-semibold">Share Your Story</h3>
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      <div className="mb-4">
        <label htmlFor="title" className="text-text-secondary mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-bg-primary text-text-primary border-border focus:ring-accent-primary w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
          placeholder="A brief title for your experience"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="text-text-secondary mb-1 block text-sm font-medium">
          Your Story
        </label>
        <textarea
          id="content"
          required
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-bg-primary text-text-primary border-border focus:ring-accent-primary w-full resize-none rounded-lg border px-4 py-2 outline-none focus:ring-2"
          placeholder="Share your journey..."
        />
      </div>

      <div className="mb-6">
        <label htmlFor="tags" className="text-text-secondary mb-1 block text-sm font-medium">
          Tags (comma separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="bg-bg-primary text-text-primary border-border focus:ring-accent-primary w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
          placeholder="e.g. NICU, breastfeeding, twins"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-accent-primary text-accent-ink w-full rounded-lg py-3 font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Story Anonymously'}
      </button>
    </form>
  );
}
