import crypto from "crypto";

const API_VERSION = "2025-01";

export interface ShopifyGraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export async function shopifyGraphQL<T = Record<string, unknown>>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<ShopifyGraphQLResponse<T>> {
  const response = await fetch(
    `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Shopify API HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response.json() as Promise<ShopifyGraphQLResponse<T>>;
}

export function getAppUrl(): string {
  if (process.env["SHOPIFY_APP_URL"]) {
    return process.env["SHOPIFY_APP_URL"].replace(/\/$/, "");
  }
  if (process.env["REPLIT_DEV_DOMAIN"]) {
    return `https://${process.env["REPLIT_DEV_DOMAIN"]}`;
  }
  return "http://localhost:8080";
}

export function getRedirectUri(): string {
  return `${getAppUrl()}/api/shopify/callback`;
}

export function buildInstallUrl(shop: string, state: string): string {
  const apiKey = process.env["SHOPIFY_API_KEY"] ?? "";
  const scopes =
    process.env["SHOPIFY_SCOPES"] ?? "read_products,write_script_tags";
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: getRedirectUri(),
    state,
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  shop: string,
  code: string,
): Promise<string> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env["SHOPIFY_API_KEY"],
      client_secret: process.env["SHOPIFY_API_SECRET"],
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export function verifyHmac(
  query: Record<string, string>,
  secret: string,
): boolean {
  const { hmac, ...rest } = query;
  if (!hmac) return false;

  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");

  const computed = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(hmac, "hex"),
    );
  } catch {
    return false;
  }
}

export function verifyWebhookHmac(
  rawBody: Buffer,
  hmacHeader: string,
  secret: string,
): boolean {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(hmacHeader),
    );
  } catch {
    return false;
  }
}

export function isShopifyConfigured(): boolean {
  return !!(process.env["SHOPIFY_API_KEY"] && process.env["SHOPIFY_API_SECRET"]);
}

const PLAN_BILLING_CONFIGS: Record<
  string,
  { name: string; amount: string }
> = {
  starter: { name: "Omniweb Starter", amount: "29.00" },
  pro: { name: "Omniweb Pro", amount: "99.00" },
};

export function getPlanFromSubscriptionName(
  name: string,
): "free" | "starter" | "pro" {
  const lower = name.toLowerCase();
  if (lower.includes("pro")) return "pro";
  if (lower.includes("starter")) return "starter";
  return "free";
}

export function mapShopifyStatus(
  status: string,
): "none" | "trialing" | "active" | "past_due" | "canceled" | "incomplete" {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "PENDING":
      return "trialing";
    case "FROZEN":
      return "past_due";
    case "CANCELLED":
      return "canceled";
    case "EXPIRED":
      return "canceled";
    case "DECLINED":
      return "none";
    default:
      return "none";
  }
}

export interface AppSubscriptionResult {
  confirmationUrl: string;
  subscriptionGid: string;
}

export async function createAppSubscription(
  shop: string,
  accessToken: string,
  plan: string,
  returnUrl: string,
): Promise<AppSubscriptionResult> {
  const config = PLAN_BILLING_CONFIGS[plan];
  if (!config) throw new Error(`Unknown plan: ${plan}`);

  const isTest = process.env["NODE_ENV"] !== "production";

  const mutation = `
    mutation AppSubscriptionCreate(
      $name: String!
      $lineItems: [AppSubscriptionLineItemInput!]!
      $returnUrl: URL!
      $test: Boolean
    ) {
      appSubscriptionCreate(
        name: $name
        lineItems: $lineItems
        returnUrl: $returnUrl
        test: $test
      ) {
        userErrors { field message }
        confirmationUrl
        appSubscription { id status }
      }
    }
  `;

  const result = await shopifyGraphQL<{
    appSubscriptionCreate: {
      userErrors: Array<{ field: string; message: string }>;
      confirmationUrl: string;
      appSubscription: { id: string; status: string } | null;
    };
  }>(shop, accessToken, mutation, {
    name: config.name,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: config.amount, currencyCode: "USD" },
            interval: "EVERY_30_DAYS",
          },
        },
      },
    ],
    returnUrl,
    test: isTest,
  });

  const { userErrors, confirmationUrl, appSubscription } =
    result.data.appSubscriptionCreate;

  if (userErrors.length > 0) {
    throw new Error(userErrors[0]!.message);
  }

  return {
    confirmationUrl,
    subscriptionGid: appSubscription?.id ?? "",
  };
}

