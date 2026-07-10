---
name: Onboarding ProtectedRoute reliability
description: How to correctly guard routes for new users who have no onboarding DB row yet.
---

## The rule
`useGetOnboarding` returns `isError: true` (not `data: undefined`) when the API returns 404 — i.e. new users with no row. The ProtectedRoute must check `isError` explicitly and add `retry: false` to the query so the 404 is not retried 3 times.

**Why:** Original code only checked `!onboarding.completed`. For new users, `data` is undefined and `isError` is true — the check was silently skipped, leaving them on protected pages without onboarding.

**How to apply:**
```tsx
const { data: onboarding, isLoading, isError } = useGetOnboarding({
  query: { enabled: !!isSignedIn, retry: false, staleTime: 30_000 }
});

if (isError && !isOnboardingPage) return <Redirect to="/onboarding" />;
```

Also: `handleComplete` in onboarding.tsx must use `mutateAsync` + `await queryClient.invalidateQueries(...)` BEFORE calling `setLocation('/dashboard')`. Otherwise the ProtectedRoute still sees stale `isError: true` and redirects back to onboarding in a loop.
