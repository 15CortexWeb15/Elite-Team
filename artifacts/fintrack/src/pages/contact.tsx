import React, { useState } from 'react';
import { Link } from 'wouter';
import { BarChart3, ArrowLeft, Mail, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Footer } from '@/components/Footer';
import { GA } from '@/lib/analytics';
import { toast } from 'sonner';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', type: 'general', message: '' });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: form.type,
          message: `[From: ${form.name || 'Anonymous'} | ${form.email || 'No email'}]\n\n${form.message}`,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      GA.feedbackSubmitted(form.type);
      setSubmitted(true);
    } catch {
      toast.error('Failed to send message. Please email us directly.');
    } finally {
      setLoading(false);
    }
  };

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

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Get in touch</h1>
          <p className="text-muted-foreground max-w-xl">
            Have a question, found a bug, or want to share feedback? We read every message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Email us</p>
                <a href="mailto:hello@roxel.app" className="text-sm text-primary hover:underline underline-offset-2">
                  hello@roxel.app
                </a>
                <p className="text-xs text-muted-foreground mt-1">We typically respond within 24–48 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm mb-1">In-app feedback</p>
                <p className="text-xs text-muted-foreground">
                  Already a user? Use the{' '}
                  <Link href="/feedback" className="text-primary hover:underline underline-offset-2">Feedback</Link>
                  {' '}page inside the app — it's the fastest way to reach us.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card">
              <p className="font-medium text-sm mb-2">For legal & privacy</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Privacy: <a href="mailto:privacy@roxel.app" className="text-primary hover:underline underline-offset-2">privacy@roxel.app</a></p>
                <p>Legal: <a href="mailto:legal@roxel.app" className="text-primary hover:underline underline-offset-2">legal@roxel.app</a></p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center rounded-xl border border-border bg-card">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-semibold mb-2">Message sent!</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Thanks for reaching out. We'll get back to you within 24–48 hours.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setForm({ name: '', email: '', type: 'general', message: '' }) || setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 p-6 rounded-xl border border-border bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="name" placeholder="Your name" value={form.name} onChange={set('name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Topic</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General enquiry</SelectItem>
                      <SelectItem value="bug">Bug report</SelectItem>
                      <SelectItem value="feature">Feature request</SelectItem>
                      <SelectItem value="billing">Billing or account</SelectItem>
                      <SelectItem value="privacy">Privacy or legal</SelectItem>
                      <SelectItem value="press">Press or partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder="Tell us what's on your mind..."
                    value={form.message}
                    onChange={set('message')}
                  />
                </div>

                <Button type="submit" disabled={loading || !form.message.trim()} className="w-full gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer full />
    </div>
  );
}
