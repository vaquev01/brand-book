import { describe, expect, it } from "vitest";
import { saasExample } from "@/lib/examples";
import type { GeneratedAsset } from "@/lib/types";
import { buildSectionDefs, CATEGORIES } from "./brandbookViewerSections";

const imgGen = {
  downloadImage: () => {},
  generate: () => Promise.resolve(),
  generateAllApplications: () => Promise.resolve(),
  generateApplication: () => Promise.resolve(),
  loadingKey: null,
  saveGeneratedToAssets: () => Promise.resolve(),
};

describe("brandbookViewerSections", () => {
  it("exports the expected category order", () => {
    expect(CATEGORIES).toEqual([
      "Essência da Marca",
      "Público-Alvo",
      "Identidade Verbal",
      "Identidade Visual",
      "Paleta de Cores",
      "Tipografia",
      "Sistema Visual",
      "Padrões Gráficos",
      "Design System",
      "Aplicações da Marca",
      "Diretrizes de Uso",
    ]);
  });

  it("builds core sections for a full brandbook fixture", () => {
    const sections = buildSectionDefs({
      assetPackFiles: [],
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
