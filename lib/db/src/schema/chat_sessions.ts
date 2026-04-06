import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export interface StoredMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const chatSessionsTable = pgTable("chat_sessions", {
  sessionKey: text("session_key").primaryKey(),
  sessionId: text("session_id").notNull(),
  shopId: text("shop_id").notNull(),
  messages: jsonb("messages").notNull().$type<StoredMessage[]>().default([]),
  messageCount: integer("message_count").notNull().default(0),
  firstMessage: text("first_message").notNull().default(""),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ChatSession = typeof chatSessionsTable.$inferSelect;
export type InsertChatSession = typeof chatSessionsTable.$inferInsert;
