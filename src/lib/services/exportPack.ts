import JSZip from "jszip";
import { lintBrandbook } from "@/lib/brandbookLinter";
import { BrandbookSchemaLoose } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { getProtectedExportGuard } from "@/lib/brandbookQualityGate";
import { slugify } from "@/lib/common";
import { generateProductionManifest } from "@/lib/productionExport";
import type { AssetPackFile, BrandbookData, GeneratedAsset, UploadedAsset } from "@/lib/types";

export type ExportPackInput = {
  brandbookData?: unknown;
  generatedAssets?: GeneratedAsset[];
  uploadedAssets?: UploadedAsset[];
  assetPackFiles?: AssetPackFile[];
};

export type ExportPackPayload = {
  brandbookData: BrandbookData;
  generatedAssets: GeneratedAsset[];
  uploadedAssets: UploadedAsset[];
  assetPackFiles: AssetPackFile[];
};

export type ExportPackArchive = {
  buffer: Buffer;
  slug: string;
  stats: {
    assetPackFilesCount: number;
    generatedAssetsCount: number;
    uploadedAssetsCount: number;
    zipSize: number;
  };
};

export class ExportPackInputError extends Error {}

function extFromContentType(ct: string | null): string {
  const c = (ct ?? "").toLowerCase();
  if (c.includes("image/png")) return "png";
  if (c.includes("image/jpeg")) return "jpg";
  if (c.includes("image/webp")) return "webp";
  if (c.includes("image/svg")) return "svg";
  return "bin";
}

export function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; ext: string } | null {
  const match = /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");
  return { bytes: new Uint8Array(buffer), ext: extFromContentType(mime) };
}

async function fetchBytes(url: string): Promise<{ bytes: Uint8Array; ext: string } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type");
  const arrayBuffer = await res.arrayBuffer();
  return { bytes: new Uint8Array(arrayBuffer), ext: extFromContentType(contentType) };
}

export function safeRelPath(path: string): string | null {
  const normalized = path.replace(/\\/g, "/").trim();
  if (!normalized) return null;
  if (normalized.startsWith("/") || normalized.startsWith("..") || normalized.includes("/../") || normalized.includes("\0")) return null;
  if (normalized.length > 180) return null;
  return normalized;
}

async function resolveAssetBytes(url: string): Promise<{ bytes: Uint8Array; ext: string } | null> {
  if (url.startsWith("data:")) return decodeDataUrl(url);
  if (url.startsWith("http")) return fetchBytes(url).catch(() => null);
  return null;
}

function addBaseFiles(zip: JSZip, brandbookData: BrandbookData) {
  const manifest = generateProductionManifest(brandbookData);
  zip.file("brandbook.json", JSON.stringify(brandbookData, null, 2));
  zip.file("production-manifest.json", JSON.stringify(manifest, null, 2));
  zip.file("tokens.css", manifest.colorSystem.cssVariables + "\n\n" + manifest.typographySystem.cssVariables + "\n");
  zip.file("tokens.scss", manifest.colorSystem.scssVariables + "\n\n" + manifest.typographySystem.scssVariables + "\n");
  zip.file("google-fonts-url.txt", manifest.typographySystem.googleFontsUrl + "\n");
}

async function addGeneratedAssets(zip: JSZip, slug: string, brandbookData: BrandbookData, assets: GeneratedAsset[]) {
  zip.file(
    "images/manifest.json",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        assets,
        applications: brandbookData.applications,
      },
      null,
      2
    )
  );

  const imagesFolder = zip.folder("images")!;
  const failedFolder = zip.folder("images/failed")!;

  for (const asset of assets) {
    const baseName = `${slug}_${asset.key}_${asset.provider}`.replace(/[^a-zA-Z0-9._-]/g, "_");
    const resolved = await resolveAssetBytes(asset.url);
    if (resolved) {
      imagesFolder.file(`${baseName}.${resolved.ext}`, resolved.bytes);
      imagesFolder.file(`${baseName}.prompt.txt`, asset.prompt + "\n");
      continue;
    }
    failedFolder.file(`${baseName}.url.txt`, asset.url + "\n");
    failedFolder.file(`${baseName}.prompt.txt`, asset.prompt + "\n");
  }
}

