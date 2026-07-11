'use client';

import { useDeferredValue, useMemo, useState } from 'react';

type DirectoryListing = {
  id: string;
  organisation: string;
  service_type: string;
  region: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
};

interface DirectorySearchProps {
  initialListings: DirectoryListing[];
}

function buildIndex(listings: DirectoryListing[]) {
  return listings.map((listing) => ({
    listing,
    haystack: [listing.organisation, listing.service_type, listing.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  }));
}

export function DirectorySearch({ initialListings }: DirectorySearchProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const deferredSearch = useDeferredValue(search);

  const indexed = useMemo(() => buildIndex(initialListings), [initialListings]);

  const regions = useMemo(
    () => ['All', ...Array.from(new Set(initialListings.map((l) => l.region).filter(Boolean)))],
    [initialListings],
  );

  const filtered = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase();
    return indexed
      .filter(({ listing, haystack }) => {
        const matchesSearch = needle === '' || haystack.includes(needle);
        const matchesRegion = regionFilter === 'All' || listing.region === regionFilter;
        return matchesSearch && matchesRegion;
      })
      .map(({ listing }) => listing);
  }, [indexed, deferredSearch, regionFilter]);

  const isStale = search !== deferredSearch;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="glass-card flex flex-col gap-3 rounded-3xl p-4 sm:gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Search organisations, services, keywords..."
            className="glass-input w-full px-4 py-3 text-text-primary placeholder:text-text-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search directory"
            autoComplete="off"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="glass-input w-full px-4 py-3 text-text-primary"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            aria-label="Filter by region"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-3xl border-dashed py-12 text-center">
          <p className="text-text-muted">No services found matching your criteria.</p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 transition-opacity sm:gap-6 md:grid-cols-2 lg:grid-cols-3 ${isStale ? 'opacity-70' : 'opacity-100'}`}
          aria-busy={isStale}
        >
          {filtered.map((listing) => (
            <article key={listing.id} className="liquid-listing">
              <div className="mb-4 flex-1">
                <span className="mb-3 inline-block rounded-full border border-accent-primary/20 bg-accent-primary/15 px-3 py-1 text-xs font-semibold text-accent-primary">
                  {listing.service_type}
                </span>
                <h3 className="mb-2 text-lg font-bold text-text-primary sm:text-xl">
                  {listing.organisation}
                </h3>
                <p className="line-clamp-3 text-sm text-text-secondary">{listing.description}</p>
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4 text-sm text-text-secondary">
                {listing.region && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Region:</span> {listing.region}
                  </div>
                )}
                {listing.contact_phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Phone:</span>
                    <a
                      href={`tel:${listing.contact_phone}`}
                      className="text-accent-primary hover:underline"
                    >
                      {listing.contact_phone}
                    </a>
                  </div>
                )}
                {listing.contact_email && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Email:</span>
                    <a
                      href={`mailto:${listing.contact_email}`}
                      className="text-accent-primary hover:underline"
                    >
                      {listing.contact_email}
                    </a>
                  </div>
                )}
                {listing.website_url && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">Web:</span>
                    <a
                      href={listing.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-accent-primary hover:underline"
                    >
                      Visit Site
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
