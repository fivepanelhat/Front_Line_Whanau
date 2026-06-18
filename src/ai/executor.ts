/**
 * Executor — Action Agent
 *
 * Specialist agent that takes action on behalf of the user:
 * - Form pre-filling
 * - Document draft generation
 * - Reminder scheduling
 *
 * Requires consent scope: ai.execute
 * Always requires user review before finalising any action.
 *
 * Currently a structured stub. Will be connected to an LLM
 * provider in a future phase.
 */

import type { Agent, AgentMessage, AgentResponse, ConsentScope } from './types';
import { AgentRole } from './types';

// ── Agent Implementation ─────────────────────────────────────

export class Executor implements Agent {
  role = AgentRole.Executor;

  canHandle(query: string): boolean {
    const lower = query.toLowerCase();
    const actionKeywords = [
      'fill', 'form', 'apply', 'draft', 'write', 'letter',
      'template', 'download', 'remind', 'schedule', 'prepare',
    ];
    return actionKeywords.some((kw) => lower.includes(kw));
  }

  async process(message: AgentMessage): Promise<AgentResponse> {
    // Executor requires explicit consent
    const hasConsent = message.grantedScopes.includes('ai.execute' as ConsentScope);

    if (!hasConsent) {
      return {
        agent: this.role,
        content: `I can help you prepare forms and documents, but I need your explicit consent first.

**What I can do:**
- Pre-fill WINZ and IRD application forms with information you provide
- Draft letters for tenancy repair requests
- Prepare checklists for appointments

**What this means for your data:**
- I'll only use information you explicitly provide for this task
- Nothing is submitted or sent without your review and approval
- You can cancel at any time

Would you like to grant consent for AI-assisted actions?`,
        sources: [],
        suggestedActions: [],
        confidence: 0.9,
        timestamp: new Date(),
      };
    }

    // Detect what action is requested
    const actionType = this.detectAction(message.content);

    switch (actionType) {
      case 'winz-form':
        return this.prepareWINZForm();
      case 'ird-form':
        return this.prepareIRDForm();
      case 'tenancy-letter':
        return this.prepareTenancyLetter();
      default:
        return this.generalActionResponse();
    }
  }

  private detectAction(query: string): string {
    const lower = query.toLowerCase();

    if (lower.match(/winz|preterm.*payment|work.*income/)) return 'winz-form';
    if (lower.match(/ird|best.*start|tax.*credit|inland.*revenue/)) return 'ird-form';
    if (lower.match(/tenan|repair|landlord|letter/)) return 'tenancy-letter';

    return 'general';
  }

  private prepareWINZForm(): AgentResponse {
    return {
      agent: this.role,
      content: `# WINZ Application Preparation

I've prepared a checklist for your WINZ application. Please review and confirm:

## Documents You'll Need
- [ ] Proof of birth (hospital letter with gestational age)
- [ ] Your IRD number
- [ ] Partner's IRD number (if applicable)
- [ ] Bank account number (for direct credit)
- [ ] Photo ID
- [ ] Proof of address

## Application Checklist
- [ ] Preterm Baby Payment
- [ ] Accommodation Supplement
- [ ] Childcare Assistance (if applicable)
- [ ] Recoverable Assistance (for urgent one-off costs)

## Next Steps
1. **Download** the WINZ application template
2. **Gather** the documents listed above
3. **Call** 0800 559 009 or visit your local WINZ office
4. **Request** a full needs assessment at your appointment

> ⚠️ **Review carefully** — I have not submitted anything on your behalf. You are in full control.`,
      sources: [
        { type: 'directory', title: 'Work and Income NZ', reference: 'https://www.workandincome.govt.nz/' },
        { type: 'guide', title: 'WINZ Application Guide', reference: '/guides/winz-application-guide' },
      ],
      suggestedActions: [
        { label: 'Download WINZ Template', type: 'navigate', target: '/templates/winz-preterm-baby-payment.pdf' },
        { label: 'Call WINZ', type: 'call', target: '0800559009' },
      ],
      confidence: 0.85,
      timestamp: new Date(),
    };
  }

