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
 <div className="flex flex-wrap justify-between items-center gap-4">
 <div>
 <h2 className="text-2xl font-heading font-extrabold text-text-primary">
 Services Directory
 </h2>
 <p className="text-sm text-text-secondary mt-1">
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
 className="flex-1 min-w-[240px] rounded-lg border border-white/[0.08] bg-bg-secondary px-4 py-2.5 text-sm focus:outline-none"
 autoComplete="off"
 />

 <select
 value={selectedDirCategory}
 onChange={(e) => setSelectedDirCategory(e.target.value)}
 className="rounded-lg bg-bg-secondary border border-white/[0.08] px-4 py-2.5 text-sm focus:outline-none"
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

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {filteredServices.map((srv) => (
 <div
 key={srv.id}
 className="glass-panel p-5 space-y-3 flex flex-col justify-between"
 >
 <div>
 <div className="flex justify-between items-start gap-2">
 <h3 className="font-bold text-sm text-text-primary">{srv.name}</h3>
 <span className="text-[9px] uppercase tracking-wider font-extrabold bg-accent-secondary/15 text-accent-secondary rounded px-2 py-0.5 whitespace-nowrap">
 {CATEGORY_LABELS[srv.categories[0]] || srv.categories[0]}
 </span>
 </div>
 <p className="text-xs text-text-secondary mt-2 leading-relaxed">{srv.description}</p>
 {srv.address && (
 <p className="text-[11px] text-text-muted mt-2">📍 {srv.address}</p>
 )}
 </div>

 <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-2">
 <span className="text-xs font-bold text-text-secondary">
 {srv.contact.includes('@') ? '✉️ ' : '📞 '}
 {srv.contact}
 </span>
 <div className="flex gap-2">
 {srv.contact && !srv.contact.includes('@') && (
 <a
 href={`tel:${srv.contact.replace(/[^0-9]/g, '')}`}
 className="text-xs font-semibold text-accent-secondary hover:underline"
 >
 Call
 </a>
 )}
 {srv.url && (
 <a
 href={srv.url}
 target="_blank"
 rel="noopener noreferrer"
 className="text-xs font-semibold text-accent-secondary hover:underline"
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
