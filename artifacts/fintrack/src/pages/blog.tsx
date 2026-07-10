import { Link } from 'wouter';
import { BarChart3, ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';

const COMING_SOON_TOPICS = [
  { tag: 'Psychology', title: 'Why most traders fail: the journaling blind spot' },
  { tag: 'Analytics',  title: 'Understanding your win rate vs expectancy' },
  { tag: 'AI',         title: 'How Roxel\'s AI coach identifies behavioural leaks' },
  { tag: 'Risk',       title: 'Position sizing for consistency, not just profit' },
  { tag: 'Process',    title: 'Building a pre-market routine that actually works' },
];

export default function BlogPage() {
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

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-4xl">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">The Roxel Blog</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Trading clarity, distilled.
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Practical writing on trading psychology, performance analytics, risk management, and building
            sustainable edge in any market.
          </p>
        </div>

        {/* Coming soon state */}
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="w-full max-w-xl p-8 rounded-2xl border border-border bg-card text-center">
            <div className="h-14 w-14 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto mb-5">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">First posts coming soon</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              We're writing content that actually matters to active traders — no noise, no hype.
              The blog launches soon. Leave your email and we'll let you know.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button className="gap-2 shrink-0">
                Notify me <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Teaser topics */}
          <div className="w-full">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-5 text-center">
              Topics we're covering
            </p>
            <div className="space-y-3">
              {COMING_SOON_TOPICS.map(({ tag, title }) => (
                <div key={title}
                  className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-border bg-card/50 opacity-60">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs shrink-0">{tag}</Badge>
                    <span className="text-sm font-medium">{title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">Coming soon</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer full />
    </div>
  );
}
