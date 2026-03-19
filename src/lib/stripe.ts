import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
  agency: process.env.STRIPE_PRICE_AGENCY,
}

export type BillablePlan = "pro" | "team" | "agency"

export function isValidBillablePlan(plan: string): plan is BillablePlan {
  return plan === "pro" || plan === "team" || plan === "agency"
}
