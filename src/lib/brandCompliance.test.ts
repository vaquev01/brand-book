import { describe, expect, it } from "vitest"
import { runComplianceCheck } from "./brandCompliance"
import type { BrandbookData } from "./types"

const completeBrandbook: BrandbookData = {
  brandName: "TestBrand",
  industry: "Technology",
  brandConcept: {
    purpose: "Empower creators",
    mission: "Make design accessible",
    vision: "A world where every brand shines",
    values: ["Innovation", "Quality", "Trust"],
    personality: ["Bold", "Innovative", "Reliable"],
    toneOfVoice: "Professional, friendly, confident",
  },
  logo: {
    primary: "https://example.com/logo.svg",
    secondary: "https://example.com/logo-dark.svg",
    symbol: "Geometric mark",
    clearSpace: "1x height",
    minimumSize: "24px",
    incorrectUsages: ["stretch", "recolor", "effects"],
  },
  colors: {
    primary: [
      { name: "Deep Blue", hex: "#1e3a5f", rgb: "30,58,95", cmyk: "68,39,0,63" },
      { name: "Violet", hex: "#6366f1", rgb: "99,102,241", cmyk: "59,58,0,5" },
    ],
    secondary: [
      { name: "Gray", hex: "#94a3b8", rgb: "148,163,184", cmyk: "20,11,0,28" },
    ],
  },
  typography: {
    primary: { name: "Inter", usage: "Headlines", weights: ["400", "700"] },
    secondary: { name: "Georgia", usage: "Body", weights: ["400"] },
  },
  keyVisual: {
    elements: ["Shapes", "Lines", "Gradients"],
    photographyStyle: "Minimal and clean",
  },
  applications: [
    { type: "Business Card", description: "Standard", imagePlaceholder: "url" },
  ],
}

describe("brandCompliance", () => {
  it("passes a complete brandbook with high score", () => {
    const report = runComplianceCheck(completeBrandbook)
    expect(report.score).toBeGreaterThanOrEqual(80)
    expect(report.failed).toBe(0)
  })

  it("flags missing primary colors", () => {
    const broken = { ...completeBrandbook, colors: { primary: [], secondary: [] } }
    const report = runComplianceCheck(broken)
    expect(report.issues.some(i => i.ruleId === "colors.primary-defined")).toBe(true)
  })

  it("flags missing primary font", () => {
    const broken = { ...completeBrandbook, typography: {} }
    const report = runComplianceCheck(broken)
    expect(report.issues.some(i => i.ruleId === "typography.primary-defined")).toBe(true)
  })

  it("flags missing logo", () => {
    const broken = { ...completeBrandbook, logo: { ...completeBrandbook.logo, primary: "" } }
    const report = runComplianceCheck(broken)
    expect(report.issues.some(i => i.ruleId === "logo.primary-defined")).toBe(true)
  })

  it("detects low-contrast primary colors", () => {
    const light = {
      ...completeBrandbook,
      colors: {
        ...completeBrandbook.colors,
        primary: [{ name: "White", hex: "#ffffff", rgb: "255,255,255", cmyk: "0,0,0,0" }],
      },
    }
    const report = runComplianceCheck(light)
    expect(report.issues.some(i => i.ruleId === "colors.contrast-ratio")).toBe(true)
  })
})
