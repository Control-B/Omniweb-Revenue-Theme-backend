import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, Copy, Terminal } from "lucide-react";

export default function Install() {
  const { credentials } = useAuth();
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedLiquid, setCopiedLiquid] = useState(false);

  const domain = window.location.origin;
  const shopId = credentials?.shopId || "YOUR_SHOP_ID";
  const apiKey = credentials?.apiKey || "YOUR_API_KEY";

  const scriptTag = `<script src="${domain}/widget.js" data-shop-id="${shopId}" data-api-key="${apiKey}"></script>`;
  
  const liquidSnippet = `<!-- Omniweb AI Assistant -->
<script src="{{ '${domain}/widget.js' }}" data-shop-id="${shopId}" data-api-key="${apiKey}" defer></script>`;

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
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Please copy the text manually.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Installation</h1>
        <p className="text-muted-foreground">Add the AI assistant to your Shopify store.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal size={20} className="text-primary" />
            Integration Code
          </CardTitle>
          <CardDescription>
            Choose your preferred installation method. Both options will connect your store to this dashboard.
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
                <pre>{scriptTag}</pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background border border-border"
                  onClick={() => copyToClipboard(scriptTag, false)}
                  data-testid="button-copy-html"
                >
                  {copiedScript ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              <div className="space-y-2 mt-6">
                <h4 className="font-semibold text-sm">How to install:</h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-1">
                  <li>Go to your Shopify Admin panel.</li>
                  <li>Navigate to <strong>Online Store &gt; Themes</strong>.</li>
                  <li>Click the <strong>...</strong> button next to your current theme and select <strong>Edit code</strong>.</li>
                  <li>Open <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">theme.liquid</code> under the Layout folder.</li>
                  <li>Scroll to the bottom and paste the snippet right before the closing <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">&lt;/body&gt;</code> tag.</li>
                  <li>Click <strong>Save</strong>.</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="liquid" className="space-y-4">
              <div className="rounded-lg border bg-muted p-4 relative font-mono text-sm overflow-x-auto text-foreground/90">
                <pre>{liquidSnippet}</pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background border border-border"
                  onClick={() => copyToClipboard(liquidSnippet, true)}
                  data-testid="button-copy-liquid"
                >
                  {copiedLiquid ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              <div className="space-y-2 mt-6">
                <h4 className="font-semibold text-sm">How to install as a snippet:</h4>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-1">
                  <li>In your Shopify theme code editor, go to the <strong>Snippets</strong> folder.</li>
                  <li>Click <strong>Add a new snippet</strong> and name it <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">omniweb-widget.liquid</code>.</li>
                  <li>Paste the code above into the new file and save.</li>
                  <li>Open <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">theme.liquid</code> and add <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">&#123;% render 'omniweb-widget' %&#125;</code> before <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">&lt;/body&gt;</code>.</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
