import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Plus, X, TrendingUp, TrendingDown,
  Activity, RefreshCw, LineChart as LineIcon, BarChart2, AreaChartIcon,
  CandlestickChart as CandleIcon,
} from 'lucide-react';
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { createChart, ColorType, CandlestickSeries, type ISeriesApi } from 'lightweight-charts';
import { format } from 'date-fns';

// ─── API helpers ─────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

type Quote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  prevClose: number;
  currency: string;
};

type HistoryPoint = {
  time: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

async function apiFetch<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json() as Promise<T>;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const WATCHLIST_KEY = 'fintrack:watchlist-v2';
const CHART_TYPE_KEY = 'fintrack:stocks-chart-type';
const DEFAULT_WATCHLIST = ['AAPL', 'TSLA', 'MSFT', 'BTC-USD', 'SPY'];

function loadWatchlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? 'null') ?? DEFAULT_WATCHLIST; }
  catch { return DEFAULT_WATCHLIST; }
}
function saveWatchlist(wl: string[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(wl));
}

type ChartType = 'area' | 'line' | 'bar' | 'candle';
type Range = '1d' | '5d' | '1mo' | '3mo';

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmtChange(v: number) {
  return (v >= 0 ? '+' : '') + v.toFixed(2);
}
function fmtPct(v: number) {
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
}
function fmtCompact(n?: number) {
  if (!n) return '—';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return n.toLocaleString();
}
function fmtVol(n?: number) { return n ? fmtCompact(n) : '—'; }

// ─── Toggle group ─────────────────────────────────────────────────────────────

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition-all ${
            value === o.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Candlestick chart (lightweight-charts) ───────────────────────────────────

function CandlestickChart({ points }: { points: HistoryPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(215 20% 55%)',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'hsl(215 20% 18%)' },
        horzLines: { color: 'hsl(215 20% 18%)' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: 'hsl(215 20% 18%)' },
      timeScale: { borderColor: 'hsl(215 20% 18%)', timeVisible: true, secondsVisible: false },
      width: el.clientWidth,
      height: 300,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(142 71% 45%)',
      downColor: 'hsl(0 72% 51%)',
      borderUpColor: 'hsl(142 71% 45%)',
      borderDownColor: 'hsl(0 72% 51%)',
      wickUpColor: 'hsl(142 71% 45%)',
      wickDownColor: 'hsl(0 72% 51%)',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !points.length) return;
    const candles = points
      .map((p) => ({
        time: Math.floor(p.time / 1000) as any,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close,
      }))
      // lightweight-charts requires strictly ascending time; dedupe by taking last value per second
      .reduce<{ time: number; open: number; high: number; low: number; close: number }[]>((acc, c) => {
        if (acc.length && acc[acc.length - 1].time === c.time) {
          acc[acc.length - 1] = c;
        } else {
          acc.push(c);
        }
        return acc;
      }, []);

    seriesRef.current.setData(candles as any);
    chartRef.current?.timeScale().fitContent();
  }, [points]);

  return <div ref={containerRef} className="w-full" style={{ height: 300 }} />;
}

// ─── Recharts price chart (area / line / bar) ─────────────────────────────────

const RANGES: { value: Range; label: string }[] = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
];

const CHART_TYPES: { value: ChartType; icon: React.ReactNode; label: string }[] = [
  { value: 'candle', icon: <CandleIcon className="h-3.5 w-3.5" />, label: 'Candle' },
  { value: 'area',   icon: <AreaChartIcon className="h-3.5 w-3.5" />, label: 'Area'  },
  { value: 'line',   icon: <LineIcon      className="h-3.5 w-3.5" />, label: 'Line'  },
  { value: 'bar',    icon: <BarChart2     className="h-3.5 w-3.5" />, label: 'Bar'   },
];

