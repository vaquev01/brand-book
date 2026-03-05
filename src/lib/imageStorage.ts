import { type GeneratedAsset, type BrandbookData, type UploadedAsset, type AssetPackFile } from "./types";

const DB_NAME = "brandbook-builder";
const DB_VERSION = 2;
const STORE_IMAGES = "generated-images";
const STORE_BRANDBOOKS = "brandbooks";
const STORE_BRAND_ASSETS = "brand-assets";
const STORE_ASSET_PACK = "asset-pack";

const LS_ACTIVE_SLUG = "bb_active";
const LS_DATA_PREFIX = "bb_data::";

// ─── IndexedDB open ────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB not available (SSR)"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES);
      }
      if (!db.objectStoreNames.contains(STORE_BRANDBOOKS)) {
        db.createObjectStore(STORE_BRANDBOOKS);
      }
      if (!db.objectStoreNames.contains(STORE_BRAND_ASSETS)) {
        db.createObjectStore(STORE_BRAND_ASSETS);
      }
      if (!db.objectStoreNames.contains(STORE_ASSET_PACK)) {
        db.createObjectStore(STORE_ASSET_PACK);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

export async function isIndexedDBAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    await openDB();
    return true;
  } catch {
    return false;
  }
}

async function withDB<T>(fn: (db: IDBDatabase) => Promise<T>): Promise<T> {
  const db = await openDB();
  return fn(db);
}

function idbGet<T>(store: IDBObjectStore, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(store: IDBObjectStore, value: unknown, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(store: IDBObjectStore, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbGetAllKeys(store: IDBObjectStore): Promise<IDBValidKey[]> {
  return new Promise((resolve, reject) => {
    const req = store.getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Active slug (localStorage) ────────────────────────────────────────────

export function getActiveSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LS_ACTIVE_SLUG);
  } catch {
    return null;
  }
}

export function setActiveSlug(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_ACTIVE_SLUG, slug);
  } catch {
    // localStorage full/unavailable — ignore
  }
}

// ─── Brandbook data (localStorage — small JSON) ────────────────────────────

export function saveBrandbookData(slug: string, data: BrandbookData): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    localStorage.setItem(LS_DATA_PREFIX + slug, JSON.stringify(data));
  } catch {
    // localStorage full — silently ignore (images still saved in IndexedDB)
  }
}

export function loadBrandbookData(slug: string): BrandbookData | null {
  if (typeof window === "undefined" || !slug) return null;
  try {
    const raw = localStorage.getItem(LS_DATA_PREFIX + slug);
    if (!raw) return null;
    return JSON.parse(raw) as BrandbookData;
  } catch {
    return null;
  }
}

export function deleteBrandbookData(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  localStorage.removeItem(LS_DATA_PREFIX + slug);
}

// ─── Generated images (IndexedDB) ─────────────────────────────────────────

export async function saveGeneratedImage(slug: string, key: string, asset: GeneratedAsset): Promise<void> {
  try {
    await withDB(async (db) => {
      const tx = db.transaction(STORE_IMAGES, "readwrite");
      await idbPut(tx.objectStore(STORE_IMAGES), asset, `${slug}::${key}`);
    });
  } catch {
    // IndexedDB unavailable (private browsing / permissions) — silent
  }
}

export async function loadGeneratedImages(slug: string): Promise<Record<string, GeneratedAsset>> {
  try {
    return await withDB(async (db) => {
      const tx = db.transaction(STORE_IMAGES, "readonly");
      const store = tx.objectStore(STORE_IMAGES);
      const prefix = `${slug}::`;
      const allKeys = await idbGetAllKeys(store);
      const slugKeys = allKeys.filter((k) => typeof k === "string" && (k as string).startsWith(prefix));
      const result: Record<string, GeneratedAsset> = {};
      for (const k of slugKeys) {
        const asset = await idbGet<GeneratedAsset>(store, k);
        if (asset) {
          const assetKey = (k as string).slice(prefix.length);
          result[assetKey] = asset;
        }
      }
      return result;
    });
  } catch {
    return {};
  }
}

export async function deleteGeneratedImage(slug: string, key: string): Promise<void> {
  try {
    await withDB(async (db) => {
      const tx = db.transaction(STORE_IMAGES, "readwrite");
      await idbDelete(tx.objectStore(STORE_IMAGES), `${slug}::${key}`);
    });
  } catch {
    // silent
  }
}

export async function clearGeneratedImages(slug: string): Promise<void> {
  try {
    await withDB(async (db) => {
      const tx = db.transaction(STORE_IMAGES, "readwrite");
      const store = tx.objectStore(STORE_IMAGES);
      const prefix = `${slug}::`;
      const allKeys = await idbGetAllKeys(store);
      const slugKeys = allKeys.filter((k) => typeof k === "string" && (k as string).startsWith(prefix));
      for (const k of slugKeys) {
        await idbDelete(store, k);
      }
    });
  } catch {
    // silent
  }
}

// ─── Uploaded brand assets (IndexedDB) ─────────────────────────────────────

export async function saveBrandAssets(slug: string, assets: UploadedAsset[]): Promise<void> {
  try {
    await withDB(async (db) => {
      const tx = db.transaction(STORE_BRAND_ASSETS, "readwrite");
      await idbPut(tx.objectStore(STORE_BRAND_ASSETS), assets, slug);
    });
  } catch {
    // silent
  }
}

export async function loadBrandAssets(slug: string): Promise<UploadedAsset[]> {
  try {
    return await withDB(async (db) => {
      const tx = db.transaction(STORE_BRAND_ASSETS, "readonly");
      const result = await idbGet<UploadedAsset[]>(tx.objectStore(STORE_BRAND_ASSETS), slug);
      return Array.isArray(result) ? result : [];
    });
  } catch {
    return [];
  }
}

// ─── Asset pack (IndexedDB) ───────────────────────────────────────────────

export async function saveAssetPack(slug: string, files: AssetPackFile[]): Promise<void> {
  try {
    await withDB(async (db) => {
      const tx = db.transaction(STORE_ASSET_PACK, "readwrite");
      await idbPut(tx.objectStore(STORE_ASSET_PACK), files, slug);
    });
  } catch {
    // silent
  }
}

export async function loadAssetPack(slug: string): Promise<AssetPackFile[]> {
  try {
    return await withDB(async (db) => {
      const tx = db.transaction(STORE_ASSET_PACK, "readonly");
      const result = await idbGet<AssetPackFile[]>(tx.objectStore(STORE_ASSET_PACK), slug);
      return Array.isArray(result) ? result : [];
    });
  } catch {
    return [];
  }
}

export async function clearAssetPack(slug: string): Promise<void> {
  try {
    await withDB(async (db) => {
      const tx = db.transaction(STORE_ASSET_PACK, "readwrite");
      await idbDelete(tx.objectStore(STORE_ASSET_PACK), slug);
    });
  } catch {
    // silent
  }
}
