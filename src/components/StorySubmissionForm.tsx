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
          tags: tags.split(',').map(t => t.trim()).filter(Boolean) 
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
      <div className="bg-accent-success/10 text-accent-success p-6 rounded-xl border border-accent-success/20 text-center">
        <h3 className="text-xl font-bold mb-2">Thank you for sharing your story.</h3>
        <p className="text-text-secondary">Your story has been submitted and is pending review by our moderation team to ensure cultural safety and appropriateness. It will appear here once approved.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-accent-primary underline">Submit another story</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-secondary p-6 rounded-xl border border-border">
      <h3 className="text-2xl font-semibold mb-4 text-text-primary">Share Your Story</h3>
      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Title</label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-bg-primary text-text-primary border border-border rounded-lg focus:ring-2 focus:ring-accent-primary outline-none"
          placeholder="A brief title for your experience"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">Your Story</label>
        <textarea
          id="content"
          required
          rows={5}
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full px-4 py-2 bg-bg-primary text-text-primary border border-border rounded-lg focus:ring-2 focus:ring-accent-primary outline-none resize-none"
          placeholder="Share your journey..."
        />
      </div>

      <div className="mb-6">
        <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1">Tags (comma separated)</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          className="w-full px-4 py-2 bg-bg-primary text-text-primary border border-border rounded-lg focus:ring-2 focus:ring-accent-primary outline-none"
          placeholder="e.g. NICU, breastfeeding, twins"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent-primary text-accent-ink font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Story Anonymously'}
      </button>
    </form>
  );
}
