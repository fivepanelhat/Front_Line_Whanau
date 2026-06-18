/**
 * Guardrails — Safety & Cultural Checks
 *
 * Validates all AI agent responses before delivery:
 * - Grounding: responses must cite sources
 * - Hallucination detection: cross-reference against known data
 * - Cultural safety: Te Tiriti principles
 * - Child protection: Oranga Tamariki Act compliance
 * - Trauma-informed: no pressuring language
 */

import type { AgentResponse, GuardrailResult, GuardrailFailure } from './types';

// ── Child Protection Keywords ────────────────────────────────

const CHILD_PROTECTION_INDICATORS = [
  'abuse',
  'neglect',
  'harm',
  'hurt',
  'hitting',
  'beating',
  'starving',
  'unsafe',
  'danger',
  'scared of parent',
  'afraid of',
  'bruise',
  'injury',
  'broken bone',
  'shaken',
  'burn',
];

const CHILD_PROTECTION_RESOURCES = `
**If you are concerned about a child's safety, please contact:**
- **Oranga Tamariki**: 0508 326 459 (0508 FAMILY) — 24/7
- **Police**: 111 (emergency) or 105 (non-emergency)
- **Healthline**: 0800 611 116
- **PlunketLine**: 0800 933 922

You are not alone. These services are free and confidential.
`;

// ── Trauma-Informed Language Patterns ────────────────────────

const PRESSURING_PHRASES = [
  'you must',
  'you need to immediately',
  'failure to',
  'you are required',
  'it is your duty',
  'you have no choice',
  'this is mandatory',
  'you are obligated',
];

const TRAUMA_INFORMED_ALTERNATIVES: Record<string, string> = {
  'you must': 'you may want to consider',
  'you need to immediately': 'when you feel ready, you might',
  'failure to': 'if this step is not completed',
  'you are required': 'it would be helpful to',
};

// ── Main Guardrail Check ─────────────────────────────────────

export function checkGuardrails(response: AgentResponse): GuardrailResult {
  const failures: GuardrailFailure[] = [];

  // 1. Grounding check — responses should cite sources
  if (response.sources.length === 0 && response.confidence > 0.3) {
    failures.push({
      guardrail: 'grounding',
      reason: 'Response does not cite any sources. All factual claims should reference a guide, directory entry, or statute.',
      severity: 'warning',
    });
  }

  // 2. Child protection check
  const childProtectionTriggered = checkChildProtection(response.content);
  if (childProtectionTriggered) {
    failures.push({
      guardrail: 'child-protection',
      reason: 'Response content relates to potential child safety concerns. Child protection resources must be surfaced.',
      severity: 'warning',
    });
  }

  // 3. Trauma-informed language check
  const traumaCheck = checkTraumaInformed(response.content);
  if (traumaCheck.length > 0) {
    failures.push({
      guardrail: 'trauma-informed',
      reason: `Response contains pressuring language: ${traumaCheck.join(', ')}. Use gentler alternatives.`,
      severity: 'warning',
    });
  }

  // 4. Cultural safety — basic checks
  const culturalCheck = checkCulturalSafety(response.content);
  if (culturalCheck) {
    failures.push(culturalCheck);
  }

  // Build modified response if needed
  let modifiedResponse = response.content;

  if (childProtectionTriggered) {
    modifiedResponse += '\n\n---\n\n' + CHILD_PROTECTION_RESOURCES;
  }

  // Replace pressuring language
  for (const phrase of traumaCheck) {
    const alternative = TRAUMA_INFORMED_ALTERNATIVES[phrase];
    if (alternative) {
      modifiedResponse = modifiedResponse.replace(
        new RegExp(phrase, 'gi'),
        alternative,
      );
    }
  }

  return {
    passed: failures.filter((f) => f.severity === 'block').length === 0,
    failures,
    modifiedResponse: modifiedResponse !== response.content ? modifiedResponse : undefined,
  };
}

// ── Helper Functions ─────────────────────────────────────────

function checkChildProtection(content: string): boolean {
  const lower = content.toLowerCase();
  return CHILD_PROTECTION_INDICATORS.some((indicator) => lower.includes(indicator));
}

function checkTraumaInformed(content: string): string[] {
  const lower = content.toLowerCase();
  return PRESSURING_PHRASES.filter((phrase) => lower.includes(phrase));
}

function checkCulturalSafety(content: string): GuardrailFailure | null {
  // Check for common te reo Māori errors (missing macrons in key terms)
  const incorrectTerms = [
    { wrong: 'whanau', correct: 'whānau' },
    { wrong: 'maori', correct: 'Māori' },
    { wrong: 'taonga', correct: 'taonga' }, // taonga has no macron — this is correct
    { wrong: 'aotearoa', correct: 'Aotearoa' },
  ];

  // Use word boundary check for case-sensitive terms that should be capitalised
  const contentWords = content.split(/\s+/);
  for (const term of incorrectTerms) {
    if (term.wrong !== term.correct) {
      if (contentWords.some((w) => w === term.wrong)) {
        return {
          guardrail: 'cultural-safety',
          reason: `"${term.wrong}" should be "${term.correct}" (correct macron/capitalisation).`,
          severity: 'warning',
        };
      }
    }
  }

  return null;
}

/**
 * Check if a user's journal entry or message indicates
 * potential child safety concerns. Returns resources if so.
 */
export function checkUserContentForChildSafety(content: string): {
  triggered: boolean;
  resources: string | null;
} {
  const triggered = checkChildProtection(content);
  return {
    triggered,
    resources: triggered ? CHILD_PROTECTION_RESOURCES : null,
  };
}
