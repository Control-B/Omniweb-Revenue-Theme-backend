import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBillingStatus } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Layers, ShieldCheck, Terminal, Puzzle } from "lucide-react";

export default function Install() {
  const { credentials } = useAuth();
  const { data: billing } = useBillingStatus();

  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedLiquid, setCopiedLiquid] = useState(false);
  const [copiedApiUrl, setCopiedApiUrl] = useState(false);

  const apiUrl = window.location.origin;
  const shopId = credentials?.shopId || "YOUR_SHOP_ID";

  const scriptTag = `<script\n  src="${apiUrl}/api/widget.js"\n  data-api-url="${apiUrl}"\n  data-shop-id="${shopId}"\n  defer></script>`;
  const liquidSnippet = `{%- comment -%} Omniweb AI Assistant {%- endcomment -%}\n<script\n  src="${apiUrl}/api/widget.js"\n  data-api-url="${apiUrl}"\n  data-shop-id="${shopId}"\n  defer></script>`;

  const themeCustomizerUrl = credentials?.shopId
    ? `https://${credentials.shopId}/admin/themes/current/editor?context=apps`
    : "https://YOUR_STORE.myshopify.com/admin/themes/current/editor?context=apps";

  const copy = async (text: string, which: "script" | "liquid" | "apiUrl") => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "script") { setCopiedScript(true); setTimeout(() => setCopiedScript(false), 2000); }
      if (which === "liquid") { setCopiedLiquid(true); setTimeout(() => setCopiedLiquid(false), 2000); }
      if (which === "apiUrl") { setCopiedApiUrl(true); setTimeout(() => setCopiedApiUrl(false), 2000); }
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy — please copy manually");
    }
  };

  const isConnected = billing?.hasShopifyToken;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Installation</h1>
        <p className="text-muted-foreground">Add the Omniweb AI assistant to your Shopify storefront.</p>
      </div>

      {isConnected ? (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CardContent className="pt-5 flex items-start gap-3">
            <ShieldCheck size={20} className="text-green-600 mt-0.5 shrink-0" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <strong>Shopify store connected.</strong> Your store is linked and the OAuth access token is active.
              Use the <strong>App Embed</strong> tab below to activate the widget — no code editing needed.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="pt-5 flex items-start gap-3">
            <Puzzle size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <p>
                <strong>Connect your Shopify store first.</strong> Installing via OAuth lets Omniweb manage your
                subscription, register webhooks, and activate the Theme App Extension automatically.
              </p>
              <a
                href={`/api/shopify/install?shop=${shopId}`}
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80"
              >
                Install on {shopId} <ExternalLink size={13} />
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Your API URL
          </CardTitle>
          <CardDescription>You'll paste this into your theme settings or code snippet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">
              {apiUrl}
            </code>
            <Button
              size="icon"
              variant="outline"
              onClick={() => copy(apiUrl, "apiUrl")}
              data-testid="button-copy-api-url"
              aria-label="Copy API URL"
            >
              {copiedApiUrl ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="embed" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="embed" className="flex items-center gap-1.5">
            <Layers size={14} />
            App Embed
            <Badge className="ml-1 text-[10px] py-0 h-4">Recommended</Badge>
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-1.5">
            <Terminal size={14} />
            HTML
          </TabsTrigger>
          <TabsTrigger value="liquid">Liquid</TabsTrigger>
        </TabsList>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers size={20} className="text-primary" />
                Theme App Extension — App Embed
              </CardTitle>
              <CardDescription>
                No code editing required. Shopify injects the widget on every page via a native theme block.
                Survives theme upgrades and can be toggled from the Shopify customizer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ol className="list-decimal list-inside text-sm space-y-5 ml-1">
                <li>
                  <span className="font-semibold">Open Theme Customizer</span>
                  <p className="text-muted-foreground mt-1">
                    In Shopify Admin → <strong>Online Store → Themes</strong>, click <strong>Customize</strong> on your active theme.
                  </p>
                  <a
                    href={themeCustomizerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2 mt-1"
                  >
                    Open Theme Customizer <ExternalLink size={11} />
                  </a>
                </li>
                <li>
                  <span className="font-semibold">Open App Embeds</span>
                  <p className="text-muted-foreground mt-1">
                    In the left sidebar, click the <strong>App Embeds</strong> icon (puzzle piece at the bottom of the panel).
                  </p>
                </li>
                <li>
                  <span className="font-semibold">Enable Omniweb Widget</span>
                  <p className="text-muted-foreground mt-1">
                    Find <strong>"Omniweb Widget"</strong> in the list and toggle it <strong>on</strong>.
                  </p>
                </li>
                <li>
                  <span className="font-semibold">Paste your API URL</span>
                  <p className="text-muted-foreground mt-1">
                    In the settings panel that appears, paste your API URL into the <strong>"API URL"</strong> field:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 rounded border bg-muted px-2.5 py-1.5 text-xs font-mono break-all">
                      {apiUrl}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 shrink-0"
                      onClick={() => copy(apiUrl, "apiUrl")}
                    >
                      {copiedApiUrl ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    </Button>
                  </div>
                </li>
                <li>
                  <span className="font-semibold">Save</span>
                  <p className="text-muted-foreground mt-1">Click <strong>Save</strong>. The widget is now live on every storefront page.</p>
                </li>
              </ol>

              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20 p-4 text-sm text-blue-800 dark:text-blue-200">
                <strong>Why App Embed?</strong> Unlike a manual script tag, App Embeds survive theme switches,
                are toggleable without touching code, and are the method required for the Shopify App Store.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal size={20} className="text-primary" />
                HTML snippet
              </CardTitle>
              <CardDescription>
                Paste directly into your theme before the closing{" "}
                <code className="bg-muted px-1 rounded text-xs">&lt;/body&gt;</code> tag.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted p-4 relative font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">{scriptTag}</pre>
                <Button
                  size="icon" variant="ghost"
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background border"
                  onClick={() => copy(scriptTag, "script")}
                  data-testid="button-copy-html"
                >
                  {copiedScript ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-1">
                <li>Shopify Admin → <strong>Online Store → Themes → ... → Edit code</strong></li>
                <li>Open <code className="bg-muted px-1 rounded text-xs">layout/theme.liquid</code></li>
                <li>Paste just before <code className="bg-muted px-1 rounded text-xs">&lt;/body&gt;</code> and click <strong>Save</strong></li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquid">
          <Card>
            <CardHeader>
              <CardTitle>Liquid snippet</CardTitle>
              <CardDescription>
                Install as a reusable Liquid snippet, then render it from your layout file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted p-4 relative font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">{liquidSnippet}</pre>
                <Button
                  size="icon" variant="ghost"
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background border"
                  onClick={() => copy(liquidSnippet, "liquid")}
                  data-testid="button-copy-liquid"
                >
                  {copiedLiquid ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-1">
                <li>Theme editor → <strong>Snippets</strong></li>
                <li>Create <code className="bg-muted px-1 rounded text-xs">omniweb-widget.liquid</code> and paste the code</li>
                <li>In <code className="bg-muted px-1 rounded text-xs">layout/theme.liquid</code> add{" "}
                  <code className="bg-muted px-1 rounded text-xs">&#123;% render 'omniweb-widget' %&#125;</code>{" "}
                  before <code className="bg-muted px-1 rounded text-xs">&lt;/body&gt;</code>
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="pt-5 flex items-start gap-3">
          <ShieldCheck size={20} className="text-green-600 mt-0.5 shrink-0" />
          <div className="text-sm text-green-800 dark:text-green-200">
            <strong>No API key exposed in your storefront.</strong> The widget authenticates using your Shop ID only.
            Admin credentials stay private inside this dashboard.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
