# Deployment Strategy — Front Line Whānau

## Platform Decision: Vercel (recommended) + Docker fallback

### Summary

| Factor | Vercel | Self-hosted Docker |
|---|---|---|
| Setup time | ~30 min | ~4–8 hours |
| NZ data residency | ⚠️ Asia-Pacific region (SYD) | ✅ Full control |
| Cost (early-stage) | Free tier available | VPS/cloud cost |
| Zero-downtime deploys | ✅ Automatic | Manual configuration |
| Preview URLs | ✅ Per PR automatically | Manual setup |
| Edge functions | ✅ Native | Requires Nginx/proxy |
| CI/CD integration | ✅ Git push → deploy | GitHub Actions required |
| Tauri desktop build | N/A (separate) | N/A (separate) |
| Supabase co-location | ✅ Use SYD region | ✅ Can co-locate |
| Sovereign data risk | Low (app is stateless) | None |

### Recommendation

**Use Vercel for the web app** — the app is architecturally stateless (all sensitive data is encrypted client-side or in Supabase, never in the Next.js server layer). Vercel simply serves the app shell. There is no sovereign data risk from hosting the Next.js app on Vercel.

**Keep Supabase in the `ap-southeast-2` (Sydney) region** for NZ data residency.

**Maintain the Docker setup** as the self-hosted fallback for organisations that require full on-premises control (e.g., DHBs, Oranga Tamariki partners).

---

## Task 18 — Environments

### Environment Topology

```
main branch ──→ Production  (front-line-whanau.vercel.app or custom domain)
dev branch  ──→ Staging     (front-line-whanau-staging.vercel.app)
PR branches ──→ Preview     (front-line-whanau-pr-{N}.vercel.app)
```

### Vercel Project Setup

1. Connect GitHub repo to Vercel
2. Set **Production branch**: `main`
3. Set **Preview branches**: all other branches
4. Configure environment variables (see checklist below) per environment

### Environment Variable Scopes in Vercel

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | prod URL | staging URL | localhost URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key | staging anon key | local key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ set | ✅ set | ✅ set |
| `GOOGLE_API_KEY` | ✅ set | ✅ set (quota limited) | optional |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.nz` | preview URL | `http://localhost:3000` |

---

## Task 17 — Environment Variable Checklist

### Required (app will crash without these)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - Format: `https://<project-id>.supabase.co`
  - Source: Supabase Dashboard → Project Settings → API
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (safe to expose)
  - Source: Supabase Dashboard → Project Settings → API → `anon` `public`

### Required for server-side operations (AI agent, admin)

- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Service role key (bypasses RLS — keep secret)
  - Source: Supabase Dashboard → Project Settings → API → `service_role` `secret`
  - ⚠️ Never commit. Never expose to browser.
- [ ] `GOOGLE_API_KEY` — Gemini API key for AI agents
  - Source: [Google AI Studio](https://aistudio.google.com/app/apikey)

### Optional but recommended

- [ ] `NEXT_PUBLIC_APP_URL` — Full canonical URL (used for OG tags, redirects)
  - Production example: `https://frontlinewhanau.nz`
- [ ] `DATABASE_URL` — Direct Postgres connection string (Prisma, if used)
  - Source: Supabase Dashboard → Project Settings → Database → Connection string

### Validation

The app validates all required vars on startup via `src/lib/env.ts`.
A missing required variable will produce a clear error with the missing key name.

---

## Task 19 — Monitoring & Logging Strategy

### Principles

- **No third-party analytics** without user consent (aligns with SOVEREIGN-DATA-POLICY.md)
- **Server logs only** — no client-side tracking
- **Error reporting** — structural errors only, never personal data

### Chosen Stack (zero-cost to start)

| Concern | Tool | Why |
|---|---|---|
| Uptime / availability | `/api/health` + Vercel Analytics (anonymous) | Already built |
| Server errors | Vercel Function Logs (built-in) | No config needed |
| Client-side errors | `global-error.tsx` captures + logs to console | Already built |
| Structured logging | `pino` (lightweight, JSON output) | Production-grade |
| Future alerting | Vercel → Slack webhook (opt-in) | Simple threshold alerts |

### What Is Never Logged

- Passphrase fragments or derived keys
- Journal entry content
- Personal health information
- Consent decisions (tracked locally in audit trail only)

---

## Docker Deployment (self-hosted fallback)

The existing `Dockerfile` + `docker-compose.yml` are production-ready.

For Railway or Fly.io self-hosted:

```bash
# Build and push
docker build -t front-line-whanau .

# Run with required env vars
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  -e GOOGLE_API_KEY=$GOOGLE_API_KEY \
  front-line-whanau
```
