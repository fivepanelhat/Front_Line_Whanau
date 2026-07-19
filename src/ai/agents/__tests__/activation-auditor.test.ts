import { describe, it, expect } from 'vitest';
import {
  ActivationAuditor,
  detectCrisis,
  inferNeedAreas,
  renderPlaybookMarkdown,
  runActivationAudit,
  sanitiseFreeText,
} from '../activation-auditor';
import {
  ActivationAuditInputSchema,
  KaitiakiPlaybookSchema,
  PLAYBOOK_DISCLAIMER,
} from '../../schemas/kaitiaki-playbook';

describe('sanitiseFreeText (privacy by design)', () => {
  it('strips emails, NZ phone numbers, and NHI-shaped tokens', () => {
    const dirty = 'Contact me at mum@example.com or 021 123 4567, NHI is ABC1234 thanks';
    const clean = sanitiseFreeText(dirty);
    expect(clean).not.toContain('mum@example.com');
    expect(clean).not.toContain('021 123 4567');
    expect(clean).not.toMatch(/ABC1234/i);
    expect(clean).toContain('[removed]');
  });

  it('leaves ordinary text untouched', () => {
    const text = 'our twins are in NICU and we are exhausted';
    expect(sanitiseFreeText(text)).toBe(text);
  });
});

describe('detectCrisis (safety guardrail)', () => {
  it('detects crisis language', () => {
    expect(detectCrisis("I can't keep going anymore")).toBe(true);
    expect(detectCrisis('baby stopped breathing last night')).toBe(true);
  });

  it('does not false-positive on everyday worry', () => {
    expect(detectCrisis('I am worried about feeding times')).toBe(false);
  });
});

describe('inferNeedAreas', () => {
  it('maps free text onto need areas deterministically', () => {
    const needs = inferNeedAreas('our twins are in NICU, money is tight and I feel so anxious');
    expect(needs).toContain('nicu_navigation');
    expect(needs).toContain('financial');
    expect(needs).toContain('emotional');
    expect(needs).toContain('twins_multiples');
  });
});

describe('runActivationAudit', () => {
  it('produces a schema-valid playbook from an empty input', () => {
    const playbook = runActivationAudit({});
    expect(() => KaitiakiPlaybookSchema.parse(playbook)).not.toThrow();
    expect(playbook.plays.length).toBeGreaterThan(0);
    expect(playbook.disclaimer).toBe(PLAYBOOK_DISCLAIMER);
  });

  it('is deterministic for identical inputs', () => {
    const input = { freeText: 'twins in NICU, feeding questions' } as const;
    const a = runActivationAudit(input);
    const b = runActivationAudit(input);
    expect(a.plays).toEqual(b.plays);
    expect(a.auditBasis).toEqual(b.auditBasis);
  });

  it('always offers the multiples community play for whānau', () => {
    const playbook = runActivationAudit({ freeText: 'feeling overwhelmed' });
    expect(playbook.plays.map((p) => p.category)).toContain('twins_multiples');
  });

  it('flags financial plays for HITL review', () => {
    const playbook = runActivationAudit({ needAreas: ['financial'] });
    const financial = playbook.plays.find((p) => p.category === 'financial');
    expect(financial?.reviewRequired).toBe(true);
    expect(playbook.reviewStatus).toBe('pending_review');
  });

  it('flags cultural plays for HITL review and honours te ao Māori priority', () => {
    const playbook = runActivationAudit({ culturalPriority: 'te_ao_maori' });
    const cultural = playbook.plays.find((p) => p.category === 'cultural');
    expect(cultural).toBeDefined();
    expect(cultural?.reviewRequired).toBe(true);
    expect(cultural?.resources.some((r) => r.kaupapaMaori)).toBe(true);
  });

  it('auto-approves playbooks with no sensitive plays', () => {
    const playbook = runActivationAudit({ needAreas: ['nicu_navigation'] });
    expect(playbook.plays.every((p) => !p.reviewRequired)).toBe(true);
    expect(playbook.reviewStatus).toBe('auto_approved');
  });

  it('gives rural whānau only remote-accessible pathways', () => {
    const playbook = runActivationAudit({
      needAreas: ['financial', 'emotional'],
      locationContext: 'rural',
    });
    for (const play of playbook.plays) {
      expect(play.resources.every((r) => r.remoteAccessible)).toBe(true);
    }
  });

  it('surfaces urgent contacts and review on crisis language, and suppresses the weaver', () => {
    const playbook = runActivationAudit({
      freeText: "I can't keep going, everything is too much",
    });
    expect(playbook.urgentSupport?.show).toBe(true);
    expect(playbook.urgentSupport?.contacts.some((c) => c.contact === '111')).toBe(true);
    expect(playbook.reviewStatus).toBe('pending_review');
    expect(playbook.weaverTrigger.shouldTrigger).toBe(false);
  });

  it('sets a consent-gated weaver trigger for emotional journeys', () => {
    const playbook = runActivationAudit({
      gestationalContext: 'nicu_current',
      needAreas: ['emotional'],
    });
    expect(playbook.weaverTrigger.shouldTrigger).toBe(true);
    expect(playbook.weaverTrigger.consentRequired).toBe(true);
    expect(playbook.weaverTrigger.theme).toBeTruthy();
  });

  it('carries cultural elements into the weaver trigger for te ao Māori whānau', () => {
    const playbook = runActivationAudit({
      culturalPriority: 'te_ao_maori',
      gestationalContext: 'recently_home',
    });
    expect(playbook.weaverTrigger.shouldTrigger).toBe(true);
    expect(playbook.weaverTrigger.culturalElements).toContain('manaakitanga');
  });

  it('never echoes raw free text into the playbook (data minimisation)', () => {
    const playbook = runActivationAudit({
      freeText: 'ring me on 021 123 4567 about our NICU twins',
    });
    const serialised = JSON.stringify(playbook);
    expect(serialised).not.toContain('021 123 4567');
  });

  it('rejects oversized free text at the boundary', () => {
    expect(() => runActivationAudit({ freeText: 'a'.repeat(3000) })).toThrow();
  });
});

