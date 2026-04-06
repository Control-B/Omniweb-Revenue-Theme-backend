import { Router, type IRouter, type Request, type Response } from "express";
import { db, merchantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  createAppSubscription,
  getActiveSubscription,
  cancelAppSubscription,
  mapShopifyStatus,
  getPlanFromSubscriptionName,
  isShopifyConfigured,
  getAppUrl,
  verifyWebhookHmac,
} from "../lib/shopify.js";
import { PLAN_LIMITS, PLAN_NAMES } from "../lib/stripe.js";
import { requireSessionAuth } from "../middleware/api-key.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

function getDashboardBaseUrl(): string {
  return `${getAppUrl()}/dashboard`;
}

function shopifyNotConfigured(res: Response): void {
  res.status(503).json({
    error: "Shopify app not configured",
    message:
      "Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET to enable Shopify billing.",
  });
}

/** GET /billing/status — current plan, usage, and subscription info */
router.get(
  "/billing/status",
  requireSessionAuth,
  async (req: Request, res: Response): Promise<void> => {
    const merchant = req.merchant!;

    const rows = await db
      .select({
        plan: merchantsTable.plan,
        subscriptionStatus: merchantsTable.subscriptionStatus,
        shopifyAccessToken: merchantsTable.shopifyAccessToken,
        shopifySubscriptionGid: merchantsTable.shopifySubscriptionGid,
        currentPeriodEnd: merchantsTable.currentPeriodEnd,
        monthlyMessageCount: merchantsTable.monthlyMessageCount,
        usagePeriodStart: merchantsTable.usagePeriodStart,
      })
      .from(merchantsTable)
      .where(eq(merchantsTable.id, merchant.id))
      .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }

    const m = rows[0]!;
    let plan = m.plan ?? "free";
    let subscriptionStatus = m.subscriptionStatus ?? "none";
    let currentPeriodEnd = m.currentPeriodEnd;

    // Fetch live subscription status from Shopify when we have a token
    if (m.shopifyAccessToken && isShopifyConfigured()) {
      try {
        const liveSub = await getActiveSubscription(
          merchant.shopId,
          m.shopifyAccessToken,
        );

        if (liveSub) {
          const livePlan = getPlanFromSubscriptionName(liveSub.name);
          const liveStatus = mapShopifyStatus(liveSub.status);
          const livePeriodEnd = liveSub.currentPeriodEnd
            ? new Date(liveSub.currentPeriodEnd)
            : null;

          if (
            livePlan !== plan ||
            liveStatus !== subscriptionStatus ||
            liveSub.id !== m.shopifySubscriptionGid
          ) {
            await db
              .update(merchantsTable)
              .set({
                plan: livePlan,
                subscriptionStatus: liveStatus,
                currentPeriodEnd: livePeriodEnd,
                shopifySubscriptionGid: liveSub.id,
                updatedAt: new Date(),
              })
              .where(eq(merchantsTable.id, merchant.id));
          }

          plan = livePlan;
          subscriptionStatus = liveStatus;
          currentPeriodEnd = livePeriodEnd;
        } else if (plan !== "free") {
          await db
            .update(merchantsTable)
            .set({
              plan: "free",
              subscriptionStatus: "none",
              shopifySubscriptionGid: null,
              updatedAt: new Date(),
            })
            .where(eq(merchantsTable.id, merchant.id));
          plan = "free";
          subscriptionStatus = "none";
          currentPeriodEnd = null;
        }
      } catch (err) {
        logger.warn(
          { err, shopId: merchant.shopId },
          "Could not fetch live Shopify subscription — using cached data",
        );
      }
    }

    const isSubscriptionActive = ["active", "trialing"].includes(subscriptionStatus);
    const isPaidPlan = ["starter", "pro"].includes(plan);
    const effectivePlan = isPaidPlan && !isSubscriptionActive ? "free" : plan;
    const limit = PLAN_LIMITS[effectivePlan] ?? 50;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const storedPeriod = m.usagePeriodStart;
    const used =
      storedPeriod && storedPeriod >= periodStart
        ? (m.monthlyMessageCount ?? 0)
        : 0;

    res.json({
      plan,
      planName: PLAN_NAMES[plan] ?? plan,
      effectivePlan,
      effectivePlanName: PLAN_NAMES[effectivePlan] ?? effectivePlan,
      subscriptionStatus,
      isSubscriptionActive,
      currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null,
      hasShopifyToken: !!m.shopifyAccessToken,
      shopifyConfigured: isShopifyConfigured(),
      usage: {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        percentage: Math.min(100, Math.round((used / limit) * 100)),
      },
    });
  },
);

/** POST /billing/create-subscription — start a Shopify recurring charge */
router.post(
  "/billing/create-subscription",
  requireSessionAuth,
  async (req: Request, res: Response): Promise<void> => {
    if (!isShopifyConfigured()) {
      shopifyNotConfigured(res);
      return;
    }

    const merchant = req.merchant!;
    const { plan } = req.body as { plan?: string };

    if (!plan || !["starter", "pro"].includes(plan)) {
      res.status(400).json({ error: "plan must be 'starter' or 'pro'" });
      return;
    }

    const rows = await db
      .select({ shopifyAccessToken: merchantsTable.shopifyAccessToken })
      .from(merchantsTable)
      .where(eq(merchantsTable.id, merchant.id))
      .limit(1);

    const accessToken = rows[0]?.shopifyAccessToken;
    if (!accessToken) {
      res.status(400).json({
        error: "Store not connected via Shopify",
        message: "Please install the app through Shopify to enable billing.",
        installUrl: `/api/shopify/install?shop=${merchant.shopId}`,
      });
      return;
    }

    const returnUrl = `${getDashboardBaseUrl()}/billing?status=success`;

    try {
      const { confirmationUrl, subscriptionGid } = await createAppSubscription(
        merchant.shopId,
        accessToken,
        plan,
        returnUrl,
      );

      await db
        .update(merchantsTable)
        .set({ shopifySubscriptionGid: subscriptionGid, updatedAt: new Date() })
        .where(eq(merchantsTable.id, merchant.id));

      res.json({ url: confirmationUrl });
    } catch (err) {
      logger.error({ err, shopId: merchant.shopId }, "Shopify create-subscription error");
      res.status(502).json({
        error: err instanceof Error ? err.message : "Failed to create subscription",
      });
    }
  },
);

