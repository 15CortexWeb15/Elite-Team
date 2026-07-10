---
name: GA analytics pattern
description: How GA event tracking is wired in the Roxel frontend.
---

## The rule
All GA calls go through `src/lib/analytics.ts` — a thin `safeGtag` wrapper that silently no-ops when GA is blocked. Never call `window.gtag` directly in components.

**Why:** Ad blockers remove gtag. Direct calls throw; the wrapper catches silently.

**Named events are on the `GA` object:**
- `GA.tradeSaved(isNew, market)` — journal page after create/update success
- `GA.tradeDeleted()` — journal page after delete success
- `GA.aiAnalysisRequested(period)` — ai-coach page before mutate
- `GA.csvImportCompleted(count)` — TradeImportDialog after import success
- `GA.csvAnalysisRequested()` — TradeImportDialog before analyze fetch
- `GA.onboardingCompleted(data)` — onboarding.tsx after mutateAsync succeeds
- `GA.feedbackSubmitted(type)` — contact.tsx after feedback POST

**Page views:** `trackPageView(path, title)` fired automatically in `ClerkProviderWithRoutes` via `useEffect` on `[location]` change. No per-page instrumentation needed.
