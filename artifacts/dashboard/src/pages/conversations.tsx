import { useConversations } from "@/hooks/use-api";
import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquareOff } from "lucide-react";

export default function Conversations() {
  const { data, isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sessions = data?.sessions || [];
  const total = data?.total || 0;

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
              <CardDescription>Real-time view of customer interactions.</CardDescription>
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
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Last Active</TableHead>
                    <TableHead className="w-[400px]">First Message</TableHead>
                    <TableHead className="text-center">Messages</TableHead>
                    <TableHead className="text-right">Session ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.sessionId} data-testid={`row-session-${session.sessionId}`}>
                      <TableCell className="font-medium text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="max-w-[400px]">
                        <span className="truncate block" title={session.firstMessage}>
                          {session.firstMessage || <span className="text-muted-foreground italic">No messages yet</span>}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{session.messageCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground font-mono text-xs">
                        {session.sessionId.substring(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
