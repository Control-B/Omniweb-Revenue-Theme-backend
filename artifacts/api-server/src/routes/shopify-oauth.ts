import crypto from "crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, merchantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  buildInstallUrl,
  exchangeCodeForToken,
  verifyHmac,
  getAppUrl,
} from "../lib/shopify.js";
import { signToken } from "../lib/jwt.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const SESSION_COOKIE = "ow_session";
const OAUTH_STATE_COOKIE = "shopify_oauth_state";
const IS_PROD = process.env["NODE_ENV"] === "production";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

/**
 * GET /shopify/install?shop=mystore.myshopify.com
 * Begins the Shopify OAuth flow. Redirect merchants here from the install button.
 */
router.get(
  "/shopify/install",
  (req: Request, res: Response): void => {
    const shop = (req.query["shop"] as string | undefined)?.toLowerCase().trim();

    if (!shop || !isValidShopDomain(shop)) {
      res.status(400).send("Missing or invalid ?shop parameter. Expected format: mystore.myshopify.com");
      return;
    }

    if (!process.env["SHOPIFY_API_KEY"] || !process.env["SHOPIFY_API_SECRET"]) {
      res.status(503).send("Shopify app credentials not configured. Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET.");
      return;
    }

    const state = crypto.randomBytes(16).toString("hex");
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PROD,
      maxAge: 10 * 60 * 1000,
    });

    const installUrl = buildInstallUrl(shop, state);
    logger.info({ shop }, "Shopify OAuth: redirecting to install URL");
    res.redirect(installUrl);
  },
);

/**
 * GET /shopify/callback?code=...&shop=...&state=...&hmac=...
 * Shopify redirects here after the merchant approves the app install.
 * Exchanges code for access token, creates or updates merchant record,
 * issues a session cookie, and redirects to the dashboard.
 */
router.get(
  "/shopify/callback",
  async (req: Request, res: Response): Promise<void> => {
    const appUrl = getAppUrl();
    const dashboardUrl = `${appUrl}/dashboard`;

    const { shop, code, state, hmac, ...rest } = req.query as Record<string, string>;

    if (!shop || !isValidShopDomain(shop)) {
      res.status(400).send("Invalid shop domain");
      return;
    }

    // CSRF: validate state matches what we set in the cookie
    const storedState = (req.cookies as Record<string, string>)?.[OAUTH_STATE_COOKIE];
    if (!storedState || storedState !== state) {
      logger.warn({ shop }, "Shopify OAuth: state mismatch — possible CSRF");
      res.status(403).send("Invalid state parameter");
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE);

    // Verify Shopify HMAC signature
    const secret = process.env["SHOPIFY_API_SECRET"];
    if (!secret) {
      res.status(503).send("Shopify app secret not configured");
      return;
    }

    const queryParams = { shop, code, state, hmac, ...rest };
    if (!verifyHmac(queryParams, secret)) {
      logger.warn({ shop }, "Shopify OAuth: HMAC verification failed");
      res.status(403).send("Invalid HMAC signature");
      return;
    }

    try {
      const accessToken = await exchangeCodeForToken(shop, code);

      const rows = await db
        .select({ id: merchantsTable.id, email: merchantsTable.email })
        .from(merchantsTable)
        .where(eq(merchantsTable.shopId, shop))
        .limit(1);

      let merchantId: string;
      let merchantEmail: string;

      if (rows.length > 0) {
        // Existing merchant — refresh access token
        merchantId = rows[0]!.id;
        merchantEmail = rows[0]!.email;

        await db
          .update(merchantsTable)
          .set({ shopifyAccessToken: accessToken, updatedAt: new Date() })
          .where(eq(merchantsTable.id, merchantId));

        logger.info({ merchantId, shop }, "Shopify OAuth: refreshed access token");
      } else {
        // New merchant — auto-create account from Shopify install
        merchantId = crypto.randomUUID();
        merchantEmail = `${shop.replace(".myshopify.com", "")}@merchants.omniweb.dev`;
        const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);

        await db.insert(merchantsTable).values({
          id: merchantId,
          email: merchantEmail,
          shopId: shop,
          passwordHash,
          shopifyAccessToken: accessToken,
          plan: "free",
          subscriptionStatus: "none",
          monthlyMessageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        logger.info({ merchantId, shop }, "Shopify OAuth: created new merchant via install");
      }

      // Issue session so the merchant is immediately logged into the dashboard
      const token = signToken({ merchantId, email: merchantEmail, shopId: shop });
      setSessionCookie(res, token);

      // Send to billing page so they can choose a plan
      res.redirect(`${dashboardUrl}/billing`);
    } catch (err) {
      logger.error({ err, shop }, "Shopify OAuth callback error");
      res.status(500).send("App installation failed. Please try again or contact support.");
    }
  },
);

export default router;
