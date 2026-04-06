import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { merchantsTable } from "./merchants";

export const positionEnum = pgEnum("widget_position", ["bottom-right", "bottom-left"]);

export const widgetConfigsTable = pgTable("widget_configs", {
  shopId: text("shop_id")
    .primaryKey()
    .references(() => merchantsTable.shopId, { onDelete: "cascade" }),
  widgetTitle: text("widget_title").notNull().default("Sales Assistant"),
  greeting: text("greeting").notNull().default("Hi! 👋 I'm your AI sales assistant. How can I help you today?"),
  persona: text("persona").notNull().default(
    "You are a friendly, knowledgeable, and helpful AI sales assistant for an online store. You help shoppers find products, answer questions about products, pricing, shipping, and returns, and guide them toward making a purchase. Be concise, warm, and helpful. Never be pushy."
  ),
  voiceId: text("voice_id").notNull().default("21m00Tcm4TlvDq8ikWAM"),
  accentColor: text("accent_color").notNull().default("#E63946"),
  position: positionEnum("position").notNull().default("bottom-right"),
  enabled: boolean("enabled").notNull().default(true),
  registeredAt: timestamp("registered_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WidgetConfig = typeof widgetConfigsTable.$inferSelect;
export type InsertWidgetConfig = typeof widgetConfigsTable.$inferInsert;
