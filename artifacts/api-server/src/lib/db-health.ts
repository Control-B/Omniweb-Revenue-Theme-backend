import { db, merchantsTable, widgetConfigsTable, chatSessionsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger.js";

export async function checkDatabaseHealth(): Promise<void> {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info("Database connection healthy");

    const result = await db.execute(sql`
      SELECT COUNT(*) AS table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('merchants', 'widget_configs', 'chat_sessions')
    `);
    const row = result.rows[0] as Record<string, unknown> | undefined;
    const tableCount = Number(row?.["table_count"] ?? 0);
    if (tableCount < 3) {
      throw new Error(
        `Expected 3 required tables in DB but found ${tableCount}. ` +
          "Run: pnpm --filter @workspace/db run push"
      );
    }
    logger.info({ tableCount }, "Database schema verified");
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    throw err;
  }
}
