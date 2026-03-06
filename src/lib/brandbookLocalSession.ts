import type { AssetPackFile, GeneratedAsset, UploadedAsset } from "@/lib/types";
import {
  clearGeneratedImages,
  isIndexedDBAvailable,
  loadAssetPack,
  loadBrandAssets,
  loadGeneratedImages,
  saveAssetPack,
  saveBrandAssets,
  saveGeneratedImage,
} from "@/lib/imageStorage";
import { slugify } from "@/lib/common";

const GENERATED_ASSETS_LS_PREFIX = "bb_generated_assets::";
const BRAND_ASSETS_LS_PREFIX = "bb_brand_assets::";
const ASSET_PACK_LS_PREFIX = "bb_asset_pack::";

export type BrandbookSessionAssets = {
  assetPackFiles: AssetPackFile[];
  generatedAssets: Record<string, GeneratedAsset>;
  uploadedBrandAssets: UploadedAsset[];
};

export function slugifyForStorage(name: string): string {
  return slugify(name);
}

export function loadCachedGeneratedAssets(slug: string): Record<string, GeneratedAsset> {
  if (typeof window === "undefined") return {};
  if (!slug) return {};
  try {
    const raw = localStorage.getItem(GENERATED_ASSETS_LS_PREFIX + slug);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, GeneratedAsset>;
  } catch {
    return {};
  }
}

export function clearCachedGeneratedAssets(slug: string): void {
  if (typeof window === "undefined") return;
  if (!slug) return;
  localStorage.removeItem(GENERATED_ASSETS_LS_PREFIX + slug);
}

export function loadCachedBrandAssets(slug: string): UploadedAsset[] {
  if (typeof window === "undefined") return [];
  if (!slug) return [];
  try {
    const raw = localStorage.getItem(BRAND_ASSETS_LS_PREFIX + slug);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as UploadedAsset[];
  } catch {
    return [];
  }
}

export function loadCachedAssetPack(slug: string): AssetPackFile[] {
  if (typeof window === "undefined") return [];
  if (!slug) return [];
  try {
    const raw = localStorage.getItem(ASSET_PACK_LS_PREFIX + slug);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AssetPackFile[];
  } catch {
    return [];
  }
}

export async function loadBrandbookSessionAssets(slug: string): Promise<BrandbookSessionAssets> {
  const [generatedFromDb, uploadedFromDb, packFromDb] = await Promise.all([
    loadGeneratedImages(slug).catch(() => ({})),
    loadBrandAssets(slug).catch(() => []),
    loadAssetPack(slug).catch(() => []),
  ]);

  return {
    generatedAssets:
      Object.keys(generatedFromDb).length > 0
        ? generatedFromDb
        : loadCachedGeneratedAssets(slug),
    uploadedBrandAssets:
      uploadedFromDb.length > 0 ? uploadedFromDb : loadCachedBrandAssets(slug),
    assetPackFiles: packFromDb.length > 0 ? packFromDb : loadCachedAssetPack(slug),
  };
}

export async function migrateLegacyLocalStorageToIndexedDB(): Promise<void> {
  if (typeof window === "undefined") return;
  const ok = await isIndexedDBAvailable();
  if (!ok) return;

  const slugs = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(GENERATED_ASSETS_LS_PREFIX)) slugs.add(key.slice(GENERATED_ASSETS_LS_PREFIX.length));
      else if (key.startsWith(BRAND_ASSETS_LS_PREFIX)) slugs.add(key.slice(BRAND_ASSETS_LS_PREFIX.length));
      else if (key.startsWith(ASSET_PACK_LS_PREFIX)) slugs.add(key.slice(ASSET_PACK_LS_PREFIX.length));
    }
  } catch {
    return;
  }

  for (const slug of slugs) {
    try {
      const generatedAssets = loadCachedGeneratedAssets(slug);
      for (const [key, asset] of Object.entries(generatedAssets)) {
        await saveGeneratedImage(slug, key, asset);
      }
      if (Object.keys(generatedAssets).length > 0) {
        localStorage.removeItem(GENERATED_ASSETS_LS_PREFIX + slug);
      }
    } catch {}

    try {
      const uploadedBrandAssets = loadCachedBrandAssets(slug);
      if (uploadedBrandAssets.length > 0) {
        await saveBrandAssets(slug, uploadedBrandAssets);
        localStorage.removeItem(BRAND_ASSETS_LS_PREFIX + slug);
      }
    } catch {}

    try {
      const assetPackFiles = loadCachedAssetPack(slug);
      if (assetPackFiles.length > 0) {
        await saveAssetPack(slug, assetPackFiles);
        localStorage.removeItem(ASSET_PACK_LS_PREFIX + slug);
      }
    } catch {}
  }
}

export async function clearBrandbookGeneratedAssetSession(slug: string): Promise<void> {
  clearCachedGeneratedAssets(slug);
  await clearGeneratedImages(slug).catch(() => {});
}
