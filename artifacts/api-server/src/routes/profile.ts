import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable, tradesTable, onboardingTable, aiAnalysisTable, feedbackTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import {
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router = Router();

// Get or auto-create profile
router.get("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  let [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));

  if (!profile) {
    const [created] = await db.insert(profilesTable).values({ userId }).returning();
    profile = created;
  }

  res.json(GetProfileResponse.parse(profile));
});

router.patch("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Ensure profile exists
  const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId));
  if (existing.length === 0) {
    await db.insert(profilesTable).values({ userId });
  }

  const [updated] = await db
    .update(profilesTable)
    .set(parsed.data)
    .where(eq(profilesTable.userId, userId))
    .returning();

  res.json(UpdateProfileResponse.parse(updated));
});

router.delete("/profile/account", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  // Delete all user data
  await Promise.all([
    db.delete(tradesTable).where(eq(tradesTable.userId, userId)),
    db.delete(onboardingTable).where(eq(onboardingTable.userId, userId)),
    db.delete(aiAnalysisTable).where(eq(aiAnalysisTable.userId, userId)),
    db.delete(feedbackTable).where(eq(feedbackTable.userId, userId)),
    db.delete(profilesTable).where(eq(profilesTable.userId, userId)),
  ]);

  res.sendStatus(204);
});

export default router;
