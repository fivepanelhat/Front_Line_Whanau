/**
 * Pathway Architect — Support Pathway Generator
 *
 * Specialist agent that creates personalised, step-by-step
 * support pathways for whānau based on their situation.
 * Covers financial, housing, health, and mental health pathways.
 *
 * Requires consent scope: ai.process
 *
 * Currently a structured stub returning templated pathways.
 * Will be connected to an LLM provider in a future phase.
 */

import type { Agent, AgentMessage, AgentResponse, SupportPathway, PathwayStep, ConsentScope } from './types';
import { AgentRole } from './types';

// ── Pathway Templates ────────────────────────────────────────

const PATHWAY_TEMPLATES: Record<string, SupportPathway> = {
  financial: {
    id: 'pathway-financial',
    type: 'financial',
    status: 'not-started',
    currentStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'fin-1',
        title: 'Apply for Preterm Baby Payment',
        description: 'Contact WINZ (0800 559 009) to apply for the Preterm Baby Payment. You\'ll need proof of birth showing gestational age, your IRD number, and bank account details.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'WINZ', reference: 'https://www.workandincome.govt.nz/' }],
        estimatedMinutes: 30,
      },
      {
        id: 'fin-2',
        title: 'Register Birth & Apply for Best Start',
        description: 'Register your babies\' births with Internal Affairs. Apply for Best Start through IRD — $73.86/week per child.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'IRD', reference: 'https://www.ird.govt.nz/' }],
        estimatedMinutes: 45,
      },
      {
        id: 'fin-3',
        title: 'Request Needs Assessment at WINZ',
        description: 'Ask for a comprehensive needs assessment. This reviews all possible entitlements including Accommodation Supplement, Childcare Assistance, and Disability Allowance.',
        status: 'not-started',
        resources: [{ type: 'guide', title: 'WINZ Application Guide', reference: '/guides/winz-application-guide' }],
        estimatedMinutes: 60,
      },
      {
        id: 'fin-4',
        title: 'Apply for Working for Families',
        description: 'Contact IRD (0800 227 774) for Working for Families tax credits. As parents of twins, you may be eligible for substantial support.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'IRD', reference: 'https://www.ird.govt.nz/' }],
        estimatedMinutes: 20,
      },
      {
        id: 'fin-5',
        title: 'Check for Community Grants',
        description: 'Contact Citizens Advice Bureau for information about local community grants, food banks, and charitable support available in Taranaki.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'Citizens Advice Bureau', reference: 'https://www.cab.org.nz/' }],
        estimatedMinutes: 15,
      },
    ],
  },
  housing: {
    id: 'pathway-housing',
    type: 'housing',
    status: 'not-started',
    currentStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'house-1',
        title: 'Assess Your Home for Preterm Baby Safety',
        description: 'Check your home meets Healthy Homes Standards: adequate heating, insulation, ventilation. Preterm babies are especially vulnerable to cold and damp.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'Tenancy Services', reference: 'https://www.tenancy.govt.nz/' }],
        estimatedMinutes: 20,
      },
      {
        id: 'house-2',
        title: 'Request Repairs from Landlord',
        description: 'Write to your landlord requesting any necessary repairs. Keep a copy. Landlords must respond within a reasonable timeframe under the Residential Tenancies Act.',
        status: 'not-started',
        resources: [{ type: 'statute', title: 'Residential Tenancies Act 1986', reference: 'https://www.legislation.govt.nz/act/public/1986/0120/' }],
        estimatedMinutes: 15,
      },
      {
        id: 'house-3',
        title: 'Apply for Accommodation Supplement',
        description: 'If rent is a burden, apply to WINZ for the Accommodation Supplement. This helps with rent or board costs.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'WINZ', reference: 'https://www.workandincome.govt.nz/' }],
        estimatedMinutes: 30,
      },
      {
        id: 'house-4',
        title: 'Contact Kāinga Ora if Needed',
        description: 'If your housing situation is urgent, contact Kāinga Ora (0800 801 601) about the Housing Register or emergency housing.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'Kāinga Ora', reference: 'https://kaingaora.govt.nz/' }],
        estimatedMinutes: 20,
      },
    ],
  },
  'mental-health': {
    id: 'pathway-mental-health',
    type: 'mental-health',
    status: 'not-started',
    currentStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: 'mh-1',
        title: 'Reach Out for Immediate Support',
        description: 'If you\'re feeling overwhelmed, call or text 1737 — it\'s free, confidential, and available 24/7. You don\'t need to be in crisis to call.',
        status: 'not-started',
        resources: [{ type: 'directory', title: '1737 Need to Talk?', reference: 'https://1737.org.nz/' }],
        estimatedMinutes: 5,
      },
      {
        id: 'mh-2',
        title: 'Connect with Perinatal Support',
        description: 'Contact PADA (0800 726 222) for specialised perinatal anxiety and depression support. They understand what you\'re going through.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'PADA', reference: 'https://www.pada.nz/' }],
        estimatedMinutes: 10,
      },
      {
        id: 'mh-3',
        title: 'Talk to Your Midwife or GP',
        description: 'Let your midwife or GP know how you\'re feeling. They can arrange referrals to perinatal mental health services and check on your physical recovery too.',
        status: 'not-started',
        resources: [],
        estimatedMinutes: 20,
      },
      {
        id: 'mh-4',
        title: 'Start a Journal',
        description: 'Use the Front Line Whānau journal to write down your thoughts and feelings. This is your private space — everything stays on your device unless you choose otherwise.',
        status: 'not-started',
        resources: [{ type: 'general', title: 'Journal', reference: '/journal' }],
        estimatedMinutes: 10,
      },
      {
        id: 'mh-5',
        title: 'Connect with Other Parents',
        description: 'Contact the NZ Multiple Birth Association for peer support from other parents of twins and multiples who understand your journey.',
        status: 'not-started',
        resources: [{ type: 'directory', title: 'NZ Multiple Birth Association', reference: 'https://www.multiples.org.nz/' }],
        estimatedMinutes: 15,
      },
    ],
  },
};

