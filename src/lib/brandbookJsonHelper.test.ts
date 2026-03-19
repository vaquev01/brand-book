import { describe, expect, it } from "vitest"
import { parseBrandbookJson, safeHex } from "./brandbookJsonHelper"

describe("brandbookJsonHelper", () => {
  it("parses valid brandbook JSON", () => {
    const result = parseBrandbookJson({
      brandName: "Test",
      brandConcept: { purpose: "x" },
      colors: { primary: [] },
    })
    expect(result).not.toBeNull()
    expect(result?.brandName).toBe("Test")
  })

  it("returns null for invalid data", () => {
    expect(parseBrandbookJson(null)).toBeNull()
    expect(parseBrandbookJson({})).toBeNull()
    expect(parseBrandbookJson("string")).toBeNull()
    expect(parseBrandbookJson({ brandName: "Test" })).toBeNull()
  })

  it("sanitizes hex colors", () => {
    expect(safeHex("#ff0000")).toBe("#ff0000")
    expect(safeHex("#FFF")).toBe("#FFF")
    expect(safeHex("not-a-color")).toBe("#ccc")
    expect(safeHex(null)).toBe("#ccc")
    expect(safeHex(42)).toBe("#ccc")
    // After stripping non-hex chars, '#ff0000";alert(1)//' becomes '#ff0000ae1' (9 hex digits)
    // which exceeds the 3-8 digit limit, so it falls back to #ccc
    expect(safeHex('#ff0000";alert(1)//')).toBe("#ccc")
  })
})
