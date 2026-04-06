import { db, merchantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { PLAN_LIMITS } from "./stripe.js";

export interface UsageStatus {
  allowed: boolean;
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  resetDate?: Date;
}

function getBillingPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Check whether a shop is within its plan's monthly message limit.
 * Resets the usage counter automatically if the billing period has rolled over.
 */
export async function checkUsage(shopId: string): Promise<UsageStatus> {
  const rows = await db
    .select({
      id: merchantsTable.id,
      plan: merchantsTable.plan,
      monthlyMessageCount: merchantsTable.monthlyMessageCount,
      usagePeriodStart: merchantsTable.usagePeriodStart,
      currentPeriodEnd: merchantsTable.currentPeriodEnd,
    })
    .from(merchantsTable)
    .where(eq(merchantsTable.shopId, shopId))
    .limit(1);

  if (rows.length === 0) {
    return { allowed: false, plan: "free", limit: 0, used: 0, remaining: 0 };
  }

  const merchant = rows[0];
  const plan = merchant.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS["free"]!;

  const periodStart = getBillingPeriodStart();

  let used = merchant.monthlyMessageCount ?? 0;
  const storedPeriodStart = merchant.usagePeriodStart;

  if (!storedPeriodStart || storedPeriodStart < periodStart) {
    await db
      .update(merchantsTable)
      .set({
        monthlyMessageCount: 0,
        usagePeriodStart: periodStart,
        updatedAt: new Date(),
      })
      .where(eq(merchantsTable.id, merchant.id));
    used = 0;
  }

  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return { allowed, plan, limit, used, remaining };
}

/**
 * Increment the monthly message counter for a shop.
 * Resets automatically if we're in a new billing period.
 */
export async function incrementUsage(shopId: string): Promise<void> {
  const rows = await db
    .select({ id: merchantsTable.id, monthlyMessageCount: merchantsTable.monthlyMessageCount, usagePeriodStart: merchantsTable.usagePeriodStart })
    .from(merchantsTable)
    .where(eq(merchantsTable.shopId, shopId))
    .limit(1);

  if (rows.length === 0) return;
  const merchant = rows[0];
  const periodStart = getBillingPeriodStart();

  const storedPeriodStart = merchant.usagePeriodStart;
  const needsReset = !storedPeriodStart || storedPeriodStart < periodStart;
  const newCount = needsReset ? 1 : (merchant.monthlyMessageCount ?? 0) + 1;

  await db
    .update(merchantsTable)
    .set({
      monthlyMessageCount: newCount,
      usagePeriodStart: needsReset ? periodStart : storedPeriodStart,
      updatedAt: new Date(),
    })
    .where(eq(merchantsTable.id, merchant.id));
}
