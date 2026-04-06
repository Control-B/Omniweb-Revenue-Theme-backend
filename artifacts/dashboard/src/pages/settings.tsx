import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useWidgetConfig, useUpdateWidgetConfig, useVoices } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

const configSchema = z.object({
  widgetTitle: z.string().min(1, "Widget title is required"),
  greeting: z.string().min(1, "Greeting is required"),
  persona: z.string().min(1, "Persona instructions are required"),
  voiceId: z.string().min(1, "Please select a voice"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, "Must be a valid hex color"),
  position: z.enum(["bottom-right", "bottom-left"]),
  enabled: z.boolean(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export default function Settings() {
  const { credentials } = useAuth();
  const { data: config, isLoading: isConfigLoading } = useWidgetConfig();
  const { data: voicesData, isLoading: isVoicesLoading } = useVoices();
  const updateConfig = useUpdateWidgetConfig();
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      widgetTitle: "",
      greeting: "",
      persona: "",
      voiceId: "",
      accentColor: "#000000",
      position: "bottom-right",
      enabled: false,
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        widgetTitle: config.widgetTitle,
        greeting: config.greeting,
        persona: config.persona,
        voiceId: config.voiceId,
        accentColor: config.accentColor,
        position: config.position,
        enabled: config.enabled,
      });
    }
  }, [config, form]);

  const onSubmit = (data: ConfigFormValues) => {
    updateConfig.mutate(data, {
      onSuccess: () => {
        toast.success("Settings saved", {
          description: "Your widget configuration has been updated successfully.",
        });
      },
      onError: () => {
        toast.error("Failed to save settings", {
          description: "Please check your credentials and try again.",
        });
      }
    });
  };

  const previewColor = form.watch("accentColor");
  const previewPosition = form.watch("position");
  const previewTitle = form.watch("widgetTitle");

  if (isConfigLoading || isVoicesLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Widget Settings</h1>
        <p className="text-muted-foreground">Manage how your AI sales assistant looks and behaves on your store.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and placement of the widget.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="widgetTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Widget Title</FormLabel>
                          <FormControl>
                            <Input placeholder="AI Assistant" {...field} data-testid="input-widget-title" />
                          </FormControl>
                          <FormDescription>Displayed in the widget header.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <Input 
                                type="color" 
                                className="w-12 h-10 p-1 cursor-pointer" 
                                {...field} 
                                data-testid="input-color-picker"
                              />
                              <Input 
                                type="text" 
                                className="flex-1 font-mono" 
                                {...field} 
                                data-testid="input-color-hex"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Widget Position</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            data-testid="radio-position"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="bottom-right" data-testid="radio-position-right" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">Bottom Right</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="bottom-left" data-testid="radio-position-left" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">Bottom Left</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Behavior</CardTitle>
                  <CardDescription>Configure the AI persona and voice settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="greeting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Welcome Greeting</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Hi there! How can I help you find the perfect product today?" 
                            className="resize-none min-h-[80px]"
                            {...field} 
                            data-testid="textarea-greeting"
                          />
                        </FormControl>
                        <FormDescription>The first message shown to shoppers when they open the widget.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="persona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt / Persona</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="You are a helpful sales assistant for a premium coffee brand..." 
                            className="resize-y min-h-[120px] font-mono text-sm"
                            {...field} 
                            data-testid="textarea-persona"
                          />
                        </FormControl>
                        <FormDescription>Instructions that define the AI's personality and knowledge.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="voiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Voice</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-voice">
                              <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {voicesData?.voices.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id} data-testid={`select-voice-${voice.id}`}>
                                <span>{voice.name}</span>
                                <span className="text-muted-foreground ml-2 text-xs">({voice.description})</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The voice used when the AI speaks to the customer.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Widget</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle to show or hide the widget on your live store.
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-enabled"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateConfig.isPending}
                  data-testid="button-save-settings"
                >
                  {updateConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>

            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h3 className="font-semibold mb-4">Live Preview</h3>
            <div className="relative h-[600px] w-full rounded-xl border border-border bg-slate-100 dark:bg-slate-900 overflow-hidden flex flex-col shadow-inner">
              {/* Fake Browser Chrome */}
              <div className="h-10 bg-slate-200 dark:bg-slate-800 border-b border-border flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 h-6 bg-white dark:bg-slate-950 rounded-md text-[10px] flex items-center px-3 text-muted-foreground opacity-70">
                  {credentials?.shopId}
                </div>
              </div>
              
              {/* Fake Store Content */}
              <div className="flex-1 p-6 space-y-4 opacity-40 pointer-events-none">
                <div className="w-1/3 h-8 bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="w-full h-40 bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded" />
                  <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded" />
                  <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded" />
                </div>
              </div>

              {/* Fake Widget */}
              {form.watch("enabled") !== false && (
                <div 
                  className="absolute bottom-6 flex flex-col gap-4 max-w-[280px] w-[calc(100%-48px)] transition-all duration-300 ease-in-out"
                  style={{
                    [previewPosition === "bottom-left" ? "left" : "right"]: "24px",
                    alignItems: previewPosition === "bottom-left" ? "flex-start" : "flex-end"
                  }}
                >
                  <div className="w-full bg-background rounded-xl shadow-xl overflow-hidden border border-border flex flex-col h-[320px]">
                    <div 
                      className="p-4 text-white font-medium flex items-center gap-2"
                      style={{ backgroundColor: previewColor }}
                    >
                      <MessageCircle size={18} />
                      <span className="truncate">{previewTitle || "AI Assistant"}</span>
                    </div>
                    <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                      <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-sm text-foreground max-w-[85%] self-start">
                        {form.watch("greeting") || "Hello!"}
                      </div>
                    </div>
                    <div className="p-3 border-t border-border">
                      <div className="h-10 bg-muted rounded-full w-full flex items-center px-4">
                        <span className="text-xs text-muted-foreground">Type a message...</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer"
                    style={{ backgroundColor: previewColor }}
                  >
                    <MessageCircle size={24} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
