import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
    _stripe = new Stripe(key)
  }
  return _stripe
}

export const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
  agency: process.env.STRIPE_PRICE_AGENCY,
}

export type BillablePlan = "pro" | "team" | "agency"

export function isValidBillablePlan(plan: string): plan is BillablePlan {
  return plan === "pro" || plan === "team" || plan === "agency"
}
