import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { generateProductionManifest } from "@/lib/productionExport";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { BrandbookSchemaLoose } from "@/lib/brandbookSchema";
import type { AssetPackFile, BrandbookData, GeneratedAsset, UploadedAsset } from "@/lib/types";
import { slugify } from "@/lib/common";
import { bbLog, captureMem, diffMem, getRequestId, memToJson, serializeError } from "@/lib/serverLog";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "/api/export-pack",
      method: "POST",
    },
    { status: 200 }
  );
}

function extFromContentType(ct: string | null): string {
  const c = (ct ?? "").toLowerCase();
  if (c.includes("image/png")) return "png";
  if (c.includes("image/jpeg")) return "jpg";
  if (c.includes("image/webp")) return "webp";
  if (c.includes("image/svg")) return "svg";
  return "bin";
}

function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; ext: string } | null {
  const m = /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  const mime = m[1].toLowerCase();
  const base64 = m[2];
  const buf = Buffer.from(base64, "base64");
  const ext = extFromContentType(mime);
  return { bytes: new Uint8Array(buf), ext };
}

async function fetchBytes(url: string): Promise<{ bytes: Uint8Array; ext: string } | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const ct = res.headers.get("content-type");
  const ab = await res.arrayBuffer();
  return { bytes: new Uint8Array(ab), ext: extFromContentType(ct) };
}

