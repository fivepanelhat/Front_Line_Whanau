/**
 * Knowledge Weaver — Information Retrieval Agent
 *
 * Specialist agent that retrieves and synthesises information
 * from the services directory, guides, and NZ legislation references.
 * Returns structured, sourced information to help whānau.
 *
 * Currently a structured stub returning templated responses.
 * Will be connected to an LLM provider in a future phase.
 */

import type { Agent, AgentMessage, AgentResponse, Source, SuggestedAction } from './types';
import { AgentRole } from './types';

// ── Knowledge Base (Static) ──────────────────────────────────

interface KnowledgeEntry {
  keywords: string[];
  title: string;
  content: string;
  sources: Source[];
  actions: SuggestedAction[];
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['preterm', 'baby', 'payment', 'winz', 'neonatal'],
    title: 'Preterm Baby Payment',
    content: `The **Preterm Baby Payment** is available through Work and Income (WINZ) for parents of babies born before 37 weeks gestation. This payment helps cover additional costs during the neonatal period.

**Who can apply:**
- Parents or caregivers of a baby born before 37 weeks
- The baby must still be in hospital or recently discharged

**What you need:**
- Proof of birth (hospital letter confirming gestational age)
- Your IRD number
- Bank account details

**How to apply:**
Contact your local WINZ office or call 0800 559 009. You can also apply online through MyMSD.`,
    sources: [
      { type: 'directory', title: 'Work and Income NZ', reference: 'https://www.workandincome.govt.nz/' },
    ],
    actions: [
      { label: 'Call WINZ', type: 'call', target: '0800559009' },
      { label: 'View WINZ Guide', type: 'navigate', target: '/guides/winz-application-guide' },
    ],
  },
  {
    keywords: ['best', 'start', 'ird', 'tax', 'credit'],
    title: 'Best Start Tax Credit',
    content: `**Best Start** is a tax credit of **$73.86 per week per child** for the first year of life (up to 3 years if household income is under $93,858).

**Key details:**
- Paid by Inland Revenue (IRD)
- Available for each child — twins receive double
- Apply through IRD when registering the birth
- No asset test for the first year

**For twins:**
You are entitled to Best Start for **each baby**, meaning up to $147.72/week for the first year.`,
    sources: [
      { type: 'directory', title: 'Inland Revenue NZ', reference: 'https://www.ird.govt.nz/' },
    ],
    actions: [
      { label: 'Call IRD', type: 'call', target: '0800227774' },
      { label: 'View IRD Guide', type: 'navigate', target: '/guides/ird-best-start-guide' },
    ],
  },
  {
    keywords: ['housing', 'tenancy', 'repair', 'landlord', 'rent'],
    title: 'Tenancy Rights & Housing Support',
    content: `If you're having issues with your rental property, you have rights under the **Residential Tenancies Act 1986**.

**Common situations:**
- **Repairs needed**: Your landlord must maintain the property to a reasonable standard. Submit repair requests in writing.
- **Healthy Homes**: Rental properties must meet Healthy Homes Standards (heating, insulation, ventilation, moisture, draught).
- **Rent increases**: Landlords can only increase rent once every 12 months with 60 days' notice.

**If your home is unsuitable for preterm babies:**
Contact Tenancy Services for advice on requesting urgent repairs. Preterm babies are vulnerable to cold, damp, and mould.`,
    sources: [
      { type: 'directory', title: 'Tenancy Services (MBIE)', reference: 'https://www.tenancy.govt.nz/' },
      { type: 'statute', title: 'Residential Tenancies Act 1986', reference: 'https://www.legislation.govt.nz/act/public/1986/0120/' },
    ],
    actions: [
      { label: 'Call Tenancy Services', type: 'call', target: '0800836262' },
      { label: 'View Tenancy Guide', type: 'navigate', target: '/guides/tenancy-rights-guide' },
    ],
  },
  {
    keywords: ['mental', 'health', 'stress', 'anxiety', 'depression', 'counselling', 'help'],
    title: 'Mental Health Support',
    content: `It's completely normal to feel overwhelmed during and after a NICU stay. You are not alone, and support is available right now.

**Immediate support:**
- **1737**: Call or text for free counselling, 24/7
- **PlunketLine**: 0800 933 922 — parenting support 24/7
- **PADA**: 0800 726 222 — perinatal anxiety & depression support

**Taranaki-specific:**
- **Taranaki Retreat**: (06) 752 2289 — free walk-in mental health crisis support

**Remember:** Asking for help is a sign of strength, not weakness. These services are free and confidential.`,
    sources: [
      { type: 'directory', title: '1737 Need to Talk?', reference: 'https://1737.org.nz/' },
      { type: 'directory', title: 'PADA', reference: 'https://www.pada.nz/' },
    ],
    actions: [
      { label: 'Call or text 1737', type: 'call', target: '1737' },
      { label: 'Call PlunketLine', type: 'call', target: '0800933922' },
      { label: 'Mental Health Resources', type: 'navigate', target: '/guides/mental-health-resources' },
    ],
  },
  {
    keywords: ['accommodation', 'supplement', 'rent', 'assistance', 'financial'],
    title: 'Financial Assistance Overview',
    content: `There are several financial support options available to families of preterm twins in New Zealand:

**Through WINZ (Work and Income):**
- Preterm Baby Payment
- Accommodation Supplement
- Childcare Assistance
- Recoverable Assistance (emergency grants)
- Disability Allowance (for ongoing medical needs)

**Through IRD (Inland Revenue):**
- Best Start ($73.86/week per child)
- Working for Families Tax Credits
- Parental Leave Payments (up to 26 weeks)

**Tips:**
- Apply for everything you might be eligible for — the worst that can happen is they say no
- Ask for a **needs assessment** at WINZ — this ensures nothing is missed
- Keep copies of all applications and correspondence`,
    sources: [
      { type: 'directory', title: 'Work and Income NZ', reference: 'https://www.workandincome.govt.nz/' },
      { type: 'directory', title: 'Inland Revenue NZ', reference: 'https://www.ird.govt.nz/' },
    ],
    actions: [
      { label: 'Call WINZ', type: 'call', target: '0800559009' },
      { label: 'Call IRD', type: 'call', target: '0800227774' },
    ],
  },
];

