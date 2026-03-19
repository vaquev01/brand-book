"use client";

import type { GeneratedAsset } from "./types";
import {
  saveGeneratedImage,
  loadGeneratedImages,
} from "./imageStorage";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ServerAsset {
  id: string;
  key: string;
  sourceUrl: string | null;
  publicUrl: string | null;
  provider: string | null;
  prompt: string | null;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  uploaded: number;
  downloaded: number;
  errors: string[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SYNC_BATCH_SIZE = 10;
const SYNC_FETCH_TIMEOUT = 30_000;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fetch with a timeout to avoid hanging indefinitely. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = SYNC_FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Check if a URL is a usable image (data URL or valid http URL). */
function isUsableUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.startsWith("data:") || url.startsWith("https://") || url.startsWith("http://");
}

// ─── Fetch server assets (GET) ──────────────────────────────────────────────

/**
 * Fetch all ProjectAsset records for a given project from the server.
 * Returns an empty array if the user is not authenticated or the request fails.
 */
export async function fetchServerAssets(projectId: string): Promise<ServerAsset[]> {
  try {
    const res = await fetchWithTimeout(
      `/api/assets/sync?projectId=${encodeURIComponent(projectId)}`,
      { method: "GET", headers: { Accept: "application/json" } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { assets?: ServerAsset[] };
    return Array.isArray(json.assets) ? json.assets : [];
  } catch {
    return [];
  }
}

// ─── Upload local → server ──────────────────────────────────────────────────

/**
 * Upload a batch of local assets to the server via POST /api/assets/sync.
 * Returns the number of successfully synced assets.
 */
async function uploadBatchToServer(
  projectId: string,
  assets: Array<{ key: string; url: string; provider?: string; prompt?: string }>
): Promise<{ synced: number; error?: string }> {
  try {
    const res = await fetchWithTimeout("/api/assets/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, assets }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      return { synced: 0, error: body.error ?? `HTTP ${res.status}` };
    }
    const body = (await res.json()) as { synced?: number };
    return { synced: body.synced ?? 0 };
  } catch (err) {
    return { synced: 0, error: err instanceof Error ? err.message : "Upload failed" };
  }
}

/**
 * Upload all local generated assets that the server doesn't have yet.
 */
async function uploadMissingToServer(
  projectId: string,
  localAssets: Record<string, GeneratedAsset>,
  serverAssets: ServerAsset[]
): Promise<{ uploaded: number; errors: string[] }> {
  const serverKeys = new Set(serverAssets.map((a) => a.key));
  const errors: string[] = [];
  let uploaded = 0;

  // Find local assets not on the server, or whose URL differs
  const serverUrlMap = new Map(
    serverAssets.map((a) => [a.key, a.sourceUrl ?? a.publicUrl])
  );

  const toUpload = Object.entries(localAssets).filter(([key, asset]) => {
    if (!isUsableUrl(asset.url)) return false;
    // Upload if server doesn't have it, or server has a different URL
    if (!serverKeys.has(key)) return true;
    const serverUrl = serverUrlMap.get(key);
    // If local has a data URL and server has something different, prefer local
    if (asset.url.startsWith("data:") && serverUrl !== asset.url) return true;
    return false;
  });

  // Upload in batches
  for (let i = 0; i < toUpload.length; i += SYNC_BATCH_SIZE) {
    const batch = toUpload.slice(i, i + SYNC_BATCH_SIZE).map(([key, asset]) => ({
      key,
      url: asset.url,
      provider: typeof asset.provider === "string" ? asset.provider : undefined,
      prompt: asset.prompt,
    }));

    const result = await uploadBatchToServer(projectId, batch);
    uploaded += result.synced;
    if (result.error) {
      errors.push(`Batch ${Math.floor(i / SYNC_BATCH_SIZE) + 1}: ${result.error}`);
    }
  }

  return { uploaded, errors };
}

// ─── Download server → local (IndexedDB) ───────────────────────────────────

/**
 * Download server assets that are missing from IndexedDB.
 * Converts publicUrl/sourceUrl into a GeneratedAsset and saves locally.
 */
async function downloadMissingToLocal(
  slug: string,
  localAssets: Record<string, GeneratedAsset>,
  serverAssets: ServerAsset[]
): Promise<{ downloaded: number; errors: string[] }> {
  const errors: string[] = [];
  let downloaded = 0;

  for (const serverAsset of serverAssets) {
    // Skip if we already have this asset locally with a usable URL
    const local = localAssets[serverAsset.key];
    if (local && isUsableUrl(local.url)) continue;

    // Pick the best URL from the server record
    const url = serverAsset.sourceUrl ?? serverAsset.publicUrl;
    if (!isUsableUrl(url)) continue;

    try {
      const generatedAsset: GeneratedAsset = {
        key: serverAsset.key,
        url,
        provider: (serverAsset.provider as GeneratedAsset["provider"]) ?? "upload",
        prompt: serverAsset.prompt ?? "",
        generatedAt: serverAsset.updatedAt ?? serverAsset.createdAt ?? new Date().toISOString(),
      };

      await saveGeneratedImage(slug, serverAsset.key, generatedAsset);
      downloaded++;
    } catch (err) {
      errors.push(
        `Download ${serverAsset.key}: ${err instanceof Error ? err.message : "failed"}`
      );
    }
  }

  return { downloaded, errors };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Full bidirectional sync between IndexedDB and the server.
 *
 * 1. Fetches the server's asset list for the project.
 * 2. Uploads any local assets the server is missing.
 * 3. Downloads any server assets missing from IndexedDB.
 *
 * @param projectId - The server project ID. If null/empty, sync is skipped.
 * @param slug - The local storage slug for IndexedDB keys.
 * @returns SyncResult with counts and any errors.
 */
export async function syncAllImages(
  projectId: string | null | undefined,
  slug: string
): Promise<SyncResult> {
  if (!projectId || !slug) {
    return { uploaded: 0, downloaded: 0, errors: [] };
  }

  const errors: string[] = [];

  // 1. Load local state
  let localAssets: Record<string, GeneratedAsset>;
  try {
    localAssets = await loadGeneratedImages(slug);
  } catch {
    localAssets = {};
  }

  // 2. Fetch server state
  const serverAssets = await fetchServerAssets(projectId);

  // 3. Upload local → server (assets server doesn't have)
  const uploadResult = await uploadMissingToServer(projectId, localAssets, serverAssets);
  errors.push(...uploadResult.errors);

  // 4. Download server → local (assets IndexedDB doesn't have)
  const downloadResult = await downloadMissingToLocal(slug, localAssets, serverAssets);
  errors.push(...downloadResult.errors);

  return {
    uploaded: uploadResult.uploaded,
    downloaded: downloadResult.downloaded,
    errors,
  };
}

/**
 * Upload a single newly generated asset to the server.
 * This is a fire-and-forget convenience used right after image generation.
 * It does NOT block the UI — errors are silently logged.
 *
 * @param projectId - Server project ID. If null, the upload is skipped.
 * @param asset - The generated asset to upload.
 */
export async function syncSingleAsset(
  projectId: string | null | undefined,
  asset: GeneratedAsset
): Promise<void> {
  if (!projectId || !isUsableUrl(asset.url)) return;

  try {
    await uploadBatchToServer(projectId, [
      {
        key: asset.key,
        url: asset.url,
        provider: typeof asset.provider === "string" ? asset.provider : undefined,
        prompt: asset.prompt,
      },
    ]);
  } catch {
    // Non-fatal: server sync is best-effort after generation
  }
}

/**
 * On page load, pull any server-side assets that are missing locally.
 * Returns the downloaded assets as a record so the caller can merge them
 * into React state.
 *
 * @param projectId - Server project ID.
 * @param slug - Local storage slug.
 * @returns Record of asset key → GeneratedAsset for newly downloaded assets.
 */
export async function pullServerAssets(
  projectId: string | null | undefined,
  slug: string
): Promise<Record<string, GeneratedAsset>> {
  if (!projectId || !slug) return {};

  let localAssets: Record<string, GeneratedAsset>;
  try {
    localAssets = await loadGeneratedImages(slug);
  } catch {
    localAssets = {};
  }

  const serverAssets = await fetchServerAssets(projectId);
  const result: Record<string, GeneratedAsset> = {};

  for (const serverAsset of serverAssets) {
    const local = localAssets[serverAsset.key];
    if (local && isUsableUrl(local.url)) continue;

    const url = serverAsset.sourceUrl ?? serverAsset.publicUrl;
    if (!isUsableUrl(url)) continue;

    const generatedAsset: GeneratedAsset = {
      key: serverAsset.key,
      url,
      provider: (serverAsset.provider as GeneratedAsset["provider"]) ?? "upload",
      prompt: serverAsset.prompt ?? "",
      generatedAt: serverAsset.updatedAt ?? serverAsset.createdAt ?? new Date().toISOString(),
    };

    // Save to IndexedDB
    try {
      await saveGeneratedImage(slug, serverAsset.key, generatedAsset);
    } catch {
      // IndexedDB write failed — still return the asset for React state
    }

    result[serverAsset.key] = generatedAsset;
  }

  return result;
}
