import { Link } from 'wouter';
import { BarChart3, ArrowLeft, AlertTriangle, BrainCircuit, ShieldAlert, BookOpen } from 'lucide-react';
import { Footer } from '@/components/Footer';

const SUPPORT_EMAIL = 'shamilkhalilov786@gmail.com';

export default function AiDisclaimerPage() {
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

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">AI Disclaimer</h1>
          <p className="text-sm text-muted-foreground">Effective: July 10, 2026</p>
        </div>

        {/* Critical callout */}
        <div className="flex gap-4 p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-10">
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Read Before Using AI Features</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Roxel's AI provides analysis and educational insights only. It is <strong>not</strong> financial
              advice. You remain fully responsible for every trade and investment decision you make.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">

          <section>
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">What Roxel's AI Does</h2>
            </div>
            <p>
              Roxel uses AI models to help you analyse your trading journal data. Currently, the AI engine
              is <strong className="text-foreground">Llama 3 70B</strong> (via Groq). Future tiers will
              include <strong className="text-foreground">Claude Haiku</strong> (Pro) and{' '}
              <strong className="text-foreground">Fable 5</strong> (Ultra).
            </p>
            <p className="mt-3">
              The AI analyses patterns in your historical trades — such as win rate, risk/reward ratios,
              session timing, and behavioural tendencies — and surfaces observations to help you reflect on
              your trading process.
            </p>
            <p className="mt-3">
              This is a <strong className="text-foreground">journalling and educational tool</strong>. It is
              designed to help you think more clearly about your own behaviour, not to make trading decisions
              for you.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">What Roxel's AI Does NOT Do</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide financial advice, investment advice, or trading recommendations of any kind</li>
              <li>Predict future market movements, asset prices, or trading outcomes</li>
              <li>Guarantee profitable results or improved performance</li>
              <li>Replace the guidance of a qualified, regulated financial professional</li>
              <li>Account for your personal financial situation, goals, or risk tolerance</li>
              <li>Operate as a regulated financial service or advisory firm</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold text-foreground">Limitations of AI Analysis</h2>
            </div>
            <p>
              AI-generated analysis may be inaccurate, incomplete, or misleading. The AI may misinterpret
              your data, miss important context, or produce plausible-sounding but incorrect observations.
              Always apply your own critical judgement before acting on any AI output.
            </p>
            <p className="mt-3">
              Past trading patterns analysed by the AI are not necessarily indicative of future results.
              Markets are unpredictable. Historical performance does not guarantee future outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Responsibility</h2>
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="font-medium text-foreground mb-2">You are fully responsible for:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Every trade and investment decision you make</li>
                <li>Understanding the risks involved in financial markets</li>
                <li>Managing your own capital and risk exposure</li>
                <li>Seeking qualified professional advice where appropriate</li>
              </ul>
            </div>
            <p className="mt-4">
              Roxel, its owner Shamil Khalilov, and any associated parties accept{' '}
              <strong className="text-foreground">no liability</strong> for any financial losses, missed
              opportunities, or other damages arising from your use of Roxel's AI features or any other
              part of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">No Professional Relationship</h2>
            <p>
              Using Roxel's AI features does not create any professional, advisory, or fiduciary relationship
              between you and Roxel or Shamil Khalilov. Roxel is a software product, not a regulated
              financial adviser, broker, or investment firm.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Regulated Financial Advice</h2>
            <p>
              If you require personalised financial or investment advice, please consult a qualified
              professional authorised and regulated by the{' '}
              <a href="https://www.fca.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                Financial Conduct Authority (FCA)
              </a>{' '}
              or the appropriate regulatory body in your jurisdiction. Never risk capital you cannot afford to lose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Questions</h2>
            <p>
              Questions about this disclaimer? Contact:<br />
              <strong className="text-foreground">Shamil Khalilov</strong> —{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-2">{SUPPORT_EMAIL}</a>
            </p>
          </section>
        </div>
      </main>

      <Footer full />
    </div>
  );
}