/** POST /billing/cancel-subscription — cancel the active Shopify recurring charge */
router.post(
  "/billing/cancel-subscription",
  requireSessionAuth,
  async (req: Request, res: Response): Promise<void> => {
    if (!isShopifyConfigured()) {
      shopifyNotConfigured(res);
      return;
    }

    const merchant = req.merchant!;

    const rows = await db
      .select({
        shopifyAccessToken: merchantsTable.shopifyAccessToken,
        shopifySubscriptionGid: merchantsTable.shopifySubscriptionGid,
      })
      .from(merchantsTable)
      .where(eq(merchantsTable.id, merchant.id))
      .limit(1);

    const { shopifyAccessToken: accessToken, shopifySubscriptionGid: subscriptionGid } =
      rows[0] ?? {};

    if (!accessToken || !subscriptionGid) {
      res.status(400).json({ error: "No active Shopify subscription found to cancel" });
      return;
    }

    try {
      await cancelAppSubscription(merchant.shopId, accessToken, subscriptionGid);

      await db
        .update(merchantsTable)
        .set({
          plan: "free",
          subscriptionStatus: "canceled",
          shopifySubscriptionGid: null,
          currentPeriodEnd: null,
          updatedAt: new Date(),
        })
        .where(eq(merchantsTable.id, merchant.id));

      res.json({ success: true });
    } catch (err) {
      logger.error({ err, shopId: merchant.shopId }, "Shopify cancel-subscription error");
      res.status(502).json({
        error: err instanceof Error ? err.message : "Failed to cancel subscription",
      });
    }
  },
);

/**
 * POST /billing/shopify-webhook
 * Receives Shopify app_subscriptions/update, app/uninstalled, and GDPR webhooks.
 * Must be mounted with express.raw() BEFORE express.json() in app.ts.
 */
router.post(
  "/billing/shopify-webhook",
  async (req: Request, res: Response): Promise<void> => {
    const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string | undefined;
    const topic = req.headers["x-shopify-topic"] as string | undefined;
    const shop = req.headers["x-shopify-shop-domain"] as string | undefined;

    if (!hmacHeader || !topic || !shop) {
      res.status(401).json({ error: "Missing required Shopify webhook headers" });
      return;
    }

    const secret = process.env["SHOPIFY_API_SECRET"];
    if (!secret) {
      logger.error("SHOPIFY_API_SECRET not set — webhook rejected");
      res.status(503).json({ error: "Webhook not configured" });
      return;
    }

    const rawBody = req.body as Buffer;
    if (!verifyWebhookHmac(rawBody, hmacHeader, secret)) {
      logger.warn({ shop, topic }, "Shopify webhook HMAC verification failed");
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString()) as Record<string, unknown>;
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }

    try {
      await handleShopifyWebhook(topic, shop, payload);
      res.json({ received: true });
    } catch (err) {
      logger.error({ err, topic, shop }, "Shopify webhook handler error");
      res.status(500).json({ error: "Webhook handler failed" });
    }
  },
);

async function handleShopifyWebhook(
  topic: string,
  shop: string,
  payload: Record<string, unknown>,
): Promise<void> {
  switch (topic) {
    case "app_subscriptions/update": {
      const sub = payload as {
        admin_graphql_api_id?: string;
        name?: string;
        status?: string;
        current_period_end?: string;
      };

      const rows = await db
        .select({ id: merchantsTable.id })
        .from(merchantsTable)
        .where(eq(merchantsTable.shopId, shop))
        .limit(1);

      if (rows.length === 0) break;

      const plan = getPlanFromSubscriptionName(sub.name ?? "");
      const status = mapShopifyStatus(sub.status ?? "");

      await db
        .update(merchantsTable)
        .set({
          plan,
          subscriptionStatus: status,
          shopifySubscriptionGid: sub.admin_graphql_api_id ?? null,
          currentPeriodEnd: sub.current_period_end
            ? new Date(sub.current_period_end)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(merchantsTable.id, rows[0]!.id));

      logger.info({ shop, plan, status }, "Shopify subscription updated via webhook");
      break;
    }

    case "app/uninstalled": {
      await db
        .update(merchantsTable)
        .set({
          shopifyAccessToken: null,
          plan: "free",
          subscriptionStatus: "canceled",
          shopifySubscriptionGid: null,
          currentPeriodEnd: null,
          updatedAt: new Date(),
        })
        .where(eq(merchantsTable.shopId, shop));

      logger.info({ shop }, "App uninstalled — access token cleared, downgraded to free");
      break;
    }

    // GDPR webhooks — required for Shopify App Store listing
    case "customers/redact":
    case "shop/redact":
    case "customers/data_request":
      logger.info({ topic, shop }, "GDPR webhook received and acknowledged");
      break;

    default:
      logger.info({ topic, shop }, "Unhandled Shopify webhook topic");
  }
}

export default router;
