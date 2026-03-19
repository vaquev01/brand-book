import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { storageUpload, buildAssetKey } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * GET /api/assets/sync?projectId=xxx — Return all ProjectAsset records for a project.
 * Used by the client to pull server-side assets into IndexedDB on page load.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId é obrigatório." }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Projeto não encontrado ou sem permissão." }, { status: 403 });
    }

    const assets = await prisma.projectAsset.findMany({
      where: { projectId },
      select: {
        id: true,
        key: true,
        sourceUrl: true,
        publicUrl: true,
        provider: true,
        prompt: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ assets });
  } catch (error: unknown) {
    console.error("[GET /api/assets/sync]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar assets" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/assets/sync — Bulk-sync generated images from browser to server.
 * Stores images in PostgreSQL (sourceUrl) and optionally in R2 (publicUrl).
 * This ensures share links always show the latest images.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { projectId, assets } = (await request.json()) as {
      projectId: string;
      assets: Array<{
        key: string;
        url: string; // data URL or external URL
        provider?: string;
        prompt?: string;
      }>;
    };

    if (!projectId || !Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json({ error: "projectId e assets são obrigatórios." }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Projeto não encontrado ou sem permissão." }, { status: 403 });
    }

    // Get existing asset keys to skip already-synced ones
    const existingAssets = await prisma.projectAsset.findMany({
      where: { projectId },
      select: { id: true, key: true, publicUrl: true, sourceUrl: true },
    });
    const existingMap = new Map(existingAssets.map((a) => [a.key, a]));

    let synced = 0;
    // Process up to 10 assets per request to avoid timeouts
    for (const asset of assets.slice(0, 10)) {
      if (!asset.key || !asset.url) continue;

      const existing = existingMap.get(asset.key);

      // Skip if the exact same URL is already stored
      if (existing?.sourceUrl === asset.url) continue;
      if (existing?.publicUrl && !existing.publicUrl.includes("_placeholder") && existing.sourceUrl === asset.url) continue;

      let publicUrl: string | undefined;
      let sourceUrl: string = asset.url; // ALWAYS store the URL — this is the fallback that goes to PostgreSQL

      // If it's an external URL, download it and convert to data URL for reliable storage
      if (/^https?:\/\//i.test(asset.url)) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15_000);
          const imgRes = await fetch(asset.url, {
            signal: controller.signal,
            headers: { "User-Agent": "brandbook-app/1.0" },
          }).finally(() => clearTimeout(timeout));

          if (imgRes.ok) {
            const contentType = imgRes.headers.get("content-type")?.split(";")[0].trim() ?? "image/png";
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            if (buffer.byteLength < 12 * 1024 * 1024) {
              // Convert to data URL for PostgreSQL storage (reliable, no external dependency)
              const b64 = buffer.toString("base64");
              const safeMime = contentType.startsWith("image/") ? contentType : "image/png";
              sourceUrl = `data:${safeMime};base64,${b64}`;

              // Also try R2 upload if configured
              try {
                const ext = safeMime.split("/")[1] ?? "png";
                const storageKey = buildAssetKey(projectId, asset.key, ext);
                const result = await storageUpload(storageKey, buffer, { contentType: safeMime });
                if (!result.publicUrl.includes("_placeholder")) {
                  publicUrl = result.publicUrl;
                }
              } catch {
                // R2 not configured or failed — fine, we have sourceUrl
              }
            }
          }
        } catch {
          // Download failed — store the original external URL as fallback
          sourceUrl = asset.url;
        }
      } else if (asset.url.startsWith("data:")) {
        // Data URL — try R2 upload, but always keep data URL in sourceUrl
        sourceUrl = asset.url;
        try {
          const match = asset.url.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const buffer = Buffer.from(match[2], "base64");
            const ext = mimeType.split("/")[1] ?? "png";
            const storageKey = buildAssetKey(projectId, asset.key, ext);
            const result = await storageUpload(storageKey, buffer, { contentType: mimeType });
            if (!result.publicUrl.includes("_placeholder")) {
              publicUrl = result.publicUrl;
            }
          }
        } catch {
          // R2 not configured or failed — fine, we have sourceUrl in PostgreSQL
        }
      }

      // Upsert asset record — ALWAYS stores sourceUrl so share page works
      if (existing) {
        await prisma.projectAsset.update({
          where: { id: existing.id },
          data: {
            sourceUrl,
            ...(publicUrl ? { publicUrl } : {}),
            prompt: asset.prompt ?? undefined,
            provider: asset.provider,
          },
        });
      } else {
        await prisma.projectAsset.create({
          data: {
            projectId,
            key: asset.key,
            name: asset.key.replace(/_/g, " "),
            sourceUrl,
            publicUrl,
            prompt: asset.prompt,
            provider: asset.provider,
            mimeType: "image/png",
          },
        });
      }
      synced++;
    }

    return NextResponse.json({ ok: true, synced });
  } catch (error: unknown) {
    console.error("[POST /api/assets/sync]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao sincronizar" },
      { status: 500 },
    );
  }
}
