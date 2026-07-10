import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Render a compact inline error card instead of full-page */
  inline?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      if (this.props.inline) {
        return (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="text-sm font-medium mb-1">Failed to load this section</p>
              <p className="text-xs text-muted-foreground">An unexpected error occurred.</p>
            </div>
            <Button size="sm" variant="outline" onClick={this.handleReset}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        );
      }
      return <PageErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function PageErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center">
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Your data is safe — this is a display issue only.
        </p>
        {error?.message && (
          <p className="text-xs font-mono text-muted-foreground/60 bg-muted px-3 py-2 rounded-md break-all">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => { window.location.href = '/'; }}>
          <Home className="h-4 w-4" /> Go home
        </Button>
      </div>
    </div>
  );
}

/** Shown when the entire app root crashes — used in main.tsx */
export function AppErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2 max-w-lg">
        <h1 className="text-2xl font-bold">Roxel ran into a problem</h1>
        <p className="text-muted-foreground">
          Something unexpected happened. Your trades and data are safe.
        </p>
        {error?.message && (
          <p className="text-xs font-mono text-muted-foreground/50 bg-muted px-3 py-2 rounded-md mt-3 break-all">
            {error.message}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Reload
        </Button>
        <Button variant="outline" onClick={() => { window.location.href = '/'; }}>
          Return to home
        </Button>
      </div>
    </div>
  );
}
