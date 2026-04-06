import { type Request, type Response, type NextFunction } from "express";
import { checkUsage } from "../lib/plan-limits.js";
import { PLAN_NAMES } from "../lib/stripe.js";

/**
 * Middleware enforcing monthly message limits on widget endpoints (/api/chat, /api/voice).
 *
 * Checks both:
 *   1. Subscription status — inactive/past_due/canceled subscriptions are downgraded to
 *      free-tier limits (50 messages/month) regardless of the nominal plan.
 *   2. Usage count — returns 402 when the effective limit is reached.
 *
 * The shopId is read from req.body (both endpoints accept it in the POST body).
 * If shopId is absent the request passes through (other middleware validates it).
 */
export async function requirePlanLimits(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const shopId = (req.body as { shopId?: string })?.shopId;
  if (!shopId || typeof shopId !== "string") {
    next();
    return;
  }

  try {
    const status = await checkUsage(shopId.slice(0, 200));

    if (!status.allowed) {
      const effectivePlanName = PLAN_NAMES[status.effectivePlan] ?? status.effectivePlan;
      const nominalPlanName = PLAN_NAMES[status.plan] ?? status.plan;
      const isInactiveDowngrade =
        status.effectivePlan !== status.plan &&
        !["active", "trialing"].includes(status.subscriptionStatus);

      let message: string;
      if (isInactiveDowngrade) {
        message =
          `Your ${nominalPlanName} subscription is ${status.subscriptionStatus}. ` +
          `You've been downgraded to the Free plan (${status.limit} messages/month) ` +
          `and have reached the limit. Renew your subscription to restore full access.`;
      } else {
        message =
          `You've used all ${status.limit} messages included in your ${effectivePlanName} plan this month. ` +
          `Upgrade to continue.`;
      }

      res.status(402).json({
        error: "Plan limit reached",
        message,
        plan: status.plan,
        effectivePlan: status.effectivePlan,
        subscriptionStatus: status.subscriptionStatus,
        used: status.used,
        limit: status.limit,
        upgradeUrl: "/dashboard/billing",
      });
      return;
    }
  } catch {
    // Non-fatal: if the usage check itself errors, let the request through
    // rather than blocking all widget traffic due to a transient DB hiccup.
  }

  next();
}
