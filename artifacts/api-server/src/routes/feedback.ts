import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, feedbackTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import {
  SubmitFeedbackBody,
  SubmitFeedbackResponse,
  ListFeedbackResponse,
} from "@workspace/api-zod";

const router = Router();

router.post("/feedback", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(feedbackTable)
    .values({ ...parsed.data, userId })
    .returning();

  res.status(201).json(SubmitFeedbackResponse.parse(item));
});

router.get("/feedback", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const items = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.userId, userId))
    .orderBy(desc(feedbackTable.createdAt));

  res.json(ListFeedbackResponse.parse(items));
});

export default router;