export interface ActiveSubscription {
  id: string;
  name: string;
  status: string;
  currentPeriodEnd: string | null;
  amount: number;
  currencyCode: string;
}

export async function getActiveSubscription(
  shop: string,
  accessToken: string,
): Promise<ActiveSubscription | null> {
  const query = `
    query {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
          currentPeriodEnd
          lineItems {
            plan {
              pricingDetails {
                ... on AppRecurringPricing {
                  price { amount currencyCode }
                  interval
                }
              }
            }
          }
        }
      }
    }
  `;

  const result = await shopifyGraphQL<{
    currentAppInstallation: {
      activeSubscriptions: Array<{
        id: string;
        name: string;
        status: string;
        currentPeriodEnd: string | null;
        lineItems: Array<{
          plan: {
            pricingDetails: {
              price?: { amount: string; currencyCode: string };
              interval?: string;
            };
          };
        }>;
      }>;
    };
  }>(shop, accessToken, query);

  const subs =
    result.data.currentAppInstallation.activeSubscriptions;
  if (subs.length === 0) return null;

  const sub = subs[0]!;
  const pricing = sub.lineItems[0]?.plan.pricingDetails;

  return {
    id: sub.id,
    name: sub.name,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
    amount: parseFloat(pricing?.price?.amount ?? "0"),
    currencyCode: pricing?.price?.currencyCode ?? "USD",
  };
}

/**
 * Register all required webhooks for this app immediately after OAuth.
 * Safe to call on re-installs — Shopify deduplicates by callbackUrl + topic.
 */
export async function registerWebhooks(
  shop: string,
  accessToken: string,
): Promise<void> {
  const appUrl = getAppUrl();
  const callbackUrl = `${appUrl}/api/billing/shopify-webhook`;

  const topics = [
    "APP_UNINSTALLED",
    "APP_SUBSCRIPTIONS_UPDATE",
    "CUSTOMERS_REDACT",
    "CUSTOMERS_DATA_REQUEST",
    "SHOP_REDACT",
  ] as const;

  const mutation = `
    mutation WebhookSubscriptionCreate(
      $topic: WebhookSubscriptionTopic!
      $webhookSubscription: WebhookSubscriptionInput!
    ) {
      webhookSubscriptionCreate(
        topic: $topic
        webhookSubscription: $webhookSubscription
      ) {
        userErrors { field message }
        webhookSubscription { id topic }
      }
    }
  `;

  for (const topic of topics) {
    try {
      await shopifyGraphQL(shop, accessToken, mutation, {
        topic,
        webhookSubscription: { callbackUrl, format: "JSON" },
      });
    } catch {
      // Topic may already be registered — Shopify returns an error rather than
      // upserting; silently skip so the install flow isn't blocked.
    }
  }
}

export async function cancelAppSubscription(
  shop: string,
  accessToken: string,
  subscriptionGid: string,
): Promise<void> {
  const mutation = `
    mutation AppSubscriptionCancel($id: ID!) {
      appSubscriptionCancel(id: $id) {
        userErrors { field message }
        appSubscription { id status }
      }
    }
  `;

  const result = await shopifyGraphQL<{
    appSubscriptionCancel: {
      userErrors: Array<{ field: string; message: string }>;
      appSubscription: { id: string; status: string } | null;
    };
  }>(shop, accessToken, mutation, { id: subscriptionGid });

  const { userErrors } = result.data.appSubscriptionCancel;
  if (userErrors.length > 0) {
    throw new Error(userErrors[0]!.message);
  }
}