function PriceChart({
  points,
  type,
  currency,
  range,
}: {
  points: HistoryPoint[];
  type: ChartType;
  currency: string;
  range: Range;
}) {
  if (type === 'candle') return <CandlestickChart points={points} />;

  const isUp = points.length > 1 && points[points.length - 1].price >= points[0].price;
  const color = isUp ? 'hsl(var(--profit))' : 'hsl(var(--loss))';

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    if (range === '1d') return format(d, 'HH:mm');
    if (range === '5d') return format(d, 'EEE HH:mm');
    return format(d, 'MMM d');
  };

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-sm">
        <p className="text-muted-foreground mb-1">{fmtTime(label)}</p>
        <p className="font-mono font-semibold">{currency} {Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  };

  const shared = { data: points, margin: { top: 8, right: 8, left: 0, bottom: 0 } };
  const xAxis = (
    <XAxis
      dataKey="time"
      tickFormatter={fmtTime}
      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
      tickLine={false}
      axisLine={false}
      minTickGap={60}
    />
  );
  const yAxis = (
    <YAxis
      domain={['auto', 'auto']}
      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
      tickLine={false}
      axisLine={false}
      width={64}
      tickFormatter={(v) => Number(v).toFixed(0)}
    />
  );
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />;
  const tooltip = <Tooltip content={<ChartTooltip />} />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === 'line' ? (
        <LineChart {...shared}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      ) : type === 'bar' ? (
        <BarChart {...shared}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Bar dataKey="price" fill={color} radius={[2, 2, 0, 0]} maxBarSize={8} />
        </BarChart>
      ) : (
        <AreaChart {...shared}>
          <defs>
            <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0}   />
            </linearGradient>
          </defs>
          {grid}{xAxis}{yAxis}{tooltip}
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#stockGrad)" dot={false} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}

// ─── Quote card ───────────────────────────────────────────────────────────────

