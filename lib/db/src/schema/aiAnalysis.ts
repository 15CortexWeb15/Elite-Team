import { pgTable, text, serial, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiAnalysisTable = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  period: text("period").notNull().default("all"), // week | month | all
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  repeatedMistakes: text("repeated_mistakes"),
  riskAnalysis: text("risk_analysis"),
  psychologyInsights: text("psychology_insights"),
  consistencyScore: numeric("consistency_score", { precision: 5, scale: 2 }),
  actionableImprovements: text("actionable_improvements"),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("ai_analysis_user_id_idx").on(table.userId),
]);

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysisTable).omit({
  id: true, createdAt: true,
});
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalysisTable.$inferSelect;
