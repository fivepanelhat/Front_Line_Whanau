import { createClient } from '@/lib/supabase/server';
import { DirectorySearch } from '@/components/DirectorySearch';

export const metadata = {
  title: 'National Directory | Front Line Whānau',
  description: 'Search for verified frontline services and organisations across Aotearoa.',
};

export default async function DirectoryPage() {
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from('directory_listings')
    .select(
      'id, organisation, service_type, region, description, contact_email, contact_phone, website_url',
    )
    .eq('is_verified', true)
    .eq('is_active', true)
    .order('organisation', { ascending: true });

  if (error) {
    console.error('Error fetching directory listings:', error);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="liquid-orb liquid-orb--teal pointer-events-none absolute -left-16 top-0 h-80 w-80 opacity-60"
      />
      <div
        aria-hidden
        className="liquid-orb liquid-orb--amber pointer-events-none absolute -right-10 top-32 h-72 w-72 opacity-50"
      />

      <div className="relative px-4 pb-6 pt-10 sm:px-6 sm:pb-10 sm:pt-14">
        <div className="glass-card mx-auto max-w-6xl overflow-hidden rounded-3xl p-6 sm:p-10">
          <p className="section-label">Aotearoa · National</p>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-text-primary sm:mb-4 sm:text-4xl">
            National Directory
          </h1>
          <p className="max-w-2xl text-base text-text-secondary sm:text-lg">
            Find verified support services, clinical organisations, and community groups across
            Aotearoa New Zealand.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
        <DirectorySearch initialListings={listings || []} />
      </div>
    </div>
  );
}
