import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { storageUpload, buildAssetKey } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * POST /api/assets/sync — Bulk-sync generated images from browser to server.
 * Called when the editor detects images in IndexedDB that aren't on the server yet.
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
      select: { key: true, publicUrl: true, sourceUrl: true },
    });
    const existingMap = new Map(existingAssets.map((a) => [a.key, a]));

    let synced = 0;
    // Process up to 10 assets per request to avoid timeouts
    for (const asset of assets.slice(0, 10)) {
      if (!asset.key || !asset.url) continue;

      const existing = existingMap.get(asset.key);
      // Skip if the exact same URL is already stored (avoid redundant uploads)
      if (existing?.publicUrl && !existing.publicUrl.includes("_placeholder") && existing.sourceUrl === asset.url) continue;
      if (existing?.sourceUrl === asset.url) continue;

      let publicUrl: string | undefined;
      let sourceUrl: string | undefined;

      // Try R2 upload first
      if (asset.url.startsWith("data:")) {
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
          // R2 failed — fall back to storing data URL directly
        }

        // If R2 failed or not configured, store the data URL directly
        if (!publicUrl) {
          sourceUrl = asset.url;
        }
      }

      // Upsert asset record
      if (existing) {
        await prisma.projectAsset.update({
          where: { id: (await prisma.projectAsset.findFirst({ where: { projectId, key: asset.key } }))!.id },
          data: {
            ...(publicUrl ? { publicUrl } : {}),
            ...(sourceUrl ? { sourceUrl } : {}),
            prompt: asset.prompt || existing.sourceUrl ? undefined : asset.prompt,
            provider: asset.provider,
          },
        });
      } else {
        await prisma.projectAsset.create({
          data: {
            projectId,
            key: asset.key,
            name: asset.key.replace(/_/g, " "),
            publicUrl,
            sourceUrl,
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
