# FinTrack

A professional trading journal SaaS — dense, distraction-free environment for serious traders. Track performance, discover your edge, and let AI surface the patterns you're missing.

## Run & Operate

- Frontend (Vite dev): managed by the `FinTrack Frontend` workflow
- API server (Express): managed by the `API Server` workflow
- `pnpm install` — install all workspace dependencies
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to dev DB (run after schema edits)

## Environment Variables

- `DATABASE_URL` — auto-managed by Replit (runtime-managed, do not set manually)
- `CLERK_SECRET_KEY` — Clerk secret key (external Clerk account, set as env var)
- `CLERK_PUBLISHABLE_KEY` / `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (same value, set as env var)
- `GROQ_API_KEY` — Groq AI key for AI coach feature (set as env var)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS 4, Wouter (routing), TanStack Query
- API: Express 5, Clerk Express middleware, pino logging
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (external account — `pk_test` / `sk_test` dev keys)
- Validation: Zod, `drizzle-zod`
- API codegen: Orval (OpenAPI → Zod + React hooks)
- Build: esbuild

## Where things live

- `artifacts/fintrack/` — React frontend (Vite)
- `artifacts/api-server/` — Express API server
- `lib/db/src/schema/` — Drizzle schema (source of truth for DB shape)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated React query hooks (do not edit manually)
- `lib/api-zod/` — generated Zod schemas (do not edit manually)

## Architecture decisions

- Clerk proxy middleware (`artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`) is production-only — in dev, the frontend talks to Clerk directly; `VITE_CLERK_PROXY_URL` is empty in dev and that's correct.
- `VITE_CLERK_PUBLISHABLE_KEY` is passed to the Vite frontend via the `define` block in `artifacts/fintrack/vite.config.ts` because Vite 7 does not automatically expose `process.env.VITE_*` variables that aren't in `.env` files.
- API routes live under `/api/*`; the frontend is served at `/`.

## Gotchas

- After editing `lib/db/src/schema/`, run `pnpm --filter @workspace/db run push` to apply changes to the dev DB.
- After editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` to regenerate client hooks.
- Do not edit files in `lib/api-client-react/` or `lib/api-zod/` directly — they are auto-generated.
- The "Clerk has been loaded with development keys" console warning is expected in dev. Do not change the keys.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
