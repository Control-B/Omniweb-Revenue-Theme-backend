import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface WidgetConfig {
  shopId: string;
  greeting: string;
  persona: string;
  voiceId: string;
  accentColor: string;
  position: "bottom-right" | "bottom-left";
  widgetTitle: string;
  enabled: boolean;
}

export interface Voice {
  id: string;
  name: string;
  description: string;
}

export interface Session {
  sessionId: string;
  messageCount: number;
  firstMessage: string;
  lastActiveAt: string;
  createdAt: string;
}

const fetchWithAuth = async (url: string, credentials: { shopId: string; apiKey: string } | null, options: RequestInit = {}) => {
  if (!credentials) throw new Error("Unauthorized");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-widget-api-key": credentials.apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText || "Request failed");
  }

  return response.json();
};

export function useWidgetConfig(shopId?: string) {
  const { credentials } = useAuth();
  const targetShopId = shopId || credentials?.shopId;

  return useQuery<WidgetConfig>({
    queryKey: ["widgetConfig", targetShopId],
    queryFn: () => fetchWithAuth(`/api/widget-config/${targetShopId}`, credentials),
    enabled: !!targetShopId && !!credentials,
  });
}

export function useUpdateWidgetConfig() {
  const { credentials } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WidgetConfig>) => 
      fetchWithAuth(`/api/widget-config/${credentials?.shopId}`, credentials, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["widgetConfig", credentials?.shopId], data);
    },
  });
}

export function useVoices() {
  const { credentials } = useAuth();

  return useQuery<{ voices: Voice[] }>({
    queryKey: ["voices"],
    queryFn: () => fetchWithAuth("/api/voices", credentials),
    enabled: !!credentials,
  });
}

export function useConversations() {
  const { credentials } = useAuth();

  return useQuery<{ sessions: Session[]; total: number }>({
    queryKey: ["conversations", credentials?.shopId],
    queryFn: () => fetchWithAuth(`/api/conversations/${credentials?.shopId}`, credentials),
    enabled: !!credentials?.shopId,
    refetchInterval: 30000, // auto-refresh every 30s
  });
}
