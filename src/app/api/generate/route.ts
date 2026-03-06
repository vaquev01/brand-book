import { NextRequest } from "next/server";
import {
  generateBrandbook,
  GenerateInputError,
  parseGenerateInput,
} from "@/lib/services/generate";
import { bbLog, captureMem, diffMem, getRequestId, memToJson, serializeError } from "@/lib/serverLog";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const memBefore = captureMem();
  const encoder = new TextEncoder();
  const body = await request.json();
  const preview = body as {
    provider?: string;
    scope?: string;
    creativityLevel?: string;
    briefing?: string;
    externalUrls?: string[];
    referenceImages?: string[];
    logoImage?: string;
  };

  bbLog("info", "api.generate.start", {
    requestId,
    mem: memToJson(memBefore),
    provider: preview.provider ?? "openai",
    scope: preview.scope ?? "full",
    creativityLevel: preview.creativityLevel ?? "balanced",
    hasBriefing: !!preview.briefing,
    externalUrlsCount: Array.isArray(preview.externalUrls) ? preview.externalUrls.length : 0,
    referenceImagesCount: Array.isArray(preview.referenceImages) ? preview.referenceImages.length : 0,
    hasLogoImage: typeof preview.logoImage === "string" && preview.logoImage.length > 0,
  });

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...(data as object), requestId })}\n\n`));
      }

      try {
        const input = parseGenerateInput(body);
        const result = await generateBrandbook(input, (phase, pct) => {
          send({ type: "progress", phase, pct });
        });

        send({ type: "complete", data: result });
        controller.close();

        const memAfter = captureMem();
        bbLog("info", "api.generate.ok", {
          requestId,
          durationMs: Date.now() - startedAt,
          memDelta: diffMem(memBefore, memAfter),
        });
      } catch (error: unknown) {
        if (error instanceof GenerateInputError) {
          bbLog("warn", "api.generate.reject.invalid_input", {
            requestId,
            error: error.message,
          });
        }
        bbLog("error", "api.generate.exception", {
          requestId,
          durationMs: Date.now() - startedAt,
          error: serializeError(error),
          mem: memToJson(captureMem()),
        });
        send({ type: "error", error: error instanceof Error ? error.message : "Erro desconhecido" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "x-request-id": requestId,
    },
  });
}