function safeRelPath(path: string): string | null {
  const p = path.replace(/\\/g, "/").trim();
  if (!p) return null;
  if (p.startsWith("/") || p.startsWith("..") || p.includes("/../") || p.includes("\0")) return null;
  if (p.length > 180) return null;
  return p;
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const memBefore = captureMem();

  function respondJson(status: number, body: Record<string, unknown>, extra: Record<string, unknown> = {}) {
    const memAfter = captureMem();
    const durationMs = Date.now() - startedAt;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    bbLog(level, status >= 400 ? "api.export-pack.error" : "api.export-pack.ok", {
      requestId,
      status,
      durationMs,
      memDelta: diffMem(memBefore, memAfter),
      ...extra,
    });
    return NextResponse.json(body, { status, headers: { "x-request-id": requestId } });
  }

  bbLog("info", "api.export-pack.start", {
    requestId,
    mem: memToJson(memBefore),
  });

  try {
    const body = (await request.json()) as {
      brandbookData?: unknown;
      generatedAssets?: GeneratedAsset[];
      uploadedAssets?: UploadedAsset[];
      assetPackFiles?: AssetPackFile[];
    };

    if (!body.brandbookData) {
      return respondJson(400, { error: "brandbookData é obrigatório" });
    }

    const migrated = migrateBrandbook(body.brandbookData);
    const base = BrandbookSchemaLoose.safeParse(migrated);
    if (!base.success) {
      return respondJson(400, { error: "brandbookData inválido para export" });
    }

    const brandbookData = base.data as unknown as BrandbookData;
    const assets = Array.isArray(body.generatedAssets) ? body.generatedAssets : [];
    const uploadedAssets = Array.isArray(body.uploadedAssets) ? body.uploadedAssets : [];
    const assetPackFiles = Array.isArray(body.assetPackFiles) ? body.assetPackFiles : [];

    bbLog("debug", "api.export-pack.payload", {
      requestId,
      assetsCount: assets.length,
      uploadedAssetsCount: uploadedAssets.length,
      assetPackFilesCount: assetPackFiles.length,
    });

    const slug = slugify(brandbookData.brandName);
    const zip = new JSZip();

    zip.file("brandbook.json", JSON.stringify(brandbookData, null, 2));

    const manifest = generateProductionManifest(brandbookData);
    zip.file("production-manifest.json", JSON.stringify(manifest, null, 2));

    zip.file("tokens.css", manifest.colorSystem.cssVariables + "\n\n" + manifest.typographySystem.cssVariables + "\n");
    zip.file("tokens.scss", manifest.colorSystem.scssVariables + "\n\n" + manifest.typographySystem.scssVariables + "\n");

    zip.file("google-fonts-url.txt", manifest.typographySystem.googleFontsUrl + "\n");

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

    for (const a of assets) {
      const baseName = `${slug}_${a.key}_${a.provider}`.replace(/[^a-zA-Z0-9._-]/g, "_");

      let bytes: Uint8Array | null = null;
      let ext = "png";

      if (a.url.startsWith("data:")) {
        const decoded = decodeDataUrl(a.url);
        if (decoded) {
          bytes = decoded.bytes;
          ext = decoded.ext;
        }
      } else if (a.url.startsWith("http")) {
        const fetched = await fetchBytes(a.url).catch(() => null);
        if (fetched) {
          bytes = fetched.bytes;
          ext = fetched.ext;
        }
      }

      if (bytes) {
        imagesFolder.file(`${baseName}.${ext}`, bytes);
        imagesFolder.file(`${baseName}.prompt.txt`, a.prompt + "\n");
      } else {
        failedFolder.file(`${baseName}.url.txt`, a.url + "\n");
        failedFolder.file(`${baseName}.prompt.txt`, a.prompt + "\n");
      }
    }

    if (assetPackFiles.length > 0) {
      zip.file(
        "asset-pack/manifest.json",
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            files: assetPackFiles.map((f) => ({ path: f.path })),
          },
          null,
          2
        )
      );

      const packFolder = zip.folder("asset-pack")!;
      const packFailedFolder = zip.folder("asset-pack/failed")!;

      for (const f of assetPackFiles) {
        const p = typeof f.path === "string" ? safeRelPath(f.path) : null;
        const c = typeof f.content === "string" ? f.content : null;
        if (!p || !c) {
          packFailedFolder.file(`invalid_${Date.now()}.json`, JSON.stringify(f ?? null, null, 2) + "\n");
          continue;
        }
        const trimmed = c.trim();
        if (!trimmed) continue;
        packFolder.file(p, trimmed + "\n");
      }
    }

    if (uploadedAssets.length > 0) {
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

      for (const u of uploadedAssets) {
        const safeType = String(u.type || "other").replace(/[^a-zA-Z0-9._-]/g, "_") || "other";
        const safeId = String(u.id || "").replace(/[^a-zA-Z0-9._-]/g, "_");
        const safeName = String(u.name || "asset").replace(/[^a-zA-Z0-9._-]/g, "_") || "asset";

        const baseName = [slug, safeType, safeName, safeId].filter(Boolean).join("_").slice(0, 140);

        let bytes: Uint8Array | null = null;
        let ext = "png";

        if (typeof u.dataUrl === "string" && u.dataUrl.startsWith("data:")) {
          const decoded = decodeDataUrl(u.dataUrl);
          if (decoded) {
            bytes = decoded.bytes;
            ext = decoded.ext;
          }
        } else if (typeof u.dataUrl === "string" && u.dataUrl.startsWith("http")) {
          const fetched = await fetchBytes(u.dataUrl).catch(() => null);
          if (fetched) {
            bytes = fetched.bytes;
            ext = fetched.ext;
          }
        }

        if (bytes) {
          uploadedFolder.file(`${safeType}/${baseName}.${ext}`, bytes);
          uploadedFolder.file(`${safeType}/${baseName}.meta.json`, JSON.stringify(u, null, 2) + "\n");
        } else {
          uploadedFailedFolder.file(`${baseName}.dataUrl.txt`, String(u.dataUrl || "") + "\n");
          uploadedFailedFolder.file(`${baseName}.meta.json`, JSON.stringify(u, null, 2) + "\n");
        }
      }
    }

    const outBuffer = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
    const out = Buffer.from(outBuffer);

    const memAfter = captureMem();
    bbLog("info", "api.export-pack.ok", {
      requestId,
      status: 200,
      durationMs: Date.now() - startedAt,
      memDelta: diffMem(memBefore, memAfter),
      zipSize: out.byteLength,
      assetsCount: assets.length,
      uploadedAssetsCount: uploadedAssets.length,
      assetPackFilesCount: assetPackFiles.length,
    });

    return new NextResponse(out, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}-brandbook-pack.zip"`,
        "x-request-id": requestId,
      },
    });
  } catch (error: unknown) {
    bbLog("error", "api.export-pack.exception", {
      requestId,
      durationMs: Date.now() - startedAt,
      error: serializeError(error),
      mem: memToJson(captureMem()),
    });
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return respondJson(500, { error: message });
  }
}
