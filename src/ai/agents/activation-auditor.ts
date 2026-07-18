import {
  ActivationAuditInput,
  ActivationAuditInputSchema,
  CulturalPriority,
  GestationalContext,
  KaitiakiPlaybook,
  KaitiakiPlaybookSchema,
  LocationContext,
  NeedArea,
  Play,
  PLAYBOOK_DISCLAIMER,
  ResourcePathway,
} from '../schemas/kaitiaki-playbook';

/**
 * Activation Auditor - turns a short, privacy-preserving intake into a
 * personalised Kaitiaki Support Playbook.
 *
 * Adapted "audit -> playbook" play: low-friction input in, something
 * usable-today out. The audit itself is deterministic (a curated play
 * library keyed on coarse need categories) so the output is auditable,
 * testable, works offline/without an API key, and can never hallucinate
 * a provider or an entitlement.
 *
 * Guardrails baked in:
 * - Data minimisation: only coarse enums cross the boundary; free text
 * is stripped of emails/phones/NHI-shaped tokens before use.
 * - HITL: financial and cultural plays are always reviewRequired; a
 * playbook containing any such play is reviewStatus 'pending_review'.
 * - Crisis detection: crisis language short-circuits to urgent contacts
 * and flags human review.
 * - Weaver handover: emotional/cultural context sets a consent-gated
 * trigger for the Narrative Weaver; the auditor never writes stories.
 */

// ---------------------------------------------------------------------------
// PII sanitisation (data minimisation at the boundary)
// ---------------------------------------------------------------------------

const PII_PATTERNS: RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.]+/g, // emails
  /\b(?:\+?64|0)[\s-]?[2-9](?:[\s-]?\d){7,9}\b/g, // NZ phone numbers
  /\b[A-Z]{3}\d{4}\b/gi, // NHI-shaped tokens (ABC1234)
];

export function sanitiseFreeText(text: string): string {
  let out = text;
  for (const pattern of PII_PATTERNS) {
    out = out.replace(pattern, '[removed]');
  }
  return out;
}

// ---------------------------------------------------------------------------
// Crisis detection (safety guardrail - checked before anything else)
// ---------------------------------------------------------------------------

const CRISIS_TERMS = [
  'not breathing',
  'stopped breathing',
  'turning blue',
  'unresponsive',
  'suicid',
  'end my life',
  'hurt myself',
  'harm myself',
  "can't keep going",
  'want to die',
];

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_TERMS.some((term) => lower.includes(term));
}

const URGENT_CONTACTS: ResourcePathway[] = [
  {
    provider: 'Emergency services',
    contact: '111',
    whatTheyOffer: 'Immediate emergency help for you or your pepi.',
    remoteAccessible: true,
    kaupapaMaori: false,
  },
  {
    provider: 'Healthline',
    contact: '0800 611 116',
    whatTheyOffer: '24/7 free health advice from registered nurses.',
    remoteAccessible: true,
    kaupapaMaori: false,
  },
  {
    provider: '1737 Need to Talk?',
    contact: 'Call or text 1737',
    whatTheyOffer: '24/7 free support from trained counsellors.',
    remoteAccessible: true,
    kaupapaMaori: false,
  },
];

// ---------------------------------------------------------------------------
// Free-text need inference (deterministic keyword mapping, no LLM)
// ---------------------------------------------------------------------------

const NEED_KEYWORDS: Record<NeedArea, string[]> = {
  nicu_navigation: ['nicu', 'scbu', 'incubator', 'neonatal', 'hospital', 'ward'],
  feeding: ['feed', 'breastfeed', 'expressing', 'formula', 'tube', 'milk', 'latch'],
  financial: [
    'money',
    'winz',
    'work and income',
    'best start',
    'benefit',
    'cost',
    'afford',
    'financial',
    'payment',
  ],
  emotional: [
    'overwhelm',
    'anxious',
    'anxiety',
    'scared',
    'exhausted',
    'depress',
    'lonely',
    'cry',
    'stress',
    'grief',
  ],
  cultural: ['tikanga', 'karakia', 'marae', 'iwi', 'whakapapa', 'maori', 'maori', 'kaupapa'],
  twins_multiples: ['twin', 'multiple', 'triplet'],
  discharge_home: ['discharge', 'going home', 'take home', 'home soon', 'coming home'],
  partner_org: [
    'our organisation',
    'our service',
    'referral pathway',
    'we support whanau',
    'we support whanau',
  ],
};

