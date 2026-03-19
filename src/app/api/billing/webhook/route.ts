import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Stripe sends raw body, we need to read it as text
async function getRawBody(request: NextRequest): Promise<string> {
  const arrayBuffer = await request.arrayBuffer()
  return Buffer.from(arrayBuffer).toString("utf-8")
}

function planFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {}
  if (process.env.STRIPE_PRICE_PRO) priceMap[process.env.STRIPE_PRICE_PRO] = "pro"
  if (process.env.STRIPE_PRICE_TEAM) priceMap[process.env.STRIPE_PRICE_TEAM] = "team"
  if (process.env.STRIPE_PRICE_AGENCY) priceMap[process.env.STRIPE_PRICE_AGENCY] = "agency"
  return priceMap[priceId] || "free"
}

async function updateUserSubscription(userId: string, plan: string) {
  const validPlans = ["free", "pro", "team", "agency", "enterprise"]
  const tier = validPlans.includes(plan) ? plan : "free"

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: tier as "free" | "pro" | "team" | "agency" | "enterprise" },
  })

  console.log(`[webhook] Updated user ${userId} to plan: ${tier}`)
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan

  if (!userId || !plan) {
    console.warn("[webhook] checkout.session.completed missing metadata:", session.id)
    return
  }

  await updateUserSubscription(userId, plan)

  // Ensure stripeCustomerId is saved
  if (session.customer && typeof session.customer === "string") {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: session.customer },
    })
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.warn("[webhook] subscription.updated missing userId metadata:", subscription.id)
    return
  }

  const priceId = subscription.items.data[0]?.price?.id
  if (!priceId) {
    console.warn("[webhook] subscription.updated missing price:", subscription.id)
    return
  }

  const plan = subscription.metadata?.plan || planFromPriceId(priceId)
  await updateUserSubscription(userId, plan)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.warn("[webhook] subscription.deleted missing userId metadata:", subscription.id)
    return
  }

  await updateUserSubscription(userId, "free")
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await getRawBody(request)
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[webhook] Signature verification failed:", message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`[webhook] Error processing ${event.type}:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
