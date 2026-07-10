import { Link } from 'wouter';
import { BarChart3, ArrowLeft, BrainCircuit, Shield, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

const VALUES = [
  {
    icon: Shield,
    title: 'Discipline over dopamine',
    desc: 'No streaks, badges, or gamification. We believe accountability tools should reinforce rational thinking — not emotional reactions.',
  },
  {
    icon: BrainCircuit,
    title: 'AI in service of the trader',
    desc: "The AI coach exists to surface patterns you can't see yourself — not to make decisions for you. The trader stays in control.",
  },
  {
    icon: Zap,
    title: 'Speed and clarity',
    desc: "Logging a trade should take under 60 seconds. Analysis should be immediate. We don't hide useful information behind extra clicks.",
  },
  {
    icon: Heart,
    title: 'Privacy first',
    desc: 'Your trade data is yours. We never sell it, share it with advertisers, or use it to train models without your consent.',
  },
];

const STACK = [
  { name: 'React + TypeScript', role: 'Frontend' },
  { name: 'Vite', role: 'Build tooling' },
  { name: 'Tailwind CSS + shadcn/ui', role: 'Design system' },
  { name: 'Express.js', role: 'API server' },
  { name: 'PostgreSQL + Drizzle ORM', role: 'Database' },
  { name: 'Clerk', role: 'Authentication' },
  { name: 'Llama 3.3 70B via Groq', role: 'AI engine' },
  { name: 'Recharts', role: 'Data visualisation' },
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
            Built by traders, <br className="hidden sm:block" />
            <span className="text-muted-foreground">for traders who take it seriously.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
            Most traders fail not because of bad strategy — but because of undocumented behavioural patterns
            they can't see. Revenge trades, overtrading on Mondays, sizing up after a big win. Roxel makes
            those patterns visible.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            We built Roxel because the existing tools were either too simple (spreadsheets), too noisy
            (social-first platforms), or too expensive (institutional software). We wanted something calm,
            professional, and genuinely analytical — a tool serious traders would actually use every day.
          </p>
        </section>

        {/* Values */}
        <section className="bg-card border-y border-border py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Our values</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-10">What we believe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6 rounded-xl border border-border bg-background">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stack */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-4xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Technology</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Built on solid foundations</h2>
          <p className="text-sm text-muted-foreground mb-10">
            Open, auditable technology. No black boxes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STACK.map(({ name, role }) => (
              <div key={name} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-card border-t border-border py-16 sm:py-20 text-center">
          <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Ready to trade with clarity?</h2>
            <p className="text-muted-foreground mb-8">Join traders using Roxel to systematically compound their edge.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">Start for free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer full />
    </div>
  );
}
