import React from 'react';
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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

export default function AnalyticsPage() {
  const { data: profitCurve, isLoading: loadingPC } = useGetProfitCurve();
  const { data: monthlyReturns, isLoading: loadingMR } = useGetMonthlyReturns();
  const { data: assetStats, isLoading: loadingAS } = useGetAnalyticsByAsset();
  const { data: dayStats, isLoading: loadingDS } = useGetAnalyticsByDay();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-sm">
          <p className="text-muted-foreground mb-1">{label}</p>
          <p className="font-mono font-medium">{formatMoney(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your trading performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Curve */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumulative P&L</CardTitle>
            <CardDescription>Your equity curve over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {loadingPC ? (
              <Skeleton className="h-full w-full" />
            ) : profitCurve && profitCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativePL" 
                    stroke="hsl(var(--profit))" 
                    fillOpacity={1} 
                    fill="url(#colorPl)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Returns</CardTitle>
            <CardDescription>P&L breakdown by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingMR ? (
              <Skeleton className="h-full w-full" />
            ) : monthlyReturns && monthlyReturns.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="label" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="profitLoss" radius={[4, 4, 0, 0]}>
                    {monthlyReturns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profitLoss >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>

        {/* Performance By Day */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Day</CardTitle>
            <CardDescription>Which days are you most profitable?</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingDS ? (
              <Skeleton className="h-full w-full" />
            ) : dayStats && dayStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="dayName"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="totalPL" radius={[0, 4, 4, 0]} barSize={20}>
                    {dayStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.totalPL >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>

        {/* Asset Breakdown Table */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Asset Breakdown</CardTitle>
            <CardDescription>Your edge by instrument</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAS ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : assetStats && assetStats.length > 0 ? (
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
            ) : (
              <div className="p-8 text-center text-muted-foreground">Not enough data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}