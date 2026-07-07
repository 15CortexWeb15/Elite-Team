---
name: FinTrack Architecture
description: Full-stack trading journal SaaS — key patterns, auth wiring, env setup, and backend conventions to keep consistent.
---

# FinTrack Architecture

## Stack
- pnpm monorepo: `artifacts/fintrack` (React 19 + Vite 7), `artifacts/api-server` (Express 5), `lib/db` (Drizzle + PostgreSQL)
- Auth: **Replit-managed Clerk** (provisioned via `setupClerkWhitelabelAuth()`)
- AI: Groq API (`GROQ_API_KEY` secret)

## Clerk wiring (critical)

### Frontend
- `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` are all **Replit Secrets** (encrypted).
- Frontend derives the publishable key via `publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)` from `@clerk/react/internal` — this is required for Replit-managed Clerk.
- `ClerkApiSetup` component (inside `ClerkProvider` + `QueryClientProvider`) calls `setAuthTokenGetter(() => getToken())` via `useAuth()`. This wires Clerk session tokens into every `customFetch` call as `Authorization: Bearer <token>`. **Without this, every protected API route returns 401.**
- `ClerkQueryClientCacheInvalidator` clears React Query cache on user change (sign-in/sign-out).
- The Clerk proxy middleware is **production-only** — no-op in dev. `VITE_CLERK_PROXY_URL` must be unset in dev.

### Backend
- `clerkMiddleware()` with **no arguments** — reads `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from env vars directly. Do NOT use `publishableKeyFromHost` on the backend in dev; it resolves incorrectly and causes 401s.
- `requireAuth` middleware checks `auth().userId` — returns 401 if no valid Bearer token.
- Stock routes (`/api/stocks/*`) have `requireAuth` removed — market data is public.

**Why the `ClerkApiSetup` pattern matters:** The generated `customFetch` in `@workspace/api-client-react` has a `setAuthTokenGetter` hook but it is not wired by default. Every generated query/mutation uses `customFetch`, so without this setup no authenticated request ever includes a token.

**How to apply:** Any time auth is touched — new routes, new query hooks, or Clerk config changes — verify: (1) `ClerkApiSetup` is mounted inside both `ClerkProvider` and `QueryClientProvider`, (2) backend uses bare `clerkMiddleware()`.

## DB
- Schema in `lib/db/src/schema/` — after edits, run `pnpm --filter @workspace/db run push`
- `DATABASE_URL` is runtime-managed by Replit — never set manually

## API codegen
- Edit `lib/api-spec/openapi.yaml`, then run `pnpm --filter @workspace/api-spec run codegen`
- Never edit `lib/api-client-react/` or `lib/api-zod/` directly
