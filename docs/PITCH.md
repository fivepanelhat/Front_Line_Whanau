# Front Line Whānau — Partnership & Investment One-Pager

**A sovereign, privacy-first support platform for whānau of preterm babies navigating Aotearoa's frontline services.**

---

## The Problem

Every year in Aotearoa New Zealand, thousands of whānau enter the NICU journey — and a fragmented maze of services. Health NZ, Little Miracles Trust, Plunket, WINZ, iwi providers, and dozens of regional organisations each hold a piece of the support puzzle. Parents in the highest-stress weeks of their lives are left to assemble it themselves. Māori, Pacific, and rural whānau face the widest gaps.

## The Solution

One platform, two portals:

- **Whānau Portal** — plain-language answers, financial-grant eligibility checking (Best Start, WINZ, Disability Allowance), a national services directory, peer stories, and a medical-jargon translator. Available in Te Reo Māori, Gagana Samoa, and Lea Faka-Tonga.
- **Practitioner Portal** — encrypted clinical notes (Taonga Vault: passphrase-based, encrypted client-side, never readable by the server), moderation tools, and a human-in-the-loop review queue for every AI recommendation that matters.

## Why It's Different

1. **Data sovereignty by design.** Client-side encryption, Māori data-sovereignty policy, NZ-hosted data, and a published Child Protection Policy. Nothing leaves the whānau's control.
2. **AI with a human safety net.** A LangGraph multi-agent system (research, financial eligibility, advocacy, cultural safety, clinical triage) where sensitive outputs are gated behind practitioner review — not shipped straight to vulnerable users.
3. **Culturally grounded.** Te Tiriti-aligned governance, cultural-safety review built into content moderation, multilingual from day one.
4. **Open source.** MIT-licensed, auditable, community-extendable.

## Traction & Technical Readiness

- Production build, CI pipeline (type-check, lint, 179 unit tests, Playwright E2E, build gate) — all green
- Live Supabase (Postgres + pgvector RAG) database, provisioned and health-checked end-to-end
- Ships as Web, PWA, and Tauri desktop app (Windows/Linux)
- Security hardening: authenticated + rate-limited API surface, RLS on every table, strict CSP

## The Ask

We're seeking **partnership and seed support** to move from beta to national rollout:

- **Health/NGO partners** — pilot integrations with NICU units, Little Miracles Trust, Plunket, and iwi health providers
- **Funding** — 12 months of runway for a small core team: clinical-safety review, Te Reo content expansion, and directory onboarding for the ~200 organisations whānau actually need
- **Advisors** — Māori data governance, neonatal clinical practice

## Contact

**fivepanelhat** — fivepanelhat@gmail.com
Repository: https://github.com/fivepanelhat/Front_Line_Whanau
