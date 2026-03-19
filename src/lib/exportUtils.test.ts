import { describe, expect, it } from "vitest"
import { exportCSSTokens, exportW3CTokens, exportTailwindConfig } from "./exportUtils"
import type { BrandbookData } from "./types"

const brandbook: BrandbookData = {
  brandName: "TestBrand",
  industry: "Technology",
  brandConcept: {
    purpose: "Empower creators",
    mission: "Make design accessible",
    vision: "A world where every brand shines",
    values: ["Innovation", "Quality"],
    personality: ["Bold", "Innovative"],
    toneOfVoice: "Professional",
  },
  logo: {
    primary: "url",
    secondary: "url",
    symbol: "Mark",
    clearSpace: "1x",
    minimumSize: "24px",
    incorrectUsages: ["stretch"],
  },
  colors: {
    primary: [
      { name: "Deep Blue", hex: "#1e3a5f", rgb: "30,58,95", cmyk: "68,39,0,63" },
    ],
    secondary: [
      { name: "Gray", hex: "#94a3b8", rgb: "148,163,184", cmyk: "20,11,0,28" },
    ],
  },
  typography: {
    primary: { name: "Inter", usage: "Headlines", weights: ["400", "700"] },
    secondary: { name: "Georgia", usage: "Body", weights: ["400"] },
  },
  typographyScale: [
    { name: "Body", fontRole: "primary", size: "16px", lineHeight: "1.6", fontWeight: "400", usage: "Body text" },
  ],
  keyVisual: {
    elements: ["Shapes"],
    photographyStyle: "Minimal",
  },
  applications: [],
}

describe("exportCSSTokens", () => {
  it("produces a string containing :root with custom properties", () => {
    const css = exportCSSTokens(brandbook)
    expect(css).toContain(":root {")
    expect(css).toContain("--testbrand-color-primary-1: #1e3a5f;")
    expect(css).toContain("--testbrand-color-secondary-1: #94a3b8;")
  })

  it("includes typography font family variables", () => {
    const css = exportCSSTokens(brandbook)
    expect(css).toContain("--testbrand-font-primary:")
    expect(css).toContain("'Inter'")
  })

  it("includes typography scale variables", () => {
    const css = exportCSSTokens(brandbook)
    expect(css).toContain("--testbrand-text-body-size: 16px;")
    expect(css).toContain("--testbrand-text-body-line-height: 1.6;")
    expect(css).toContain("--testbrand-text-body-weight: 400;")
  })
})

describe("exportW3CTokens", () => {
  it("returns valid JSON with color and typography groups", () => {
    const raw = exportW3CTokens(brandbook)
    const tokens = JSON.parse(raw)
    expect(tokens).toHaveProperty("color")
    expect(tokens).toHaveProperty("typography")
    expect(tokens.color.primary["1"].$value).toBe("#1e3a5f")
    expect(tokens.color.primary["1"].$type).toBe("color")
    expect(tokens.color.secondary["1"].$value).toBe("#94a3b8")
  })

  it("includes typography family tokens", () => {
    const tokens = JSON.parse(exportW3CTokens(brandbook))
    expect(tokens.typography.family.primary.$type).toBe("fontFamily")
    expect(tokens.typography.family.primary.$value).toContain("Inter")
  })

  it("includes typography scale tokens", () => {
    const tokens = JSON.parse(exportW3CTokens(brandbook))
    expect(tokens.typography.scale.body).toBeDefined()
    expect(tokens.typography.scale.body.fontSize.$value).toBe("16px")
  })
})

describe("exportTailwindConfig", () => {
  it("contains theme.extend with brand colors", () => {
    const tw = exportTailwindConfig(brandbook)
    expect(tw).toContain("theme:")
    expect(tw).toContain("extend:")
    expect(tw).toContain("colors:")
    expect(tw).toContain('"primary-1": "#1e3a5f"')
    expect(tw).toContain('"secondary-1": "#94a3b8"')
  })

  it("contains fontFamily section", () => {
    const tw = exportTailwindConfig(brandbook)
    expect(tw).toContain("fontFamily:")
    expect(tw).toContain("'Inter'")
  })

  it("is valid JS module structure", () => {
    const tw = exportTailwindConfig(brandbook)
    expect(tw).toContain("module.exports = {")
    expect(tw).toContain("};")
  })
})
