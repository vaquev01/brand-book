import type { GeneratedAsset, UploadedAsset } from "@/lib/types";

export type AssetLookup = (key: string) => string | null;

export type AvailableAsset = {
  label: string;
  url: string;
};

export type AssetCatalogItem = {
  key: string;
  label: string;
};

export function createAssetLookup(
  generatedAssets: Record<string, GeneratedAsset>,
  generatedImages: Record<string, string>
): AssetLookup {
  return (key: string): string | null => generatedAssets[key]?.url ?? generatedImages[key] ?? null;
}

export function resolveImmersiveAssets({
  generatedAssets,
  generatedImages,
  uploadedAssets,
}: {
  generatedAssets: Record<string, GeneratedAsset>;
  generatedImages: Record<string, string>;
  uploadedAssets: UploadedAsset[];
}) {
  const getAssetUrl = createAssetLookup(generatedAssets, generatedImages);
  const firstUploaded = (types: UploadedAsset["type"][]) =>
    uploadedAssets.find((asset) => types.includes(asset.type))?.dataUrl ?? null;

  const patternUrl =
    getAssetUrl("brand_pattern") ??
    getAssetUrl("pattern_0") ??
    firstUploaded(["pattern"]);

  const atmosphereUrl =
    getAssetUrl("presentation_bg") ??
    getAssetUrl("hero_visual") ??
    null;

  const watermarkUrl =
    getAssetUrl("brand_mascot") ??
    getAssetUrl("mascot_0") ??
    firstUploaded(["mascot", "element"]);

  return { patternUrl, atmosphereUrl, watermarkUrl };
}

export function pickMappedAssetUrl(
  id: string,
  assetMap: Record<string, string[]>,
  getAssetUrl: AssetLookup
): string | null {
  const keys = assetMap[id];
  if (!keys) return null;

  for (const key of keys) {
    const url = getAssetUrl(key);
    if (url) return url;
  }

  return null;
}

export function pickSectionHeroUrl(
  sectionId: string,
  assetMap: Record<string, string[]>,
  getAssetUrl: AssetLookup,
  usedUrls: Set<string>,
  dedup = true
): string | null {
  const keys = assetMap[sectionId];
  if (!keys) return null;

  for (const key of keys) {
    const url = getAssetUrl(key);
    if (url) {
      if (dedup && usedUrls.has(url)) continue;
      usedUrls.add(url);
      return url;
    }
  }

  for (const key of keys) {
    const url = getAssetUrl(key);
    if (url) return url;
  }

  return null;
}

export function buildAvailableAssets(
  assetCatalog: readonly AssetCatalogItem[],
  getAssetUrl: AssetLookup
): AvailableAsset[] {
  const result: AvailableAsset[] = [];

  for (const asset of assetCatalog) {
    const url = getAssetUrl(asset.key);
    if (url) result.push({ url, label: asset.label });
  }

  return result;
}

export function chunkAvailableAssets(
  assets: AvailableAsset[],
  n: number
): AvailableAsset[][] {
  if (assets.length < 2) return [];

  const chunks: AvailableAsset[][] = [];
  const size = Math.max(2, Math.ceil(assets.length / n));

  for (let i = 0; i < assets.length; i += size) {
    chunks.push(assets.slice(i, i + size));
  }

  return chunks;
}
