import { db, dailyStatsTable, chatSessionsTable } from "@workspace/db";
import { eq, sql, gte, desc } from "drizzle-orm";

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function upsertDailyStats(shopId: string, isNewSession: boolean): Promise<void> {
  const date = todayDate();
  await db
    .insert(dailyStatsTable)
    .values({
      shopId,
      date,
      messageCount: 1,
      sessionCount: isNewSession ? 1 : 0,
    })
    .onConflictDoUpdate({
      target: [dailyStatsTable.shopId, dailyStatsTable.date],
      set: {
        messageCount: sql`daily_stats.message_count + 1`,
        sessionCount: isNewSession
          ? sql`daily_stats.session_count + 1`
          : sql`daily_stats.session_count`,
      },
    });
}

export async function getAnalyticsSummary(shopId: string): Promise<{
  messages: number;
  sessions: number;
  avgPerSession: number;
  pageTypeBreakdown: Record<string, number>;
}> {
  const start = monthStart();

  const [totals, pageTypes] = await Promise.all([
    db
      .select({
        messages: sql<number>`coalesce(sum(message_count), 0)::int`,
        sessions: sql<number>`coalesce(sum(session_count), 0)::int`,
      })
      .from(dailyStatsTable)
      .where(
        sql`${dailyStatsTable.shopId} = ${shopId} AND ${dailyStatsTable.date} >= ${start}`
      ),
    db
      .select({
        pageType: chatSessionsTable.pageType,
        count: sql<number>`count(*)::int`,
      })
      .from(chatSessionsTable)
      .where(
        sql`${chatSessionsTable.shopId} = ${shopId} AND ${chatSessionsTable.createdAt} >= ${start}::timestamp`
      )
      .groupBy(chatSessionsTable.pageType),
  ]);

  const messages = totals[0]?.messages ?? 0;
  const sessions = totals[0]?.sessions ?? 0;
  const avgPerSession = sessions > 0 ? Math.round((messages / sessions) * 10) / 10 : 0;

  const pageTypeBreakdown: Record<string, number> = {
    product: 0,
    collection: 0,
    cart: 0,
    search: 0,
    other: 0,
  };
  for (const row of pageTypes) {
    const key = row.pageType in pageTypeBreakdown ? row.pageType : "other";
    pageTypeBreakdown[key] = (pageTypeBreakdown[key] ?? 0) + row.count;
  }

  return { messages, sessions, avgPerSession, pageTypeBreakdown };
}

export async function getAnalyticsDaily(shopId: string): Promise<
  Array<{ date: string; messageCount: number; sessionCount: number }>
> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const startDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const rows = await db
    .select({
      date: dailyStatsTable.date,
      messageCount: dailyStatsTable.messageCount,
      sessionCount: dailyStatsTable.sessionCount,
    })
    .from(dailyStatsTable)
    .where(
      sql`${dailyStatsTable.shopId} = ${shopId} AND ${dailyStatsTable.date} >= ${startDate}`
    )
    .orderBy(desc(dailyStatsTable.date));

  const byDate = new Map(rows.map((r) => [r.date, r]));

  const result: Array<{ date: string; messageCount: number; sessionCount: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const row = byDate.get(dateStr);
    result.push({
      date: dateStr,
      messageCount: row?.messageCount ?? 0,
      sessionCount: row?.sessionCount ?? 0,
    });
  }
  return result;
}
