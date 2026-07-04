import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const onboardingTable = pgTable("onboarding", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  completed: boolean("completed").notNull().default(false),
  experience: text("experience"),
  markets: text("markets"),
  tradingStyle: text("trading_style"),
  goals: text("goals"),
  timezone: text("timezone"),
  riskProfile: text("risk_profile"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOnboardingSchema = createInsertSchema(onboardingTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Onboarding = typeof onboardingTable.$inferSelect;