function QuoteCard({
  quote,
  selected,
  onSelect,
  onRemove,
}: {
  quote: Quote;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const isUp = (quote.change ?? 0) >= 0;
  return (
    <button
      onClick={onSelect}
      className={`group relative w-full text-left rounded-xl border p-4 transition-all hover:shadow-md ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        title="Remove from watchlist"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-sm tracking-tight">{quote.symbol}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[100px]">{quote.name}</p>
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-0.5 ${
          isUp ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
        }`}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {fmtPct(quote.changePercent)}
        </div>
      </div>

      <p className="text-2xl font-bold font-mono tracking-tight">
        {quote.price?.toFixed(2)}
      </p>
      <p className={`text-xs font-mono mt-0.5 ${isUp ? 'text-profit' : 'text-loss'}`}>
        {fmtChange(quote.change)} today
      </p>
    </button>
  );
}

// ─── Search dropdown ──────────────────────────────────────────────────────────

function SearchDropdown({
  results,
  onAdd,
}: {
  results: SearchResult[];
  onAdd: (symbol: string) => void;
}) {
  if (results.length === 0) return null;
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
      {results.map((r) => (
        <button
          key={r.symbol}
          onClick={() => onAdd(r.symbol)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/60 transition-colors text-sm"
        >
          <div className="flex items-center gap-3">
            <span className="font-bold font-mono">{r.symbol}</span>
            <span className="text-muted-foreground truncate">{r.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-[10px] py-0">{r.type}</Badge>
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StocksPage() {
  const [watchlist, setWatchlist] = useState<string[]>(loadWatchlist);
  const [selected, setSelected] = useState<string>(watchlist[0] ?? 'AAPL');
  const [range, setRange] = useState<Range>('1d');
  const [chartType, setChartType] = useState<ChartType>(
    () => (localStorage.getItem(CHART_TYPE_KEY) as ChartType | null) ?? 'candle',
  );
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Persist chart type preference
  useEffect(() => { localStorage.setItem(CHART_TYPE_KEY, chartType); }, [chartType]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live quotes — refresh every 5 s
  const { data: quotes = [], isLoading: quotesLoading, dataUpdatedAt, refetch } = useQuery<Quote[]>({
    queryKey: ['stocks-quotes', watchlist],
    queryFn: () => apiFetch<Quote[]>(`/api/stocks/quote?symbols=${encodeURIComponent(watchlist.join(','))}`),
    refetchInterval: 5_000,
    enabled: watchlist.length > 0,
    staleTime: 4_000,
  });

  // History for selected symbol — 15 s for intraday, 60 s for longer ranges
  const { data: history, isLoading: historyLoading } = useQuery<{
    points: HistoryPoint[];
    currency: string;
    regularMarketPrice: number;
  }>({
    queryKey: ['stocks-history', selected, range],
    queryFn: () =>
      apiFetch(`/api/stocks/history/${encodeURIComponent(selected)}?range=${range}`),
    refetchInterval: range === '1d' ? 15_000 : 60_000,
    enabled: !!selected,
    staleTime: 12_000,
  });

  // Search results
  const { data: searchResults = [] } = useQuery<SearchResult[]>({
    queryKey: ['stocks-search', search],
    queryFn: () => apiFetch<SearchResult[]>(`/api/stocks/search?q=${encodeURIComponent(search)}`),
    enabled: search.length >= 1,
    staleTime: 30_000,
  });

  const selectedQuote = quotes.find((q) => q.symbol === selected);

  function addSymbol(symbol: string) {
    const upper = symbol.toUpperCase();
    if (!watchlist.includes(upper)) {
      const next = [...watchlist, upper];
      setWatchlist(next);
      saveWatchlist(next);
      setSelected(upper);
    }
    setSearch('');
    setSearchOpen(false);
  }

  function removeSymbol(symbol: string) {
    const next = watchlist.filter((s) => s !== symbol);
    setWatchlist(next);
    saveWatchlist(next);
    if (selected === symbol) setSelected(next[0] ?? '');
  }

  const lastUpdated = dataUpdatedAt
    ? format(new Date(dataUpdatedAt), 'HH:mm:ss')
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Markets</h1>
          <p className="text-muted-foreground mt-1">
            Powered by Finnhub — auto-refreshes every 5 s.
            {lastUpdated && (
              <span className="ml-2 text-xs font-mono opacity-60">Last: {lastUpdated}</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbol or company…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className="pl-9 pr-9 bg-card"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setSearchOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {searchOpen && search.length > 0 && (
          <SearchDropdown results={searchResults} onAdd={addSymbol} />
        )}
      </div>

      {/* Watchlist grid */}
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <Activity className="h-8 w-8 opacity-20" />
          <p>Your watchlist is empty. Search above to add symbols.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {quotesLoading
            ? watchlist.map((s) => (
                <div key={s} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            : watchlist.map((symbol) => {
                const q = quotes.find((qq) => qq.symbol === symbol);
                if (!q) {
                  return (
                    <div key={symbol} className="rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-1 min-h-[100px]">
                      <p className="font-bold text-sm">{symbol}</p>
                      <p className="text-xs text-muted-foreground">Not found</p>
                      <button onClick={() => removeSymbol(symbol)} className="mt-1 text-xs text-destructive hover:underline">Remove</button>
                    </div>
                  );
                }
                return (
                  <QuoteCard
                    key={symbol}
                    quote={q}
                    selected={selected === symbol}
                    onSelect={() => setSelected(symbol)}
                    onRemove={() => removeSymbol(symbol)}
                  />
                );
              })}
        </div>
      )}

      {/* Chart section */}
      {selected && (
        <Card>
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedQuote ? (
                    <>
                      <span>{selected}</span>
                      <span className="text-muted-foreground font-normal text-base">
                        {selectedQuote.name}
                      </span>
                    </>
                  ) : (
                    <span>{selected}</span>
                  )}
                </CardTitle>
                {selectedQuote && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl font-bold font-mono">
                      {selectedQuote.currency} {selectedQuote.price?.toFixed(2)}
                    </span>
                    <span className={`text-sm font-mono font-medium ${selectedQuote.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {fmtChange(selectedQuote.change)} ({fmtPct(selectedQuote.changePercent)})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <ToggleGroup
                  options={RANGES.map((r) => ({ value: r.value, label: r.label }))}
                  value={range}
                  onChange={setRange}
                />
                <ToggleGroup
                  options={CHART_TYPES}
                  value={chartType}
                  onChange={setChartType}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {historyLoading ? (
              <Skeleton className="h-[300px] w-full rounded-lg" />
            ) : history && history.points.length > 0 ? (
              <>
                <PriceChart
                  points={history.points}
                  type={chartType}
                  currency={history.currency}
                  range={range}
                />
                {/* Stats row */}
                {selectedQuote && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Open</p>
                      <p className="font-mono font-medium">{selectedQuote.open?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Prev Close</p>
                      <p className="font-mono font-medium">{selectedQuote.prevClose?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Day High</p>
                      <p className="font-mono font-medium text-profit">{selectedQuote.dayHigh?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Day Low</p>
                      <p className="font-mono font-medium text-loss">{selectedQuote.dayLow?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Volume</p>
                      <p className="font-mono font-medium">{fmtVol(selectedQuote.volume)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Market Cap</p>
                      <p className="font-mono font-medium">{fmtCompact(selectedQuote.marketCap)}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No chart data available for {selected}.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