  private prepareIRDForm(): AgentResponse {
    return {
      agent: this.role,
      content: `# IRD Best Start Application

I've prepared a guide for applying for Best Start tax credits:

## For Your Twins
- **Per child**: $73.86/week
- **Combined (twins)**: $147.72/week
- **Duration**: First year of life (universal), up to 3 years (income-tested)

## What You'll Need
- [ ] Babies' birth certificates or birth registration numbers
- [ ] Your IRD number
- [ ] Partner's IRD number
- [ ] Bank account details
- [ ] Estimated household income

## How to Apply
1. **Register births** with Internal Affairs (births.govt.nz)
2. **Apply for IRD numbers** for each baby
3. **Apply for Best Start** through myIR or call 0800 227 774
4. **Apply for Working for Families** at the same time

> ⚠️ **Review carefully** — Nothing has been submitted. You control the process.`,
      sources: [
        { type: 'directory', title: 'Inland Revenue NZ', reference: 'https://www.ird.govt.nz/' },
        { type: 'guide', title: 'Best Start Guide', reference: '/guides/ird-best-start-guide' },
      ],
      suggestedActions: [
        { label: 'Download IRD Template', type: 'navigate', target: '/templates/ird-best-start.pdf' },
        { label: 'Call IRD', type: 'call', target: '0800227774' },
      ],
      confidence: 0.85,
      timestamp: new Date(),
    };
  }

  private prepareTenancyLetter(): AgentResponse {
    return {
      agent: this.role,
      content: `# Tenancy Repair Request Letter

Here's a draft letter template you can customise and send to your landlord:

---

**[Your Name]**
**[Your Address]**
**[Date]**

Dear [Landlord/Property Manager Name],

I am writing to request repairs at the above property. As tenants with newborn preterm twins, maintaining a warm, dry, and safe home environment is especially important for our children's health.

**Repairs Required:**
- [Describe issue 1, e.g., "Broken heat pump in the living room"]
- [Describe issue 2, e.g., "Mould on the bedroom ceiling"]
- [Describe issue 3, e.g., "Draughty window seals in the nursery"]

Under the **Residential Tenancies Act 1986** and the **Healthy Homes Standards**, landlords are required to maintain rental properties to a reasonable standard, including adequate heating, insulation, and ventilation.

I would appreciate these repairs being addressed within **14 days**. Please contact me to arrange suitable times for the work to be carried out.

Thank you for your attention to this matter.

Yours sincerely,
[Your Name]

---

> ⚠️ **This is a template** — please customise it with your details before sending. Keep a copy for your records.`,
      sources: [
        { type: 'statute', title: 'Residential Tenancies Act 1986', reference: 'https://www.legislation.govt.nz/act/public/1986/0120/' },
        { type: 'directory', title: 'Tenancy Services', reference: 'https://www.tenancy.govt.nz/' },
      ],
      suggestedActions: [
        { label: 'Download Tenancy Template', type: 'navigate', target: '/templates/tenancy-repair-request.pdf' },
        { label: 'Call Tenancy Services', type: 'call', target: '0800836262' },
      ],
      confidence: 0.8,
      timestamp: new Date(),
    };
  }

  private generalActionResponse(): AgentResponse {
    return {
      agent: this.role,
      content: `I can help you prepare documents and forms. What would you like to do?

- **📝 WINZ Application** — Prepare checklist and gather documents
- **💰 IRD Best Start** — Apply for tax credits for your twins
- **✉️ Tenancy Letter** — Draft a repair request to your landlord
- **📋 Custom Document** — I can help draft other letters or checklists

Just tell me what you need, and I'll prepare it for your review.`,
      sources: [],
      suggestedActions: [
        { label: 'Prepare WINZ Application', type: 'form', target: 'winz-form' },
        { label: 'Apply for Best Start', type: 'form', target: 'ird-form' },
        { label: 'Draft Tenancy Letter', type: 'form', target: 'tenancy-letter' },
      ],
      confidence: 0.9,
      timestamp: new Date(),
    };
  }
}
