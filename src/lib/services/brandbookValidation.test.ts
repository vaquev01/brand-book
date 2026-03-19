import { describe, expect, it } from "vitest"
import { validateLooseBrandbook, tryValidateLooseBrandbook, BrandbookValidationError } from "@/lib/brandbookValidation"

describe("brandbookValidation", () => {
  const validBrandbook = {
    brandName: "TestBrand",
    industry: "Technology",
    brandConcept: {
      purpose: "Test purpose",
      mission: "Test mission",
      vision: "Test vision",
      values: ["Innovation", "Quality", "Trust"],
      personality: ["Bold", "Innovative", "Reliable"],
      toneOfVoice: "Professional and friendly",
    },
    logo: {
      primary: "https://example.com/logo.svg",
      secondary: "https://example.com/logo-dark.svg",
      symbol: "Abstract geometric mark",
      clearSpace: "Minimum 1x height of symbol",
      minimumSize: "24px digital, 10mm print",
      incorrectUsages: ["Do not stretch", "Do not recolor", "Do not add effects"],
    },
    colors: {
      primary: [
        { name: "Deep Blue", hex: "#1e3a5f", rgb: "30, 58, 95", cmyk: "68, 39, 0, 63" },
        { name: "Electric Violet", hex: "#6366f1", rgb: "99, 102, 241", cmyk: "59, 58, 0, 5" },
      ],
      secondary: [
        { name: "Soft Gray", hex: "#94a3b8", rgb: "148, 163, 184", cmyk: "20, 11, 0, 28" },
      ],
    },
    typography: {
      primary: { name: "Inter", usage: "Headlines and UI", weights: ["400", "600", "700"] },
    },
    keyVisual: {
      elements: ["Geometric shapes", "Gradient overlays", "Clean lines"],
      photographyStyle: "Clean, modern, minimal",
    },
    applications: [
      { type: "Business Card", description: "Standard 90x50mm", imagePlaceholder: "https://placehold.co/900x500" },
    ],
  }

  it("validates a valid brandbook", () => {
    const result = validateLooseBrandbook(validBrandbook)
    expect(result.brandName).toBe("TestBrand")
  })

  it("throws on null input", () => {
    expect(() => validateLooseBrandbook(null)).toThrow(BrandbookValidationError)
  })

  it("throws on missing required fields", () => {
    expect(() => validateLooseBrandbook({ brandName: "Test" })).toThrow(BrandbookValidationError)
  })

  it("tryValidate returns ok:true for valid data", () => {
    const result = tryValidateLooseBrandbook(validBrandbook)
    expect(result.ok).toBe(true)
  })

  it("tryValidate returns ok:false for invalid data", () => {
    const result = tryValidateLooseBrandbook({ brandName: "Test" })
    expect(result.ok).toBe(false)
  })
})
