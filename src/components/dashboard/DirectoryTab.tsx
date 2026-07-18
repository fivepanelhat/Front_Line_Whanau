'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { SERVICES } from '@/data/directory';
import { CATEGORY_LABELS, type ServiceCategory } from '@/data/types';

/** Pre-index static services once for responsive filtering. */
const SERVICE_INDEX = SERVICES.map((srv) => ({
  srv,
  haystack: `${srv.name} ${srv.description} ${srv.contact}`.toLowerCase(),
}));

export function DirectoryTab() {
  const [searchDir, setSearchDir] = useState('');
  const [selectedDirCategory, setSelectedDirCategory] = useState<string>('All');
  const deferredSearch = useDeferredValue(searchDir);

  const filteredServices = useMemo(() => {
    const search = deferredSearch.toLowerCase().trim();
    return SERVICE_INDEX.filter(({ srv, haystack }) => {
      const matchCat =
        selectedDirCategory === 'All' ||
        srv.categories.includes(selectedDirCategory as ServiceCategory);
      const matchSearch = !search || haystack.includes(search);
      return matchCat && matchSearch;
    }).map(({ srv }) => srv);
  }, [deferredSearch, selectedDirCategory]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-text-primary text-2xl font-extrabold">
            Services Directory
          </h2>
          <p className="text-text-secondary mt-1 text-sm">
            Find local Taranaki and national support agencies. No usage metrics are tracked.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search agency by name, phone or description..."
          value={searchDir}
          onChange={(e) => setSearchDir(e.target.value)}
          className="bg-bg-secondary min-w-[240px] flex-1 rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm focus:outline-none"
          autoComplete="off"
        />

        <select
          value={selectedDirCategory}
          onChange={(e) => setSelectedDirCategory(e.target.value)}
          className="bg-bg-secondary rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm focus:outline-none"
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredServices.map((srv) => (
          <div key={srv.id} className="glass-panel flex flex-col justify-between space-y-3 p-5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-text-primary text-sm font-bold">{srv.name}</h3>
                <span className="bg-accent-secondary/15 text-accent-secondary rounded px-2 py-0.5 text-[9px] font-extrabold tracking-wider whitespace-nowrap uppercase">
                  {CATEGORY_LABELS[srv.categories[0]] || srv.categories[0]}
                </span>
              </div>
              <p className="text-text-secondary mt-2 text-xs leading-relaxed">{srv.description}</p>
              {srv.address && <p className="text-text-muted mt-2 text-[11px]">📍 {srv.address}</p>}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-3">
              <span className="text-text-secondary text-xs font-bold">
                {srv.contact.includes('@') ? '✉️ ' : '📞 '}
                {srv.contact}
              </span>
              <div className="flex gap-2">
                {srv.contact && !srv.contact.includes('@') && (
                  <a
                    href={`tel:${srv.contact.replace(/[^0-9]/g, '')}`}
                    className="text-accent-secondary text-xs font-semibold hover:underline"
                  >
                    Call
                  </a>
                )}
                {srv.url && (
                  <a
                    href={srv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-secondary text-xs font-semibold hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
