import { describe, expect, it } from "vitest"
import { buildPatternRecipe, buildPatternCollection } from "./patternEngine"
import type { BrandbookData } from "./types"

const minimalBrandbook: BrandbookData = {
  brandName: "TestBrand",
  industry: "Technology",
  brandConcept: {
    purpose: "Test",
    mission: "Test",
    vision: "Test",
    values: ["Innovation", "Quality", "Trust"],
    personality: ["Bold", "Innovative", "Reliable"],
    toneOfVoice: "Professional",
  },
  logo: {
    primary: "url",
    secondary: "url",
    symbol: "Geometric mark",
    clearSpace: "1x",
    minimumSize: "24px",
    incorrectUsages: ["stretch", "recolor", "effects"],
  },
  colors: {
    primary: [{ name: "Blue", hex: "#1e3a5f", rgb: "30,58,95", cmyk: "68,39,0,63" }],
    secondary: [{ name: "Gray", hex: "#94a3b8", rgb: "148,163,184", cmyk: "20,11,0,28" }],
  },
  typography: { primary: { name: "Inter", usage: "All", weights: ["400", "700"] } },
  keyVisual: {
    elements: ["Shapes", "Lines", "Gradients"],
    photographyStyle: "Minimal",
    symbols: ["Circle", "Triangle"],
    flora: ["Fern", "Moss"],
  },
  applications: [{ type: "Card", description: "Test", imagePlaceholder: "url" }],
}

describe("patternEngine", () => {
  it("builds a pattern recipe with prompt and negative prompt", () => {
    const recipe = buildPatternRecipe(minimalBrandbook)
    expect(recipe.prompt).toContain("TestBrand")
    expect(recipe.negativePrompt).toContain("text")
    expect(recipe.variant).toBe("mixed")
    expect(recipe.density).toBe("balanced")
    expect(recipe.mood).toBe("light")
  })

  it("builds a collection of 6 pattern variations", () => {
    const collection = buildPatternCollection(minimalBrandbook)
    expect(collection).toHaveLength(6)
    const variants = collection.map((r) => r.variant)
    expect(variants).toContain("organic")
    expect(variants).toContain("geometric")
    expect(variants).toContain("textural")
  })

  it("incorporates flora/symbols in motif vocabulary", () => {
    const recipe = buildPatternRecipe(minimalBrandbook, "organic", "dense", "dark")
    expect(recipe.prompt).toContain("Fern")
    expect(recipe.prompt).toContain("Circle")
    expect(recipe.mood).toBe("dark")
  })
})
