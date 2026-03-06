import { describe, expect, it } from "vitest";
import type { GeneratedAsset, UploadedAsset } from "@/lib/types";
import {
  buildAvailableAssets,
  chunkAvailableAssets,
  createAssetLookup,
  pickMappedAssetUrl,
  pickSectionHeroUrl,
  resolveImmersiveAssets,
} from "./brandbookViewerAssetSelectors";

const generatedAsset = (key: string, url: string): GeneratedAsset => ({
  key,
  url,
  provider: "dalle3",
  prompt: "prompt",
  generatedAt: "2026-03-06T00:00:00.000Z",
});

describe("brandbookViewerAssetSelectors", () => {
  it("prefers generated assets over legacy generated images", () => {
    const getAssetUrl = createAssetLookup(
      { hero_visual: generatedAsset("hero_visual", "https://generated") },
      { hero_visual: "https://legacy" }
    );

    expect(getAssetUrl("hero_visual")).toBe("https://generated");
  });

  it("resolves immersive assets with uploaded fallbacks", () => {
    const uploadedAssets: UploadedAsset[] = [
      { id: "1", name: "Pattern", type: "pattern", dataUrl: "data:pattern" },
      { id: "2", name: "Mascot", type: "mascot", dataUrl: "data:mascot" },
    ];

    expect(
      resolveImmersiveAssets({
        generatedAssets: {},
        generatedImages: { hero_visual: "https://hero" },
        uploadedAssets,
      })
    ).toEqual({
      patternUrl: "data:pattern",
      atmosphereUrl: "https://hero",
      watermarkUrl: "data:mascot",
    });
  });

  it("picks mapped assets in order", () => {
    const getAssetUrl = createAssetLookup({}, { a: "https://a", b: "https://b" });

    expect(pickMappedAssetUrl("section", { section: ["missing", "b", "a"] }, getAssetUrl)).toBe("https://b");
  });

  it("deduplicates hero urls but falls back to reuse when necessary", () => {
    const getAssetUrl = createAssetLookup({}, { hero1: "https://same", hero2: "https://same" });
    const usedUrls = new Set<string>();
    const assetMap = { section: ["hero1", "hero2"] };

    expect(pickSectionHeroUrl("section", assetMap, getAssetUrl, usedUrls)).toBe("https://same");
    expect(pickSectionHeroUrl("section", assetMap, getAssetUrl, usedUrls)).toBe("https://same");
  });

  it("builds and chunks available assets", () => {
    const getAssetUrl = createAssetLookup({}, {
      hero_visual: "https://hero",
      brand_pattern: "https://pattern",
      brand_mascot: "https://mascot",
    });

    const assets = buildAvailableAssets(
      [
        { key: "hero_visual", label: "Hero" },
        { key: "brand_pattern", label: "Pattern" },
        { key: "brand_mascot", label: "Mascot" },
      ],
      getAssetUrl
    );

    expect(assets).toEqual([
      { label: "Hero", url: "https://hero" },
      { label: "Pattern", url: "https://pattern" },
      { label: "Mascot", url: "https://mascot" },
    ]);
    expect(chunkAvailableAssets(assets, 2)).toEqual([
      [
        { label: "Hero", url: "https://hero" },
        { label: "Pattern", url: "https://pattern" },
      ],
      [
        { label: "Mascot", url: "https://mascot" },
      ],
    ]);
  });
});
