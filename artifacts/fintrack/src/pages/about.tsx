import { Link } from 'wouter';
import { BarChart3, ArrowLeft, BrainCircuit, Shield, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

const VALUES = [
  {
    icon: BookOpen,
    title: 'Learn from every trade',
    desc: 'Every trade — win or loss — holds a lesson. Roxel makes capturing and reviewing those lessons effortless, so they compound into lasting improvement.',
  },
  {
    icon: BrainCircuit,
    title: 'AI that serves you',
    desc: 'The AI coach surfaces patterns you cannot see yourself — not to make decisions for you. You stay in control. The AI helps you think more clearly.',
  },
  {
    icon: Shield,
    title: 'Privacy first',
    desc: 'Your trading data is private and sensitive. We never sell it, share it with advertisers, or use it to train AI models without your knowledge.',
  },
  {
    icon: Zap,
    title: 'Fast and frictionless',
    desc: 'Logging a trade should take under a minute. Analysis should be instant. Roxel is designed to remove every unnecessary step between you and clarity.',
  },
];

const FEATURES = [
  { label: 'Trade Journal', desc: 'Log entries and exits, notes, screenshots, and emotions for every trade.' },
  { label: 'Performance Analytics', desc: 'Win rate, expectancy, risk/reward, drawdown, and more — visualised clearly.' },
  { label: 'AI Trading Coach', desc: 'Pattern recognition and behavioural insights powered by leading AI models.' },
  { label: 'CSV Import', desc: 'Bulk-import your trade history from brokers and platforms in seconds.' },
  { label: 'Calendar View', desc: 'See your P&L by day, week, and month at a glance.' },
  { label: 'Market Overview', desc: 'Track the assets you trade most without leaving your journal.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground h-8 w-8 rounded-md flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">Roxel</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-4xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">About Roxel</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Built to help traders<br className="hidden sm:block" />
            <span className="text-muted-foreground"> analyse, improve, and grow.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-6">
            Roxel is an AI-powered trading journal designed to help traders of all levels analyse their
            performance, learn from every trade, and develop consistent habits that translate into long-term results.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Most traders already know what they should do. What they lack is clear data on what they're
            actually doing — and why it's costing them. Roxel exists to close that gap: turning a scattered
            trading history into structured insight, and structured insight into better decisions.
          </p>
        </section>

        {/* What Roxel does */}
        <section className="bg-card border-y border-border py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">The platform</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">Everything in one place</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ label, desc }) => (
                <div key={label} className="p-5 rounded-xl border border-border bg-background">
                  <p className="font-semibold mb-1.5 text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-4xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Our principles</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-border bg-card">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI note */}
        <section className="bg-card border-y border-border py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0 mt-0.5">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold mb-2">About the AI</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Roxel's AI coach currently runs on <strong className="text-foreground">Llama 3 70B</strong>.
                  Pro subscribers will have access to <strong className="text-foreground">Claude Haiku</strong>,
                  and Ultra subscribers to <strong className="text-foreground">Fable 5</strong> — progressively
                  more powerful models for deeper analysis. All AI features are educational only.{' '}
                  <Link href="/ai-disclaimer" className="text-primary underline underline-offset-2">
                    Read the AI disclaimer.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Start trading with clarity</h2>
          <p className="text-muted-foreground mb-8">
            Join traders using Roxel to turn their journal into a genuine edge.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Get started — it's free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer full />
    </div>
  );
}
