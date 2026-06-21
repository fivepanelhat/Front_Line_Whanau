import type { AgentResponse } from './types';

export interface GuardrailFailure {
  guardrail: 'grounding' | 'unsourced-claim' | 'child-safety' | 'trauma-informed' | 'cultural-safety';
  reason: string;
  severity: 'warning' | 'block';
}

export interface GuardrailResult {
  passed: boolean;                 // false if ANY block-level failure
  failures: GuardrailFailure[];
  modifiedResponse?: string;
  showUrgentHelp?: boolean;        // gentle, opt-in — NOT injected into AI prose
}

// Word-boundary triage. This is a heuristic prompt to offer help, NOT detection,
// and MUST be reviewed by a qualified practitioner before production use.
const CHILD_SAFETY_TERMS = [
  'being hurt', 'being hit', 'beaten', 'shaken', 'not safe at home',
  'scared of (?:my|their) (?:partner|parent)', 'someone is hurting',
];

// Asserting money/law without a source is a BLOCK — never ship an unsourced figure.
const FACTUAL_CLAIM = /\$\s?\d|per week|per fortnight|\bAct \d{4}\b|\bsection \d+/i;

const PRESSURING: Record<string, string> = {
  'you must': 'you may want to consider',
  'you need to immediately': 'when you feel ready, you might',
  'failure to': 'if this step is not completed',
  'you are required': 'it would be helpful to',
  'you have no choice': 'one option you could consider',
  'this is mandatory': 'this is usually expected',
  'you are obligated': 'you may be expected',
  'it is your duty': 'it may help to',
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function checkGuardrails(response: AgentResponse): GuardrailResult {
  const failures: GuardrailFailure[] = [];
  const content = response.content;
  let modified = content;

  // 1. Unsourced factual claim → BLOCK (this is the real anti-hallucination gate)
  const hasClaim = FACTUAL_CLAIM.test(content);
  const hasSource = (response.sources ?? []).length > 0;
  if (hasClaim && !hasSource) {
    failures.push({
      guardrail: 'unsourced-claim',
      severity: 'block',
      reason: 'States a monetary/legal figure with no official source. Do not deliver.',
    });
  }

  // 2. Grounding — softer warning when confident but uncited
  if (!hasSource && response.confidence > 0.3 && !hasClaim) {
    failures.push({
      guardrail: 'grounding',
      severity: 'warning',
      reason: 'No source cited for a confident response.',
    });
  }

  // 3. Child-safety triage — word-boundary, never auto-injects contacts into prose
  const lower = content.toLowerCase();
  const triggered = CHILD_SAFETY_TERMS.some((t) =>
    new RegExp(`\\b${t}\\b`, 'i').test(lower),
  );

  if (triggered) {
    failures.push({
      guardrail: 'child-safety',
      severity: 'warning',
      reason: 'Response content relates to potential child safety concerns.',
    });
  }

  // 4. Trauma-informed rewrite (all phrases covered, regex-escaped, word-bounded)
  for (const [phrase, alt] of Object.entries(PRESSURING)) {
    const re = new RegExp(`\\b${escapeRe(phrase)}\\b`, 'gi');
    if (re.test(modified)) {
      failures.push({
        guardrail: 'trauma-informed',
        severity: 'warning',
        reason: `Softened pressuring phrase: "${phrase}".`,
      });
      modified = modified.replace(re, alt);
    }
  }

  // 5. Cultural-safety — advisory only, punctuation-tolerant, no dead rules
  const macron: Array<[RegExp, string]> = [
    [/\bwhanau\b/g, 'whānau'],
    [/\bmaori\b/gi, 'Māori'],
    [/\baotearoa\b/g, 'Aotearoa'],
  ];
  for (const [re, correct] of macron) {
    if (re.test(modified)) {
      failures.push({
        guardrail: 'cultural-safety',
        severity: 'warning',
        reason: `Use "${correct}" (macron/capitalisation).`,
      });
      modified = modified.replace(re, correct);
    }
  }

  return {
    passed: failures.every((f) => f.severity !== 'block'),
    failures,
    modifiedResponse: modified !== content ? modified : undefined,
    showUrgentHelp: triggered, // UI decides how to offer this, gently and opt-in
  };
}

export function checkUserContentForChildSafety(content: string): {
  triggered: boolean;
  resources: string | null;
} {
  const lower = content.toLowerCase();
  const triggered = CHILD_SAFETY_TERMS.some((t) =>
    new RegExp(`\\b${t}\\b`, 'i').test(lower)
  );
  return {
    triggered,
    resources: triggered ? "Oranga Tamariki: 0508 326 459" : null,
  };
}
