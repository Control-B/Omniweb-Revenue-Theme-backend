import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "starter", "pro"]);

export const merchantsTable = pgTable("merchants", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  shopId: text("shop_id").notNull().unique(),
  passwordHash: text("password_hash"),
  apiKeyHash: text("api_key_hash"),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Merchant = typeof merchantsTable.$inferSelect;
export type InsertMerchant = typeof merchantsTable.$inferInsert;
