import { NextRequest, NextResponse } from "next/server";
import { bytesToBase64, isPrivateHostname } from "@/lib/common";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string };
    const rawUrl = body.url?.trim();
    if (!rawUrl) {
      return NextResponse.json({ error: "url é obrigatório" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: "url inválida" }, { status: 400 });
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return NextResponse.json({ error: "Apenas http/https" }, { status: 400 });
    }
    if (isPrivateHostname(parsed.hostname)) {
      return NextResponse.json({ error: "Hostname não permitido" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "brandbook-app/1.0",
      },
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      return NextResponse.json({ error: `Falha ao baixar imagem: ${res.status}` }, { status: 400 });
    }

    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "URL não parece ser uma imagem" }, { status: 400 });
    }

    const len = res.headers.get("content-length");
    if (len) {
      const n = Number(len);
      if (Number.isFinite(n) && n > 12 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem muito grande" }, { status: 400 });
      }
    }

    const ab = await res.arrayBuffer();
    if (ab.byteLength > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Imagem muito grande" }, { status: 400 });
    }

    const b64 = bytesToBase64(new Uint8Array(ab));
    const dataUrl = `data:${contentType};base64,${b64}`;

    return NextResponse.json({ dataUrl, contentType });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
