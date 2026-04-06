import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, Copy, ShieldCheck, Terminal } from "lucide-react";

export default function Install() {
  const { credentials } = useAuth();
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedLiquid, setCopiedLiquid] = useState(false);

  const apiUrl = window.location.origin;
  const shopId = credentials?.shopId || "YOUR_SHOP_ID";

  const scriptTag = `<script src="${apiUrl}/widget.js"\n  data-api-url="${apiUrl}"\n  data-shop-id="${shopId}"\n  defer></script>`;

  const liquidSnippet = `{%- comment -%} Omniweb AI Assistant {%- endcomment -%}\n<script src="{{ '${apiUrl}/widget.js' | asset_url }}"\n  data-api-url="${apiUrl}"\n  data-shop-id="${shopId}"\n  defer></script>`;

  const copyToClipboard = async (text: string, isLiquid: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isLiquid) {
        setCopiedLiquid(true);
        setTimeout(() => setCopiedLiquid(false), 2000);
      } else {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      }
      toast.success("Copied to clipboard", {
        description: "You can now paste the code into your store.",
      });
    } catch {
      toast.error("Failed to copy", {
        description: "Please copy the text manually.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Installation</h1>
        <p className="text-muted-foreground">Add the AI assistant widget to your Shopify store.</p>
      </div>

      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="pt-5 flex items-start gap-3">
          <ShieldCheck size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800 dark:text-green-200">
            <strong>No API key required in your storefront.</strong> The widget authenticates using
            your Shop ID only. Your admin API key stays private in this dashboard.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal size={20} className="text-primary" />
            Integration Code
          </CardTitle>
          <CardDescription>
            Choose your preferred installation method. Paste the snippet into your Shopify theme before the closing{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground text-xs">&lt;/body&gt;</code> tag.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="html">Standard HTML</TabsTrigger>
              <TabsTrigger value="liquid">Shopify Liquid</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-4">
              <div className="rounded-lg border bg-muted p-4 relative font-mono text-sm overflow-x-auto text-foreground/90">
                <pre className="whitespace-pre-wrap break-all">{scriptTag}</pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background border border-border"
                  onClick={() => copyToClipboard(scriptTag, false)}
                  data-testid="button-copy-html"
                  aria-label="Copy HTML snippet"
                >
                  {copiedScript ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-sm">How to install:</h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-1">
                  <li>In Shopify Admin, go to <strong>Online Store &gt; Themes</strong>.</li>
                  <li>Click <strong>...</strong> next to your live theme, then <strong>Edit code</strong>.</li>
                  <li>Open <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">layout/theme.liquid</code>.</li>
                  <li>Paste the snippet just before <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">&lt;/body&gt;</code> and click <strong>Save</strong>.</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="liquid" className="space-y-4">
              <div className="rounded-lg border bg-muted p-4 relative font-mono text-sm overflow-x-auto text-foreground/90">
                <pre className="whitespace-pre-wrap break-all">{liquidSnippet}</pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background border border-border"
                  onClick={() => copyToClipboard(liquidSnippet, true)}
                  data-testid="button-copy-liquid"
                  aria-label="Copy Liquid snippet"
                >
                  {copiedLiquid ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-sm">How to install as a snippet:</h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-1">
                  <li>In your theme code editor, go to <strong>Snippets</strong>.</li>
                  <li>Create a new snippet named <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">omniweb-widget.liquid</code> and paste the code above.</li>
                  <li>In <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">layout/theme.liquid</code>, add <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">&#123;% render 'omniweb-widget' %&#125;</code> before <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">&lt;/body&gt;</code>.</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
