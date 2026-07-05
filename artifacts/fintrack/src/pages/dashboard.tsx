import React, { useState } from 'react';
import { useGetDashboard, useGetProfitCurve } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney, formatPercent, formatNumber, cnProfitLoss } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, TrendingUp, Target, Zap, Activity, BrainCircuit, AreaChart as AreaIcon, LineChart as LineIcon, BarChart2 } from 'lucide-react';
import {
  Area, AreaChart,
  Line, LineChart,
  Bar, BarChart,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

type ChartType = 'area' | 'line' | 'bar';
const CHART_KEY = 'fintrack:dashboard-chart-type';

const CHART_OPTIONS: { value: ChartType; icon: React.ReactNode; label: string }[] = [
  { value: 'area', icon: <AreaIcon className="h-3.5 w-3.5" />, label: 'Area' },
  { value: 'line', icon: <LineIcon className="h-3.5 w-3.5" />, label: 'Line' },
  { value: 'bar',  icon: <BarChart2  className="h-3.5 w-3.5" />, label: 'Bar'  },
];

export default function DashboardPage() {
  const [chartType, setChartType] = useState<ChartType>(
    () => (localStorage.getItem(CHART_KEY) as ChartType | null) ?? 'area',
  );
  const { data: dashboard, isLoading: loadingDash } = useGetDashboard();
  const { data: profitCurve, isLoading: loadingCurve } = useGetProfitCurve();

  const isLoading = loadingDash || loadingCurve;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <Button asChild>
          <Link href="/journal">Add Trade</Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's P&L</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cnProfitLoss(dashboard.todayProfitLoss)}`}>
              {formatMoney(dashboard.todayProfitLoss)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reset at 00:00 local time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cnProfitLoss(dashboard.overallProfitLoss)}`}>
              {formatMoney(dashboard.overallProfitLoss)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {formatNumber(dashboard.totalTrades)} total trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(dashboard.winRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg RR: {dashboard.averageRR ? dashboard.averageRR.toFixed(2) : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{dashboard.currentStreak}</div>
              <span className={`text-sm font-medium uppercase ${dashboard.streakType === 'win' ? 'text-profit' : dashboard.streakType === 'loss' ? 'text-loss' : 'text-muted-foreground'}`}>
                {dashboard.streakType ? `${dashboard.streakType}s` : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col">
          <CardHeader className="border-b border-border py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Cumulative P&L</CardTitle>
                <CardDescription>Your equity curve</CardDescription>
              </div>
              <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5 flex-shrink-0">
                {CHART_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setChartType(o.value); localStorage.setItem(CHART_KEY, o.value); }}
                    title={o.label}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition-all ${
                      chartType === o.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {o.icon}
                    <span className="hidden sm:inline">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 min-h-[250px]">
            {profitCurve && profitCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={profitCurve}>
                    <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => formatMoney(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={72} />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(val: number) => [formatMoney(val), 'Cumulative P&L']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="cumulativePL" stroke="hsl(var(--profit))" strokeWidth={2} dot={false} />
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={profitCurve}>
                    <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => formatMoney(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={72} />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(val: number) => [formatMoney(val), 'Cumulative P&L']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Bar dataKey="cumulativePL" fill="hsl(var(--profit))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={profitCurve}>
                    <defs>
                      <linearGradient id="colorPl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(var(--profit))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => formatMoney(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={72} />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(val: number) => [formatMoney(val), 'Cumulative P&L']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="cumulativePL" stroke="hsl(var(--profit))" fillOpacity={1} fill="url(#colorPl)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                <p>No data yet.</p>
                <p className="text-sm mt-1">Log trades to see your profit curve.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insight Card */}
        <Card className="col-span-1 bg-card border-border flex flex-col">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-6">
            {dashboard.aiSummary ? (
              <div className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed">
                {dashboard.aiSummary}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                <BrainCircuit className="h-8 w-8 mb-3 opacity-20" />
                <p>Not enough data yet.</p>
                <p className="text-sm mt-1">Log more trades to unlock AI insights.</p>
              </div>
            )}
            <div className="mt-auto pt-6">
              <Button variant="outline" className="w-full text-xs" asChild>
                <Link href="/ai-coach">Open AI Coach</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades Table */}
        <Card className="col-span-1 lg:col-span-3 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
            <div>
              <CardTitle className="text-base font-semibold">Recent Execution</CardTitle>
              <CardDescription>Your last 5 trades</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
              <Link href="/journal">View all <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {dashboard.recentTrades.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Target className="h-8 w-8 mb-3 opacity-20" />
                <p>No trades logged yet.</p>
                <p className="text-sm mt-1">Add a trade to see it here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="font-medium text-left p-4">Asset</th>
                      <th className="font-medium text-left p-4">Dir</th>
                      <th className="font-medium text-right p-4">Entry</th>
                      <th className="font-medium text-right p-4">Exit</th>
                      <th className="font-medium text-right p-4">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dashboard.recentTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">
                          {trade.asset}
                          <span className="ml-2 text-xs text-muted-foreground">{trade.market}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={trade.direction === 'long' ? 'text-profit border-profit/20' : 'text-loss border-loss/20'}>
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-mono">{trade.entryPrice}</td>
                        <td className="p-4 text-right font-mono">{trade.exitPrice || '-'}</td>
                        <td className={`p-4 text-right font-mono font-medium ${cnProfitLoss(trade.profitLoss)}`}>
                          {trade.profitLoss ? formatMoney(trade.profitLoss) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}