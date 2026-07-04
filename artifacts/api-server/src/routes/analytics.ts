import { Router } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, tradesTable, aiAnalysisTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import {
  GetDashboardResponse,
  GetProfitCurveResponse,
  GetMonthlyReturnsResponse,
  GetAnalyticsByAssetResponse,
  GetAnalyticsByDayResponse,
  GetCalendarDataQueryParams,
  GetCalendarDataResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/analytics/dashboard", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const trades = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, userId))
    .orderBy(desc(tradesTable.tradeDate));

  const total = trades.length;
  const wins = trades.filter(t => t.result === "win").length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  const totalPL = trades.reduce((sum, t) => sum + Number(t.profitLoss ?? 0), 0);

  const today = new Date().toISOString().split("T")[0];
  const todayPL = trades
    .filter(t => t.tradeDate === today)
    .reduce((sum, t) => sum + Number(t.profitLoss ?? 0), 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const monthStr = startOfMonth.toISOString().split("T")[0];
  const monthlyPL = trades
    .filter(t => t.tradeDate >= monthStr)
    .reduce((sum, t) => sum + Number(t.profitLoss ?? 0), 0);

  // Calculate streak
  let currentStreak = 0;
  let streakType: "win" | "loss" | null = null;
  for (const t of trades) {
    if (!t.result || t.result === "breakeven") break;
    if (streakType === null) {
      streakType = t.result as "win" | "loss";
      currentStreak = 1;
    } else if (t.result === streakType) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Average RR
  const rrs = trades.filter(t => t.riskReward != null).map(t => Number(t.riskReward));
  const averageRR = rrs.length > 0 ? rrs.reduce((a, b) => a + b, 0) / rrs.length : null;

  const recentTrades = trades.slice(0, 5).map(normalizeTrade);

  // Latest AI summary
  const [latestAi] = await db
    .select()
    .from(aiAnalysisTable)
    .where(eq(aiAnalysisTable.userId, userId))
    .orderBy(desc(aiAnalysisTable.createdAt))
    .limit(1);

  const dashboard = {
    totalTrades: total,
    winRate: Math.round(winRate * 10) / 10,
    totalProfitLoss: totalPL,
    todayProfitLoss: todayPL,
    overallProfitLoss: totalPL,
    currentStreak,
    streakType: streakType ?? null,
    averageRR: averageRR !== null ? Math.round(averageRR * 100) / 100 : null,
    monthlyProfitLoss: monthlyPL,
    recentTrades,
    aiSummary: latestAi?.summary ?? null,
  };

  res.json(GetDashboardResponse.parse(dashboard));
});

router.get("/analytics/profit-curve", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const trades = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, userId))
    .orderBy(tradesTable.tradeDate);

  // Group by date
  const byDate: Record<string, { dailyPL: number; count: number }> = {};
  for (const t of trades) {
    const d = t.tradeDate;
    if (!byDate[d]) byDate[d] = { dailyPL: 0, count: 0 };
    byDate[d].dailyPL += Number(t.profitLoss ?? 0);
    byDate[d].count++;
  }

  let cumulative = 0;
  const curve = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { dailyPL, count }]) => {
      cumulative += dailyPL;
      return { date, cumulativePL: cumulative, dailyPL, tradeCount: count };
    });

  res.json(GetProfitCurveResponse.parse(curve));
});

router.get("/analytics/monthly-returns", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const trades = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, userId));

  const monthMap: Record<string, { year: number; month: number; pl: number; total: number; wins: number }> = {};
  for (const t of trades) {
    const [yr, mo] = t.tradeDate.split("-");
    const key = `${yr}-${mo}`;
    if (!monthMap[key]) monthMap[key] = { year: Number(yr), month: Number(mo), pl: 0, total: 0, wins: 0 };
    monthMap[key].pl += Number(t.profitLoss ?? 0);
    monthMap[key].total++;
    if (t.result === "win") monthMap[key].wins++;
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const result = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({
      year: v.year,
      month: v.month,
      label: `${MONTHS[v.month - 1]} ${v.year}`,
      profitLoss: v.pl,
      tradeCount: v.total,
      winRate: v.total > 0 ? Math.round((v.wins / v.total) * 1000) / 10 : 0,
    }));

  res.json(GetMonthlyReturnsResponse.parse(result));
});

