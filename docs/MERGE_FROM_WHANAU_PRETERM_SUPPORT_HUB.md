# Merge note: whanau-preterm-support-hub → Front_Line_Whanau

**Date:** 2026-07-16  
**Canonical product repo:** [fivepanelhat/Front_Line_Whanau](https://github.com/fivepanelhat/Front_Line_Whanau)  
**Legacy scaffold:** [fivepanelhat/whanau-preterm-support-hub](https://github.com/fivepanelhat/whanau-preterm-support-hub) (redirect / archived)

## Decision

`Front_Line_Whanau` is the single national platform for whānau of preterm twins and frontline service navigation in Aotearoa.  
`whanau-preterm-support-hub` was an earlier Next.js scaffold (v0.1.0) with overlapping vision, cultural principles, and Aether release-preflight work.

To stop dual-tracking:

1. All product development continues **only** in `Front_Line_Whanau`.
2. Unique assets from the hub were ported here (see below).
3. The hub repository README redirects here and the repo is archived.

## Ported from hub

| Asset | Location in this repo |
| ----- | --------------------- |
| Release preflight (Aether-adapted) | `scripts/flw_release_preflight.py` |
| ADR-0001 release guardrails | `docs/adr/0001-aether-release-guardrails.md` |
| Cultural / Te Tiriti framing | Already present; reinforced in README + REALITY.md |

## Not ported (by design)

- Hub `app/` scaffold UI (superseded by `src/app` product surface)
- Hub Jest-only test setup (this repo uses Vitest + Playwright)
- Duplicate CAT congruence / badge noise without product value

## For contributors

- Open issues and PRs against **Front_Line_Whanau** only.
- Live demo: https://front-line-whanau.vercel.app
- Run release preflight before tags:  
  `python scripts/flw_release_preflight.py --version 0.4.0`
