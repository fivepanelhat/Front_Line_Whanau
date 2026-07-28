# Security Runbook: Secrets & Token Management

This document outlines the standard operating procedures for managing, rotating, and securing sensitive credentials in the Front Line Whānau project.

## 1. Secrets Inventory

| Secret Name | Location | Purpose | Rotation Frequency |
|-------------|----------|---------|--------------------|
| `API_SECRET_KEY` | Vercel Environment / `.env` | Secures internal backend APIs from public access. | Every 90 days or upon developer offboarding. |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Environment / `.env` | Server-side admin access to Supabase (bypasses RLS). | Every 180 days or upon suspect breach. |
| `JWT_SECRET` | Vercel Environment / `.env` | Signs internal JSON Web Tokens. | Annually. |

> [!WARNING]
> **NEVER** prefix sensitive keys with `NEXT_PUBLIC_`. The only keys that should have this prefix are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 2. Rotation Procedure

### Rotating `API_SECRET_KEY` (Zero-Downtime)
1. Generate a new high-entropy string (e.g., `openssl rand -base64 32`).
2. Update the `API_SECRET_KEY` environment variable in Vercel to a JSON array or comma-separated string containing BOTH the old and new keys (e.g., `old_key,new_key`).
3. Update `src/proxy.ts` to accept either key during the transition window.
4. Deploy the application.
5. Update all client-side or external services to use the `new_key`.
6. Once metrics show no usage of `old_key`, remove it from Vercel and redeploy.

### Rotating `SUPABASE_SERVICE_ROLE_KEY`
1. Navigate to your Supabase Project Dashboard -> Settings -> API.
2. Click "Roll Service Role Key". This will invalidate the old key immediately.
3. Update the `SUPABASE_SERVICE_ROLE_KEY` environment variable in Vercel.
4. Trigger a new deployment on Vercel immediately.
*(Note: This involves brief downtime. Schedule during low-traffic windows.)*

## 3. Audit Logs
We actively log high-risk actions using `createAuditLog()` in `src/ai/security.ts`.
- `REVIEW_DECISION`: Logged when a moderator approves/rejects an AI response.
- `FEEDBACK_EXPORT`: Logged when the feedback CSV is downloaded.
- `FHIR_ACCESS`: Logged when patient data is queried.

*Review logs weekly via your logging provider (e.g., Vercel Logs, Datadog).*

## Security Notifications

| Channel | Response |
| ------- | -------- |
| Dependabot (npm + Actions) | Weekly; merge security updates first |
| npm audit / CI | Zero high/critical on `main` |
| Secret rotation | Follow runbook tables above |
| CSP / rate limits / RLS | Keep defaults strict; review on every auth change |

## Active patches (2026-07)

| Finding | Mitigation |
| ------- | ---------- |
| Workflow token scope | `permissions: contents: read` on CI |
| Supply chain | Dependabot enabled; lockfile commits required |

## Fleet security principles

- **No silent exfiltration** of personal or tenant operational data
- Prefer **local-first** processing; third-party AI only with explicit operator configuration and UI/docs disclosure
- Report vulnerabilities via GitHub Security Advisories or the maintainer contact on the org profile
- High-stakes production changes require human approval (HITL)

## Data sales and third parties

- **We do not sell personal information or customer operational data to third parties.**
- Optional AI or cloud services run only when configured by the operator; processing must be disclosed (in-product and/or docs).
- Prefer local-first paths so third-party transfer is unnecessary by default.

## NZ Privacy Act and Te Mana Raraunga

- Design in accordance with the **Privacy Act 2020**.
- Operate in accordance with **Te Mana Raraunga** principles for Māori data sovereignty interests.
- Align AI features with **NZ AI safety** / responsible AI expectations (HITL, transparency, no silent training on private content).

