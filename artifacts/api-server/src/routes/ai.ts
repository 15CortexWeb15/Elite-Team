import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, tradesTable, aiAnalysisTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import {
  RequestAiAnalysisBody,
  RequestAiAnalysisResponse,
  GetLatestAiAnalysisResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/ai/analysis/latest", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const [analysis] = await db
    .select()
    .from(aiAnalysisTable)
    .where(eq(aiAnalysisTable.userId, userId))
    .orderBy(desc(aiAnalysisTable.createdAt))
    .limit(1);

  if (!analysis) {
    res.status(404).json({ error: "No analysis yet" });
    return;
  }

  res.json(GetLatestAiAnalysisResponse.parse(normalizeAnalysis(analysis)));
});

router.post("/ai/analysis", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = RequestAiAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const period = parsed.data.period ?? "all";

  // Fetch trades for this period
  let trades = await db
    .select()
    .from(tradesTable)
    .where(eq(tradesTable.userId, userId))
    .orderBy(desc(tradesTable.tradeDate));

  if (period === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split("T")[0];
    trades = trades.filter(t => t.tradeDate >= weekStr);
  } else if (period === "month") {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthStr = monthAgo.toISOString().split("T")[0];
    trades = trades.filter(t => t.tradeDate >= monthStr);
  }

  if (trades.length === 0) {
    res.status(400).json({ error: "No trades found for the selected period. Add some trades first." });
    return;
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    res.status(503).json({ error: "AI Coach is not configured. Please set the GROQ_API_KEY environment variable." });
    return;
  }

  // Build trading summary for Groq
  const total = trades.length;
  const wins = trades.filter(t => t.result === "win").length;
  const losses = trades.filter(t => t.result === "loss").length;
  const breakevens = trades.filter(t => t.result === "breakeven").length;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0";
  const totalPL = trades.reduce((sum, t) => sum + Number(t.profitLoss ?? 0), 0);
  const avgPL = total > 0 ? (totalPL / total).toFixed(2) : "0";
  const rrs = trades.filter(t => t.riskReward != null).map(t => Number(t.riskReward));
  const avgRR = rrs.length > 0 ? (rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2) : "N/A";

  const markets = [...new Set(trades.map(t => t.market))].join(", ");
  const assets = [...new Set(trades.map(t => t.asset))].join(", ");

  const tradesSummary = trades.slice(0, 50).map(t =>
    `${t.tradeDate} | ${t.asset} (${t.market}) | ${t.direction.toUpperCase()} | Entry: ${t.entryPrice} | Exit: ${t.exitPrice} | PL: ${Number(t.profitLoss ?? 0).toFixed(2)} | Result: ${t.result ?? "unknown"} | RR: ${t.riskReward ?? "N/A"} | Notes: ${t.notes ?? "none"}`
  ).join("\n");

  const prompt = `You are a professional trading coach and mentor. Analyze this trader's journal for the period: ${period}.

TRADING STATISTICS:
- Total trades: ${total}
- Win rate: ${winRate}%
- Wins: ${wins}, Losses: ${losses}, Breakevens: ${breakevens}
- Total P&L: ${totalPL.toFixed(2)}
- Average P&L per trade: ${avgPL}
- Average Risk/Reward: ${avgRR}
- Markets traded: ${markets}
- Assets traded: ${assets}

RECENT TRADES (up to 50):
${tradesSummary}

Provide a detailed professional analysis. Be specific, actionable, and supportive. Format your response as JSON with these exact fields:
{
  "strengths": "2-3 specific strengths based on the data",
  "weaknesses": "2-3 specific weaknesses or areas needing improvement",
  "repeatedMistakes": "patterns of mistakes appearing multiple times",
  "riskAnalysis": "analysis of position sizing, risk management, stop loss usage",
  "psychologyInsights": "trading psychology observations (FOMO, revenge trading, overtrading, etc.)",
  "consistencyScore": <number 0-100>,
  "actionableImprovements": "3-5 specific, concrete steps to improve",
  "summary": "A 2-3 sentence overall assessment that a trader would find motivating and insightful"
}`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a professional trading coach. Always respond with valid JSON only, no markdown, no code blocks." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      req.log.error({ err }, "Groq API error");
      res.status(502).json({ error: "AI service error. Please try again." });
      return;
    }

    const groqData = await groqRes.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = groqData.choices?.[0]?.message?.content ?? "{}";

    let aiData: {
      strengths?: string;
      weaknesses?: string;
      repeatedMistakes?: string;
      riskAnalysis?: string;
      psychologyInsights?: string;
      consistencyScore?: number;
      actionableImprovements?: string;
      summary?: string;
    };
    try {
      aiData = JSON.parse(content);
    } catch {
      // Try to extract JSON from content
      const match = content.match(/\{[\s\S]*\}/);
      aiData = match ? JSON.parse(match[0]) : {};
    }

    const [saved] = await db
      .insert(aiAnalysisTable)
      .values({
        userId,
        period,
        strengths: aiData.strengths ?? null,
        weaknesses: aiData.weaknesses ?? null,
        repeatedMistakes: aiData.repeatedMistakes ?? null,
        riskAnalysis: aiData.riskAnalysis ?? null,
        psychologyInsights: aiData.psychologyInsights ?? null,
        consistencyScore: aiData.consistencyScore != null ? String(aiData.consistencyScore) : null,
        actionableImprovements: aiData.actionableImprovements ?? null,
        summary: aiData.summary ?? null,
      })
      .returning();

    res.json(RequestAiAnalysisResponse.parse(normalizeAnalysis(saved)));
  } catch (err) {
    req.log.error({ err }, "AI analysis error");
    res.status(500).json({ error: "Failed to generate AI analysis. Please try again." });
  }
});

function normalizeAnalysis(a: typeof aiAnalysisTable.$inferSelect) {
  return {
    ...a,
    consistencyScore: a.consistencyScore != null ? Number(a.consistencyScore) : null,
  };
}

export default router;
