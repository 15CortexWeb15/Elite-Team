import React, { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser, useAuth } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { dark } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider, useTheme } from "next-themes";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useGetOnboarding, getGetOnboardingQueryKey, setAuthTokenGetter } from "@workspace/api-client-react";
import { trackPageView } from "./lib/analytics";

// ── Page lazy imports ─────────────────────────────────────────────────────────
const HomePage       = React.lazy(() => import("./pages/home"));
const DashboardPage  = React.lazy(() => import("./pages/dashboard"));
const JournalPage    = React.lazy(() => import("./pages/journal"));
const AnalyticsPage  = React.lazy(() => import("./pages/analytics"));
const AiCoachPage    = React.lazy(() => import("./pages/ai-coach"));
const CalendarPage   = React.lazy(() => import("./pages/calendar"));
const ProfilePage    = React.lazy(() => import("./pages/profile"));
const SettingsPage   = React.lazy(() => import("./pages/settings"));
const FeedbackPage   = React.lazy(() => import("./pages/feedback"));
const OnboardingPage = React.lazy(() => import("./pages/onboarding"));
const StocksPage     = React.lazy(() => import("./pages/stocks"));
const NotFound       = React.lazy(() => import("./pages/not-found"));
const VideoTemplate  = React.lazy(() => import("./components/video/VideoTemplate"));
// Public content pages
const PrivacyPage       = React.lazy(() => import("./pages/privacy"));
const TermsPage         = React.lazy(() => import("./pages/terms"));
const AiDisclaimerPage  = React.lazy(() => import("./pages/ai-disclaimer"));
const AboutPage         = React.lazy(() => import("./pages/about"));
const ContactPage       = React.lazy(() => import("./pages/contact"));
const BlogPage          = React.lazy(() => import("./pages/blog"));

// ── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/':              'Roxel — AI Trading Journal',
  '/dashboard':     'Overview — Roxel',
  '/journal':       'Trade Journal — Roxel',
  '/analytics':     'Analytics — Roxel',
  '/stocks':        'Markets — Roxel',
  '/ai-coach':      'AI Coach — Roxel',
  '/calendar':      'Calendar — Roxel',
  '/profile':       'Profile — Roxel',
  '/settings':      'Settings — Roxel',
  '/feedback':      'Feedback — Roxel',
  '/onboarding':    'Setup — Roxel',
  '/sign-in':       'Sign In — Roxel',
  '/sign-up':       'Get Started — Roxel',
  '/privacy':       'Privacy Policy — Roxel',
  '/terms':         'Terms of Service — Roxel',
  '/ai-disclaimer': 'AI Disclaimer — Roxel',
  '/about':         'About — Roxel',
  '/contact':       'Contact — Roxel',
  '/blog':          'Blog — Roxel',
};

// ── Clerk setup ───────────────────────────────────────────────────────────────
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
}

function buildClerkAppearance(isDark: boolean) {
  return {
    theme: isDark ? dark : undefined,
    cssLayerName: "clerk",
    options: {
      logoPlacement: "inside" as const,
      logoLinkUrl: basePath || "/",
      logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    },
    variables: isDark
      ? {
          colorPrimary: "hsl(0 0% 93%)",
          colorForeground: "hsl(0 0% 93%)",
          colorMutedForeground: "hsl(0 0% 65%)",
          colorDanger: "hsl(0 84% 60%)",
          colorBackground: "hsl(0 0% 7%)",
          colorInput: "hsl(0 0% 12%)",
          colorInputForeground: "hsl(0 0% 93%)",
          colorNeutral: "hsl(0 0% 20%)",
          fontFamily: "var(--app-font-sans)",
          borderRadius: "0.5rem",
        }
      : {
          colorPrimary: "hsl(222 47% 11%)",
          colorForeground: "hsl(222 47% 11%)",
          colorMutedForeground: "hsl(215 16% 47%)",
          colorDanger: "hsl(0 72% 51%)",
          colorBackground: "hsl(210 20% 98%)",
          colorInput: "hsl(214 32% 92%)",
          colorInputForeground: "hsl(222 47% 11%)",
          colorNeutral: "hsl(215 20% 65%)",
          fontFamily: "var(--app-font-sans)",
          borderRadius: "0.5rem",
        },
    elements: {
      rootBox: "w-full flex justify-center",
      cardBox: "bg-card rounded-xl border border-border w-[440px] max-w-full shadow-xl overflow-hidden",
      card: "!shadow-none !border-0 !bg-transparent !rounded-none",
      footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
      headerTitle: "text-foreground font-bold",
      headerSubtitle: "text-muted-foreground",
      socialButtonsBlockButtonText: "text-foreground font-medium",
      formFieldLabel: "text-foreground font-medium",
      footerActionLink: "text-primary hover:text-primary/90 font-medium",
      footerActionText: "text-muted-foreground",
      dividerText: "text-muted-foreground",
      identityPreviewEditButton: "text-primary",
      formFieldSuccessText: "text-profit",
      alertText: "text-destructive",
      logoBox: "mb-6 flex justify-center",
      logoImage: isDark ? "h-8 w-auto filter invert" : "h-8 w-auto",
      socialButtonsBlockButton: "border border-border hover:bg-muted/50 bg-background text-foreground transition-colors",
      formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors",
      formFieldInput: "bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
      footerAction: "border-t border-border mt-4 pt-4",
      dividerLine: "bg-border",
      alert: "bg-destructive/10 border border-destructive/20 text-destructive",
      badge: "!hidden",
      developmentBadge: "!hidden",
      otpCodeFieldInput: "bg-input border-border focus:ring-ring",
      formFieldRow: "mb-4",
      main: "p-6 sm:p-8",
    },
  };
}

