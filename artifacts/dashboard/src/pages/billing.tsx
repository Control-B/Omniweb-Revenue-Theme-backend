import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useBillingStatus,
  useCreateSubscription,
  useCancelSubscription,
} from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Loader2,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Link2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  trialing: { label: "Trial", variant: "secondary" },
  past_due: { label: "Past Due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "destructive" },
  none: { label: "Free Plan", variant: "outline" },
  incomplete: { label: "Incomplete", variant: "destructive" },
};

const PLAN_PRICES: Record<string, string> = {
  free: "$0/mo",
  starter: "$29/mo",
  pro: "$99/mo",
};

export default function Billing() {
  const { data: billing, isLoading, refetch } = useBillingStatus();
  const subscribe = useCreateSubscription();
  const cancel = useCancelSubscription();
  const [location] = useLocation();
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") {
      toast.success("Subscription activated!", {
        description: "Your plan has been upgraded. It may take a moment to reflect.",
      });
      void refetch();
      window.history.replaceState({}, "", location);
    } else if (status === "canceled") {
      toast.info("Checkout canceled", {
        description: "No changes were made to your subscription.",
      });
      window.history.replaceState({}, "", location);
    }
  }, [location, refetch]);

  const handleUpgrade = async (plan: string) => {
    if (!billing?.shopifyConfigured) {
      toast.error("Shopify app not configured", {
        description:
          "Set SHOPIFY_API_KEY and SHOPIFY_API_SECRET to enable billing.",
      });
      return;
    }
    if (!billing.hasShopifyToken) {
      toast.error("Store not connected", {
        description:
          "Install the app from the Shopify App Store to enable billing.",
      });
      return;
    }
    try {
      await subscribe.mutateAsync(plan);
    } catch (err) {
      toast.error("Checkout failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) {
      setCancelConfirm(true);
      return;
    }
    try {
      await cancel.mutateAsync();
      toast.success("Subscription canceled", {
        description: "You've been downgraded to the Free plan.",
      });
      setCancelConfirm(false);
      void refetch();
    } catch (err) {
      toast.error("Cancellation failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
      setCancelConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Could not load billing information.
      </div>
    );
  }

  const statusInfo =
    STATUS_LABELS[billing.subscriptionStatus] ?? STATUS_LABELS["none"]!;
  const isPastDue = billing.subscriptionStatus === "past_due";
  const isOnPaidPlan = ["starter", "pro"].includes(billing.plan);
  const isActive = billing.isSubscriptionActive;
  const canUpgrade = billing.shopifyConfigured && billing.hasShopifyToken;

  const renewalDate = billing.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const usagePercent = billing.usage.percentage;
  const isNearLimit = usagePercent >= 80;
  const isAtLimit = usagePercent >= 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your plan and usage — billed securely through Shopify
        </p>
      </div>

      {isPastDue && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Your last payment failed. Please update your payment method in
            Shopify admin to avoid service interruption.
          </AlertDescription>
        </Alert>
      )}

      {isOnPaidPlan && !isActive && !isPastDue && (
        <Alert className="border-amber-400 bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Your <strong>{billing.planName}</strong> subscription is{" "}
            <strong>{billing.subscriptionStatus}</strong>. The widget is running
            under Free plan limits ({billing.usage.limit} msg/mo) until you
            renew.
          </AlertDescription>
        </Alert>
      )}

      {!billing.hasShopifyToken && (
        <Alert className="border-blue-400 bg-blue-50 dark:bg-blue-950/30">
          <Link2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <strong>Connect your Shopify store</strong> to enable paid plans.
            Install the app from the{" "}
            <a
              href="/dashboard/install"
              className="underline font-medium hover:no-underline"
            >
              install page
            </a>{" "}
            and billing will be handled directly through Shopify — no credit
            card form needed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Current Plan
              </CardTitle>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <CardDescription>
              {isOnPaidPlan
                ? `Your ${billing.planName} subscription — billed through Shopify`
                : "You are on the free plan"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{billing.planName}</span>
              <span className="text-muted-foreground text-sm">
                {PLAN_PRICES[billing.plan] ?? ""}
              </span>
            </div>

            {renewalDate && isActive && (
              <p className="text-sm text-muted-foreground">
                <CheckCircle2 className="inline h-4 w-4 text-green-500 mr-1" />
                Renews on {renewalDate}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {!isOnPaidPlan && (
                <Button
                  onClick={() => handleUpgrade("starter")}
                  disabled={subscribe.isPending || !canUpgrade}
                  data-testid="button-upgrade-starter"
                >
                  {subscribe.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight size={16} className="mr-2" />
                  )}
                  Upgrade to Starter
                </Button>
              )}

              {billing.plan === "starter" && isActive && (
                <Button
                  onClick={() => handleUpgrade("pro")}
                  disabled={subscribe.isPending || !canUpgrade}
                  data-testid="button-upgrade-pro"
                >
                  {subscribe.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap size={16} className="mr-2" />
                  )}
                  Upgrade to Pro
                </Button>
              )}

              {isOnPaidPlan && isActive && (
                <Button
                  variant={cancelConfirm ? "destructive" : "outline"}
                  onClick={() => void handleCancel()}
                  disabled={cancel.isPending}
                  data-testid="button-cancel-subscription"
                >
                  {cancel.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle size={16} className="mr-2" />
                  )}
                  {cancelConfirm ? "Confirm Cancel" : "Cancel Plan"}
                </Button>
              )}
              {cancelConfirm && (
                <Button
                  variant="ghost"
                  onClick={() => setCancelConfirm(false)}
                  className="text-muted-foreground"
                >
                  Keep Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} />
              Usage This Month
            </CardTitle>
            <CardDescription>
              AI messages used in the current billing period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Messages used</span>
              <span
                className={`font-medium ${isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-600" : ""}`}
              >
                {billing.usage.used.toLocaleString()} /{" "}
                {billing.usage.limit.toLocaleString()}
              </span>
            </div>
            <Progress
              value={usagePercent}
              className={`h-2 ${isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-amber-500" : ""}`}
              data-testid="usage-progress-bar"
            />
            <div className="text-xs text-muted-foreground">
              {isAtLimit ? (
                <span className="text-destructive font-medium">
                  Limit reached — upgrade to send more messages
                </span>
              ) : isNearLimit ? (
                <span className="text-amber-600">
                  {billing.usage.remaining.toLocaleString()} messages remaining
                  — consider upgrading
                </span>
              ) : (
                <span>
                  {billing.usage.remaining.toLocaleString()} messages remaining
                  this month
                </span>
              )}
            </div>

            {billing.plan === "free" && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleUpgrade("starter")}
                disabled={subscribe.isPending || !canUpgrade}
              >
                <ArrowUpRight size={14} className="mr-1" />
                Get 500 messages/month with Starter
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>
            All plans are billed through Shopify — no separate credit card
            needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              {
                name: "Free",
                price: "$0/mo",
                messages: "50 messages/mo",
                key: "free",
              },
              {
                name: "Starter",
                price: "$29/mo",
                messages: "500 messages/mo",
                key: "starter",
              },
              {
                name: "Pro",
                price: "$99/mo",
                messages: "5,000 messages/mo",
                key: "pro",
              },
            ].map((plan) => (
              <div
                key={plan.key}
                className={`rounded-lg border p-4 ${
                  billing.plan === plan.key
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="font-semibold mb-1">{plan.name}</div>
                <div className="text-muted-foreground text-xs mb-2">
                  {plan.price}
                </div>
                <div className="text-foreground font-medium">
                  {plan.messages}
                </div>
                {billing.plan === plan.key && (
                  <Badge className="mt-2" variant="secondary">
                    Current
                  </Badge>
                )}
                {billing.plan !== plan.key &&
                  ["starter", "pro"].includes(plan.key) && (
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      variant="outline"
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={
                        subscribe.isPending ||
                        !canUpgrade ||
                        billing.plan === "pro"
                      }
                      data-testid={`button-plan-${plan.key}`}
                    >
                      {billing.plan === "pro" && plan.key === "starter"
                        ? "Downgrade"
                        : "Upgrade"}
                    </Button>
                  )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
