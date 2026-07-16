import { SERVICES } from './services';
import { CATEGORY_LABELS, type Service, type ServiceCategory, type Region } from './types';

export { SERVICES, CATEGORY_LABELS };
export type { Service, ServiceCategory, Region };

const STALE_AFTER_DAYS = 365;

/** Precomputed lowercase haystack per service - avoids rebuild on every keystroke. */
const SEARCH_INDEX: ReadonlyArray<{ service: Service; haystack: string }> = SERVICES.map(
 (service) => ({
 service,
 haystack: [service.name, service.description, ...service.categories]
 .join(' ')
 .toLowerCase(),
 }),
);

export function getAll(): Service[] {
 return SERVICES;
}

export function getByCategory(category: ServiceCategory): Service[] {
 return SERVICES.filter((s) => s.categories.includes(category));
}

export function getByRegion(region: Region): Service[] {
 // National services are relevant everywhere, so include them for Taranaki too.
 return region === 'Taranaki'
 ? SERVICES.filter((s) => s.region === 'Taranaki' || s.region === 'National')
 : SERVICES.filter((s) => s.region === 'National');
}

/** Crisis lines first, for the trauma-informed urgent-help surface. */
export function getCrisisServices(): Service[] {
 return SERVICES.filter((s) => s.crisis);
}

export function search(query: string): Service[] {
 const q = query.trim().toLowerCase();
 if (!q) return SERVICES;
 return SEARCH_INDEX.filter((entry) => entry.haystack.includes(q)).map((e) => e.service);
}

/** Group every service under each of its category labels (for rendering). */
export function groupByCategory(): Record<string, Service[]> {
 const out: Record<string, Service[]> = {};
 for (const cat of Object.keys(CATEGORY_LABELS) as ServiceCategory[]) {
 const items = getByCategory(cat);
 if (items.length) out[CATEGORY_LABELS[cat]] = items;
 }
 return out;
}

/** Entries not verified within STALE_AFTER_DAYS - surface for a data review. */
export function getStaleServices(now = new Date()): Service[] {
 return SERVICES.filter(
 (s) =>
 (now.getTime() - new Date(s.lastVerified).getTime()) / 86_400_000 > STALE_AFTER_DAYS,
 );
}
