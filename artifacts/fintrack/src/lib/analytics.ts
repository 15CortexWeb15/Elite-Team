/**
 * Roxel Analytics — thin wrapper around gtag (G-5HJDSP39CF).
 * All calls are silent no-ops when GA is not loaded or is ad-blocked.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { gtag: (...args: any[]) => void; dataLayer: unknown[]; }
}

function safeGtag(command: string, ...args: unknown[]) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag(command, ...args);
    }
  } catch { /* GA may be blocked */ }
}

export type TrackParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params?: TrackParams) {
  safeGtag('event', name, params ?? {});
}

export function trackPageView(pagePath: string, pageTitle: string) {
  safeGtag('event', 'page_view', { page_path: pagePath, page_title: pageTitle });
}

// ── Named events — call these at the relevant UI actions ─────────────────────

export const GA = {
  signUpCompleted:       ()                        => trackEvent('sign_up',               { method: 'clerk' }),
  signInCompleted:       (method = 'clerk')        => trackEvent('login',                 { method }),
  onboardingCompleted:   (d: TrackParams)          => trackEvent('onboarding_completed',   d),
  tradeSaved:            (isNew: boolean, market?: string) => trackEvent('trade_saved',   { action: isNew ? 'create' : 'update', market }),
  tradeDeleted:          ()                        => trackEvent('trade_deleted'),
  aiAnalysisRequested:   (period: string)          => trackEvent('ai_analysis_requested', { period }),
  csvImportCompleted:    (count: number)           => trackEvent('csv_import_completed',   { trade_count: count }),
  csvAnalysisRequested:  ()                        => trackEvent('csv_analysis_requested'),
  feedbackSubmitted:     (type: string)            => trackEvent('feedback_submitted',     { feedback_type: type }),
} as const;
