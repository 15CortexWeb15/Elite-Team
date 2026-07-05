import React from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Monitor, Moon, Sun, DollarSign, BarChart2, Keyboard } from 'lucide-react';
import { toast } from 'sonner';

// ── Local-only preferences stored in localStorage ──────────────────────────
const LS_KEY = 'roxel:display-prefs';

type DisplayPrefs = {
  currency: string;
  dateFormat: string;
  numberFormat: string;
  defaultMarket: string;
  riskUnit: string;
  compactNumbers: boolean;
  showPLInPercent: boolean;
};

const DEFAULTS: DisplayPrefs = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'en-US',
  defaultMarket: 'any',
  riskUnit: 'percent',
  compactNumbers: false,
  showPLInPercent: false,
};

function loadPrefs(): DisplayPrefs {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function savePrefs(prefs: DisplayPrefs) {
  localStorage.setItem(LS_KEY, JSON.stringify(prefs));
}

const SHORTCUTS = [
  { keys: ['N'], action: 'New trade' },
  { keys: ['⌘', 'K'], action: 'Command palette (coming soon)' },
  { keys: ['⌘', '/'], action: 'Toggle sidebar' },
  { keys: ['Esc'], action: 'Close dialog / panel' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = React.useState<DisplayPrefs>(loadPrefs);

  function update<K extends keyof DisplayPrefs>(key: K, val: DisplayPrefs[K]) {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    savePrefs(next);
    toast.success('Preference saved');
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">App appearance and display preferences.</p>
      </div>

      {/* ── Appearance ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how Roxel looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'light', label: 'Light', Icon: Sun },
                { value: 'dark', label: 'Dark', Icon: Moon },
                { value: 'system', label: 'System', Icon: Monitor },
              ] as const).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium
                    ${theme === value
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Display ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Display
          </CardTitle>
          <CardDescription>How numbers, dates, and currencies are shown throughout the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={prefs.currency} onValueChange={(v) => update('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                  <SelectItem value="JPY">JPY — Japanese Yen (¥)</SelectItem>
                  <SelectItem value="CAD">CAD — Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                  <SelectItem value="CHF">CHF — Swiss Franc</SelectItem>
                  <SelectItem value="BTC">BTC — Bitcoin (₿)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={prefs.dateFormat} onValueChange={(v) => update('dateFormat', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                  <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number Format</Label>
              <Select value={prefs.numberFormat} onValueChange={(v) => update('numberFormat', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">1,234.56 (US)</SelectItem>
                  <SelectItem value="de-DE">1.234,56 (EU)</SelectItem>
                  <SelectItem value="fr-FR">1 234,56 (FR)</SelectItem>
                  <SelectItem value="en-IN">1,23,456.78 (IN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Unit</Label>
              <Select value={prefs.riskUnit} onValueChange={(v) => update('riskUnit', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage of account (%)</SelectItem>
                  <SelectItem value="currency">Fixed currency amount</SelectItem>
                  <SelectItem value="r">R-multiples</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Compact numbers</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Show $1.2K instead of $1,200</p>
              </div>
              <Switch checked={prefs.compactNumbers} onCheckedChange={(v) => update('compactNumbers', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show P&L in %</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Display percentage returns alongside dollar amounts</p>
              </div>
              <Switch checked={prefs.showPLInPercent} onCheckedChange={(v) => update('showPLInPercent', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Trading Defaults ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Trading Defaults
          </CardTitle>
          <CardDescription>Pre-fill values when logging new trades.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Market</Label>
            <Select value={prefs.defaultMarket} onValueChange={(v) => update('defaultMarket', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">No default — always ask</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="forex">Forex (FX)</SelectItem>
                <SelectItem value="stocks">Equities / Stocks</SelectItem>
                <SelectItem value="options">Options / Derivatives</SelectItem>
                <SelectItem value="futures">Futures / Commodities</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">This will pre-select the market when you open the new trade form.</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Keyboard shortcuts ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>Speed up your workflow with these shortcuts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {SHORTCUTS.map(({ keys, action }) => (
              <div key={action} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{action}</span>
                <div className="flex items-center gap-1">
                  {keys.map((k) => (
                    <kbd key={k} className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── About ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            About Roxel
            <Badge variant="secondary" className="text-xs font-mono">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Version: 0.1.0-beta</p>
          <p>AI model: Llama 3.3-70B Versatile (via Groq)</p>
          <p>Built for serious traders who want clarity over clutter.</p>
        </CardContent>
      </Card>
    </div>
  );
}
