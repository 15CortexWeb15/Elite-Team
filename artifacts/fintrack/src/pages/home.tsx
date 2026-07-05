import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  BrainCircuit,
  BookOpen,
  PieChart,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured Trade Journal',
    desc: 'Log every trade with entry/exit, asset, market, R/R ratio, and notes. Filter, sort and review your full history in a clean data table.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Equity curve, monthly returns, win rate by day-of-week, and per-instrument edge breakdown — all computed automatically from your journal.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Trading Coach',
    desc: 'Powered by Llama 3. Identifies behavioral leaks, repeated mistakes, and psychological patterns buried in your execution data.',
  },
  {
    icon: CalendarDays,
    title: 'Trading Calendar',
    desc: 'A heatmap calendar that shows your daily P&L at a glance. Spot losing streaks and high-performance windows immediately.',
  },
  {
    icon: PieChart,
    title: 'Asset Breakdown',
    desc: 'See exactly which instruments you have a statistical edge in — and which ones are quietly draining your account.',
  },
  {
    icon: ShieldCheck,
    title: 'No noise. No gamification.',
    desc: 'No glowing streaks or badges. Just a calm, professional environment that reinforces discipline over dopamine.',
  },
];

const STEPS = [
  { n: '01', title: 'Log your trades', desc: 'Add each trade with entry, exit, asset, and notes. Takes under 60 seconds per position.' },
  { n: '02', title: 'Review your analytics', desc: 'Instantly see your equity curve, win rate, and which days or assets are hurting you most.' },
  { n: '03', title: 'Run AI analysis', desc: 'Get a behavioural deep-dive from our AI coach — strengths, weaknesses, and concrete next steps.' },
];

const BENEFITS = [
  'Auto-calculated P&L, R/R, and result on every save',
  'Works across crypto, forex, equities, options & futures',
  'Dark-mode-first, desktop-optimised interface',
  'AI coach powered by Llama 3.3-70B',
  'Full trade history — no limits',
  'Privacy-first — your data is never sold',
];

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground h-8 w-8 rounded-md flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="font-bold text-xl tracking-tight">FinTrack</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-24 pb-20 lg:pt-36 lg:pb-28 flex flex-col items-center text-center px-4">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/5 via-transparent to-transparent" aria-hidden />

          <Badge variant="outline" className="mb-8 gap-2 px-3 py-1.5 text-xs font-medium border-border">
            <span className="flex h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
            Free during open beta
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight max-w-5xl mb-6 leading-[1.05]">
            The professional standard
            <br />
            <span className="text-muted-foreground">for trading journals.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            FinTrack is a dense, distraction-free environment for serious traders.
            Track performance, discover your edge, and let AI surface the patterns you're missing.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
            <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
              <Link href="/sign-up">
                Start journaling for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 sm:gap-16 text-center">
            {[
              { value: '100%', label: 'Free to start' },
              { value: '<60s', label: 'Per trade entry' },
              { value: 'AI', label: 'Powered analysis' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl font-bold">{value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="bg-card border-y border-border py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Everything a serious trader needs. Nothing they don't.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Built for active traders who want clarity over clutter — a complete performance stack in a single, focused tool.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6 rounded-xl border border-border bg-background flex flex-col gap-4 hover:border-border/80 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Up and running in minutes.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {STEPS.map(({ n, title, desc }, i) => (
                <div key={n} className="relative flex flex-col gap-4">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute left-full top-6 w-full border-t border-dashed border-border -translate-x-1/2" style={{ width: 'calc(100% - 2rem)' }} />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-muted-foreground/50">{n}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits checklist ── */}
        <section className="bg-card border-y border-border py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Why FinTrack</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Designed to make you a better trader.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Most traders fail not because of their strategy — but because of undocumented behavioral patterns they can't see. FinTrack makes them visible.
                </p>
                <Button size="lg" className="gap-2 h-12 px-8" asChild>
                  <Link href="/sign-up">
                    <Zap className="h-4 w-4" />
                    Start free
                  </Link>
                </Button>
              </div>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-profit shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 flex flex-col items-center text-center px-4">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mb-6">
            Ready to trade with clarity?
          </h2>
          <p className="text-muted-foreground max-w-xl mb-10 leading-relaxed">
            Join traders who use FinTrack to hold themselves accountable, remove bias, and compound their edge systematically.
          </p>
          <Button size="lg" className="h-12 px-10 text-base gap-2" asChild>
            <Link href="/sign-up">
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">No credit card required. Free during beta.</p>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground h-6 w-6 rounded flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-foreground">FinTrack</span>
          </div>
          <p>&copy; {new Date().getFullYear()} FinTrack. Built for serious traders.</p>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
