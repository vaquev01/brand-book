import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { storageUpload, buildAssetKey } from "@/lib/storage";
import { generateImageWithProvider } from "@/lib/services/generateImage";
import { buildImagePrompt, ASSET_CATALOG } from "@/lib/imagePrompts";
import type { BrandbookData, ImageProvider } from "@/lib/types";
import type { AspectRatioKey } from "@/lib/services/generateImage";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max for batch

/**
 * POST /api/assets/regenerate-batch
 *
 * Regenerates all (or selected) images for a project using the brandbook data
 * to build world-class prompts. Runs sequentially to respect rate limits.
 *
 * Body: {
 *   projectId: string,
 *   provider?: "imagen" | "dalle3" | "ideogram" | "stability",  // default: imagen
 *   keys?: string[],       // specific keys to regenerate; if empty, regenerates ALL except logo_primary
 *   skipExisting?: boolean, // if true, skip keys that already have a sourceUrl
 *   batchSize?: number,     // how many to process per request (default: 8, max: 15)
 *   offset?: number,        // start from this index in the catalog (for pagination)
 * }
 *
 * Returns: { ok: true, regenerated: number, errors: string[], nextOffset?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      projectId: string;
      provider?: ImageProvider;
      keys?: string[];
      skipExisting?: boolean;
      batchSize?: number;
      offset?: number;
    };

    const {
      projectId,
      provider = "imagen",
      keys,
      skipExisting = false,
      batchSize = 8,
      offset = 0,
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 403 });
    }

    // Get latest brandbook version
    const latestVersion = await prisma.brandbookVersion.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    if (!latestVersion?.brandbookJson) {
      return NextResponse.json({ error: "No brandbook found for this project" }, { status: 404 });
    }
    const brandbook = latestVersion.brandbookJson as unknown as BrandbookData;

    // Determine which keys to regenerate
    const PROTECTED_KEYS = ["logo_primary"]; // Never regenerate main logo
    const clampedBatch = Math.min(Math.max(batchSize, 1), 15);

    let targetKeys: string[];
    if (keys && keys.length > 0) {
      targetKeys = keys.filter(k => !PROTECTED_KEYS.includes(k));
    } else {
      // All catalog keys except protected ones
      targetKeys = ASSET_CATALOG
        .map(a => a.key)
        .filter(k => !PROTECTED_KEYS.includes(k));
    }

    // Apply offset + batchSize for pagination
    const paginatedKeys = targetKeys.slice(offset, offset + clampedBatch);

    if (paginatedKeys.length === 0) {
      return NextResponse.json({ ok: true, regenerated: 0, errors: [], done: true });
    }

    // Optionally skip keys that already have images
    let keysToProcess = paginatedKeys;
    if (skipExisting) {
      const existing = await prisma.projectAsset.findMany({
        where: {
          projectId,
          key: { in: paginatedKeys },
          sourceUrl: { not: null },
        },
        select: { key: true },
      });
      const existingSet = new Set(existing.map(a => a.key));
      keysToProcess = paginatedKeys.filter(k => !existingSet.has(k));
    }

    // Build aspect ratio map from catalog
    const aspectMap = new Map<string, AspectRatioKey>();
    for (const item of ASSET_CATALOG) {
      aspectMap.set(item.key, item.aspectRatio as AspectRatioKey);
    }

    const results: string[] = [];
    const errors: string[] = [];

    // Process sequentially to respect rate limits
    for (const assetKey of keysToProcess) {
      try {
        // Build the prompt using the full brandbook context
        const prompt = buildImagePrompt(assetKey as Parameters<typeof buildImagePrompt>[0], brandbook, provider);
        const aspectRatio = aspectMap.get(assetKey) ?? "1:1";

        // Generate the image
        const result = await generateImageWithProvider({
          prompt,
          provider,
          assetKey,
          aspectRatio,
        });

        // Persist to database (try R2 first, fallback to data URL)
        let persisted = false;
        try {
          let imageBuffer: Buffer;
          let mimeType = "image/png";

          if (result.url.startsWith("data:")) {
            const match = result.url.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              mimeType = match[1];
              imageBuffer = Buffer.from(match[2], "base64");
            } else {
              imageBuffer = Buffer.from(result.url);
            }
          } else {
            const imgRes = await fetch(result.url);
            const arrayBuf = await imgRes.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuf);
            mimeType = imgRes.headers.get("content-type") ?? "image/png";
          }

          const ext = mimeType.split("/")[1] ?? "png";
          const storageKey = buildAssetKey(projectId, assetKey, ext);

          // Try R2 upload
          try {
            const uploadResult = await storageUpload(storageKey, imageBuffer, { contentType: mimeType });
            const publicUrl = uploadResult.publicUrl;
            const isRealPublic = publicUrl && !publicUrl.includes("_placeholder");

            // Upsert with R2 URL + data URL fallback
            const sourceUrl = result.url.startsWith("data:") ? result.url : `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

            const existing = await prisma.projectAsset.findFirst({
              where: { projectId, key: assetKey },
            });

            const assetData = {
              storageKey,
              ...(isRealPublic ? { publicUrl } : {}),
              sourceUrl, // Always store data URL as fallback
              prompt,
              provider: result.provider,
              mimeType,
              fileSizeBytes: imageBuffer.length,
            };

            if (existing) {
              await prisma.projectAsset.update({ where: { id: existing.id }, data: assetData });
            } else {
              await prisma.projectAsset.create({
                data: { projectId, key: assetKey, name: assetKey.replace(/_/g, " "), ...assetData },
              });
            }
            persisted = true;
          } catch {
            // R2 failed — store data URL only
            const sourceUrl = result.url.startsWith("data:") ? result.url : `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
            const existing = await prisma.projectAsset.findFirst({
              where: { projectId, key: assetKey },
            });
            if (existing) {
              await prisma.projectAsset.update({
                where: { id: existing.id },
                data: { sourceUrl, prompt, provider: result.provider, mimeType },
              });
            } else {
              await prisma.projectAsset.create({
                data: { projectId, key: assetKey, name: assetKey.replace(/_/g, " "), sourceUrl, prompt, provider: result.provider, mimeType },
              });
            }
            persisted = true;
          }
        } catch (persistErr) {
          errors.push(`${assetKey}: generated but persist failed — ${persistErr instanceof Error ? persistErr.message : "unknown"}`);
        }

        if (persisted) {
          results.push(assetKey);
        }
      } catch (genErr) {
        errors.push(`${assetKey}: generation failed — ${genErr instanceof Error ? genErr.message : "unknown"}`);
      }
    }

    const nextOffset = offset + clampedBatch;
    const done = nextOffset >= targetKeys.length;

    return NextResponse.json({
      ok: true,
      regenerated: results.length,
      keys: results,
      errors,
      done,
      nextOffset: done ? undefined : nextOffset,
      total: targetKeys.length,
      processed: Math.min(nextOffset, targetKeys.length),
    });
  } catch (error: unknown) {
    console.error("[POST /api/assets/regenerate-batch]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Batch regeneration failed" },
      { status: 500 },
    );
  }
}