export function inferNeedAreas(freeText: string): NeedArea[] {
  const lower = freeText.toLowerCase();
  return (Object.keys(NEED_KEYWORDS) as NeedArea[]).filter((need) =>
    NEED_KEYWORDS[need].some((kw) => lower.includes(kw)),
  );
}

// ---------------------------------------------------------------------------
// Curated play library - trusted NZ providers only
// ---------------------------------------------------------------------------

const NEONATAL_TRUST: ResourcePathway = {
  provider: 'The Neonatal Trust',
  contact: 'https://www.neonataltrust.org.nz',
  whatTheyOffer: 'Support packs, peer support, and information for NICU/SCBU families.',
  remoteAccessible: true,
  kaupapaMaori: false,
};

const MULTIPLES_NZ: ResourcePathway = {
  provider: 'Multiples NZ',
  contact: 'https://www.multiples.org.nz',
  whatTheyOffer: 'Local multiples clubs, twins-specific advice, and parent-to-parent support.',
  remoteAccessible: true,
  kaupapaMaori: false,
};

const PLUNKET: ResourcePathway = {
  provider: 'Whanau Awhina Plunket',
  contact: 'PlunketLine 0800 933 922',
  whatTheyOffer: '24/7 free advice from Plunket nurses, plus home visits after discharge.',
  remoteAccessible: true,
  kaupapaMaori: false,
};

const LA_LECHE: ResourcePathway = {
  provider: 'La Leche League NZ',
  contact: 'https://lalecheleague.org.nz',
  whatTheyOffer: 'Free breastfeeding and expressing support, including for preterm babies.',
  remoteAccessible: true,
  kaupapaMaori: false,
};

const WORK_AND_INCOME: ResourcePathway = {
  provider: 'Work and Income (WINZ)',
  contact: 'https://www.workandincome.govt.nz',
  whatTheyOffer: 'Childcare assistance, Child Disability Allowance, and hardship support.',
  remoteAccessible: true,
  kaupapaMaori: false,
};

const IRD_BEST_START: ResourcePathway = {
  provider: 'Inland Revenue - Best Start',
  contact: 'https://www.ird.govt.nz/working-for-families',
  whatTheyOffer: 'Best Start payments for each baby in their first years (per-child for twins).',
  remoteAccessible: true,
  kaupapaMaori: false,
};

const PADA: ResourcePathway = {
  provider: 'Perinatal Anxiety & Depression Aotearoa (PADA)',
  contact: 'https://pada.nz',
  whatTheyOffer: 'Directory of perinatal mental-health support across Aotearoa.',
  remoteAccessible: true,
  kaupapaMaori: false,
};

const WHANAU_ORA: ResourcePathway = {
  provider: 'Whanau Ora',
  contact: 'https://www.whanauora.nz',
  whatTheyOffer: 'Kaupapa Maori, whanau-centred support through local navigators.',
  remoteAccessible: true,
  kaupapaMaori: true,
};

const CAB: ResourcePathway = {
  provider: 'Citizens Advice Bureau',
  contact: '0800 367 222',
  whatTheyOffer: 'Free, confidential help understanding entitlements and services.',
  remoteAccessible: true,
  kaupapaMaori: false,
};

/**
 * One play template per need area. `whyThisMatters` is finished at
 * generation time with the whanau's gestational context.
 */
