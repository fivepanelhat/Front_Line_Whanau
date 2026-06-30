import { createClient } from '@/lib/supabase/server';
import { StorySubmissionForm } from '@/components/StorySubmissionForm';

export const metadata = {
  title: 'Peer Stories | Front Line Whānau',
  description: 'Read and share lived experiences from other whānau.',
};

export default async function StoriesPage() {
  const supabase = await createClient();

  const { data: stories, error } = await supabase
    .from('peer_stories')
    .select('*')
    .eq('is_approved', true)
    .eq('cultural_safety_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching peer stories:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-purple-700 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Whānau Stories</h1>
          <p className="text-purple-100 text-lg">
            Read lived experiences from other parents who have walked the preterm journey, and share your own to help others feel less alone.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-10 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Stories</h2>
          {stories && stories.length > 0 ? (
            stories.map(story => (
              <article key={story.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                <div className="flex gap-2 mb-4">
                  {story.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{story.content}</p>
                <div className="mt-4 text-sm text-gray-500">
                  Shared anonymously on {new Date(story.created_at).toLocaleDateString()}
                </div>
              </article>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-500">
              No stories have been published yet. Be the first to share your journey!
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <StorySubmissionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
