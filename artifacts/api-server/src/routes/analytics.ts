import { Router, type IRouter, type Request, type Response } from "express";
import { getAnalyticsSummary, getAnalyticsDaily } from "../lib/analytics-store.js";

const router: IRouter = Router();

router.get("/analytics/summary", async (req: Request, res: Response): Promise<void> => {
  const shopId = req.merchant!.shopId;
  try {
    const summary = await getAnalyticsSummary(shopId);
    res.json(summary);
  } catch {
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

router.get("/analytics/daily", async (req: Request, res: Response): Promise<void> => {
  const shopId = req.merchant!.shopId;
  try {
    const days = await getAnalyticsDaily(shopId);
    res.json({ days });
  } catch {
    res.status(500).json({ error: "Failed to fetch daily analytics" });
  }
});

export default router;
