# COMPLIANCE.md

**Coastal Alpine Tech Limited** | **Product:** Front Line Whanau
Last updated: 19 July 2026

## Privacy / Security / Governance (fleet mandatory)

| Pillar | Standard |
| --- | --- |
| **Privacy** | Local-first default; purpose-limited collection; Privacy Act 2020; Te Mana Raraunga spirit; third-party processing only when opt-in and disclosed |
| **Security** | No silent exfil; owner-controlled credentials; least privilege; SecOps / red-team cadence where CI is present |
| **Governance** | HITL for high-stakes; agents draft only; humans sign / send / pay |

Last reviewed (fleet block): 2026-07-21

> Super Grok compliance briefing (19 July 2026). This is **alignment evidence**, not a compliance certificate or legal advice.

## Regulatory Mapping

### New Zealand
- Privacy Act 2020 + **IPP 3A** (Privacy Amendment Act 2025) - effective **1 May 2026**  
  Notification required when personal information is collected indirectly.
- Biometric Processing Privacy Code 2025  
  New biometric processing: 3 November 2025  
  Existing biometric processing: 3 August 2026
- Health Information Privacy Code (applies where health / wellbeing data is processed)
- Te Mana Raraunga principles - primary data sovereignty framework

### European Union
- **EU AI Act** - Annex III high-risk obligations enforceable **2 August 2026**
- Relevant high-risk categories:
  - Health decision support
  - Biometrics (remote identification, categorisation, emotion recognition)
  - Critical infrastructure / essential services
- Required: risk management, data governance, technical documentation, human oversight, logging, transparency, post-market monitoring

### International Standards
- **ISO/IEC 42001** - AI Management System (AIMS)  
  Covers AI policy, risk assessment, data governance, human oversight, monitoring, continual improvement
- **SOC 2** - Security, Availability, Confidentiality, Processing Integrity, Privacy  
  Priority for multi-tenant / customer-facing components

### Core Technical Controls (Mandatory)
- Local-first / offline-native processing by default
- Owner-controlled encryption keys
- No silent data exfiltration
- Explicit Human-in-the-Loop (HITL) gates for high-impact and culturally sensitive decisions
- Data residency under New Zealand control

### Scope Notes
- Current systems prioritise offline-native operation and data minimisation.
- Any future multi-tenant or customer-facing features will be assessed against SOC 2 and EU AI Act high-risk requirements before release.

### Limitations
- Not legal advice; not a certification claim.
- Confirm statute application with NZ counsel before commercial shipping claims.
- Agents inform / draft / prepare only; humans advise / sign / file / send / pay.
