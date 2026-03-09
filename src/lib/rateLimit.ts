import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import type { NextRequest } from "next/server"

type ValidPlan = "free" | "pro" | "team" | "agency" | "enterprise"
const VALID_PLANS: readonly ValidPlan[] = ["free", "pro", "team", "agency", "enterprise"]

// Graceful degradation: if Redis not configured, allow all requests
const isConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

function createRedis(): Redis | null {
  if (!isConfigured) return null
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

const redis = createRedis()

// Rate limiters per plan — only instantiated when Redis is available
const limiters = redis
  ? {
      free: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 d"),
        prefix: "rl:free",
      }),
      pro: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(25, "1 d"),
        prefix: "rl:pro",
      }),
      team: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 d"),
        prefix: "rl:team",
      }),
      agency: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10000, "1 d"),
        prefix: "rl:agency",
      }),
      enterprise: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100000, "1 d"),
        prefix: "rl:enterprise",
      }),
    }
  : null

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for a user. Returns success=true if allowed.
 * Falls back to allowing all requests if Redis is not configured.
 */
export async function checkRateLimit(
  userId: string,
  plan: string = "free"
): Promise<RateLimitResult> {
  if (!limiters) {
    return { success: true, limit: -1, remaining: -1, reset: 0 }
  }

  const planKey: ValidPlan = VALID_PLANS.includes(plan as ValidPlan)
    ? (plan as ValidPlan)
    : "free"

  const limiter = limiters[planKey]
  const result = await limiter.limit(userId)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

/** Get client IP from request headers */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}
