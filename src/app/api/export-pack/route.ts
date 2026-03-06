import { NextRequest, NextResponse } from "next/server";
import {
  buildExportPackArchive,
  ExportPackInputError,
  parseExportPackInput,
} from "@/lib/services/exportPack";
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
    const body = await request.json();
    const payload = parseExportPackInput(body);

    bbLog("debug", "api.export-pack.payload", {
      requestId,
      assetsCount: payload.generatedAssets.length,
      uploadedAssetsCount: payload.uploadedAssets.length,
      assetPackFilesCount: payload.assetPackFiles.length,
    });

    const archive = await buildExportPackArchive(payload);

    const memAfter = captureMem();
    bbLog("info", "api.export-pack.ok", {
      requestId,
      status: 200,
      durationMs: Date.now() - startedAt,
      memDelta: diffMem(memBefore, memAfter),
      zipSize: archive.stats.zipSize,
      assetsCount: archive.stats.generatedAssetsCount,
      uploadedAssetsCount: archive.stats.uploadedAssetsCount,
      assetPackFilesCount: archive.stats.assetPackFilesCount,
    });

    return new NextResponse(new Uint8Array(archive.buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archive.slug}-brandbook-pack.zip"`,
        "x-request-id": requestId,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ExportPackInputError) {
      return respondJson(400, { error: error.message });
    }
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