// ── Agent Implementation ─────────────────────────────────────

export class KnowledgeWeaver implements Agent {
  role = AgentRole.KnowledgeWeaver;

  canHandle(query: string): boolean {
    const lower = query.toLowerCase();
    return KNOWLEDGE_BASE.some((entry) =>
      entry.keywords.some((kw) => lower.includes(kw)),
    );
  }

  async process(message: AgentMessage): Promise<AgentResponse> {
    const query = message.content.toLowerCase();

    // Find matching knowledge entries
    const matches = KNOWLEDGE_BASE.filter((entry) =>
      entry.keywords.some((kw) => query.includes(kw)),
    );

    if (matches.length === 0) {
      return this.fallbackResponse(message);
    }

    // Combine matching entries
    const content = matches.map((m) => `## ${m.title}\n\n${m.content}`).join('\n\n---\n\n');
    const sources = matches.flatMap((m) => m.sources);
    const actions = matches.flatMap((m) => m.actions);

    return {
      agent: this.role,
      content,
      sources,
      suggestedActions: actions,
      confidence: 0.85,
      timestamp: new Date(),
    };
  }

  private fallbackResponse(message: AgentMessage): AgentResponse {
    return {
      agent: this.role,
      content: `I don't have specific information about that topic yet, but here are some general resources that might help:

- **WINZ**: 0800 559 009 — Financial support and emergency assistance
- **IRD**: 0800 227 774 — Tax credits and family payments
- **PlunketLine**: 0800 933 922 — Parenting advice and support
- **1737**: Call or text — Free counselling, anytime

You can also browse our **Services Directory** for local Taranaki and national support services.`,
      sources: [
        { type: 'general', title: 'Front Line Whānau Directory', reference: '/directory' },
      ],
      suggestedActions: [
        { label: 'Browse Directory', type: 'navigate', target: '/directory' },
      ],
      confidence: 0.3,
      timestamp: new Date(),
    };
  }
}