// ── Auth page wrappers ────────────────────────────────────────────────────────
function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/dashboard`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/onboarding`} />
    </div>
  );
}

// ── Global loading spinner ────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Loading" />
    </div>
  );
}

// ── Clerk ↔ React Query wiring ────────────────────────────────────────────────
function ClerkApiSetup() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

// ── Home redirect ─────────────────────────────────────────────────────────────
function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/dashboard" /></Show>
      <Show when="signed-out"><HomePage /></Show>
    </>
  );
}

// ── Protected route wrapper ───────────────────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoaded, isSignedIn } = useUser();
  const { data: onboarding, isLoading: isAuthLoading, isError: isOnboardingError } = useGetOnboarding({
    query: {
      enabled: !!isSignedIn,
      queryKey: getGetOnboardingQueryKey(),
      retry: false,          // Don't retry 404 (new user with no onboarding row)
      staleTime: 30_000,     // Cache onboarding status for 30 s
    },
  });
  const [location] = useLocation();
  const isOnboardingPage = location === '/onboarding';

  // Wait for Clerk to load + onboarding status to resolve
  if (!isLoaded || (isSignedIn && isAuthLoading)) {
    return <LoadingSpinner />;
  }

  // Not authenticated → sign in
  if (!isSignedIn) {
    return <Redirect to="/sign-in" />;
  }

  // New user: no onboarding row (404 → isError) → send to onboarding
  if (isOnboardingError && !isOnboardingPage) {
    return <Redirect to="/onboarding" />;
  }

  // Has a row but hasn't completed → onboarding
  if (onboarding && !onboarding.completed && !isOnboardingPage) {
    return <Redirect to="/onboarding" />;
  }

  // Already completed, but on onboarding page → dashboard
  if (onboarding?.completed && isOnboardingPage) {
    return <Redirect to="/dashboard" />;
  }

  // Onboarding page renders without AppLayout
  if (isOnboardingPage) {
    return (
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    );
  }

  return (
    <AppLayout>
      <ErrorBoundary inline>
        <Component />
      </ErrorBoundary>
    </AppLayout>
  );
}

// ── Main router ───────────────────────────────────────────────────────────────
function ClerkProviderWithRoutes() {
  const [location, setLocation] = useLocation();
  const { resolvedTheme } = useTheme();
  const clerkAppearance = buildClerkAppearance(resolvedTheme !== 'light');

  // Update document.title and fire GA page_view on every route change
  useEffect(() => {
    const title = PAGE_TITLES[location] ?? 'Roxel';
    document.title = title;
    trackPageView(location, title);
  }, [location]);

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkApiSetup />
        <ClerkQueryClientCacheInvalidator />
        <React.Suspense fallback={<LoadingSpinner />}>
          <Switch>
            {/* ── Public routes ── */}
            <Route path="/"              component={HomeRedirect} />
            <Route path="/sign-in/*?"   component={SignInPage} />
            <Route path="/sign-up/*?"   component={SignUpPage} />
            <Route path="/privacy"       component={PrivacyPage} />
            <Route path="/terms"         component={TermsPage} />
            <Route path="/ai-disclaimer" component={AiDisclaimerPage} />
            <Route path="/about"         component={AboutPage} />
            <Route path="/contact"       component={ContactPage} />
            <Route path="/blog"          component={BlogPage} />

            {/* ── Protected routes ── */}
            <Route path="/onboarding" component={() => <ProtectedRoute component={OnboardingPage} />} />
            <Route path="/dashboard"  component={() => <ProtectedRoute component={DashboardPage} />} />
            <Route path="/journal"    component={() => <ProtectedRoute component={JournalPage} />} />
            <Route path="/analytics"  component={() => <ProtectedRoute component={AnalyticsPage} />} />
            <Route path="/stocks"     component={() => <ProtectedRoute component={StocksPage} />} />
            <Route path="/ai-coach"   component={() => <ProtectedRoute component={AiCoachPage} />} />
            <Route path="/calendar"   component={() => <ProtectedRoute component={CalendarPage} />} />
            <Route path="/profile"    component={() => <ProtectedRoute component={ProfilePage} />} />
            <Route path="/settings"   component={() => <ProtectedRoute component={SettingsPage} />} />
            <Route path="/feedback"   component={() => <ProtectedRoute component={FeedbackPage} />} />
            <Route path="/video" component={() => (
              <div className="w-full h-screen bg-[#020202] text-white overflow-hidden">
                <VideoTemplate />
              </div>
            )} />

            <Route component={NotFound} />
          </Switch>
        </React.Suspense>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <WouterRouter base={basePath}>
        <TooltipProvider>
          <ClerkProviderWithRoutes />
          <Toaster />
        </TooltipProvider>
      </WouterRouter>
    </ThemeProvider>
  );
}

export default App;
