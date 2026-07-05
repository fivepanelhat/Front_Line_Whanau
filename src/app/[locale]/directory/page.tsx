import { createClient } from '@/lib/supabase/server';
import { DirectorySearch } from '@/components/DirectorySearch';

export const metadata = {
  title: 'National Directory | Front Line Whānau',
  description: 'Search for verified frontline services and organisations across Aotearoa.',
};

export default async function DirectoryPage() {
  const supabase = await createClient();

  // Fetch verified active listings
  const { data: listings, error } = await supabase
    .from('directory_listings')
    .select('id, organisation, service_type, region, description, contact_email, contact_phone, website_url')
    .eq('is_verified', true)
    .eq('is_active', true)
    .order('organisation', { ascending: true });

  if (error) {
    console.error('Error fetching directory listings:', error);
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-accent-primary py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-accent-ink mb-3 sm:mb-4">National Directory</h1>
          <p className="text-accent-ink/80 text-base sm:text-lg max-w-2xl">
            Find verified support services, clinical organisations, and community groups across Aotearoa New Zealand.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 -mt-6 sm:-mt-8 relative z-10">
        <DirectorySearch initialListings={listings || []} />
      </div>
    </div>
  );
}
