import { useState, useCallback } from 'react';
import { 
  useGetProfitCurve, 
  useGetMonthlyReturns, 
  useGetAnalyticsByAsset, 
  useGetAnalyticsByDay 
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney, formatPercent, cnProfitLoss } from '@/lib/utils';
import { 
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell as PieCell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

// ─── Chart type definitions ───────────────────────────────────────────────────

type EquityChartType   = 'area' | 'line' | 'bar';
type MonthlyChartType  = 'bar'  | 'line' | 'area';
type DayChartType      = 'bar'  | 'line';
type AssetChartType    = 'table' | 'bar' | 'pie';

const STORAGE_KEY = 'roxel:analytics-chart-types';

function loadPrefs(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}
function savePrefs(prefs: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function useChartType<T extends string>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => (loadPrefs()[key] as T) ?? defaultValue);
  const set = useCallback((v: T) => {
    setValue(v);
    const prefs = loadPrefs();
    prefs[key] = v;
    savePrefs(prefs);
  }, [key]);
  return [value, set];
}

// ─── Chart type toggle ────────────────────────────────────────────────────────

interface ChartTypeOption<T extends string> { value: T; label: string }

function ChartTypeToggle<T extends string>({ 
  options, value, onChange 
}: { 
  options: ChartTypeOption<T>[]; value: T; onChange: (v: T) => void 
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
            value === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Shared tooltips ──────────────────────────────────────────────────────────

const MoneyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-sm">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono font-medium">{formatMoney(payload[0].value)}</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-sm">
      <p className="text-muted-foreground mb-1">{d.name}</p>
      <p className="font-mono font-medium">{formatMoney(d.value)}</p>
      <p className="text-xs text-muted-foreground">{(d.payload.percent * 100).toFixed(1)}%</p>
    </div>
  );
};

// ─── PIE colours ─────────────────────────────────────────────────────────────

