import { pgTable, text, integer, index, primaryKey } from "drizzle-orm/pg-core";
import { widgetConfigsTable } from "./widget_configs";

export const dailyStatsTable = pgTable(
  "daily_stats",
  {
    shopId: text("shop_id")
      .notNull()
      .references(() => widgetConfigsTable.shopId, { onDelete: "cascade" }),
    date: text("date").notNull(),
    messageCount: integer("message_count").notNull().default(0),
    sessionCount: integer("session_count").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.shopId, t.date] }),
    index("idx_daily_stats_shop_date").on(t.shopId, t.date),
  ]
);

export type DailyStat = typeof dailyStatsTable.$inferSelect;
export type InsertDailyStat = typeof dailyStatsTable.$inferInsert;
