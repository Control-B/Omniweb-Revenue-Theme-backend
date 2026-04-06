export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Session {
  messages: Message[];
  shopId: string;
  createdAt: Date;
  lastActiveAt: Date;
  messageCount: number;
}

const MAX_SESSIONS = 1000;
const SESSION_TTL_MS = 30 * 60 * 1000;

const sessions = new Map<string, Session>();

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
  if (sessions.size > MAX_SESSIONS) {
    const oldest = [...sessions.entries()].sort(
      (a, b) => a[1].lastActiveAt.getTime() - b[1].lastActiveAt.getTime()
    );
    oldest.slice(0, sessions.size - MAX_SESSIONS).forEach(([id]) => sessions.delete(id));
  }
}

export function getOrCreateSession(sessionId: string, shopId: string): Session {
  pruneExpiredSessions();
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [],
      shopId,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      messageCount: 0,
    });
  }
  const session = sessions.get(sessionId)!;
  session.lastActiveAt = new Date();
  return session;
}

export function addMessageToSession(sessionId: string, message: Message): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.messages.push(message);
  session.messageCount++;
  session.lastActiveAt = new Date();
  if (session.messages.length > 40) {
    const systemMessages = session.messages.filter((m) => m.role === "system");
    const nonSystemMessages = session.messages.filter((m) => m.role !== "system");
    session.messages = [...systemMessages, ...nonSystemMessages.slice(-30)];
  }
}

export function getRecentSessions(shopId: string, limit = 50): Array<{
  sessionId: string;
  messageCount: number;
  firstMessage: string;
  lastActiveAt: Date;
  createdAt: Date;
}> {
  return [...sessions.entries()]
    .filter(([, s]) => s.shopId === shopId)
    .sort((a, b) => b[1].lastActiveAt.getTime() - a[1].lastActiveAt.getTime())
    .slice(0, limit)
    .map(([id, s]) => ({
      sessionId: id,
      messageCount: s.messageCount,
      firstMessage: s.messages.find((m) => m.role === "user")?.content ?? "",
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
    }));
}