const PLAY_LIBRARY: Record<NeedArea, Omit<Play, 'whyThisMatters'>> = {
  nicu_navigation: {
    id: 'play_nicu_navigation',
    category: 'nicu_navigation',
    title: 'Get grounded in the NICU journey',
    steps: [
      {
        action:
          'Ask your NICU nurse for a bedside orientation - what each monitor and alarm means.',
        effort: 'one conversation',
      },
      {
        action: 'Request a Neonatal Trust support pack through your unit or their website.',
        effort: '5 min',
      },
      {
        action:
          'Write down one question for the medical team each day so ward rounds work for you.',
        effort: '2 min a day',
      },
    ],
    resources: [NEONATAL_TRUST, PLUNKET],
    reviewRequired: false,
    integrationHint: 'Ask the hub to explain any medical terms from ward rounds in plain language.',
  },
  feeding: {
    id: 'play_feeding',
    category: 'feeding',
    title: 'Feeding support that fits your situation',
    steps: [
      {
        action: 'Ask your unit about lactation consultant availability - hospital support is free.',
        effort: 'one question',
      },
      {
        action: 'Contact La Leche League NZ for preterm-specific expressing guidance.',
        effort: 'one phone call',
      },
    ],
    resources: [LA_LECHE, PLUNKET],
    reviewRequired: false,
    integrationHint:
      "The hub's feeding navigator can answer specific expressing and tube-feeding questions.",
  },
  financial: {
    id: 'play_financial',
    category: 'financial',
    title: 'Check the entitlements most whanau miss',
    steps: [
      {
        action: 'Check Best Start - it is paid per child, so twins qualify twice.',
        effort: '10 min online',
      },
      {
        action: 'Ask your hospital social worker about NICU travel and accommodation assistance.',
        effort: 'one conversation',
      },
      {
        action: 'Ring CAB if any application feels confusing - they will walk you through it free.',
        effort: 'one phone call',
      },
    ],
    resources: [IRD_BEST_START, WORK_AND_INCOME, CAB],
    // Financial guidance is HITL-gated: eligibility must never be presented
    // as confirmed without human review.
    reviewRequired: true,
    integrationHint: 'Ask the hub to run a funding eligibility check for your situation.',
  },
  emotional: {
    id: 'play_emotional',
    category: 'emotional',
    title: 'Look after yourself, not just your pepi',
    steps: [
      { action: 'Tell one trusted person how you are actually doing this week.', effort: '5 min' },
      {
        action: 'Browse the PADA directory for perinatal mental-health support near you or online.',
        effort: '10 min',
      },
      {
        action: 'If it ever feels too heavy, call or text 1737 - any time, free.',
        effort: 'whenever needed',
      },
    ],
    resources: [PADA, PLUNKET],
    reviewRequired: false,
    integrationHint: "The hub's wellbeing companion is here for a korero whenever you need one.",
  },
  cultural: {
    id: 'play_cultural',
    category: 'cultural',
    title: 'Keep tikanga at the centre of your journey',
    steps: [
      {
        action: 'Ask your unit about its whanau room and how tikanga can be supported on the ward.',
        effort: 'one question',
      },
      {
        action:
          'Connect with a Whanau Ora navigator to bring kaupapa Maori support alongside clinical care.',
        effort: 'one phone call',
      },
    ],
    resources: [WHANAU_ORA],
    // Cultural guidance beyond safe triage is HITL-gated - the hub does
    // not issue tikanga rulings; it connects whanau with people who can.
    reviewRequired: true,
    integrationHint:
      "The hub's cultural navigator can help find kaupapa Maori services in your rohe.",
  },
  twins_multiples: {
    id: 'play_twins_multiples',
    category: 'twins_multiples',
    title: 'Tap into the multiples community',
    steps: [
      {
        action: 'Join your local Multiples NZ club - parents of twins who have walked this road.',
        effort: '10 min',
      },
      {
        action: 'Ask about their NICU/premature multiples support and equipment lending.',
        effort: 'one message',
      },
    ],
    resources: [MULTIPLES_NZ, NEONATAL_TRUST],
    reviewRequired: false,
    integrationHint:
      'Ask the hub about twins-specific feeding and sleep routines when you are ready.',
  },
  discharge_home: {
    id: 'play_discharge_home',
    category: 'discharge_home',
    title: 'Make the journey home feel manageable',
    steps: [
      {
        action:
          'Ask your unit for a written discharge plan and who to call with questions after you leave.',
        effort: 'one conversation',
      },
      {
        action: 'Save PlunketLine (0800 933 922) in your phone before discharge day.',
        effort: '1 min',
      },
      {
        action:
          'Line up one practical helper (meals, washing, school runs) for your first fortnight home.',
        effort: 'one ask',
      },
    ],
    resources: [PLUNKET, NEONATAL_TRUST],
    reviewRequired: false,
    integrationHint: "The hub's discharge companion can help you build a week-one plan.",
  },
  partner_org: {
    id: 'play_partner_org',
    category: 'partner_org',
    title: 'Plug your service into the preterm support network',
    steps: [
      {
        action: 'Map which of your services are reachable by rural whanau without travel.',
        effort: '30 min',
      },
      {
        action: 'Establish a referral relationship with The Neonatal Trust and Multiples NZ.',
        effort: 'one email each',
      },
    ],
    resources: [NEONATAL_TRUST, MULTIPLES_NZ, WHANAU_ORA],
    reviewRequired: false,
    integrationHint: 'The hub team can discuss directory listing and integration options.',
  },
};