// ── Agent Implementation ─────────────────────────────────────

export class PathwayArchitect implements Agent {
  role = AgentRole.PathwayArchitect;

  canHandle(query: string): boolean {
    const lower = query.toLowerCase();
    const pathwayKeywords = [
      'pathway', 'plan', 'steps', 'help me', 'what should i do',
      'guide me', 'where do i start', 'how do i', 'checklist',
    ];
    return pathwayKeywords.some((kw) => lower.includes(kw));
  }

  async process(message: AgentMessage): Promise<AgentResponse> {
    // Check consent
    const hasConsent = message.grantedScopes.includes('ai.process' as ConsentScope);

    if (!hasConsent) {
      return {
        agent: this.role,
        content: `I can create a personalised support pathway for you, but I need your consent to process this information first. The pathway will be based on the details you share about your situation.

**What this means:**
- I'll use what you tell me to suggest relevant steps
- Your information stays private and is not stored without your permission
- You can revoke consent at any time

Would you like to grant consent for AI processing?`,
        sources: [],
        suggestedActions: [],
        confidence: 0.9,
        timestamp: new Date(),
      };
    }

    // Determine pathway type from query
    const pathwayType = this.detectPathwayType(message.content);
    const pathway = PATHWAY_TEMPLATES[pathwayType];

    if (!pathway) {
      return this.generalPathwayResponse();
    }

    const stepsFormatted = pathway.steps
      .map((step, i) => `### Step ${i + 1}: ${step.title}\n${step.description}\n${step.estimatedMinutes ? `⏱️ ~${step.estimatedMinutes} minutes` : ''}`)
      .join('\n\n');

    return {
      agent: this.role,
      content: `# Your ${pathwayType.replace('-', ' ')} Support Pathway\n\nHere's a step-by-step plan tailored for families of preterm twins:\n\n${stepsFormatted}\n\n---\n\n*Take these steps at your own pace. There's no rush — do what feels manageable today.*`,
      sources: pathway.steps.flatMap((s) => s.resources),
      suggestedActions: [
        { label: `Start: ${pathway.steps[0].title}`, type: 'info', target: pathway.steps[0].id },
      ],
      confidence: 0.8,
      timestamp: new Date(),
    };
  }

  private detectPathwayType(query: string): string {
    const lower = query.toLowerCase();

    if (lower.match(/financ|money|pay|winz|ird|benefit|grant/)) return 'financial';
    if (lower.match(/hous|rent|landlord|tenan|home|repair/)) return 'housing';
    if (lower.match(/mental|stress|anxi|depress|feel|emotion|overwhelm|sad/)) return 'mental-health';
    if (lower.match(/health|doctor|hospital|nicu|baby|medical/)) return 'financial'; // default to financial as it's most common

    return 'financial';
  }

  private generalPathwayResponse(): AgentResponse {
    return {
      agent: this.role,
      content: `I can help you create a support pathway. Which area would you like help with?

- **💰 Financial Support** — WINZ payments, IRD credits, emergency assistance
- **🏠 Housing** — Tenancy rights, repairs, accommodation support
- **💚 Mental Health** — Counselling, peer support, self-care
- **🏥 Health** — Neonatal follow-up, GP referrals, specialist care

Just tell me what you need help with, and I'll create a personalised plan.`,
      sources: [],
      suggestedActions: [
        { label: 'Financial Pathway', type: 'info', target: 'financial' },
        { label: 'Housing Pathway', type: 'info', target: 'housing' },
        { label: 'Mental Health Pathway', type: 'info', target: 'mental-health' },
      ],
      confidence: 0.9,
      timestamp: new Date(),
    };
  }
}
