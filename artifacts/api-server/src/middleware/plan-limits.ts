import { type Request, type Response, type NextFunction } from "express";
import { checkUsage } from "../lib/plan-limits.js";
import { PLAN_NAMES } from "../lib/stripe.js";

/**
 * Middleware for the /api/chat endpoint.
 * Looks up the shop's plan limit by shopId from the request body.
 * Returns 402 if the merchant has exceeded their monthly message limit.
 */
export async function requirePlanLimits(req: Request, res: Response, next: NextFunction): Promise<void> {
  const shopId = (req.body as { shopId?: string })?.shopId;
  if (!shopId || typeof shopId !== "string") {
    next();
    return;
  }

  try {
    const status = await checkUsage(shopId.slice(0, 200));
    if (!status.allowed) {
      const planName = PLAN_NAMES[status.plan] ?? status.plan;
      res.status(402).json({
        error: "Plan limit reached",
        message: `You've used all ${status.limit} messages included in your ${planName} plan this month. Upgrade to continue.`,
        plan: status.plan,
        used: status.used,
        limit: status.limit,
        upgradeUrl: "/dashboard/billing",
      });
      return;
    }
  } catch {
    // If usage check fails, allow the request through (fail open for usability)
  }

  next();
}