const CONTEXT_FRAMING: Record<GestationalContext, string> = {
  antenatal: 'you are preparing for a preterm arrival',
  nicu_current: 'your pepi are in neonatal care right now',
  recently_home: 'you have recently brought your pepi home',
  established_home: 'you are settled at home with ongoing needs',
  unspecified: 'you are supporting preterm pepi',
};

// ---------------------------------------------------------------------------
// The audit itself - pure and deterministic
// ---------------------------------------------------------------------------

export function runActivationAudit(rawInput: ActivationAuditInput): KaitiakiPlaybook {
  const input = ActivationAuditInputSchema.parse(rawInput);

  const freeText = input.freeText ? sanitiseFreeText(input.freeText) : '';
  const crisis = freeText ? detectCrisis(freeText) : false;

  const gestationalContext: GestationalContext = input.gestationalContext ?? 'unspecified';
  const culturalPriority: CulturalPriority = input.culturalPriority ?? 'none_stated';
  const locationContext: LocationContext = input.locationContext ?? 'unspecified';

  // Merge explicit needs with needs inferred from (sanitised) free text.
  const needSet = new Set<NeedArea>([
    ...(input.needAreas ?? []),
    ...(freeText ? inferNeedAreas(freeText) : []),
  ]);
  if (culturalPriority === 'te_ao_maori') {
    needSet.add('cultural');
  }
  if (gestationalContext === 'nicu_current' && needSet.size === 0) {
    needSet.add('nicu_navigation');
  }
  // Twins are the platform's core kaupapa - always offer the multiples
  // community unless this is a partner-organisation audit.
  if (!needSet.has('partner_org')) {
    needSet.add('twins_multiples');
  }
  if (needSet.size === 0) {
    needSet.add('nicu_navigation');
  }

  const framing = CONTEXT_FRAMING[gestationalContext];
  const plays: Play[] = [...needSet].map((need) => {
    const template = PLAY_LIBRARY[need];
    const resources =
      locationContext === 'rural'
        ? template.resources.filter((r) => r.remoteAccessible)
        : template.resources;
    return {
      ...template,
      // Rural whanau only see pathways they can actually reach.
      resources: resources.length > 0 ? resources : template.resources,
      whyThisMatters: `Included because ${framing}${
        need === 'cultural' && culturalPriority === 'te_ao_maori'
          ? ' and you asked for kaupapa Maori support'
          : ''
      }.`,
    };
  });

  // Emotionally heavy or culturally grounded journeys are where a story
  // can help - signal the Narrative Weaver, but only ever consent-gated.
  const wantsStory = needSet.has('emotional') || needSet.has('cultural');
  const playbook: KaitiakiPlaybook = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    summary: crisis
      ? 'We noticed you may need urgent support - those contacts come first. ' +
        'The plays below will still be here whenever you are ready.'
      : `Kia ora. Based on what you shared - ${framing} - here are ${plays.length} ` +
        'practical plays your whanau can start today. Each one has small, ' +
        'doable steps and trusted places to reach.',
    auditBasis: {
      gestationalContext,
      needAreas: [...needSet],
      culturalPriority,
      locationContext,
    },
    plays,
    weaverTrigger: {
      shouldTrigger: wantsStory && !crisis,
      ...(wantsStory && !crisis
        ? {
            theme:
              gestationalContext === 'nicu_current'
                ? 'strength and connection through the NICU journey'
                : 'welcoming pepi into the arms of their whanau',
            audience: 'parents' as const,
            culturalElements:
              culturalPriority === 'te_ao_maori' ? ['manaakitanga', 'whanaungatanga'] : [],
          }
        : {}),
      consentRequired: true,
    },
    reviewStatus:
      crisis || plays.some((p) => p.reviewRequired) ? 'pending_review' : 'auto_approved',
    disclaimer: PLAYBOOK_DISCLAIMER,
    ...(crisis
      ? {
          urgentSupport: {
            show: true,
            message:
              'It sounds like things are really serious right now. Please reach ' +
              'out to one of these services straight away - you do not have to ' +
              'carry this alone.',
            contacts: URGENT_CONTACTS,
          },
        }
      : {}),
  };

  // Validate our own output before anything downstream consumes it.
  return KaitiakiPlaybookSchema.parse(playbook);
}

