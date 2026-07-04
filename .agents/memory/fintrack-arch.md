---
name: FinTrack Architecture
description: Key decisions and conventions for the FinTrack trading journal SaaS app.
---

## Stack
- Frontend: React + Vite at `/` (artifact: `fintrack`), Clerk auth, Wouter routing, TanStack Query, Recharts, shadcn/ui
- Backend: Express 5 API server at port 8080, proxied as `/api/*`, built with esbuild
- DB: PostgreSQL via Drizzle ORM (`lib/db`), schema in `lib/db/src/schema/`
- Auth: Replit-managed Clerk tenant. Session cookies (no Bearer tokens).

## Auth conventions
- Frontend: `ClerkProvider` with `publishableKeyFromHost(hostname, VITE_CLERK_PUBLISHABLE_KEY)`. Proxy via `VITE_CLERK_PROXY_URL`.
- Backend: `clerkMiddleware` + `requireAuth` helper in `artifacts/api-server/src/lib/auth.ts`
- All API routes under `/api/` use `requireAuth`; `getUserId(req)` returns the Clerk userId.
- Clerk proxy path is handled by `clerkProxyMiddleware` before the main CORS middleware.

## Backend conventions
- Route path prefix: Express routes do NOT include `/api` — the root router adds that prefix.
- `res.status(N).json(data); return;` pattern — never `return res.status().json(...)`.
- `req.params.id` is string — parse numeric IDs with `parseInt` / Zod schema.
- Drizzle `numeric` columns store as strings; cast to String() on insert/update, Number() on read.
- `toDateStr(d: string | Date)` helper in trades.ts converts date values to ISO `YYYY-MM-DD` strings for Drizzle's `date` columns with `mode: "string"`.

## CORS
- `artifacts/api-server/src/app.ts` uses an origin allowlist (not `origin: true`).
- Allowlist sources: `ALLOWED_ORIGINS` env var (comma-separated) or auto-detect from `REPLIT_DEV_DOMAIN` / `REPLIT_DEPLOYMENT_URL`.

**Why:** `origin: true` + `credentials: true` would reflect any origin and allow session-cookie-authenticated cross-origin requests — a data exposure risk.

## DB indexes
- `trades`: index on `user_id` and `trade_date`
- `ai_analysis`: index on `user_id`
- `feedback`: index on `user_id`

## AI Coach
- Uses Groq API (`GROQ_API_KEY` secret), model `llama-3.3-70b-versatile`.
- Route: `POST /api/ai/analysis`, `GET /api/ai/analysis/latest`
- Fails gracefully with 503 if `GROQ_API_KEY` not set.
- Prompt requests JSON response directly; falls back to regex JSON extraction if wrapped in markdown.

## Computed trade fields
- `profitLoss`, `profitLossPercent`, `riskReward`, `result` computed server-side in `tradeCalc.ts` on every create/update.
- Server stores computed values so analytics queries are fast (no runtime computation).

## Generated code
- `lib/api-client-react/src/generated/` — React Query hooks, regenerate with codegen if OpenAPI spec changes.
- `lib/api-zod/src/generated/` — Zod validation schemas for backend routes.
- Codegen command: `pnpm run codegen` from workspace root.