router.get("/analytics/by-asset", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const trades = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, userId));

  const assetMap: Record<string, { market: string; pl: number; total: number; wins: number; rrs: number[] }> = {};
  for (const t of trades) {
    const key = `${t.asset}:::${t.market}`;
    if (!assetMap[key]) assetMap[key] = { market: t.market, pl: 0, total: 0, wins: 0, rrs: [] };
    assetMap[key].pl += Number(t.profitLoss ?? 0);
    assetMap[key].total++;
    if (t.result === "win") assetMap[key].wins++;
    if (t.riskReward != null) assetMap[key].rrs.push(Number(t.riskReward));
  }

  const result = Object.entries(assetMap).map(([key, v]) => {
    const [asset] = key.split(":::");
    const avgRR = v.rrs.length > 0 ? v.rrs.reduce((a, b) => a + b, 0) / v.rrs.length : null;
    return {
      asset,
      market: v.market,
      tradeCount: v.total,
      totalPL: v.pl,
      winRate: v.total > 0 ? Math.round((v.wins / v.total) * 1000) / 10 : 0,
      avgRR: avgRR !== null ? Math.round(avgRR * 100) / 100 : null,
    };
  }).sort((a, b) => b.totalPL - a.totalPL);

  res.json(GetAnalyticsByAssetResponse.parse(result));
});

router.get("/analytics/by-day", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const trades = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, userId));

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayMap: Record<number, { pl: number; total: number; wins: number }> = {};
  for (let i = 0; i < 7; i++) dayMap[i] = { pl: 0, total: 0, wins: 0 };

  for (const t of trades) {
    const dow = new Date(t.tradeDate + "T12:00:00Z").getUTCDay();
    dayMap[dow].pl += Number(t.profitLoss ?? 0);
    dayMap[dow].total++;
    if (t.result === "win") dayMap[dow].wins++;
  }

  const result = Object.entries(dayMap).map(([dow, v]) => ({
    dayOfWeek: Number(dow),
    dayName: DAY_NAMES[Number(dow)],
    tradeCount: v.total,
    totalPL: v.pl,
    winRate: v.total > 0 ? Math.round((v.wins / v.total) * 1000) / 10 : 0,
  }));

  res.json(GetAnalyticsByDayResponse.parse(result));
});

router.get("/analytics/calendar", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const qp = GetCalendarDataQueryParams.safeParse(req.query);

  const now = new Date();
  const year = qp.success && qp.data.year ? Number(qp.data.year) : now.getFullYear();
  const month = qp.success && qp.data.month ? Number(qp.data.month) : now.getMonth() + 1;

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const trades = await db
    .select()
    .from(tradesTable)
    .where(
      and(
        eq(tradesTable.userId, userId),
        sql`${tradesTable.tradeDate} >= ${startDate}`,
        sql`${tradesTable.tradeDate} <= ${endDate}`,
      ),
    );

  const dayMap: Record<string, { pl: number; total: number; wins: number; losses: number }> = {};
  for (const t of trades) {
    const d = t.tradeDate;
    if (!dayMap[d]) dayMap[d] = { pl: 0, total: 0, wins: 0, losses: 0 };
    dayMap[d].pl += Number(t.profitLoss ?? 0);
    dayMap[d].total++;
    if (t.result === "win") dayMap[d].wins++;
    if (t.result === "loss") dayMap[d].losses++;
  }

  const result = Object.entries(dayMap).map(([date, v]) => ({
    date,
    profitLoss: v.pl,
    tradeCount: v.total,
    result: v.pl > 0 ? "win" : v.pl < 0 ? "loss" : v.total > 0 ? "breakeven" : "none",
  }));

  res.json(GetCalendarDataResponse.parse(result));
});

function normalizeTrade(trade: typeof tradesTable.$inferSelect) {
  return {
    ...trade,
    entryPrice: Number(trade.entryPrice),
    exitPrice: Number(trade.exitPrice),
    stopLoss: trade.stopLoss != null ? Number(trade.stopLoss) : null,
    takeProfit: trade.takeProfit != null ? Number(trade.takeProfit) : null,
    positionSize: Number(trade.positionSize),
    commission: trade.commission != null ? Number(trade.commission) : null,
    riskPercent: trade.riskPercent != null ? Number(trade.riskPercent) : null,
    profitLoss: trade.profitLoss != null ? Number(trade.profitLoss) : null,
    profitLossPercent: trade.profitLossPercent != null ? Number(trade.profitLossPercent) : null,
    riskReward: trade.riskReward != null ? Number(trade.riskReward) : null,
  };
}

export default router;
