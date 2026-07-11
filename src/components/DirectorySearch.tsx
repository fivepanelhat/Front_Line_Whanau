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

/** Pre-index listings once so filter stays O(n) without per-keystroke string rebuilds. */
function buildIndex(listings: DirectoryListing[]) {
  return listings.map((listing) => ({
    listing,
    haystack: [
      listing.organisation,
      listing.service_type,
      listing.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  }));
}

export function DirectorySearch({ initialListings }: DirectorySearchProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  // Keep input snappy; filter against a deferred value under load
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
      {/* Search Controls */}
      <div className="bg-bg-secondary p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <input
            type="search"
            placeholder="Search organisations, services, keywords..."
            className="w-full pl-4 pr-4 py-3 border border-border rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search directory"
            autoComplete="off"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full px-4 py-3 border border-border rounded-lg bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
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

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-bg-secondary rounded-xl border border-dashed border-border">
          <p className="text-text-muted">No services found matching your criteria.</p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-opacity ${isStale ? 'opacity-70' : 'opacity-100'}`}
          aria-busy={isStale}
        >
          {filtered.map((listing) => (
            <article
              key={listing.id}
              className="bg-bg-secondary p-5 sm:p-6 rounded-xl border border-border flex flex-col h-full hover:border-accent-primary/40 transition"
            >
              <div className="mb-4 flex-1">
                <span className="inline-block px-3 py-1 bg-accent-primary/15 text-accent-primary text-xs font-semibold rounded-full mb-3">
                  {listing.service_type}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">
                  {listing.organisation}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-3">{listing.description}</p>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-sm text-text-secondary">
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
                      className="text-accent-primary hover:underline truncate"
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
