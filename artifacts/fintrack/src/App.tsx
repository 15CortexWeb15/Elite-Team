import React, { useEffect, useRef } from "react";
import { ClerkProvider, SignUp, Show, useClerk, useUser, AuthenticateWithRedirectCallback } from '@clerk/react';
import { dark } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from "next-themes";
import { AppLayout } from "./components/AppLayout";
import { useGetOnboarding, getGetOnboardingQueryKey } from "@workspace/api-client-react";

// Pages — lazy loaded for faster initial bundle
const HomePage = React.lazy(() => import("./pages/home"));
const DashboardPage = React.lazy(() => import("./pages/dashboard"));
const JournalPage = React.lazy(() => import("./pages/journal"));
const AnalyticsPage = React.lazy(() => import("./pages/analytics"));
const AiCoachPage = React.lazy(() => import("./pages/ai-coach"));
const CalendarPage = React.lazy(() => import("./pages/calendar"));
const ProfilePage = React.lazy(() => import("./pages/profile"));
const SettingsPage = React.lazy(() => import("./pages/settings"));
const FeedbackPage = React.lazy(() => import("./pages/feedback"));
const OnboardingPage = React.lazy(() => import("./pages/onboarding"));
const StocksPage = React.lazy(() => import("./pages/stocks"));
const NotFound = React.lazy(() => import("./pages/not-found"));
const VideoTemplate = React.lazy(() => import("./components/video/VideoTemplate"));

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
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
    logoImage: "h-8 w-auto filter invert",
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

const CustomSignInPage = React.lazy(() => import('./pages/sign-in'));

function SignInPage() {
  return <CustomSignInPage />;
}

function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AuthenticateWithRedirectCallback
        afterSignInUrl={`${basePath}/dashboard`}
        afterSignUpUrl={`${basePath}/onboarding`}
      />
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

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <HomePage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoaded, isSignedIn } = useUser();
  const { data: onboarding, isLoading: isAuthLoading } = useGetOnboarding({ query: { enabled: !!isSignedIn, queryKey: getGetOnboardingQueryKey() } });
  const [location] = useLocation();

  if (!isLoaded || (isSignedIn && isAuthLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!isSignedIn) {
    return <Redirect to="/sign-in" />;
  }

  const isOnboardingPage = location === '/onboarding';

  if (onboarding && !onboarding.completed && !isOnboardingPage) {
    return <Redirect to="/onboarding" />;
  }

  if (onboarding && onboarding.completed && isOnboardingPage) {
    return <Redirect to="/dashboard" />;
  }

  if (isOnboardingPage) {
    return <Component />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

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
        <ClerkQueryClientCacheInvalidator />
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/sso-callback" component={SSOCallbackPage} />
            <Route path="/onboarding" component={() => <ProtectedRoute component={OnboardingPage} />} />
            <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
            <Route path="/journal" component={() => <ProtectedRoute component={JournalPage} />} />
            <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
            <Route path="/stocks" component={() => <ProtectedRoute component={StocksPage} />} />
            <Route path="/ai-coach" component={() => <ProtectedRoute component={AiCoachPage} />} />
            <Route path="/calendar" component={() => <ProtectedRoute component={CalendarPage} />} />
            <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
            <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
            <Route path="/feedback" component={() => <ProtectedRoute component={FeedbackPage} />} />
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
