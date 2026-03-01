import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { generateProductionManifest } from "@/lib/productionExport";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { BrandbookSchemaLoose } from "@/lib/brandbookSchema";
import type { BrandbookData, GeneratedAsset } from "@/lib/types";

export const runtime = "nodejs";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
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
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brandbookData?: unknown;
      generatedAssets?: GeneratedAsset[];
    };

    if (!body.brandbookData) {
      return NextResponse.json({ error: "brandbookData é obrigatório" }, { status: 400 });
    }

    const migrated = migrateBrandbook(body.brandbookData);
    const base = BrandbookSchemaLoose.safeParse(migrated);
    if (!base.success) {
      return NextResponse.json({ error: "brandbookData inválido para export" }, { status: 400 });
    }

    const brandbookData = base.data as unknown as BrandbookData;
    const assets = Array.isArray(body.generatedAssets) ? body.generatedAssets : [];

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

    const out = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

    return new NextResponse(out, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=\"${slug}-brandbook-pack.zip\"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
