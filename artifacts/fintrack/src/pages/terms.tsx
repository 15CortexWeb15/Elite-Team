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

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Roxel ("the Service"), you agree to be bound by these Terms of Service. If you
            do not agree to these terms, please do not use the Service. These terms apply to all users, including
            visitors, registered users, and anyone who accesses or uses the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            Roxel is an AI-powered trading journal application that helps traders track, analyse, and improve
            their trading performance. The Service includes trade logging, performance analytics, AI coaching,
            market data viewing, and related features.
          </p>
        </Section>

        <Section title="3. User Accounts">
          <p>To use most features of the Service, you must create an account. You agree to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Provide accurate and complete information during registration.</li>
            <li>Maintain the security of your account credentials.</li>
            <li>Notify us immediately of any unauthorised use of your account.</li>
            <li>Take responsibility for all activities that occur under your account.</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or engage in
            fraudulent, abusive, or harmful behaviour.
          </p>
        </Section>

        <Section title="4. Not Financial Advice">
          <p className="font-medium text-foreground">
            THE SERVICE IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.
          </p>
          <p>
            Nothing on Roxel — including AI-generated analysis, performance metrics, or any other content —
            constitutes financial, investment, trading, or any other type of professional advice. Roxel is a
            journaling and analytics tool, not a financial advisory service. Always consult a qualified financial
            professional before making trading or investment decisions.
          </p>
          <p>
            See our full <Link href="/ai-disclaimer" className="text-primary underline underline-offset-2">AI Disclaimer</Link> for details.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Use the Service for any illegal or unauthorised purpose.</li>
            <li>Attempt to gain unauthorised access to any part of the Service or its systems.</li>
            <li>Upload malicious code, viruses, or any disruptive content.</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the Service.</li>
            <li>Use the Service to distribute spam or unsolicited communications.</li>
            <li>Violate any applicable laws or regulations.</li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All content, features, and functionality of the Service — including but not limited to text, graphics,
            logos, software, and AI-generated outputs — are owned by Roxel or its licensors and are protected by
            intellectual property laws.
          </p>
          <p>
            Your trade data, notes, and personal journal entries remain your property. By using the Service, you
            grant us a limited licence to process and store this data solely to provide the Service to you.
          </p>
        </Section>

        <Section title="7. Third-Party Services">
          <p>
            The Service integrates with third-party services including Clerk (authentication), Groq (AI
            processing), and Google Analytics (usage analytics). Your use of these integrations is also subject
            to those services' respective terms and privacy policies.
          </p>
        </Section>

        <Section title="8. Service Availability & Modifications">
          <p>
            We strive to maintain high availability of the Service, but do not guarantee uninterrupted access.
            We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time
            with reasonable notice where practical.
          </p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR UNINTERRUPTED.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, ROXEL AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS
            SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR TRADING LOSSES, ARISING OUT OF OR IN
            CONNECTION WITH YOUR USE OF THE SERVICE.
          </p>
        </Section>

        <Section title="11. Changes to Terms">
          <p>
            We reserve the right to update these Terms of Service at any time. Material changes will be
            communicated by updating the "Last updated" date. Continued use of the Service after changes
            constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:legal@roxel.app" className="text-primary underline underline-offset-2">legal@roxel.app</a>.
          </p>
        </Section>
      </main>

      <Footer full />
    </div>
  );
}
