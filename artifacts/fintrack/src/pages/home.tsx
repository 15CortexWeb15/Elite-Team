import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, ShieldCheck, BrainCircuit } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="container mx-auto px-6 h-20 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground h-8 w-8 rounded flex items-center justify-center">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">FinTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-profit"></span>
            Now in open beta
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6">
            The professional standard <br className="hidden sm:inline" />
            <span className="text-muted-foreground">for trading journals.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            FinTrack is a dense, distraction-free environment for active traders. 
            Track performance, discover edge, and let AI analyze your trading psychology.
          </p>
          <div className="flex items-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/sign-up">Start journaling for free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base hidden sm:inline-flex" asChild>
              <Link href="/sign-in">Sign in to your account</Link>
            </Button>
          </div>
        </section>

        <section className="bg-card py-24 border-y border-border">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <TrendingUp className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">Data-dense interface</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every pixel earns its place. View your win rate, profit curve, and risk/reward metrics at a glance in a layout inspired by professional terminals.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <BrainCircuit className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">AI Trading Coach</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automatically identify behavioral leaks and repeated mistakes. Our AI analyzes your trade history to provide actionable psychological insights.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <ShieldCheck className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-bold">Calm & precise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No gamification, no glowing gradients. Just a clean, professional environment that helps you focus on execution and consistency.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} FinTrack. Built for serious traders.</p>
      </footer>
    </div>
  );
}
