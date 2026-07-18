import { z } from 'zod';

/**
 * Kaitiaki Support Playbook - shared contract between the Activation
 * Auditor (producer), the UI (renderer), and downstream agents such as
 * the Narrative Weaver (consumers).
 *
 * Design constraints:
 * - Privacy-by-design: no field in this schema may hold a name, NHI,
 * date of birth, address, or contact detail. Inputs are coarse-grained
 * categories only, and every field is optional.
 * - Machine-actionable: agents route on `category`, `reviewStatus`, and
 * `weaverTrigger` without parsing prose.
 * - Human-readable: `title` / `description` / `whyThisMatters` are the
 * fields the UI renders directly.
 */

// ---------------------------------------------------------------------------
// Audit input (what whanau / partners give us - everything optional)
// ---------------------------------------------------------------------------

export const GestationalContextSchema = z.enum([
  'antenatal', // expecting, preterm birth anticipated
  'nicu_current', // baby/babies currently in NICU or SCBU
  'recently_home', // discharged within ~3 months
  'established_home', // home longer term, ongoing needs
  'unspecified',
]);

export const NeedAreaSchema = z.enum([
  'nicu_navigation', // understanding the NICU journey
  'feeding', // breastfeeding, expressing, tube feeding
  'financial', // entitlements, WINZ, Best Start
  'emotional', // wellbeing, anxiety, grief, exhaustion
  'cultural', // tikanga, karakia, whanau involvement
  'twins_multiples', // multiple-birth specific support
  'discharge_home', // preparing for or adjusting to home
  'partner_org', // a partner organisation seeking guidance
]);

export const CulturalPrioritySchema = z.enum([
  'te_ao_maori', // kaupapa Maori services, tikanga-led support
  'pasifika',
  'faith_based',
  'none_stated',
]);

/**
 * Coarse location only - never a suburb or address. Used to prefer
 * rural-accessible pathways (phone lines, online groups) over
 * in-person-only services.
 */
export const LocationContextSchema = z.enum(['urban', 'rural', 'unspecified']);

export const ActivationAuditInputSchema = z.object({
  gestationalContext: GestationalContextSchema.optional(),
  needAreas: z.array(NeedAreaSchema).optional(),
  culturalPriority: CulturalPrioritySchema.optional(),
  locationContext: LocationContextSchema.optional(),
  /** Free-text need, sanitised of contact details before processing. */
  freeText: z.string().max(2000).optional(),
});

export type ActivationAuditInput = z.infer<typeof ActivationAuditInputSchema>;
export type GestationalContext = z.infer<typeof GestationalContextSchema>;
export type NeedArea = z.infer<typeof NeedAreaSchema>;
export type CulturalPriority = z.infer<typeof CulturalPrioritySchema>;
export type LocationContext = z.infer<typeof LocationContextSchema>;

// ---------------------------------------------------------------------------
// Playbook building blocks
// ---------------------------------------------------------------------------

export const ResourcePathwaySchema = z.object({
  /** Provider name, e.g. "Whanau Awhina Plunket". */
  provider: z.string(),
  /** Official URL or free phone number - trusted NZ sources only. */
  contact: z.string(),
  /** What this provider actually does for the whanau, in plain language. */
  whatTheyOffer: z.string(),
  /** Works without travel - phone/online - so rural whanau aren't excluded. */
  remoteAccessible: z.boolean(),
  /** True for kaupapa Maori / culturally grounded services. */
  kaupapaMaori: z.boolean().default(false),
});

export const PlayStepSchema = z.object({
  /** One concrete action, doable today or this week. */
  action: z.string(),
  /** Rough effort so busy parents can pick what fits: "5 min", "one phone call". */
  effort: z.string(),
});

export const PlaySchema = z.object({
  id: z.string(),
  category: NeedAreaSchema,
  /** Short, plain-language title rendered as the card heading. */
  title: z.string(),
  /** Why this play was included for THIS whanau - the personalisation. */
  whyThisMatters: z.string(),
  /** 1-4 immediately actionable steps. Activation over information. */
  steps: z.array(PlayStepSchema).min(1).max(4),
  resources: z.array(ResourcePathwaySchema),
  /**
   * HITL checkpoint: plays touching finances, culture, or anything
   * clinical-adjacent must be human-reviewed before being presented
   * as confirmed guidance.
   */
  reviewRequired: z.boolean(),
  /** Suggested follow-up inside the hub, e.g. "ask Kea to check eligibility". */
  integrationHint: z.string().optional(),
});

/**
 * Trigger contract for the Narrative Weaver agent. The auditor never
 * generates stories itself - it signals when a story would help and
 * hands over themes only. Story generation always requires fresh,
 * explicit consent and cultural-safety review.
 */
export const WeaverTriggerSchema = z.object({
  shouldTrigger: z.boolean(),
  /** e.g. "strength through the NICU journey", "welcoming pepi home". */
  theme: z.string().optional(),
  audience: z.enum(['parents', 'siblings', 'wider_whanau']).optional(),
  /** Cultural elements to weave in - reviewed by cultural safety before use. */
  culturalElements: z.array(z.string()).optional(),
  /** Always true: stories are opt-in, never auto-generated. */
  consentRequired: z.literal(true),
});

export const ReviewStatusSchema = z.enum([
  'auto_approved', // no sensitive plays; safe to render immediately
  'pending_review', // contains plays flagged for HITL review
]);

// ---------------------------------------------------------------------------
// The playbook itself
// ---------------------------------------------------------------------------

export const KaitiakiPlaybookSchema = z.object({
  schemaVersion: z.literal('1.0'),
  generatedAt: z.string(), // ISO 8601
  /** Warm one-paragraph orientation, rendered above the plays. */
  summary: z.string(),
  /** Echo of the coarse inputs the audit used - transparency, no PII. */
  auditBasis: z.object({
    gestationalContext: GestationalContextSchema,
    needAreas: z.array(NeedAreaSchema),
    culturalPriority: CulturalPrioritySchema,
    locationContext: LocationContextSchema,
  }),
  plays: z.array(PlaySchema).min(1),
  weaverTrigger: WeaverTriggerSchema,
  reviewStatus: ReviewStatusSchema,
  /** Always present, always rendered. Never suppressed by consumers. */
  disclaimer: z.string(),
  /** If crisis language was detected, urgent contacts surface first. */
  urgentSupport: z
    .object({
      show: z.boolean(),
      message: z.string(),
      contacts: z.array(ResourcePathwaySchema),
    })
    .optional(),
});

export type ResourcePathway = z.infer<typeof ResourcePathwaySchema>;
export type PlayStep = z.infer<typeof PlayStepSchema>;
export type Play = z.infer<typeof PlaySchema>;
export type WeaverTrigger = z.infer<typeof WeaverTriggerSchema>;
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
export type KaitiakiPlaybook = z.infer<typeof KaitiakiPlaybookSchema>;

/**
 * The standing disclaimer every playbook carries. Kept here so producer,
 * renderer, and tests share one source of truth.
 */
export const PLAYBOOK_DISCLAIMER =
  'This playbook is general guidance to help your whanau find support - it is ' +
  'not medical, financial, legal, or cultural advice. Always confirm ' +
  'entitlements with the agency involved and discuss anything about your ' +
  "pepi's health with your medical team. If you are worried about your baby " +
  'right now, call Healthline on 0800 611 116 or, in an emergency, 111.';
