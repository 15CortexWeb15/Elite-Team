import { Router } from "express";

function toDateStr(d: string | Date): string {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

import { eq, and, desc, ilike, or } from "drizzle-orm";
import { db, tradesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { computeTradeFields } from "../lib/tradeCalc";
import {
  ListTradesQueryParams,
  ListTradesResponse,
  CreateTradeBody,
  CreateTradeResponse,
  GetTradeParams,
  GetTradeResponse,
  UpdateTradeParams,
  UpdateTradeBody,
  UpdateTradeResponse,
  DeleteTradeParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/trades", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const query = ListTradesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { search, direction, result, limit, offset } = query.data;

  let baseQuery = db
    .select()
    .from(tradesTable)
    .where(
      and(
        eq(tradesTable.userId, userId),
        direction ? eq(tradesTable.direction, direction) : undefined,
        result ? eq(tradesTable.result, result) : undefined,
        search
          ? or(
              ilike(tradesTable.asset, `%${search}%`),
              ilike(tradesTable.notes, `%${search}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(tradesTable.tradeDate), desc(tradesTable.createdAt))
    .$dynamic();

  if (limit) baseQuery = baseQuery.limit(Number(limit));
  if (offset) baseQuery = baseQuery.offset(Number(offset));

  const trades = await baseQuery;
  res.json(ListTradesResponse.parse(trades.map(normalizeTrade)));
});

router.post("/trades", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateTradeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const computed = computeTradeFields({
    direction: parsed.data.direction,
    entryPrice: Number(parsed.data.entryPrice),
    exitPrice: Number(parsed.data.exitPrice),
    positionSize: Number(parsed.data.positionSize),
    stopLoss: parsed.data.stopLoss != null ? Number(parsed.data.stopLoss) : null,
    commission: parsed.data.commission != null ? Number(parsed.data.commission) : null,
  });

  const [trade] = await db
    .insert(tradesTable)
    .values({
      userId,
      asset: parsed.data.asset,
      market: parsed.data.market,
      direction: parsed.data.direction,
      entryPrice: String(parsed.data.entryPrice),
      exitPrice: String(parsed.data.exitPrice),
      stopLoss: parsed.data.stopLoss != null ? String(parsed.data.stopLoss) : null,
      takeProfit: parsed.data.takeProfit != null ? String(parsed.data.takeProfit) : null,
      positionSize: String(parsed.data.positionSize),
      commission: parsed.data.commission != null ? String(parsed.data.commission) : null,
      riskPercent: parsed.data.riskPercent != null ? String(parsed.data.riskPercent) : null,
      notes: parsed.data.notes ?? null,
      tradeDate: toDateStr(parsed.data.tradeDate),
      closeDate: parsed.data.closeDate != null ? toDateStr(parsed.data.closeDate) : null,
      profitLoss: computed.profitLoss,
      profitLossPercent: computed.profitLossPercent,
      riskReward: computed.riskReward,
      result: computed.result,
    })
    .returning();

  res.status(201).json(CreateTradeResponse.parse(normalizeTrade(trade)));
});

router.get("/trades/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = GetTradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [trade] = await db
    .select()
    .from(tradesTable)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, userId)));

  if (!trade) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }
  res.json(GetTradeResponse.parse(normalizeTrade(trade)));
});

router.patch("/trades/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateTradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTradeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Get existing to compute with merged values
  const [existing] = await db
    .select()
    .from(tradesTable)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, userId)));

  if (!existing) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }

  const merged = { ...existing, ...parsed.data };
  const computed = computeTradeFields({
    direction: merged.direction,
    entryPrice: Number(merged.entryPrice),
    exitPrice: Number(merged.exitPrice),
    positionSize: Number(merged.positionSize),
    stopLoss: merged.stopLoss != null ? Number(merged.stopLoss) : null,
    commission: merged.commission != null ? Number(merged.commission) : null,
  });

  const updateData: Partial<typeof tradesTable.$inferInsert> = { ...computed };
  if (parsed.data.asset !== undefined) updateData.asset = parsed.data.asset;
  if (parsed.data.market !== undefined) updateData.market = parsed.data.market;
  if (parsed.data.direction !== undefined) updateData.direction = parsed.data.direction;
  if (parsed.data.entryPrice !== undefined) updateData.entryPrice = String(parsed.data.entryPrice);
  if (parsed.data.exitPrice !== undefined) updateData.exitPrice = String(parsed.data.exitPrice);
  if ("stopLoss" in parsed.data) updateData.stopLoss = parsed.data.stopLoss != null ? String(parsed.data.stopLoss) : null;
  if ("takeProfit" in parsed.data) updateData.takeProfit = parsed.data.takeProfit != null ? String(parsed.data.takeProfit) : null;
  if (parsed.data.positionSize !== undefined) updateData.positionSize = String(parsed.data.positionSize);
  if ("commission" in parsed.data) updateData.commission = parsed.data.commission != null ? String(parsed.data.commission) : null;
  if ("riskPercent" in parsed.data) updateData.riskPercent = parsed.data.riskPercent != null ? String(parsed.data.riskPercent) : null;
  if ("notes" in parsed.data) updateData.notes = parsed.data.notes ?? null;
  if (parsed.data.tradeDate !== undefined) updateData.tradeDate = toDateStr(parsed.data.tradeDate);
  if ("closeDate" in parsed.data) updateData.closeDate = parsed.data.closeDate != null ? toDateStr(parsed.data.closeDate) : null;

  const [updated] = await db
    .update(tradesTable)
    .set(updateData)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, userId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }
  res.json(UpdateTradeResponse.parse(normalizeTrade(updated)));
});

router.delete("/trades/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteTradeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(tradesTable)
    .where(and(eq(tradesTable.id, params.data.id), eq(tradesTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Trade not found" });
    return;
  }
  res.sendStatus(204);
});

// ─── Bulk Import ─────────────────────────────────────────────────────────────

router.post("/trades/import", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const { trades: raw } = req.body as {
    trades: Array<{
      asset: string;
      market: string;
      direction: string;
      entryPrice: number;
      exitPrice: number;
      positionSize: number;
      tradeDate: string;
      closeDate?: string | null;
      stopLoss?: number | null;
      takeProfit?: number | null;
      commission?: number | null;
      riskPercent?: number | null;
      profitLoss?: number | null;
      notes?: string | null;
    }>;
  };

  if (!Array.isArray(raw) || raw.length === 0) {
    res.status(400).json({ error: "No trades provided" });
    return;
  }

  const toInsert = raw.map((t) => {
    const computed = computeTradeFields({
      direction: t.direction as "long" | "short",
      entryPrice: Number(t.entryPrice) || 0,
      exitPrice: Number(t.exitPrice) || 0,
      positionSize: Number(t.positionSize) || 0,
      stopLoss: t.stopLoss != null ? Number(t.stopLoss) : null,
      commission: t.commission != null ? Number(t.commission) : null,
    });
    return {
      userId,
      asset: (t.asset || "UNKNOWN").toUpperCase(),
      market: (t.market || "stocks") as "crypto" | "forex" | "stocks" | "futures",
      direction: (t.direction || "long") as "long" | "short",
      entryPrice: String(t.entryPrice || 0),
      exitPrice: String(t.exitPrice || 0),
      positionSize: String(t.positionSize || 0),
      stopLoss: t.stopLoss != null ? String(t.stopLoss) : null,
      takeProfit: t.takeProfit != null ? String(t.takeProfit) : null,
      commission: t.commission != null ? String(t.commission) : null,
      riskPercent: t.riskPercent != null ? String(t.riskPercent) : null,
      notes: t.notes ?? null,
      tradeDate: toDateStr(t.tradeDate || new Date().toISOString()),
      closeDate: t.closeDate ? toDateStr(t.closeDate) : null,
      profitLoss: computed.profitLoss ?? (t.profitLoss != null ? String(t.profitLoss) : null),
      profitLossPercent: computed.profitLossPercent,
      riskReward: computed.riskReward,
      result: computed.result,
    };
  });

  const inserted = await db.insert(tradesTable).values(toInsert).returning();
  res.status(201).json({ imported: inserted.length });
});

// ─── Import AI Analysis ───────────────────────────────────────────────────────

router.post("/trades/import/analyze", requireAuth, async (req, res): Promise<void> => {
  const { trades: raw } = req.body as { trades: Array<Record<string, unknown>> };

  if (!Array.isArray(raw) || raw.length === 0) {
    res.status(400).json({ error: "No trades provided" });
    return;
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    res.status(503).json({ error: "AI not configured" });
    return;
  }

  const wins = raw.filter(t => Number(t.profitLoss ?? 0) > 0).length;
  const losses = raw.filter(t => Number(t.profitLoss ?? 0) < 0).length;
  const totalPL = raw.reduce((s, t) => s + Number(t.profitLoss ?? 0), 0);
  const assets = [...new Set(raw.map(t => t.asset))].slice(0, 20).join(", ");

  const sample = raw.slice(0, 30).map(t =>
    `${t.tradeDate} | ${t.asset} | ${t.direction?.toString().toUpperCase()} | Entry:${t.entryPrice} Exit:${t.exitPrice} | PL:${Number(t.profitLoss ?? 0).toFixed(2)}`
  ).join("\n");

  const prompt = `You are a trading coach. Briefly analyze this imported trading history batch.

BATCH SUMMARY:
- ${raw.length} trades | ${wins} wins | ${losses} losses
- Total P&L: ${totalPL.toFixed(2)}
- Assets: ${assets}

SAMPLE TRADES:
${sample}

Respond with JSON only:
{
  "headline": "One punchy sentence summarizing performance",
  "keyStrength": "The single biggest strength",
  "keyWeakness": "The single biggest weakness",
  "topInsight": "The most interesting pattern or insight from this data",
  "nextStep": "One concrete action the trader should take"
}`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    if (!groqRes.ok) {
      res.status(502).json({ error: "AI service error" });
      return;
    }

    const data = await groqRes.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, string>;
    try { parsed = JSON.parse(content); }
    catch { const m = content.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : {}; }

    res.json(parsed);
  } catch {
    res.status(500).json({ error: "Failed to analyze trades" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

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
