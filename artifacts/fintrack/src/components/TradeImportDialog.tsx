import React, { useCallback, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle2, Loader2, BrainCircuit, ArrowRight, X, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListTradesQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSVText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';

  function splitLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === delimiter && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1).map(line => {
    const vals = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  }).filter(r => Object.values(r).some(v => v !== ''));

  return { headers, rows };
}

// ─── Column Auto-detection ────────────────────────────────────────────────────

type FieldKey = 'asset' | 'direction' | 'entryPrice' | 'exitPrice' | 'positionSize' | 'tradeDate' | 'closeDate' | 'profitLoss' | 'commission' | 'stopLoss' | 'takeProfit' | 'notes' | 'market';

const FIELD_KEYWORDS: Record<FieldKey, string[]> = {
  asset:        ['symbol', 'ticker', 'asset', 'instrument', 'stock', 'pair', 'contract', 'security'],
  direction:    ['side', 'action', 'direction', 'type', 'trans', 'buy/sell', 'buysell', 'trade type'],
  entryPrice:   ['entry', 'open price', 'buy price', 'open', 'avg price', 'average price', 'exec price'],
  exitPrice:    ['exit', 'close price', 'sell price', 'close', 'avg sell', 'cover price'],
  positionSize: ['quantity', 'qty', 'shares', 'contracts', 'size', 'volume', 'units', 'amount'],
  tradeDate:    ['trade date', 'date', 'open date', 'entry date', 'time', 'opened', 'activity date'],
  closeDate:    ['close date', 'exit date', 'sell date', 'closed', 'settle date'],
  profitLoss:   ['pnl', 'p&l', 'profit', 'loss', 'realized', 'gain', 'net', 'pl ', 'p / l'],
  commission:   ['commission', 'fee', 'comm', 'cost'],
  stopLoss:     ['stop', 'stop loss', 'sl'],
  takeProfit:   ['take profit', 'tp', 'target'],
  notes:        ['notes', 'description', 'comment', 'remarks', 'memo'],
  market:       ['market', 'asset type', 'category', 'class'],
};

const FIELD_LABELS: Record<FieldKey, string> = {
  asset: 'Asset / Ticker',
  direction: 'Direction (Long/Short)',
  entryPrice: 'Entry Price',
  exitPrice: 'Exit Price',
  positionSize: 'Position Size / Qty',
  tradeDate: 'Trade Date',
  closeDate: 'Close Date',
  profitLoss: 'P&L',
  commission: 'Commission',
  stopLoss: 'Stop Loss',
  takeProfit: 'Take Profit',
  notes: 'Notes',
  market: 'Market',
};

const REQUIRED_FIELDS: FieldKey[] = ['asset', 'direction', 'entryPrice', 'exitPrice', 'positionSize', 'tradeDate'];

function autoDetectColumns(headers: string[]): Partial<Record<FieldKey, string>> {
  const mapping: Partial<Record<FieldKey, string>> = {};
  const lower = headers.map(h => h.toLowerCase());

  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS) as [FieldKey, string[]][]) {
    for (const kw of keywords) {
      const idx = lower.findIndex(h => h.includes(kw));
      if (idx !== -1 && !Object.values(mapping).includes(headers[idx])) {
        mapping[field] = headers[idx];
        break;
      }
    }
  }
  return mapping;
}

// ─── Trade Normaliser ─────────────────────────────────────────────────────────

function normalizeDirection(val: string): 'long' | 'short' {
  const v = val.toLowerCase().trim();
  if (['buy', 'b', 'long', 'l', 'bought', 'bo'].includes(v)) return 'long';
  return 'short';
}

function normalizeMarket(val: string): string {
  const v = val.toLowerCase();
  if (v.includes('crypto') || v.includes('coin') || v.includes('btc') || v.includes('eth')) return 'crypto';
  if (v.includes('forex') || v.includes('fx') || v.includes('currency')) return 'forex';
  if (v.includes('future') || v.includes('nq') || v.includes('es ') || v.includes('cl ')) return 'futures';
  return 'stocks';
}

