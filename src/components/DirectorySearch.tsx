'use client';

import { useState } from 'react';

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

export function DirectorySearch({ initialListings }: DirectorySearchProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');

  // Extract unique regions for the dropdown
  const regions = ['All', ...Array.from(new Set(initialListings.map(l => l.region).filter(Boolean)))];

  const filtered = initialListings.filter(listing => {
    const matchesSearch = 
      search === '' || 
      listing.organisation?.toLowerCase().includes(search.toLowerCase()) || 
      listing.service_type?.toLowerCase().includes(search.toLowerCase()) ||
      listing.description?.toLowerCase().includes(search.toLowerCase());
      
    const matchesRegion = regionFilter === 'All' || listing.region === regionFilter;
    
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-8">
      {/* Search Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search organisations, services, keywords..."
            className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search directory"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            aria-label="Filter by region"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No services found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
              <div className="mb-4 flex-1">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3">
                  {listing.service_type}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.organisation}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{listing.description}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                {listing.region && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Region:</span> {listing.region}
                  </div>
                )}
                {listing.contact_phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Phone:</span> 
                    <a href={`tel:${listing.contact_phone}`} className="text-blue-600 hover:underline">{listing.contact_phone}</a>
                  </div>
                )}
                {listing.contact_email && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Email:</span> 
                    <a href={`mailto:${listing.contact_email}`} className="text-blue-600 hover:underline">{listing.contact_email}</a>
                  </div>
                )}
                {listing.website_url && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Web:</span> 
                    <a href={listing.website_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">Visit Site</a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