// ---------------------------------------------------------------------------
// Rendering (markdown for the chat surface; UI can render the JSON directly)
// ---------------------------------------------------------------------------

export function renderPlaybookMarkdown(playbook: KaitiakiPlaybook): string {
  const lines: string[] = [];

  if (playbook.urgentSupport?.show) {
    lines.push(`> [!CAUTION]\n> ${playbook.urgentSupport.message}`);
    for (const c of playbook.urgentSupport.contacts) {
      lines.push(`> - **${c.provider}** - ${c.contact}: ${c.whatTheyOffer}`);
    }
    lines.push('');
  }

  lines.push('## Your Kaitiaki Support Playbook');
  lines.push('');
  lines.push(playbook.summary);
  lines.push('');

  playbook.plays.forEach((play, i) => {
    lines.push(`### ${i + 1}. ${play.title}`);
    lines.push(`*${play.whyThisMatters}*`);
    lines.push('');
    play.steps.forEach((step, j) => {
      lines.push(`${j + 1}. ${step.action} _(${step.effort})_`);
    });
    lines.push('');
    lines.push('**Where to reach out:**');
    for (const r of play.resources) {
      lines.push(`- **${r.provider}**${r.kaupapaMaori ? ' (kaupapa Maori)' : ''} - ${r.contact}`);
    }
    if (play.reviewRequired) {
      lines.push('');
      lines.push('> This play will be confirmed by our support team before you rely on it.');
    }
    lines.push('');
  });

  if (playbook.weaverTrigger.shouldTrigger) {
    lines.push(
      '---\n*If it would help, we can weave a short story for your whanau ' +
        'about this journey - just say the word and we will create one together.*',
    );
    lines.push('');
  }

  lines.push(`> [!CAUTION]\n> **Disclaimer:** ${playbook.disclaimer}`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Agent wrapper - same shape as the other manu agents
// ---------------------------------------------------------------------------

export class ActivationAuditor {
  name = 'activation_auditor';

  /**
   * `state.context.auditInput` may carry a structured ActivationAuditInput
   * (from the intake form); otherwise the query itself is treated as the
   * free-text input. Both paths are sanitised and deterministic.
   */
  async process(query: string, state: any) {
    const structured = state?.context?.auditInput;
    const parsed = structured ? ActivationAuditInputSchema.safeParse(structured) : undefined;

    const input: ActivationAuditInput = parsed?.success
      ? { ...parsed.data, freeText: parsed.data.freeText ?? query }
      : { freeText: query };

    const playbook = runActivationAudit(input);

    return {
      content: renderPlaybookMarkdown(playbook),
      agentUsed: this.name,
      sources: playbook.plays.flatMap((p) => p.resources.map((r) => r.contact)),
      requiresHumanReview: playbook.reviewStatus === 'pending_review',
      showUrgentHelp: playbook.urgentSupport?.show ?? false,
      metadata: { playbook },
    };
  }
}