function addAssetPackFiles(zip: JSZip, assetPackFiles: AssetPackFile[]) {
  if (assetPackFiles.length === 0) return;

  zip.file(
    "asset-pack/manifest.json",
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        files: assetPackFiles.map((file) => ({ path: file.path })),
      },
      null,
      2
    )
  );

  const packFolder = zip.folder("asset-pack")!;
  const packFailedFolder = zip.folder("asset-pack/failed")!;

  for (const file of assetPackFiles) {
    const safePath = typeof file.path === "string" ? safeRelPath(file.path) : null;
    const content = typeof file.content === "string" ? file.content : null;
    if (!safePath || !content) {
      packFailedFolder.file(`invalid_${Date.now()}.json`, JSON.stringify(file ?? null, null, 2) + "\n");
      continue;
    }
    const trimmed = content.trim();
    if (!trimmed) continue;
    packFolder.file(safePath, trimmed + "\n");
  }
}

async function addUploadedAssets(zip: JSZip, slug: string, uploadedAssets: UploadedAsset[]) {
  if (uploadedAssets.length === 0) return;

  zip.file(
    "uploaded/manifest.json",
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        assets: uploadedAssets,
      },
      null,
      2
    )
  );

  const uploadedFolder = zip.folder("uploaded")!;
  const uploadedFailedFolder = zip.folder("uploaded/failed")!;

  for (const asset of uploadedAssets) {
    const safeType = String(asset.type || "other").replace(/[^a-zA-Z0-9._-]/g, "_") || "other";
    const safeId = String(asset.id || "").replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeName = String(asset.name || "asset").replace(/[^a-zA-Z0-9._-]/g, "_") || "asset";
    const baseName = [slug, safeType, safeName, safeId].filter(Boolean).join("_").slice(0, 140);
    const resolved = typeof asset.dataUrl === "string" ? await resolveAssetBytes(asset.dataUrl) : null;

    if (resolved) {
      uploadedFolder.file(`${safeType}/${baseName}.${resolved.ext}`, resolved.bytes);
      uploadedFolder.file(`${safeType}/${baseName}.meta.json`, JSON.stringify(asset, null, 2) + "\n");
      continue;
    }

    uploadedFailedFolder.file(`${baseName}.dataUrl.txt`, String(asset.dataUrl || "") + "\n");
    uploadedFailedFolder.file(`${baseName}.meta.json`, JSON.stringify(asset, null, 2) + "\n");
  }
}

export function parseExportPackInput(body: ExportPackInput): ExportPackPayload {
  if (!body.brandbookData) {
    throw new ExportPackInputError("brandbookData é obrigatório");
  }

  const migrated = migrateBrandbook(body.brandbookData);
  const parsed = BrandbookSchemaLoose.safeParse(migrated);
  if (!parsed.success) {
    throw new ExportPackInputError("brandbookData inválido para export");
  }

  const lintReport = lintBrandbook(parsed.data as unknown as BrandbookData);
  const guard = getProtectedExportGuard("pack", lintReport);
  if (!guard.allowed) {
    throw new ExportPackInputError(guard.reason ?? "Pack bloqueado pelo quality gate.");
  }

  return {
    brandbookData: parsed.data as unknown as BrandbookData,
    generatedAssets: Array.isArray(body.generatedAssets) ? body.generatedAssets : [],
    uploadedAssets: Array.isArray(body.uploadedAssets) ? body.uploadedAssets : [],
    assetPackFiles: Array.isArray(body.assetPackFiles) ? body.assetPackFiles : [],
  };
}

export async function buildExportPackArchive(payload: ExportPackPayload): Promise<ExportPackArchive> {
  const slug = slugify(payload.brandbookData.brandName);
  const zip = new JSZip();

  addBaseFiles(zip, payload.brandbookData);
  await addGeneratedAssets(zip, slug, payload.brandbookData, payload.generatedAssets);
  addAssetPackFiles(zip, payload.assetPackFiles);
  await addUploadedAssets(zip, slug, payload.uploadedAssets);

  const outBuffer = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
  const buffer = Buffer.from(outBuffer);

  return {
    buffer,
    slug,
    stats: {
      assetPackFilesCount: payload.assetPackFiles.length,
      generatedAssetsCount: payload.generatedAssets.length,
      uploadedAssetsCount: payload.uploadedAssets.length,
      zipSize: buffer.byteLength,
    },
  };
}
