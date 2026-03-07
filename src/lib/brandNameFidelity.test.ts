import { describe, expect, it } from "vitest";
import { buildBrandNameFidelityLines, getBrandNameFidelity } from "./brandNameFidelity";

describe("brandNameFidelity", () => {
  it("derives prohibited variants for punctuated canonical brand names", () => {
    const fidelity = getBrandNameFidelity("Caraca! Bar");

    expect(fidelity.structuralCharacters).toContain("!");
    expect(fidelity.prohibitedVariants).toContain("Caraca Bar");
    expect(fidelity.prohibitedVariants).toContain("Caraça Bar");
  });

  it("builds explicit naming-fidelity instructions", () => {
    const block = buildBrandNameFidelityLines("Caraca! Bar", [], "logo").join(" ");

    expect(block).toContain("CANONICAL_BRAND_NAME: Caraca! Bar.");
    expect(block).toContain('EXACT_BRAND_TEXT: The wordmark must render exactly "Caraca! Bar"');
    expect(block).toContain("STRUCTURAL_CHARACTERS: !");
    expect(block).toContain('"Caraca Bar"');
  });
});
