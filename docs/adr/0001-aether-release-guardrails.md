# ADR-0001: Aether release-preflight guardrails (ported from hub)

**Status:** Accepted 
**Date:** 2026-07-06 (origin) | **Merged into Front_Line_Whanau:** 2026-07-16 
**Deciders:** Wayne Roberts (Founder, Coastal Alpine Tech)

## Context

`whanau-preterm-support-hub` adopted Aether-style release-preflight to prevent sensitive-file leakage, tag collisions, and non-monotonic releases on a public health-adjacent platform.

`Front_Line_Whanau` is now the **canonical** national platform. The same failure modes apply here (public repo, community trust, Te Mana Raraunga, agent-assisted development).

## Decision

1. Keep **Front_Line_Whanau** as the only product repository.
2. Ship `scripts/flw_release_preflight.py` (adapted from hub / Aether) as the mandatory pre-tag gate.
3. Archive `whanau-preterm-support-hub` with a redirect README.

## Consequences

- Single source of truth for code, issues, and releases.
- Stronger kaitiakitanga over whanau-adjacent documents before public tags.
- Contributors stop opening PRs against the legacy hub scaffold.
