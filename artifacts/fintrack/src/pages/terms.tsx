import { Link } from 'wouter';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

const LAST_UPDATED = 'July 10, 2026';
const SUPPORT_EMAIL = 'shamilkhalilov786@gmail.com';
const WEBSITE = 'https://elite-team--8roxel8.replit.app';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-foreground">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Agreement to Terms">
          <p>
            These Terms of Service ("Terms") govern your access to and use of Roxel, operated by{' '}
            <strong className="text-foreground">Shamil Khalilov</strong> ("we", "us", "our"), based in the
            United Kingdom. Our website is available at{' '}
            <a href={WEBSITE} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{WEBSITE}</a>.
          </p>
          <p>
            By creating an account or using Roxel in any way, you confirm that you have read, understood, and
            agreed to these Terms. If you do not agree, please stop using Roxel immediately.
          </p>
        </Section>

        <Section title="2. What Roxel Is">
          <p>
            Roxel is an AI-powered trading journal application. It helps traders log trades, analyse their
            performance, identify behavioural patterns, and receive AI-generated educational insights. Roxel is
            a <strong className="text-foreground">journalling and analytical tool only</strong>.
          </p>
        </Section>

        <Section title="3. Not Financial or Investment Advice">
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 mb-4">
            <p className="font-semibold text-foreground mb-2">Important — Please Read Carefully</p>
            <p>
              Roxel does <strong>not</strong> provide financial advice, investment advice, trading
              recommendations, or any form of regulated financial guidance.
            </p>
          </div>
          <p>
            All content on Roxel — including AI-generated analysis, performance metrics, pattern
            observations, and any other output — is for <strong className="text-foreground">informational
            and educational purposes only</strong>. It does not constitute a recommendation to buy, sell,
            or hold any financial instrument.
          </p>
          <p>
            <strong className="text-foreground">You remain solely responsible for every trading and
            investment decision you make.</strong> Roxel, its owner, and its operators accept no liability
            for any financial losses arising from your use of the platform or its AI features.
          </p>
          <p>
            If you need personalised financial advice, please consult a qualified financial adviser regulated
            by the Financial Conduct Authority (FCA) or the appropriate authority in your jurisdiction.
          </p>
        </Section>

        <Section title="4. AI Features — Educational Insights Only">
          <p>
            Roxel's AI coach is powered by AI models (currently Llama 3 70B; future tiers may include Claude
            Haiku and Fable 5). The AI analyses patterns in your journal data to surface educational observations
            about your trading behaviour.
          </p>
          <p>
            AI outputs should <strong className="text-foreground">never</strong> be treated as financial advice.
            The AI may make errors, misinterpret data, or produce observations that are not applicable to your
            situation. You should critically evaluate all AI output before acting on it.
          </p>
          <p>
            See our full <Link href="/ai-disclaimer" className="text-primary underline underline-offset-2">AI Disclaimer</Link>.
          </p>
        </Section>

        <Section title="5. User Accounts">
          <p>To use Roxel, you must create an account via Clerk (our authentication provider). You agree to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Provide accurate, truthful information during registration</li>
            <li>Keep your login credentials confidential</li>
            <li>Notify us immediately if you suspect unauthorised access to your account</li>
            <li>Be responsible for all activity that occurs under your account</li>
          </ul>
          <p>You must be at least 18 years old to use Roxel.</p>
        </Section>

        <Section title="6. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Use Roxel for any illegal, fraudulent, or harmful purpose</li>
            <li>Attempt to gain unauthorised access to Roxel's systems, servers, or databases</li>
            <li>Upload malicious code, viruses, or disruptive content</li>
            <li>Scrape, reverse-engineer, or copy Roxel's software or data</li>
            <li>Harass, abuse, or threaten other users or our team</li>
            <li>Use the AI features to generate content that is misleading, harmful, or unlawful</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </Section>

        <Section title="7. Account Suspension &amp; Termination">
          <p>
            We reserve the right to suspend or permanently terminate accounts that violate these Terms, engage
            in abusive behaviour, or use Roxel in a way that harms other users, third parties, or us.
          </p>
          <p>
            Where possible, we will notify you before taking action. However, in cases of serious or repeated
            abuse, we may act without prior notice.
          </p>
          <p>
            You may also close your account at any time by contacting us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-2">{SUPPORT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="8. Subscriptions &amp; Payments">
          <p>
            Roxel currently offers a free tier. Paid subscription tiers (Pro and Ultra) are planned and will
            be billed through <strong className="text-foreground">Stripe</strong>. When subscriptions are
            available:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Payments are processed securely by Stripe — we do not store your card details</li>
            <li>Subscriptions renew automatically unless cancelled before the renewal date</li>
            <li>Refund eligibility will be stated clearly at the time of purchase</li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          <p>
            All software, design, content, and branding of Roxel is owned by Shamil Khalilov or its licensors.
            You may not copy, reproduce, or distribute any part of Roxel without written permission.
          </p>
          <p>
            Your journal data and trade entries remain your property. By using Roxel, you grant us a limited
            licence to process and store this data solely to provide the service to you.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            ROXEL IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, SHAMIL KHALILOV AND ROXEL SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING TRADING
            LOSSES — ARISING OUT OF OR RELATED TO YOUR USE OF ROXEL.
          </p>
        </Section>

        <Section title="12. Governing Law">
          <p>
            These Terms are governed by the laws of <strong className="text-foreground">England and Wales</strong>.
            Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>
            We may update these Terms at any time. We will update the "Last updated" date at the top.
            Continued use of Roxel after changes constitutes acceptance. If you disagree with updated Terms,
            you must stop using Roxel and may close your account.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            For questions about these Terms:<br />
            <strong className="text-foreground">Shamil Khalilov</strong><br />
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-2">{SUPPORT_EMAIL}</a><br />
            United Kingdom
          </p>
        </Section>
      </main>

      <Footer full />
    </div>
  );
}
