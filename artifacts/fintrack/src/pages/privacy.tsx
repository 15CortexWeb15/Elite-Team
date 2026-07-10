import { Link } from 'wouter';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

const LAST_UPDATED = 'July 10, 2026';

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
      {/* Nav */}
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

        <div className="prose-sm">
          <Section title="1. Introduction">
            <p>
              Welcome to Roxel ("we", "our", "us"). We are committed to protecting your personal information and your
              right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our trading journal application and website (collectively, the "Service").
            </p>
            <p>
              Please read this policy carefully. If you disagree with its terms, please discontinue use of our Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-foreground">Account information</strong> — name, email address, and authentication credentials managed by Clerk.</li>
              <li><strong className="text-foreground">Onboarding data</strong> — trading experience level, primary markets, style, goals, timezone, and risk profile.</li>
              <li><strong className="text-foreground">Trade journal entries</strong> — asset tickers, trade direction, entry/exit prices, position size, stop loss, take profit, P&L, and personal notes.</li>
              <li><strong className="text-foreground">Feedback and communications</strong> — any messages you send us through the feedback form or email.</li>
            </ul>
            <p>We also collect certain information automatically:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-foreground">Usage data</strong> — pages visited, features used, and interactions with the Service (via Google Analytics).</li>
              <li><strong className="text-foreground">Device information</strong> — browser type, operating system, and IP address.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Provide, operate, and maintain the Service.</li>
              <li>Generate AI-powered trading analysis using your journal data.</li>
              <li>Personalise your experience and remember your preferences.</li>
              <li>Communicate with you about account-related matters and updates.</li>
              <li>Analyse usage patterns to improve the Service.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="4. AI Analysis & Third-Party AI Services">
            <p>
              Roxel uses the Groq API (powered by Meta's Llama models) to generate AI trading coach analysis.
              When you request an AI analysis, relevant portions of your anonymised trade data are sent to Groq's
              servers for processing. This data is used solely for generating your analysis and is not used to train
              AI models. Please review{' '}
              <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer"
                className="text-primary underline underline-offset-2">Groq's Privacy Policy</a> for details on
              how they handle data.
            </p>
          </Section>

          <Section title="5. Data Sharing & Disclosure">
            <p>We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-foreground">Clerk</strong> — for authentication and user account management.</li>
              <li><strong className="text-foreground">Groq</strong> — for AI analysis processing (trade data only, anonymised).</li>
              <li><strong className="text-foreground">Google Analytics</strong> — for usage analytics (no personal trade data).</li>
              <li><strong className="text-foreground">Legal authorities</strong> — when required by law or to protect our rights.</li>
            </ul>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS),
              secure authentication via Clerk, and access controls. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account and trade data for as long as your account is active. You may request deletion
              of your account and all associated data at any time by contacting us at{' '}
              <a href="mailto:privacy@roxel.app" className="text-primary underline underline-offset-2">privacy@roxel.app</a>.
              We will process deletion requests within 30 days.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Data portability (receive your data in a machine-readable format).</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:privacy@roxel.app" className="text-primary underline underline-offset-2">privacy@roxel.app</a>.</p>
          </Section>

          <Section title="9. Cookies">
            <p>
              We use essential cookies for authentication and session management. We also use Google Analytics
              cookies to understand usage patterns. You can control cookie settings in your browser, though
              disabling essential cookies may affect the functionality of the Service.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              The Service is not directed to individuals under the age of 18. We do not knowingly collect personal
              information from minors. If you believe a minor has provided us with personal data, please contact us.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by
              updating the "Last updated" date at the top of this page. Your continued use of the Service after
              any changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at:<br />
              <a href="mailto:privacy@roxel.app" className="text-primary underline underline-offset-2">privacy@roxel.app</a>
            </p>
          </Section>
        </div>
      </main>

      <Footer full />
    </div>
  );
}
