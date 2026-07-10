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

export default function PrivacyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="1. Who We Are">
          <p>
            Roxel is operated by <strong className="text-foreground">Shamil Khalilov</strong>, based in the
            United Kingdom. Our website is available at{' '}
            <a href={WEBSITE} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{WEBSITE}</a>.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, and protect your personal information when
            you use Roxel. By using Roxel, you agree to the practices described in this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We may collect the following categories of information:</p>

          <div className="space-y-4 mt-2">
            <div>
              <p className="font-medium text-foreground mb-1">Account &amp; Authentication Information</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Name and email address (provided when you sign up)</li>
                <li>Authentication data managed by Clerk (passwords are never stored by us directly)</li>
                <li>Profile preferences and onboarding responses</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">Usage &amp; Analytics Data</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Pages visited, features used, and in-app actions</li>
                <li>Device and browser information (browser type, operating system, screen resolution)</li>
                <li>IP address and approximate geographic location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">Trading Journal Data</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Trade entries you log (assets, prices, P&amp;L, notes, etc.)</li>
                <li>Performance data generated from your journal entries</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-1">This data is only collected if you choose to use the journalling features.</p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">AI Interaction Data</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Queries and prompts you send to the AI coach</li>
                <li>AI-generated responses shown to you</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground mb-1">Payment Information (when available)</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Subscription and billing information processed securely by Stripe</li>
                <li>We do not store card numbers or payment credentials — Stripe handles this directly</li>
              </ul>
            </div>
          </div>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>To provide and operate the Roxel platform and its features</li>
            <li>To personalise your experience based on your preferences and trading data</li>
            <li>To generate AI-powered coaching insights using your journal data</li>
            <li>To process subscription payments via Stripe (when applicable)</li>
            <li>To send account-related communications (confirmations, updates, alerts)</li>
            <li>To analyse usage patterns and improve the product</li>
            <li>To detect and prevent fraud, abuse, and security incidents</li>
            <li>To comply with applicable laws and legal obligations</li>
          </ul>
        </Section>

        <Section title="4. AI Processing &amp; Third-Party AI Services">
          <p>
            Roxel uses AI models to generate trading analysis and coaching insights. Currently, we use{' '}
            <strong className="text-foreground">Llama 3 70B</strong> via Groq. In future, Pro subscribers may
            have access to <strong className="text-foreground">Claude Haiku</strong> and Ultra subscribers to{' '}
            <strong className="text-foreground">Fable 5</strong>.
          </p>
          <p>
            When you request AI analysis, relevant portions of your anonymised trade data are sent to the
            relevant AI provider's servers for processing. This data is used solely to generate your response
            and is not used to train AI models. Please review each provider's privacy policy for details:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>
              <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Groq Privacy Policy</a>
              {' '}(Llama 3 70B)
            </li>
            <li>
              <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Anthropic Privacy Policy</a>
              {' '}(Claude Haiku — future Pro tier)
            </li>
          </ul>
        </Section>

        <Section title="5. Authentication — Clerk">
          <p>
            User authentication is handled by <strong className="text-foreground">Clerk</strong>. Clerk manages
            your email, password (hashed), and login sessions. We do not have access to your raw password.
            See <a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Clerk's Privacy Policy</a> for full details.
          </p>
        </Section>

        <Section title="6. Payments — Stripe">
          <p>
            Subscription billing is handled by <strong className="text-foreground">Stripe</strong>. When you
            subscribe, you interact directly with Stripe's payment interface. Roxel receives confirmation of
            payment status but never handles or stores your card details.
            See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Stripe's Privacy Policy</a>.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            Roxel uses cookies and similar technologies for:
          </p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-foreground">Essential cookies</strong> — required for authentication sessions and core functionality</li>
            <li><strong className="text-foreground">Analytics cookies</strong> — to understand how users navigate and use the platform (via Google Analytics)</li>
          </ul>
          <p>
            You can control non-essential cookies through your browser settings. Disabling essential cookies
            will prevent you from logging in.
          </p>
        </Section>

        <Section title="8. Data Sharing">
          <p>We do not sell your personal data. We share information only with:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong className="text-foreground">Clerk</strong> — for authentication</li>
            <li><strong className="text-foreground">Groq / Anthropic</strong> — for AI analysis (anonymised trade data only)</li>
            <li><strong className="text-foreground">Stripe</strong> — for subscription billing</li>
            <li><strong className="text-foreground">Google Analytics</strong> — for usage analytics (no personal trade data)</li>
            <li><strong className="text-foreground">Legal authorities</strong> — when required by applicable law</li>
          </ul>
        </Section>

        <Section title="9. Data Security">
          <p>
            We implement industry-standard security measures including HTTPS/TLS encryption for all data
            in transit, secure authentication via Clerk, and access controls. However, no internet transmission
            is 100% secure. We cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="10. Data Retention &amp; Deletion">
          <p>
            We retain your account and trading data for as long as your account remains active. You may
            request deletion of your account and all associated data at any time by contacting us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-2">{SUPPORT_EMAIL}</a>.
            We will process deletion requests within 30 days.
          </p>
        </Section>

        <Section title="11. Your Rights (UK &amp; EEA)">
          <p>Under UK GDPR and applicable data protection law, you have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request erasure of your data ("right to be forgotten")</li>
            <li>Restrict or object to certain processing activities</li>
            <li>Data portability — receive your data in a machine-readable format</li>
            <li>Lodge a complaint with the ICO (Information Commissioner's Office) at{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">ico.org.uk</a>
            </li>
          </ul>
          <p>To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-2">{SUPPORT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="12. Children's Privacy">
          <p>
            Roxel is not directed at individuals under 18. We do not knowingly collect personal data from
            minors. If you believe a minor has created an account, please contact us immediately.
          </p>
        </Section>

        <Section title="13. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Material changes will be communicated by
            updating the "Last updated" date above. Continued use of Roxel after changes constitutes
            acceptance of the revised policy.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            For any privacy-related questions or requests, contact:<br />
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
