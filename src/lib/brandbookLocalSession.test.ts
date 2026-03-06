import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/imageStorage", () => ({
  clearGeneratedImages: vi.fn().mockResolvedValue(undefined),
  isIndexedDBAvailable: vi.fn().mockResolvedValue(false),
  loadAssetPack: vi.fn().mockResolvedValue([]),
  loadBrandAssets: vi.fn().mockResolvedValue([]),
  loadGeneratedImages: vi.fn().mockResolvedValue({}),
  saveAssetPack: vi.fn().mockResolvedValue(undefined),
  saveBrandAssets: vi.fn().mockResolvedValue(undefined),
  saveGeneratedImage: vi.fn().mockResolvedValue(undefined),
}));

import {
  loadBrandbookSessionAssets,
  loadCachedAssetPack,
  loadCachedBrandAssets,
  loadCachedGeneratedAssets,
  slugifyForStorage,
} from "./brandbookLocalSession";

describe("brandbookLocalSession", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("slugifies brand names for storage keys", () => {
    expect(slugifyForStorage("Caraca! Bar Premium")).toBe("caraca-bar-premium");
  });

  it("loads cached session assets from localStorage fallbacks", async () => {
    const store = new Map<string, string>([
      [
        "bb_generated_assets::brand",
        JSON.stringify({ logo_primary: { key: "logo_primary", url: "data:image/png;base64,abc" } }),
      ],
      [
        "bb_brand_assets::brand",
        JSON.stringify([{ id: "asset_1", name: "Logo", type: "logo", dataUrl: "data:image/png;base64,abc" }]),
      ],
      [
        "bb_asset_pack::brand",
        JSON.stringify([{ path: "tokens/colors.json", content: "{}" }]),
      ],
    ]);

    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    });

    expect(loadCachedGeneratedAssets("brand")).toEqual({
      logo_primary: { key: "logo_primary", url: "data:image/png;base64,abc" },
    });
    expect(loadCachedBrandAssets("brand")).toEqual([
      { id: "asset_1", name: "Logo", type: "logo", dataUrl: "data:image/png;base64,abc" },
    ]);
    expect(loadCachedAssetPack("brand")).toEqual([{ path: "tokens/colors.json", content: "{}" }]);

    await expect(loadBrandbookSessionAssets("brand")).resolves.toEqual({
      assetPackFiles: [{ path: "tokens/colors.json", content: "{}" }],
      generatedAssets: { logo_primary: { key: "logo_primary", url: "data:image/png;base64,abc" } },
      uploadedBrandAssets: [
        { id: "asset_1", name: "Logo", type: "logo", dataUrl: "data:image/png;base64,abc" },
      ],
    });
  });
});
