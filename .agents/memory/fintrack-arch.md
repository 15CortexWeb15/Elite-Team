---
name: FinTrack Architecture
description: Full-stack trading journal SaaS — key patterns, auth wiring, env setup, and backend conventions to keep consistent.
---

# FinTrack Architecture

## Stack
- pnpm monorepo: `artifacts/fintrack` (React 19 + Vite 7), `artifacts/api-server` (Express 5), `lib/db` (Drizzle + PostgreSQL)
- Auth: External Clerk (user's own account, `pk_test`/`sk_test` dev keys)
- AI: Groq API (`GROQ_API_KEY` secret)

## Clerk wiring (critical)

- `CLERK_SECRET_KEY` and `GROQ_API_KEY` are **Replit Secrets** (encrypted, not in `.replit`)
- `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` are plain env vars (public keys, safe in `.replit`)
- The Clerk proxy middleware (`artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`) is **production-only** — it's a no-op in dev. `VITE_CLERK_PROXY_URL` should be unset in dev.
- Frontend uses `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` directly (NOT `publishableKeyFromHost`) — using `publishableKeyFromHost` on a Replit domain causes it to resolve to Replit-managed Clerk infrastructure instead of the user's external Clerk tenant.
- `VITE_CLERK_PUBLISHABLE_KEY` is injected via `define` in `artifacts/fintrack/vite.config.ts` because Vite 7 does not automatically expose `process.env.VITE_*` that aren't in `.env` files.
- The `define` for `VITE_CLERK_PROXY_URL` must be omitted (not set to `''`) when unset — an empty string is treated as an explicit proxy URL by Clerk and breaks dev auth.

**Why:** `publishableKeyFromHost` from `@clerk/react/internal` detects the `*.replit.dev` hostname and derives a Replit-managed Clerk key, ignoring the fallback external key entirely.

**How to apply:** Any time Clerk wiring is touched, verify these two points: (1) frontend uses direct env var, not hostname derivation; (2) `VITE_CLERK_PROXY_URL` define is conditional on the var being set.

## DB

- Schema in `lib/db/src/schema/` — after edits, run `pnpm --filter @workspace/db run push`
- `DATABASE_URL` is runtime-managed by Replit — never set manually

## API codegen

- Edit `lib/api-spec/openapi.yaml`, then run `pnpm --filter @workspace/api-spec run codegen`
- Never edit `lib/api-client-react/` or `lib/api-zod/` directly
