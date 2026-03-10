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
    const payload = await request.json() as GenerateImageInput;
    const { prompt, provider, assetKey, aspectRatio, referenceImages } = payload;

    providerName = provider;
    assetKeyName = assetKey;

    bbLog("debug", "api.generate-image.payload", {
      requestId,
      provider,
      assetKey,
      aspectRatio,
      promptChars: typeof prompt === "string" ? prompt.length : 0,
      referenceImagesCount: Array.isArray(referenceImages) ? referenceImages.length : 0,
    });

    if (!prompt || !provider) {
      return respond(400, { error: "prompt e provider são obrigatórios" }, { provider, assetKey });
    }

    const result = await generateImageWithProvider(payload);

    return respond(200, result, {
      provider: result.provider,
      assetKey,
      aspectRatio: result.aspectRatio,
      ...(result.fallback ? { fallback: true } : {}),
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
