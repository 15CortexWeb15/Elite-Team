import { Link } from 'wouter';
import { BarChart3, Twitter, Github, Mail } from 'lucide-react';

const PRODUCT_LINKS = [
  { label: 'Dashboard',    href: '/dashboard' },
  { label: 'Trade Journal', href: '/journal' },
  { label: 'Analytics',    href: '/analytics' },
  { label: 'AI Coach',     href: '/ai-coach' },
  { label: 'Markets',      href: '/stocks' },
];
const COMPANY_LINKS = [
  { label: 'About',    href: '/about' },
  { label: 'Blog',     href: '/blog' },
  { label: 'Contact',  href: '/contact' },
  { label: 'Feedback', href: '/feedback' },
];
const LEGAL_LINKS = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'AI Disclaimer',    href: '/ai-disclaimer' },
];

interface FooterProps {
  /** full=true → 4-column marketing layout; false → compact single bar */
  full?: boolean;
}

export function Footer({ full = false }: FooterProps) {
  const year = new Date().getFullYear();

  if (!full) {
    return (
      <footer className="border-t border-border py-4 px-4 lg:px-8 mt-auto shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {year} Roxel. All rights reserved.</p>
          <nav className="flex items-center gap-4" aria-label="Footer links">
            <Link href="/privacy"       className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms"         className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/ai-disclaimer" className="hover:text-foreground transition-colors">AI Disclaimer</Link>
            <Link href="/contact"       className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="bg-primary text-primary-foreground h-8 w-8 rounded-md flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg tracking-tight">Roxel</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The professional standard for AI-powered trading journals. Built for serious traders who demand clarity.
            </p>
            <div className="flex items-center gap-2">
              {[
                { href: 'https://twitter.com/roxelapp', label: 'Roxel on X / Twitter', Icon: Twitter },
                { href: 'https://github.com/roxelapp',  label: 'Roxel on GitHub',       Icon: Github },
                { href: 'mailto:hello@roxel.app',       label: 'Email Roxel',            Icon: Mail },
              ].map(({ href, label, Icon }) => (
                <a key={href} href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; {year} Roxel. All rights reserved.</p>
          <p className="text-xs text-muted-foreground text-center sm:text-right max-w-sm">
            AI analysis is for informational purposes only — not financial advice.{' '}
            <Link href="/ai-disclaimer" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Read disclaimer.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
