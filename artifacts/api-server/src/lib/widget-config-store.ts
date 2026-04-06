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

const DEFAULT_CONFIG: Omit<WidgetConfig, "shopId"> = {
  greeting: "Hi! 👋 I'm your AI sales assistant. How can I help you today?",
  persona:
    "You are a friendly, knowledgeable, and helpful AI sales assistant for an online store. You help shoppers find products, answer questions about products, pricing, shipping, and returns, and guide them toward making a purchase. Be concise, warm, and helpful. Never be pushy.",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  accentColor: "#E63946",
  position: "bottom-right",
  widgetTitle: "Sales Assistant",
  enabled: true,
};

const configs = new Map<string, WidgetConfig>();
const registeredShops = new Set<string>(["demo.myshopify.com"]);

export function isShopRegistered(shopId: string): boolean {
  return registeredShops.has(shopId);
}

export function getWidgetConfig(shopId: string): WidgetConfig {
  if (!configs.has(shopId)) {
    configs.set(shopId, { shopId, ...DEFAULT_CONFIG });
  }
  return configs.get(shopId)!;
}

export function updateWidgetConfig(
  shopId: string,
  updates: Partial<Omit<WidgetConfig, "shopId">>
): WidgetConfig {
  const existing = getWidgetConfig(shopId);
  const updated = { ...existing, ...updates, shopId };
  configs.set(shopId, updated);
  registeredShops.add(shopId);
  return updated;
}

export interface PublicWidgetConfig {
  shopId: string;
  widgetTitle: string;
  greeting: string;
  accentColor: string;
  position: "bottom-right" | "bottom-left";
  enabled: boolean;
  voiceId: string;
}

export function getPublicWidgetConfig(shopId: string): PublicWidgetConfig {
  const { shopId: sid, widgetTitle, greeting, accentColor, position, enabled, voiceId } = getWidgetConfig(shopId);
  return { shopId: sid, widgetTitle, greeting, accentColor, position, enabled, voiceId };
}

export function getAvailableVoices(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "Calm, professional female voice" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", description: "Strong, confident female voice" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", description: "Soft, warm female voice" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni", description: "Well-rounded male voice" },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", description: "Emotional, expressive female voice" },
    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", description: "Deep, mature male voice" },
    { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", description: "Crisp, authoritative male voice" },
    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", description: "Neutral, clear male voice" },
    { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", description: "Raspy, dynamic male voice" },
  ];
}