const PIE_COLORS = [
  'hsl(var(--profit))',
  '#60a5fa', '#f59e0b', '#a78bfa', '#f472b6', '#34d399',
  '#fb923c', '#38bdf8', '#818cf8', '#4ade80',
];

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-2 px-8">
      <p className="text-muted-foreground font-medium">{title}</p>
      <p className="text-sm text-muted-foreground/70 max-w-sm">{body}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: profitCurve,   isLoading: loadingPC } = useGetProfitCurve();
  const { data: monthlyReturns, isLoading: loadingMR } = useGetMonthlyReturns();
  const { data: assetStats,    isLoading: loadingAS } = useGetAnalyticsByAsset();
  const { data: dayStats,      isLoading: loadingDS } = useGetAnalyticsByDay();

  const [equityType,  setEquityType]  = useChartType<EquityChartType>('equity',  'area');
  const [monthlyType, setMonthlyType] = useChartType<MonthlyChartType>('monthly', 'bar');
  const [dayType,     setDayType]     = useChartType<DayChartType>('day',         'bar');
  const [assetType,   setAssetType]   = useChartType<AssetChartType>('asset',     'table');

  // ── Equity curve ────────────────────────────────────────────────────────────
  const renderEquity = () => {
    if (loadingPC) return <Skeleton className="h-full w-full" />;
    if (!profitCurve?.length) return (
      <EmptyState
        title="No equity curve yet"
        body="Your cumulative P&L curve will appear here once you log your first closed trades. It shows how your account balance grows (or shrinks) over time."
      />
    );

    const commonProps = {
      data: profitCurve,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };
    const xAxis = (
      <XAxis
        dataKey="date"
        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
      />
    );
    const yAxis = (
      <YAxis
        stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
        tickFormatter={(val) => `$${val}`}
      />
    );
    const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />;
    const tooltip = <Tooltip content={<MoneyTooltip />} />;

    if (equityType === 'line') return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Line type="monotone" dataKey="cumulativePL" stroke="hsl(var(--profit))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );

    if (equityType === 'bar') return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Bar dataKey="cumulativePL" radius={[4, 4, 0, 0]}>
            {profitCurve.map((entry, i) => (
              <Cell key={i} fill={entry.cumulativePL >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );

    // default: area
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorPl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0} />
            </linearGradient>
          </defs>
          {grid}{xAxis}{yAxis}{tooltip}
          <Area type="monotone" dataKey="cumulativePL" stroke="hsl(var(--profit))"
            fillOpacity={1} fill="url(#colorPl)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // ── Monthly returns ──────────────────────────────────────────────────────────
  const renderMonthly = () => {
    if (loadingMR) return <Skeleton className="h-full w-full" />;
    if (!monthlyReturns?.length) return (
      <EmptyState
        title="No monthly data yet"
        body="Monthly P&L bars will appear here as you log trades across different months — great for spotting seasonal patterns."
      />
    );

    const commonProps = { data: monthlyReturns, margin: { top: 10, right: 10, left: 0, bottom: 0 } };
    const xAxis = (
      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
    );
    const yAxis = (
      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
        tickFormatter={(val) => `$${val}`} />
    );
    const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />;
    const tooltip = <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />;

    if (monthlyType === 'line') return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Line type="monotone" dataKey="profitLoss" stroke="hsl(var(--profit))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--profit))' }} />
        </LineChart>
      </ResponsiveContainer>
    );

    if (monthlyType === 'area') return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0} />
            </linearGradient>
          </defs>
          {grid}{xAxis}{yAxis}
          <Tooltip content={<MoneyTooltip />} />
          <Area type="monotone" dataKey="profitLoss" stroke="hsl(var(--profit))"
            fillOpacity={1} fill="url(#colorMonthly)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );

    // default: bar
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart {...commonProps}>
          {grid}{xAxis}{yAxis}{tooltip}
          <Bar dataKey="profitLoss" radius={[4, 4, 0, 0]}>
            {monthlyReturns.map((entry, i) => (
              <Cell key={i} fill={entry.profitLoss >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ── Day of week ──────────────────────────────────────────────────────────────
  const renderDay = () => {
    if (loadingDS) return <Skeleton className="h-full w-full" />;
    if (!dayStats?.length) return (
      <EmptyState
        title="No day-of-week data yet"
        body="Once you have trades logged, this chart reveals which days of the week you perform best — so you can trade more on your strongest days."
      />
    );

    if (dayType === 'line') return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dayStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="dayName" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
            tickFormatter={(val) => `$${val}`} />
          <Tooltip content={<MoneyTooltip />} />
          <Line type="monotone" dataKey="totalPL" stroke="hsl(var(--profit))" strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(var(--profit))' }} />
        </LineChart>
      </ResponsiveContainer>
    );

    // default: horizontal bar
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dayStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12}
            tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <YAxis type="category" dataKey="dayName" stroke="hsl(var(--muted-foreground))"
            fontSize={12} tickLine={false} axisLine={false} width={50} />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
          <Bar dataKey="totalPL" radius={[0, 4, 4, 0]} barSize={20}>
            {dayStats.map((entry, i) => (
              <Cell key={i} fill={entry.totalPL >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ── Asset breakdown ──────────────────────────────────────────────────────────
  const renderAsset = () => {
    if (loadingAS) {
      if (assetType === 'table') return (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
      );
      return <Skeleton className="h-full w-full" />;
    }
    if (!assetStats?.length) return (
      <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
        <p className="text-muted-foreground font-medium">No asset data yet</p>
        <p className="text-sm text-muted-foreground/70 max-w-md">This section will break down your win rate, average R/R, and net P&L by instrument — showing you exactly which assets you have a statistical edge in.</p>
      </div>
    );

    if (assetType === 'bar') {
      const barData = assetStats.map(s => ({ name: s.asset, totalPL: s.totalPL }));
      return (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12}
                tickLine={false} axisLine={false} angle={-30} textAnchor="end" interval={0} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false}
                axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="totalPL" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.totalPL >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (assetType === 'pie') {
      // Use absolute value for pie sizing, label with sign
      const pieData = assetStats.map((s, i) => ({
        name: s.asset,
        value: Math.abs(s.totalPL),
        rawPL: s.totalPL,
        percent: 0, // filled by recharts
        fill: PIE_COLORS[i % PIE_COLORS.length],
      }));
      return (
        <div className="h-[260px] flex items-center gap-4">
          <ResponsiveContainer width="55%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius="45%" outerRadius="75%" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <PieCell key={i} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2 pr-2 overflow-y-auto max-h-[240px]">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                  <span className="truncate text-muted-foreground">{d.name}</span>
                </div>
                <span className={`font-mono font-medium flex-shrink-0 ${cnProfitLoss(d.rawPL)}`}>
                  {formatMoney(d.rawPL)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // default: table
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="font-medium text-left pb-3">Asset</th>
              <th className="font-medium text-left pb-3">Market</th>
              <th className="font-medium text-right pb-3">Trades</th>
              <th className="font-medium text-right pb-3">Win Rate</th>
              <th className="font-medium text-right pb-3">Avg R/R</th>
              <th className="font-medium text-right pb-3">Net P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assetStats.map((stat, i) => (
              <tr key={i} className="hover:bg-muted/50 transition-colors">
                <td className="py-3 font-medium">{stat.asset}</td>
                <td className="py-3 text-muted-foreground">{stat.market}</td>
                <td className="py-3 text-right font-mono">{stat.tradeCount}</td>
                <td className="py-3 text-right font-mono">{formatPercent(stat.winRate)}</td>
                <td className="py-3 text-right font-mono">{stat.avgRR ? stat.avgRR.toFixed(2) : '-'}</td>
                <td className={`py-3 text-right font-mono font-medium ${cnProfitLoss(stat.totalPL)}`}>
                  {formatMoney(stat.totalPL)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ── Layout ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your trading performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cumulative P&L */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Cumulative P&L</CardTitle>
              <CardDescription>Your equity curve over time</CardDescription>
            </div>
            <ChartTypeToggle
              value={equityType}
              onChange={setEquityType}
              options={[
                { value: 'area', label: 'Area' },
                { value: 'line', label: 'Line' },
                { value: 'bar',  label: 'Bar'  },
              ]}
            />
          </CardHeader>
          <CardContent className="h-[350px]">{renderEquity()}</CardContent>
        </Card>

        {/* Monthly Returns */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Monthly Returns</CardTitle>
              <CardDescription>P&L breakdown by month</CardDescription>
            </div>
            <ChartTypeToggle
              value={monthlyType}
              onChange={setMonthlyType}
              options={[
                { value: 'bar',  label: 'Bar'  },
                { value: 'line', label: 'Line' },
                { value: 'area', label: 'Area' },
              ]}
            />
          </CardHeader>
          <CardContent className="h-[300px]">{renderMonthly()}</CardContent>
        </Card>

        {/* Performance by Day */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Performance by Day</CardTitle>
              <CardDescription>Which days are you most profitable?</CardDescription>
            </div>
            <ChartTypeToggle
              value={dayType}
              onChange={setDayType}
              options={[
                { value: 'bar',  label: 'Bar'  },
                { value: 'line', label: 'Line' },
              ]}
            />
          </CardHeader>
          <CardContent className="h-[300px]">{renderDay()}</CardContent>
        </Card>

        {/* Asset Breakdown */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Asset Breakdown</CardTitle>
              <CardDescription>Your edge by instrument</CardDescription>
            </div>
            <ChartTypeToggle
              value={assetType}
              onChange={setAssetType}
              options={[
                { value: 'table', label: 'Table' },
                { value: 'bar',   label: 'Bar'   },
                { value: 'pie',   label: 'Pie'   },
              ]}
            />
          </CardHeader>
          <CardContent>{renderAsset()}</CardContent>
        </Card>

      </div>
    </div>
  );
}
