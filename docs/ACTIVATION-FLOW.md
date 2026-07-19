# Activation Flow - Audit -> Playbook -> Weaver

How a whānau request moves through the Activation Auditor inside Aether,
where human-in-the-loop (HITL) review happens, and how cultural safety is
maintained end to end.

See also: [AETHER-OPERATING-PRINCIPLES.md](AETHER-OPERATING-PRINCIPLES.md),
the playbook schema at `src/ai/schemas/kaitiaki-playbook.ts`, and the agent
at `src/ai/agents/activation-auditor.ts`.

## The flow

```
whānau input -- consent gate -- Aether Summit (supervisor)
 | deterministic activation route
 
 Activation Auditor
 sanitise -> crisis check -> audit -> playbook
 |
 
 Guardrails
 (disclaimers, output gate, HITL flag)
 |
 ------------------------------
 
 playbook rendered async HITL queue
 (UI / chat, markdown) (financial & cultural plays)
 |
 (opt-in, consent-gated)
 Narrative Weaver
 (cultural safety review before delivery)
```

## Step by step

1. **Input (privacy-preserving).** A whānau member fills the short intake
 (every field optional: gestational context, need areas, cultural priority,
 coarse urban/rural location) or simply types "we just got home with our
 twins and I don't know where to start". No names, NHI numbers, or contact
 details are requested - the schema has no fields to hold them.

2. **Consent gate.** Without explicit AI-processing consent, the graph
 returns a consent request and nothing is processed.

3. **Supervisor routing (Aether Summit).** A structured `auditInput` in
 context, or open-ended "where do I start" language, routes
 deterministically to the Activation Auditor - no LLM round-trip, so
 routing for this flow is auditable and identical every time.

4. **Sanitisation.** Free text is scrubbed of emails, phone numbers, and
 NHI-shaped tokens before any further processing (data minimisation at
 the boundary).

5. **Crisis check (safety short-circuit).** If crisis language is detected,
 urgent contacts (111, Healthline 0800 611 116, 1737) are placed at the
 top of the output, the playbook is flagged `pending_review`, and the
 `showUrgentHelp` banner is raised. Urgent contacts are never delayed by
 review.

6. **The audit.** Deterministic, curated logic (no model call) merges
 explicit needs with needs inferred from the sanitised text, then selects
 plays from a curated library of trusted NZ providers:
 - kaupapa Māori priority adds the cultural play (Whānau Ora pathways);
 - rural whānau only receive remote-accessible pathways;
 - the multiples community play is always offered (core kaupapa);
 - every play has 1-4 steps with effort estimates and named providers.

7. **HITL checkpoints.** Financial plays (entitlements) and cultural plays
 (tikanga guidance) are `reviewRequired: true`, which marks the whole
 playbook `pending_review` and sets `requiresHumanReview` in graph state.
 Review is **asynchronous and transparent**: the playbook is delivered
 immediately with a visible "this play will be confirmed by our support
 team" notice on flagged plays, and the review queue picks up the flag.
 Blocking delivery would also hold back urgent content, so it is not done.

8. **Guardrails.** The standard output gate runs over the rendered
 playbook, and the platform disclaimer is always present (it is a field
 of the playbook itself, so no consumer can drop it).

9. **Weaver trigger (opt-in).** If the journey is emotionally heavy or
 culturally grounded, the playbook carries a `weaverTrigger` - a theme,
 audience, and cultural elements only, never personal details. The UI
 offers it as an invitation ("we can weave a short story for your
 whānau"). Nothing is generated unless the whānau says yes:
 `consentRequired` is a literal `true` in the schema.

10. **Cultural safety on the story.** When triggered, the Narrative Weaver's
 output passes cultural safety review (Toroa / cultural navigator, plus
 HITL for anything involving tikanga, karakia, or whakapapa) before it
 reaches the whānau.

## Worked example

**Input:** *"Our twins are in NICU in New Plymouth, we're on one income and
I'm exhausted. We'd love kaupapa Māori support."* (rural, te ao Māori
priority)

- Sanitised; no crisis terms -> no urgent banner.
- Needs resolved: `nicu_navigation`, `financial`, `emotional`, `cultural`,
 plus `twins_multiples` (always offered).
- Playbook: five plays, each with steps like "Ask your unit for a Neonatal
 Trust support pack" *(5 min)* and "Check Best Start - paid per child, so
 twins qualify twice" *(10 min online)*. Rural context keeps every
 pathway phone/online-reachable.
- Financial and cultural plays render with the review notice and the
 playbook enters the HITL queue as `pending_review`.
- `weaverTrigger` is set (theme: *strength and connection through the NICU
 journey*, cultural elements: *manaakitanga, whanaungatanga*) and rendered
 as an invitation, not an action.
- The disclaimer block closes the playbook.

> **Disclaimer:** Playbooks are general guidance, not medical, financial,
> legal, or cultural advice. In an emergency call 111; for health concerns
> call Healthline 0800 611 116.
