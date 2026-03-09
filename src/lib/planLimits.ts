export type Plan = "free" | "pro" | "team" | "agency" | "enterprise"

export interface PlanLimits {
  maxProjects: number
  maxGenerationsPerDay: number
  maxImagesPerProject: number
  exportPdf: boolean
  pdfWatermark: boolean
  exportTokens: boolean
  exportZip: boolean
  collaboration: boolean
  customDomain: boolean
  apiAccess: boolean
  whiteLabel: boolean
  analytics: boolean
  webhooks: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxGenerationsPerDay: 3,
    maxImagesPerProject: 5,
    exportPdf: true,
    pdfWatermark: true,
    exportTokens: false,
    exportZip: false,
    collaboration: false,
    customDomain: false,
    apiAccess: false,
    whiteLabel: false,
    analytics: false,
    webhooks: false,
  },
  pro: {
    maxProjects: 5,
    maxGenerationsPerDay: 25,
    maxImagesPerProject: 50,
    exportPdf: true,
    pdfWatermark: false,
    exportTokens: true,
    exportZip: true,
    collaboration: false,
    customDomain: false,
    apiAccess: false,
    whiteLabel: false,
    analytics: true,
    webhooks: false,
  },
  team: {
    maxProjects: 20,
    maxGenerationsPerDay: 100,
    maxImagesPerProject: 200,
    exportPdf: true,
    pdfWatermark: false,
    exportTokens: true,
    exportZip: true,
    collaboration: true,
    customDomain: true,
    apiAccess: false,
    whiteLabel: false,
    analytics: true,
    webhooks: true,
  },
  agency: {
    maxProjects: -1, // unlimited
    maxGenerationsPerDay: -1,
    maxImagesPerProject: -1,
    exportPdf: true,
    pdfWatermark: false,
    exportTokens: true,
    exportZip: true,
    collaboration: true,
    customDomain: true,
    apiAccess: true,
    whiteLabel: true,
    analytics: true,
    webhooks: true,
  },
  enterprise: {
    maxProjects: -1,
    maxGenerationsPerDay: -1,
    maxImagesPerProject: -1,
    exportPdf: true,
    pdfWatermark: false,
    exportTokens: true,
    exportZip: true,
    collaboration: true,
    customDomain: true,
    apiAccess: true,
    whiteLabel: true,
    analytics: true,
    webhooks: true,
  },
}

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free
}

export function canUseFeature(plan: string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan)
  const value = limits[feature]
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === -1 || value > 0
  return false
}

export function isUnlimited(
  plan: string,
  limitKey: "maxProjects" | "maxGenerationsPerDay" | "maxImagesPerProject"
): boolean {
  return getPlanLimits(plan)[limitKey] === -1
}
