import { useAnalyticsSummary, useAnalyticsDaily } from "@/hooks/use-api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare, Users, TrendingUp, BarChart2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const PAGE_TYPE_LABELS: Record<string, string> = {
  product: "Product Pages",
  collection: "Collection Pages",
  cart: "Cart Pages",
  search: "Search Pages",
  other: "Other Pages",
};

const PAGE_TYPE_COLORS: Record<string, string> = {
  product: "bg-violet-500",
  collection: "bg-blue-500",
  cart: "bg-green-500",
  search: "bg-yellow-500",
  other: "bg-slate-400",
};

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: daily, isLoading: dailyLoading } = useAnalyticsDaily();

  const isLoading = summaryLoading || dailyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pageBreakdown = summary?.pageTypeBreakdown ?? {};
  const totalSessions = summary?.sessions ?? 0;

  const pageTypeEntries = Object.entries(PAGE_TYPE_LABELS)
    .map(([key, label]) => ({
      key,
      label,
      count: pageBreakdown[key] ?? 0,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);

  const chartData = (daily?.days ?? []).map((d) => ({
    ...d,
    label: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Performance overview for this month's AI assistant activity.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="AI Messages Sent"
          value={(summary?.messages ?? 0).toLocaleString()}
          description="Total messages this month"
          icon={MessageSquare}
        />
        <MetricCard
          title="Conversations"
          value={(summary?.sessions ?? 0).toLocaleString()}
          description="Unique sessions started"
          icon={Users}
        />
        <MetricCard
          title="Avg Messages / Conv"
          value={summary?.avgPerSession ?? 0}
          description="Messages per conversation"
          icon={TrendingUp}
        />
        <MetricCard
          title="Most Active Page"
          value={
            pageTypeEntries[0]
              ? PAGE_TYPE_LABELS[pageTypeEntries[0].key] ?? pageTypeEntries[0].key
              : "—"
          }
          description="Page type generating most conversations"
          icon={BarChart2}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Message Volume</CardTitle>
          <CardDescription>AI messages sent per day over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.every((d) => d.messageCount === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <BarChart2 className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No messages yet. Data will appear once your AI widget is active.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value, "Messages"]}
                />
                <Bar dataKey="messageCount" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Page Type Breakdown</CardTitle>
            <CardDescription>
              Which pages generate the most conversations this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pageTypeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No conversations yet.
              </p>
            ) : (
              <div className="space-y-3">
                {pageTypeEntries.map(({ key, label, count }) => {
                  const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${PAGE_TYPE_COLORS[key] ?? "bg-slate-400"}`} />
                          <span>{label}</span>
                        </div>
                        <span className="font-medium text-muted-foreground">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${PAGE_TYPE_COLORS[key] ?? "bg-slate-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Sessions</CardTitle>
            <CardDescription>Unique conversations started per day (last 30 days).</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.every((d) => d.sessionCount === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Users className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No sessions yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [value, "Sessions"]}
                  />
                  <Bar dataKey="sessionCount" fill="hsl(var(--primary) / 0.5)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
