import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) return null;
  _stripe = new Stripe(key, { apiVersion: "2025-03-31.basil" });
  return _stripe;
}

export const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env["STRIPE_STARTER_PRICE_ID"],
  pro: process.env["STRIPE_PRO_PRICE_ID"],
};

export const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  starter: 500,
  pro: 5000,
};

export const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export const PLAN_PRICES: Record<string, string> = {
  free: "$0/mo",
  starter: "$29/mo",
  pro: "$99/mo",
};

export function isStripeConfigured(): boolean {
  return !!process.env["STRIPE_SECRET_KEY"];
}
