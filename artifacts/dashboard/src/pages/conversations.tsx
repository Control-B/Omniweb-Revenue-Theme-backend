import { useState } from "react";
import { useConversations } from "@/hooks/use-api";
import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquareOff, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 25;

const PAGE_TYPE_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  product:    { label: "Product",    variant: "default" },
  collection: { label: "Collection", variant: "secondary" },
  cart:       { label: "Cart",       variant: "outline" },
  search:     { label: "Search",     variant: "outline" },
  other:      { label: "Other",      variant: "outline" },
};

function PageTypeBadge({ pageType }: { pageType: string }) {
  const config = PAGE_TYPE_CONFIG[pageType] ?? PAGE_TYPE_CONFIG["other"]!;
  return (
    <Badge variant={config.variant} className="text-xs whitespace-nowrap">
      {config.label}
    </Badge>
  );
}

export default function Conversations() {
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;
  const { data, isLoading } = useConversations(PAGE_SIZE, offset);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sessions = data?.sessions || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">Monitor AI chat sessions from your store visitors.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Chat sessions sorted by most recent activity.</CardDescription>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              {total} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <MessageSquareOff size={32} className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No conversations yet</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                When customers chat with your AI assistant, their sessions will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Last Active</TableHead>
                      <TableHead>First Message</TableHead>
                      <TableHead className="w-[110px]">Page</TableHead>
                      <TableHead className="text-center w-[90px]">Messages</TableHead>
                      <TableHead className="text-right w-[110px]">Session ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.sessionId} data-testid={`row-session-${session.sessionId}`}>
                        <TableCell className="font-medium text-muted-foreground whitespace-nowrap text-sm">
                          {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <span className="truncate block text-sm" title={session.firstMessage}>
                            {session.firstMessage || (
                              <span className="text-muted-foreground italic">No messages yet</span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <PageTypeBadge pageType={session.pageType} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{session.messageCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground font-mono text-xs">
                          {session.sessionId.substring(0, 8)}…
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>
                    Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <span className="px-2">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
