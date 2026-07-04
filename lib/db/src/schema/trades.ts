import { pgTable, text, serial, numeric, timestamp, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  asset: text("asset").notNull(),
  market: text("market").notNull(),
  direction: text("direction").notNull(), // long | short
  entryPrice: numeric("entry_price", { precision: 20, scale: 8 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 20, scale: 8 }).notNull(),
  stopLoss: numeric("stop_loss", { precision: 20, scale: 8 }),
  takeProfit: numeric("take_profit", { precision: 20, scale: 8 }),
  positionSize: numeric("position_size", { precision: 20, scale: 8 }).notNull(),
  commission: numeric("commission", { precision: 20, scale: 8 }),
  riskPercent: numeric("risk_percent", { precision: 10, scale: 4 }),
  notes: text("notes"),
  tradeDate: date("trade_date", { mode: "string" }).notNull(),
  closeDate: date("close_date", { mode: "string" }),
  // Computed and stored for fast queries
  profitLoss: numeric("profit_loss", { precision: 20, scale: 8 }),
  profitLossPercent: numeric("profit_loss_percent", { precision: 10, scale: 4 }),
  riskReward: numeric("risk_reward", { precision: 10, scale: 4 }),
  result: text("result"), // win | loss | breakeven
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index("trades_user_id_idx").on(table.userId),
  index("trades_trade_date_idx").on(table.tradeDate),
]);

export const insertTradeSchema = createInsertSchema(tradesTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
