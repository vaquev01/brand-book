import { describe, expect, it } from "vitest";
import { saasExample } from "@/lib/examples";
import type { GeneratedAsset } from "@/lib/types";
import { buildSectionDefs, CATEGORIES } from "./brandbookViewerSections";

const imgGen = {
  downloadImage: () => {},
  generate: () => Promise.resolve(),
  generateAllApplications: () => Promise.resolve(),
  generateApplication: () => Promise.resolve(),
  uploadForKey: () => Promise.resolve(),
  duplicateAsset: () => {},
  loadingKey: null,
  saveGeneratedToAssets: () => Promise.resolve(),
};

describe("brandbookViewerSections", () => {
  it("exports the expected category order", () => {
    expect(CATEGORIES).toEqual([
      "Estratégia",
      "Linguagem & Tipografia",
      "Identidade Visual",
      "Sistema Visual",
      "Aplicações",
      "Assets",
      "Para Devs & Designers",
    ]);
  });

  it("builds core sections for a full brandbook fixture", () => {
    const sections = buildSectionDefs({
      assetPack: { files: [] },
      assetPackGenerating: false,
      data: saasExample,
      generatedAssets: {} as Record<string, GeneratedAsset>,
      generatedImages: {},
      hasGeneration: true,
      imgGen,
      isAdvanced: true,
      uploadedAssets: [],
    });

    expect(sections.map((section) => section.id)).toEqual(
      expect.arrayContaining([
        "dna",
        "brand-story",
        "positioning",
        "personas",
        "logo",
        "colors",
        "typography",
        "key-visual",
        "applications",
        "asset-pack",
      ])
    );

    expect(sections.find((section) => section.id === "asset-pack")?.when).toBe(true);
    expect(sections.find((section) => section.id === "brand-assets")?.when).toBe(false);
  });
});
