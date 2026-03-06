import { NextRequest, NextResponse } from "next/server";
import {
  generateImageWithProvider,
  GenerateImageInput,
  GenerateImageInputError,
} from "@/lib/services/generateImage";
import { bbLog, captureMem, diffMem, getRequestId, memToJson, serializeError } from "@/lib/serverLog";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const memBefore = captureMem();
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
