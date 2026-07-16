# Sovereign Data Policy

## Te Mana Raraunga - Maori Data Sovereignty

The **Front Line Families Support Hub NZ** is designed in alignment with the principles of [Te Mana Raraunga - The Maori Data Sovereignty Network](https://www.temanararaunga.maori.nz/) and the rights affirmed under **Te Tiriti o Waitangi**.

---

## Core Principles

### 1. Rangatiratanga (Authority)

- **Whanau control their own data.** Every piece of personal, health, or financial information belongs to the whanau who created it.
- Users have the **right to access, export, and delete** all their data at any time.
- **No data is collected, processed, or shared** without explicit informed consent.
- Consent can be **revoked** at any time, and revocation takes immediate effect.

### 2. Whakapapa (Relationships)

- Data is understood within its **relational context** - it connects to people, places, and stories.
- The platform respects that data about whanau is **collectively significant**, not just individually relevant.
- Extended whanau access is supported through **family consent flows**, not assumed.

### 3. Whanaungatanga (Obligations)

- Those who handle data have **obligations of care** (kaitiakitanga) toward the data subjects.
- The platform **minimises data collection** - we only ask for what is needed.
- Data handlers (developers, maintainers) are bound by the [Code of Conduct](../CODE_OF_CONDUCT.md).

### 4. Kotahitanga (Collective Benefit)

- Aggregated, anonymised insights may be used to **advocate for better services** for whanau - but only with collective consent and never at the individual level.
- The platform aims to **reduce barriers**, not create new power imbalances.

---

## Technical Implementation

### Client-Side-First Architecture

| Principle | Implementation |
|-----------|---------------|
| **Data stays on device** | Journal entries and vault documents are encrypted and stored locally by default |
| **Encryption at rest** | AES-256-GCM via Web Crypto API; keys derived from user passphrase (PBKDF2) |
| **Server never sees plaintext** | If sync is enabled, only encrypted blobs are transmitted and stored |
| **No analytics without consent** | No third-party tracking. No data leaves the browser without explicit approval |

### Consent Model

```
Scope Description Default
------------------------------------------------------------------
journal.read Read journal entries Granted (local)
journal.write Create/edit journal entries Granted (local)
journal.sync Sync journal to server Denied
vault.store Store documents locally Granted (local)
vault.sync Sync documents to server Denied
ai.process AI analysis of user data Denied
ai.execute AI actions on behalf of user Denied
directory.share Share directory bookmarks Denied
```

- All **server-side scopes** default to **Denied**
- Consent is requested via a **clear, trauma-informed dialog** explaining what, why, and how to revoke
- Every consent decision is recorded in a **tamper-evident audit trail**

### Data Residency

- Local data: stored on the user's device (IndexedDB / localStorage)
- Synced data: stored in **Supabase** with configurable region
- The platform supports **New Zealand-based hosting** for full data sovereignty
- No data is transferred to jurisdictions outside the user's control without consent

---

## User Rights

Under the **Privacy Act 2020** and this policy, users have the right to:

1. **Be informed** - Know what data is collected, why, and how it is used
2. **Access** - View all data held about them
3. **Correct** - Update or correct their data
4. **Delete** - Request complete deletion of their data
5. **Export** - Download all their data in a portable format
6. **Revoke consent** - Withdraw consent for any processing at any time
7. **Complain** - Lodge a complaint with the Office of the Privacy Commissioner

---

## Compliance

| Legislation | Status |
|------------|--------|
| Privacy Act 2020 (NZ) | [OK] Compliant by design |
| Health Information Privacy Code 2020 | [OK] Health data encrypted, consent-gated |
| Te Mana Raraunga Principles | [OK] Embedded in architecture |
| GDPR (reference) | [OK] Exceeds minimum requirements |

---

> *"Ko au ko koe, ko koe ko au" - I am you, you are me.*
> Data about whanau belongs to whanau.
