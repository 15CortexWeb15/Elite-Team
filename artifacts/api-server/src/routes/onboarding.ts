import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, onboardingTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import {
  GetOnboardingResponse,
  SaveOnboardingBody,
  SaveOnboardingResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/onboarding", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const [row] = await db.select().from(onboardingTable).where(eq(onboardingTable.userId, userId));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetOnboardingResponse.parse(row));
});

router.post("/onboarding", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = SaveOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(onboardingTable).where(eq(onboardingTable.userId, userId));

  if (existing.length > 0) {
    const [updated] = await db
      .update(onboardingTable)
      .set({ ...parsed.data, completed: true, userId })
      .where(eq(onboardingTable.userId, userId))
      .returning();
    res.json(SaveOnboardingResponse.parse(updated));
  } else {
    const [created] = await db
      .insert(onboardingTable)
      .values({ ...parsed.data, completed: true, userId })
      .returning();
    res.json(SaveOnboardingResponse.parse(created));
  }
});

export default router;
