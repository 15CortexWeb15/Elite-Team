import { Router } from "express";
import healthRouter from "./health";
import onboardingRouter from "./onboarding";
import tradesRouter from "./trades";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";
import profileRouter from "./profile";
import feedbackRouter from "./feedback";
import stocksRouter from "./stocks";

const router = Router();

router.use(healthRouter);
router.use(onboardingRouter);
router.use(tradesRouter);
router.use(analyticsRouter);
router.use(aiRouter);
router.use(profileRouter);
router.use(feedbackRouter);
router.use("/stocks", stocksRouter);

export default router;
