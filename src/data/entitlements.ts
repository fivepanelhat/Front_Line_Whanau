/**
 * Entitlement reference data.
 *
 * RULE: no monetary or statutory figure is asserted in app copy without a
 * matching record here that has a source URL, an effective window, and a
 * lastVerified date. Unverified records MUST set verified:false and the UI
 * must present them as "indicative - confirm with the official source".
 */

export interface Entitlement {
  id: string;
  title: string;
  /** Structured value so we never string-concat a number into prose. */
  amount?: { value: number; unit: 'per_week' | 'per_fortnight' | 'total'; currency: 'NZD' };
  durationNote?: string;
  /** Official source only (ird.govt.nz / workandincome.govt.nz). */
  source: string;
  effectiveFrom: string; // ISO date
  effectiveTo: string | null; // ISO date, null = open-ended / unknown
  lastVerified: string; // ISO date a human checked the source
  verified: boolean; // false = do not present as fact
}

export const ENTITLEMENTS: Entitlement[] = [
  {
    id: 'ppl-preterm-cap',
    title: 'Paid Parental Leave / Preterm Baby Payment - weekly maximum',
    amount: { value: 788.66, unit: 'per_week', currency: 'NZD' },
    durationNote:
      'Preterm payment up to 13 continuous weeks at your PPL rate, before the standard 26-week PPL.',
    source: 'https://www.ird.govt.nz/paid-parental-leave/qualifying/preterm-babies',
    effectiveFrom: '2025-07-01',
    effectiveTo: '2026-06-30', // cap is reviewed annually; re-verify after 1 Jul 2026
    lastVerified: '2026-06-21',
    verified: true,
  },
  {
    id: 'best-start',
    title: 'Best Start tax credit',
    // TODO(maintainer): confirm current weekly value + cut-off before setting verified:true.
    source: 'https://www.ird.govt.nz/working-for-families/types/best-start',
    effectiveFrom: '2025-04-01',
    effectiveTo: null,
    lastVerified: '2026-06-21',
    verified: false, // not independently confirmed - present as "confirm with IRD"
  },
  {
    id: 'winz-home-help',
    title: 'WINZ Home Help (multiples / under-5s)',
    durationNote: 'Hours and eligibility vary - confirm with a hospital social worker or WINZ.',
    source: 'https://www.workandincome.govt.nz/products/a-z-benefits/home-help.html',
    effectiveFrom: '2025-04-01',
    effectiveTo: null,
    lastVerified: '2026-06-21',
    verified: false,
  },
];

const STALE_AFTER_DAYS = 90;

export type EntitlementStatus =
  | { state: 'ok'; entitlement: Entitlement }
  | { state: 'unverified' | 'expired' | 'stale'; entitlement: Entitlement; reason: string };

export function getEntitlement(id: string, now = new Date()): EntitlementStatus | null {
  const e = ENTITLEMENTS.find((x) => x.id === id);
  if (!e) return null;

  if (!e.verified) {
    return { state: 'unverified', entitlement: e, reason: 'Not independently confirmed.' };
  }
  if (e.effectiveTo && now > new Date(e.effectiveTo)) {
    return { state: 'expired', entitlement: e, reason: `Rate window ended ${e.effectiveTo}.` };
  }
  const daysSinceCheck = (now.getTime() - new Date(e.lastVerified).getTime()) / 86_400_000;
  if (daysSinceCheck > STALE_AFTER_DAYS) {
    return { state: 'stale', entitlement: e, reason: `Last verified ${e.lastVerified}.` };
  }
  return { state: 'ok', entitlement: e };
}

/** Render a figure as copy ONLY when safe; otherwise direct the family to the source. */
export function describeEntitlement(status: EntitlementStatus): {
  text: string;
  confident: boolean;
} {
  const e = status.entitlement;
  const moneyStr = e.amount
    ? `${e.amount.currency} $${e.amount.value.toFixed(2)} ${e.amount.unit.replace('_', ' ')}`
    : null;

  if (status.state === 'ok') {
    return {
      confident: true,
      text:
        `${e.title}` +
        (moneyStr ? `\n- Maximum: ${moneyStr}` : '') +
        (e.durationNote ? `\n- ${e.durationNote}` : '') +
        `\n- Source (verified ${e.lastVerified}): ${e.source}` +
        (e.effectiveTo ? `\n- Applies until ${e.effectiveTo} - re-check after that date.` : ''),
    };
  }

  // Not safe to assert - never show a number we can't stand behind.
  return {
    confident: false,
    text:
      `${e.title}\n` +
      `I can't confirm the current amount right now (${status.reason}). ` +
      `Please check the official source so you get the figure that applies today:\n${e.source}\n` +
      `A neonatal social worker can also confirm what you're entitled to.`,
  };
}
