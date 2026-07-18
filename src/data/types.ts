/**
 * Services directory - schema.
 *
 * This folder is the SINGLE SOURCE OF TRUTH for the directory.
 * The app reads from here, and docs/TARANAKI-DIRECTORY.md is GENERATED from
 * here (see scripts/generate-directory-doc.ts) - never hand-edited.
 *
 * Same freshness rules as entitlements.ts: every entry carries a source and a
 * lastVerified date so stale contact details can be flagged, not trusted blindly.
 */

export type ServiceCategory =
  | 'neonatal'
  | 'health'
  | 'parenting'
  | 'mental-health'
  | 'financial'
  | 'housing'
  | 'legal'
  | 'community'
  | 'child-protection'
  | 'emergency'
  | 'wellness'
  | 'facilities'
  | 'doctors';

export type Region = 'Taranaki' | 'National';

export interface Service {
  /** Stable slug - used as React key and for deep-linking. */
  id: string;
  name: string;
  /** A service can belong to more than one category (no duplicate entries). */
  categories: ServiceCategory[];
  region: Region;
  /** Primary contact: phone, text line, or email. */
  contact: string;
  /** Alternate/secondary contact (e.g. 0800 fallback). */
  altContact?: string;
  url?: string;
  address?: string;
  /** Free-text hours, e.g. "Mon-Fri 8:30am-5:00pm". Use availability for logic. */
  hours?: string;
  /** Machine-readable availability for filtering. */
  availability?: '24/7' | 'business-hours' | 'varies';
  /** What they actually offer whanau. */
  description: string;
  /**
   * True for life-safety / acute distress lines. The trauma-informed urgent-help
   * surface pulls these first. Keep this list short and deliberate.
   */
  crisis?: boolean;
  /** Where this entry was confirmed from. */
  source?: string;
  /** ISO date a human last checked this entry. */
  lastVerified: string;
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  neonatal: 'Neonatal & Preterm',
  health: 'Health',
  parenting: 'Well Child & Parenting',
  'mental-health': 'Mental Health & Wellbeing',
  financial: 'Financial Support',
  housing: 'Housing & Tenancy',
  legal: 'Legal & Advocacy',
  community: 'Community & Whanau',
  'child-protection': 'Child Protection & Family',
  emergency: 'Emergency',
  wellness: 'Wellness Centres',
  facilities: 'Local Facilities (Banks, Supermarkets, ATMs)',
  doctors: 'Doctors & GPs',
};
