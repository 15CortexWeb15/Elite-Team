---
name: CORS & deployment origin fix
description: How CORS was configured to allow Replit dev + deployment origins without insecure wildcards
---

## Rule
Never use a blanket `*.replit.app` wildcard with `credentials: true` in CORS config — this allows any other Replit user's app to make credentialed requests to the API.

## Approach
Use `REPLIT_DOMAINS` env var (comma-separated hostnames assigned to this specific repl — present in both dev and deployment) plus `REPLIT_DEV_DOMAIN` and `REPLIT_DEPLOYMENT_URL` to build an exact-match allowlist. Normalise origins with `new URL(origin).origin` before comparing.

**Why:** `REPLIT_DEPLOYMENT_URL` was not reliably set at runtime in the deployed container, causing CORS to block all API calls on the deployed frontend. `REPLIT_DOMAINS` solves this — it is always populated with the repl's actual domains.

**How to apply:** Any time CORS is touched on the API server, rebuild the allowlist from these env vars. Never use startsWith or partial-match on origins; always exact-match after URL normalisation.

## Env vars available (confirmed present)
- `REPLIT_DEV_DOMAIN` — dev preview domain
- `REPLIT_DOMAINS` — comma-separated list of all domains for this repl (dev + deployment)
- `REPLIT_DEPLOYMENT_URL` — deployment URL (may be unset in deployed container; prefer REPLIT_DOMAINS)
- `REPL_OWNER`, `REPL_ID` — always available
- `REPL_SLUG` — NOT observed in env; do not rely on it
