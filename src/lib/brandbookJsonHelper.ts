import type { BrandbookData } from "./types"

/**
 * Safely extract BrandbookData from a Prisma JsonValue field.
 * Returns null if the data is not a valid brandbook object.
 */
export function parseBrandbookJson(json: unknown): BrandbookData | null {
  if (!json || typeof json !== "object") return null
  const obj = json as Record<string, unknown>
  if (!obj.brandName || !obj.brandConcept || !obj.colors) return null
  return json as BrandbookData
}

/**
 * Extract a safe hex color from unknown brandbook JSON.
 */
export function safeHex(value: unknown): string {
  if (typeof value !== "string") return "#ccc"
  const clean = value.replace(/[^#a-fA-F0-9]/g, "")
  return /^#[a-fA-F0-9]{3,8}$/.test(clean) ? clean : "#ccc"
}
