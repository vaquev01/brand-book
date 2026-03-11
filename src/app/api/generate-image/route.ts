import { NextRequest, NextResponse } from "next/server";
import {
  generateImageWithProvider,
  GenerateImageInput,
  GenerateImageInputError,
} from "@/lib/services/generateImage";
import { bbLog, captureMem, diffMem, getRequestId, memToJson, serializeError } from "@/lib/serverLog";
import { checkRateLimit } from "@/lib/rateLimit";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { storageUpload, buildAssetKey } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const memBefore = captureMem();

  // Rate limiting with user plan
  let userPlan = "free";
  let clientId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  try {
    const session = await auth();
    if (session?.user?.id) {
      clientId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionTier: true },
      });
      if (user?.subscriptionTier) userPlan = user.subscriptionTier;
    }
  } catch {
    // Fall through to free tier
  }
  const rl = await checkRateLimit(clientId, userPlan);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", remaining: rl.remaining, reset: rl.reset },
      { status: 429, headers: { "X-RateLimit-Limit": String(rl.limit), "X-RateLimit-Remaining": String(rl.remaining) } }
    );
  }
  let providerName: string | undefined;
  let assetKeyName: string | undefined;

  function respond(status: number, body: Record<string, unknown>, extra: Record<string, unknown> = {}) {
    const memAfter = captureMem();
    const durationMs = Date.now() - startedAt;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    bbLog(level, status >= 400 ? "api.generate-image.error" : "api.generate-image.ok", {
      requestId,
      status,
      durationMs,
      memDelta: diffMem(memBefore, memAfter),
      ...extra,
    });
    return NextResponse.json(body, { status, headers: { "x-request-id": requestId } });
  }

  bbLog("info", "api.generate-image.start", {
    requestId,
    mem: memToJson(memBefore),
  });

  try {
    const payload = await request.json() as GenerateImageInput & { projectId?: string };
    const { prompt, provider, assetKey, aspectRatio, referenceImages, projectId } = payload;

    providerName = provider;
    assetKeyName = assetKey;

    bbLog("debug", "api.generate-image.payload", {
      requestId,
      provider,
      assetKey,
      aspectRatio,
      projectId,
      promptChars: typeof prompt === "string" ? prompt.length : 0,
      referenceImagesCount: Array.isArray(referenceImages) ? referenceImages.length : 0,
    });

    if (!prompt || !provider) {
      return respond(400, { error: "prompt e provider são obrigatórios" }, { provider, assetKey });
    }

    const result = await generateImageWithProvider(payload);

    // Auto-persist image to R2 + database when projectId is provided
    let publicUrl: string | undefined;
    if (projectId && assetKey && result.url) {
      try {
        // Convert data URL to buffer
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
          // Fetch external URL
          const imgRes = await fetch(result.url);
          const arrayBuf = await imgRes.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuf);
          mimeType = imgRes.headers.get("content-type") ?? "image/png";
        }

        const ext = mimeType.split("/")[1] ?? "png";
        const storageKey = buildAssetKey(projectId, assetKey, ext);
        const uploadResult = await storageUpload(storageKey, imageBuffer, { contentType: mimeType });
        publicUrl = uploadResult.publicUrl;

        // Upsert ProjectAsset record
        const existing = await prisma.projectAsset.findFirst({
          where: { projectId, key: assetKey },
        });
        if (existing) {
          await prisma.projectAsset.update({
            where: { id: existing.id },
            data: {
              storageKey,
              publicUrl,
              prompt,
              provider: result.provider,
              mimeType,
              fileSizeBytes: imageBuffer.length,
            },
          });
        } else {
          await prisma.projectAsset.create({
            data: {
              projectId,
              key: assetKey,
              name: assetKey.replace(/_/g, " "),
              storageKey,
              publicUrl,
              prompt,
              provider: result.provider,
              mimeType,
              fileSizeBytes: imageBuffer.length,
            },
          });
        }
      } catch (persistErr) {
        // Non-fatal: image was generated successfully, persistence is best-effort
        bbLog("warn", "api.generate-image.persist-failed", {
          requestId,
          error: serializeError(persistErr),
        });
      }
    }

    return respond(200, { ...result, publicUrl }, {
      provider: result.provider,
      assetKey,
      aspectRatio: result.aspectRatio,
      ...(result.fallback ? { fallback: true } : {}),
      ...(publicUrl ? { persisted: true } : {}),
    });
  } catch (error: unknown) {
    if (error instanceof GenerateImageInputError) {
      return respond(400, { error: error.message }, { provider: providerName ?? "unknown", assetKey: assetKeyName });
    }
    bbLog("error", "api.generate-image.exception", {
      requestId,
      error: serializeError(error),
    });
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return respond(500, { error: message }, { provider: providerName ?? "unknown", assetKey: assetKeyName });
  }
}
