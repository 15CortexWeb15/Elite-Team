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
