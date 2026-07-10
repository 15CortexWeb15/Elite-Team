import { Link } from 'wouter';
import { BarChart3, ArrowLeft, Mail, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

const SUPPORT_EMAIL = 'shamilkhalilov786@gmail.com';

export default function ContactPage() {
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

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-3xl">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Get in touch</h1>
          <p className="text-muted-foreground max-w-xl">
            Have a question, found a bug, or want to share feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {/* Email card */}
          <div className="flex items-start gap-5 p-6 rounded-xl border border-border bg-card">
            <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold mb-1">Email Support</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline underline-offset-2 font-medium text-sm"
              >
                {SUPPORT_EMAIL}
              </a>
              <p className="text-xs text-muted-foreground mt-1.5">
                The best way to reach us. We aim to reply within 24–48 hours on business days.
              </p>
            </div>
          </div>

          {/* Response time */}
          <div className="flex items-start gap-5 p-6 rounded-xl border border-border bg-card">
            <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold mb-1">Response Time</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We typically respond within <strong className="text-foreground">24–48 hours</strong> on
                weekdays. We're based in the <strong className="text-foreground">United Kingdom</strong> (GMT/BST).
              </p>
            </div>
          </div>

          {/* In-app feedback */}
          <div className="flex items-start gap-5 p-6 rounded-xl border border-border bg-card">
            <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold mb-1">In-App Feedback</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Already signed in? Use the{' '}
                <Link href="/feedback" className="text-primary hover:underline underline-offset-2">
                  Feedback
                </Link>{' '}
                page inside the app — it's the quickest way to send us a bug report or feature request.
              </p>
            </div>
          </div>
        </div>

        {/* What we can help with */}
        <div className="p-6 rounded-xl border border-border bg-card/50 mb-12">
          <p className="font-semibold mb-4">What we can help with</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            {[
              'Account &amp; login issues',
              'Bug reports',
              'Feature requests',
              'Billing &amp; subscription queries',
              'Privacy or data requests',
              'General questions about Roxel',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Ready to get in touch?</p>
          <Button size="lg" asChild>
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <Mail className="h-4 w-4 mr-2" />
              Email us now
            </a>
          </Button>
        </div>
      </main>

      <Footer full />
    </div>
  );
}
