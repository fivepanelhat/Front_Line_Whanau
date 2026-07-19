import { redirect } from 'next/navigation';

// Whānau Stories is paused for now - the route redirects to the parent
// portal. Moderation tooling and the peer_stories table remain intact so
// the feature can be re-enabled without a migration.
export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/parent`);
}
