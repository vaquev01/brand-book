import { NextRequest } from "next/server";
import {
  generateBrandbook,
  GenerateInputError,
  type GenerateRequestPayload,
  parseGenerateInput,
} from "@/lib/services/generate";
import { bbLog, captureMem, diffMem, getRequestId, memToJson, serializeError } from "@/lib/serverLog";
import { checkRateLimit } from "@/lib/rateLimit";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const memBefore = captureMem();
  const encoder = new TextEncoder();

  // Resolve user plan for rate limiting
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
    return new Response(JSON.stringify({ error: "Rate limit exceeded", remaining: rl.remaining, reset: rl.reset }), {
      status: 429,
      headers: { "Content-Type": "application/json", "X-RateLimit-Limit": String(rl.limit), "X-RateLimit-Remaining": String(rl.remaining) },
    });
  }

  const body = await request.json() as GenerateRequestPayload;

  bbLog("info", "api.generate.start", {
    requestId,
    mem: memToJson(memBefore),
    provider: body.provider ?? "openai",
    scope: body.scope ?? "full",
    creativityLevel: body.creativityLevel ?? "balanced",
    hasBriefing: !!body.briefing,
    externalUrlsCount: Array.isArray(body.externalUrls) ? body.externalUrls.length : 0,
    referenceImagesCount: Array.isArray(body.referenceImages) ? body.referenceImages.length : 0,
    hasLogoImage: typeof body.logoImage === "string" && body.logoImage.length > 0,
    projectMode: body.projectMode ?? "new_brand",
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