describe('renderPlaybookMarkdown', () => {
  it('renders summary, steps, resources, and the disclaimer', () => {
    const playbook = runActivationAudit({
      gestationalContext: 'nicu_current',
      needAreas: ['financial'],
    });
    const md = renderPlaybookMarkdown(playbook);
    expect(md).toContain('Kaitiaki Support Playbook');
    expect(md).toContain('Best Start');
    expect(md).toContain('**Disclaimer:**');
    expect(md).toContain('confirmed by our support team');
  });

  it('puts urgent contacts first in a crisis', () => {
    const playbook = runActivationAudit({ freeText: 'I want to die' });
    const md = renderPlaybookMarkdown(playbook);
    expect(md.indexOf('111')).toBeLessThan(md.indexOf('Kaitiaki Support Playbook'));
  });
});

describe('ActivationAuditor agent', () => {
  it("initializes with correct name 'activation_auditor'", () => {
    const agent = new ActivationAuditor();
    expect(agent.name).toBe('activation_auditor');
  });

  it('processes a free-text query into a playbook response', async () => {
    const agent = new ActivationAuditor();
    const result = await agent.process(
      "we just got home with our twins and I don't know where to start",
      {},
    );
    expect(result.agentUsed).toBe('activation_auditor');
    expect(result.content).toContain('Kaitiaki Support Playbook');
    expect(result.metadata.playbook.schemaVersion).toBe('1.0');
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('prefers structured auditInput from state.context when valid', async () => {
    const agent = new ActivationAuditor();
    const result = await agent.process('build my playbook', {
      context: {
        auditInput: {
          gestationalContext: 'nicu_current',
          needAreas: ['feeding'],
          locationContext: 'rural',
        },
      },
    });
    const playbook = result.metadata.playbook;
    expect(playbook.auditBasis.gestationalContext).toBe('nicu_current');
    expect(playbook.auditBasis.locationContext).toBe('rural');
    expect(playbook.plays.map((p: any) => p.category)).toContain('feeding');
  });

  it('falls back to the query when structured input is invalid', async () => {
    const agent = new ActivationAuditor();
    const result = await agent.process('help with feeding our NICU twins', {
      context: { auditInput: { gestationalContext: 'not-a-real-value' } },
    });
    expect(result.metadata.playbook.plays.map((p: any) => p.category)).toContain('feeding');
  });

  it('sets requiresHumanReview and showUrgentHelp appropriately', async () => {
    const agent = new ActivationAuditor();
    const calm = await agent.process('tips for the NICU ward', {});
    expect(calm.showUrgentHelp).toBe(false);

    const crisis = await agent.process("I can't keep going anymore", {});
    expect(crisis.showUrgentHelp).toBe(true);
    expect(crisis.requiresHumanReview).toBe(true);
  });
});

describe('ActivationAuditInputSchema', () => {
  it('accepts a fully-empty input (all fields optional)', () => {
    expect(ActivationAuditInputSchema.safeParse({}).success).toBe(true);
  });

  it('has no fields capable of holding direct identifiers', () => {
    const keys = Object.keys(ActivationAuditInputSchema.shape);
    expect(keys).toEqual([
      'gestationalContext',
      'needAreas',
      'culturalPriority',
      'locationContext',
      'freeText',
    ]);
  });
});