function parseDate(val: string): string {
  if (!val) return new Date().toISOString().slice(0, 10);
  // Handle MM/DD/YYYY, YYYY-MM-DD, etc.
  const cleaned = val.trim().split(' ')[0];
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // Try DD/MM/YYYY
  const parts = cleaned.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const attempt = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
    if (!isNaN(attempt.getTime())) return attempt.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function rowToTrade(row: Record<string, string>, mapping: Partial<Record<FieldKey, string>>, defaultMarket: string) {
  const get = (f: FieldKey) => (mapping[f] ? row[mapping[f]!] ?? '' : '');

  const directionRaw = get('direction');
  const marketRaw = get('market');

  return {
    asset: get('asset').toUpperCase() || 'UNKNOWN',
    market: marketRaw ? normalizeMarket(marketRaw) : defaultMarket,
    direction: directionRaw ? normalizeDirection(directionRaw) : 'long',
    entryPrice: parseFloat(get('entryPrice').replace(/[,$]/g, '')) || 0,
    exitPrice: parseFloat(get('exitPrice').replace(/[,$]/g, '')) || 0,
    positionSize: parseFloat(get('positionSize').replace(/[,$]/g, '')) || 0,
    tradeDate: parseDate(get('tradeDate')),
    closeDate: get('closeDate') ? parseDate(get('closeDate')) : null,
    profitLoss: get('profitLoss') ? parseFloat(get('profitLoss').replace(/[,$]/g, '')) : null,
    commission: get('commission') ? parseFloat(get('commission').replace(/[,$]/g, '')) : null,
    stopLoss: get('stopLoss') ? parseFloat(get('stopLoss').replace(/[,$]/g, '')) : null,
    takeProfit: get('takeProfit') ? parseFloat(get('takeProfit').replace(/[,$]/g, '')) : null,
    notes: get('notes') || null,
  };
}

// ─── Step Types ───────────────────────────────────────────────────────────────

type Step = 'upload' | 'map' | 'preview' | 'done';

interface AiResult {
  headline?: string;
  keyStrength?: string;
  keyWeakness?: string;
  topInsight?: string;
  nextStep?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TradeImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, string>>>({});
  const [defaultMarket, setDefaultMarket] = useState('stocks');
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);

  const reset = () => {
    setStep('upload'); setFileName(''); setHeaders([]); setRows([]);
    setMapping({}); setImporting(false); setImportedCount(0);
    setAnalyzing(false); setAiResult(null);
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSVText(text);
      if (h.length === 0) { toast.error('Could not parse file. Make sure it has headers.'); return; }
      setHeaders(h);
      setRows(r);
      setMapping(autoDetectColumns(h));
      setStep('map');
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const parsedTrades = rows.map(r => rowToTrade(r, mapping, defaultMarket));
  const missingRequired = REQUIRED_FIELDS.filter(f => !mapping[f]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch(`${BASE}/api/trades/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trades: parsedTrades }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { imported } = await res.json() as { imported: number };
      setImportedCount(imported);
      queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      setStep('done');
      toast.success(`${imported} trades imported!`);
    } catch {
      toast.error('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${BASE}/api/trades/import/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trades: parsedTrades }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as AiResult;
      setAiResult(data);
    } catch {
      toast.error('AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Import Trading History
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or TXT file from your broker. We'll auto-detect the columns.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-2 py-2">
          {(['upload', 'map', 'preview', 'done'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s ? 'text-primary' : i < (['upload','map','preview','done'] as Step[]).indexOf(step) ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === s ? 'bg-primary text-primary-foreground border-primary' : i < (['upload','map','preview','done'] as Step[]).indexOf(step) ? 'bg-muted border-muted-foreground/30 text-muted-foreground' : 'border-muted-foreground/20'}`}>
                  {i + 1}
                </div>
                <span className="hidden sm:inline capitalize">{s === 'map' ? 'Map Columns' : s === 'done' ? 'Done' : s}</span>
              </div>
              {i < 3 && <div className="flex-1 h-px bg-border" />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1: Upload ── */}
        {step === 'upload' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
            onClick={() => document.getElementById('import-file-input')?.click()}
          >
            <input
              id="import-file-input"
              type="file"
              accept=".csv,.txt,.tsv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Upload className={`h-10 w-10 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="font-semibold text-foreground">Drop your file here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">Supports CSV, TSV, and TXT files from any broker</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Interactive Brokers', 'TD Ameritrade', 'Robinhood', 'Webull', 'Binance', 'Any CSV'].map(b => (
                <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Map Columns ── */}
        {step === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
                <Badge variant="outline">{rows.length} rows</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
                <X className="h-3.5 w-3.5 mr-1" /> Change file
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Default Market</p>
                <Select value={defaultMarket} onValueChange={setDefaultMarket}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stocks">Stocks</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="futures">Futures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Used when market can't be detected from the file.</p>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 gap-0 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Our Field</span>
                <span>Your Column</span>
                <span>Sample Value</span>
              </div>
              <div className="divide-y divide-border">
                {(Object.keys(FIELD_LABELS) as FieldKey[]).map(field => {
                  const mapped = mapping[field];
                  const sample = mapped && rows[0] ? rows[0][mapped] : '';
                  const isRequired = REQUIRED_FIELDS.includes(field);
                  return (
                    <div key={field} className="grid grid-cols-3 gap-4 px-4 py-2.5 items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{FIELD_LABELS[field]}</span>
                        {isRequired && <span className="text-[10px] text-destructive font-medium">required</span>}
                      </div>
                      <Select
                        value={mapped ?? '__none__'}
                        onValueChange={(v) => setMapping(m => ({ ...m, [field]: v === '__none__' ? undefined : v }))}
                      >
                        <SelectTrigger className={`h-8 text-xs ${!mapped && isRequired ? 'border-destructive/50' : ''}`}>
                          <SelectValue placeholder="(not mapped)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">(not mapped)</SelectItem>
                          {headers.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground font-mono truncate">{sample || '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {missingRequired.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Map required fields: {missingRequired.map(f => FIELD_LABELS[f]).join(', ')}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={() => setStep('preview')} disabled={missingRequired.length > 0}>
                Preview <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview ── */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Previewing <span className="font-medium text-foreground">{parsedTrades.length}</span> trades to import.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setStep('map')}>
                <X className="h-3.5 w-3.5 mr-1" /> Edit mapping
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {['Date', 'Asset', 'Market', 'Dir', 'Entry', 'Exit', 'Size', 'P&L', 'Commission'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedTrades.slice(0, 50).map((t, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{t.tradeDate}</td>
                        <td className="px-3 py-2 font-medium">{t.asset}</td>
                        <td className="px-3 py-2 text-muted-foreground">{t.market}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] uppercase ${t.direction === 'long' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}`}>
                            {t.direction}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 font-mono">{t.entryPrice || '—'}</td>
                        <td className="px-3 py-2 font-mono">{t.exitPrice || '—'}</td>
                        <td className="px-3 py-2 font-mono">{t.positionSize || '—'}</td>
                        <td className={`px-3 py-2 font-mono font-medium ${t.profitLoss != null ? t.profitLoss >= 0 ? 'text-green-500' : 'text-red-500' : 'text-muted-foreground'}`}>
                          {t.profitLoss != null ? (t.profitLoss >= 0 ? '+' : '') + t.profitLoss.toFixed(2) : '—'}
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{t.commission != null ? t.commission : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedTrades.length > 50 && (
                <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border">
                  Showing first 50 of {parsedTrades.length} trades
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep('map')}>Back</Button>
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                Import {parsedTrades.length} Trades to Journal
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 'done' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{importedCount} trades imported</p>
                <p className="text-muted-foreground text-sm mt-1">Your journal has been updated.</p>
              </div>
            </div>

            {!aiResult ? (
              <div className="p-4 rounded-xl border border-border bg-muted/30 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 font-medium">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  Analyze with AI
                </div>
                <p className="text-sm text-muted-foreground">Get an instant performance snapshot of your imported history.</p>
                <Button onClick={handleAnalyze} disabled={analyzing} className="gap-2">
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                  {analyzing ? 'Analyzing…' : 'Run AI Analysis'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" /> AI Snapshot
                </p>
                {aiResult.headline && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <p className="font-medium text-foreground">{aiResult.headline}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiResult.keyStrength && (
                    <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                      <p className="text-xs font-semibold text-green-500 mb-1">Strength</p>
                      <p className="text-sm text-muted-foreground">{aiResult.keyStrength}</p>
                    </div>
                  )}
                  {aiResult.keyWeakness && (
                    <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <p className="text-xs font-semibold text-red-500 mb-1">Weakness</p>
                      <p className="text-sm text-muted-foreground">{aiResult.keyWeakness}</p>
                    </div>
                  )}
                  {aiResult.topInsight && (
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Key Insight</p>
                      <p className="text-sm text-muted-foreground">{aiResult.topInsight}</p>
                    </div>
                  )}
                  {aiResult.nextStep && (
                    <div className="p-3 rounded-lg border border-border bg-muted/30">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Next Step</p>
                      <p className="text-sm text-muted-foreground">{aiResult.nextStep}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { reset(); }}>Import Another File</Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
