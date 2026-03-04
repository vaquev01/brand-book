import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { resolveGoogleTextModel } from "@/lib/googleModels";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { BrandbookSchemaLoose } from "@/lib/brandbookSchema";
import type { AssetPackFile, BrandbookData } from "@/lib/types";

export const runtime = "nodejs";

type TextProvider = "openai" | "gemini";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "/api/generate-asset-pack",
      method: "POST",
    },
    { status: 200 }
  );
}

function safeRelPath(path: string): string | null {
  const p = path.replace(/\\/g, "/").trim();
  if (!p) return null;
  if (p.startsWith("/") || p.startsWith("..") || p.includes("/../") || p.includes("\0")) return null;
  if (p.length > 180) return null;
  return p;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      brandbookData?: unknown;
      textProvider: TextProvider;
      openaiKey?: string;
      googleKey?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!body.brandbookData || !body.textProvider) {
      return NextResponse.json({ error: "brandbookData e textProvider são obrigatórios." }, { status: 400 });
    }

    const migrated = migrateBrandbook(body.brandbookData);
    const base = BrandbookSchemaLoose.safeParse(migrated);
    if (!base.success) {
      return NextResponse.json({ error: "brandbookData inválido." }, { status: 400 });
    }

    const brandbookData = base.data as unknown as BrandbookData;

    const systemPrompt =
      "Você é um Diretor de Arte e Designer Sênior. Gere arquivos de identidade visual PRONTOS para uso. " +
      "Retorne EXCLUSIVAMENTE JSON válido, sem markdown e sem texto fora do JSON.";

    const userPrompt = `Gere um asset pack com arquivos vetoriais e motion básicos, consistentes com o brandbook.

Saída obrigatória:
{
  "files": [
    { "path": "vectors/icons/<nome>.svg", "content": "<svg...>" },
    { "path": "vectors/elements/<nome>.svg", "content": "<svg...>" },
    { "path": "vectors/patterns/pattern.svg", "content": "<svg...>" },
    { "path": "motion/loading-spinner.svg", "content": "<svg...>" },
    { "path": "motion/success-check.svg", "content": "<svg...>" }
  ]
}

Regras:
- SVGs válidos e renderizáveis.
- Ícones: viewBox="0 0 24 24", stroke="currentColor", fill="none" (exceto quando necessário), stroke-linecap e stroke-linejoin arredondados.
- Elementos/padrões/motion: viewBox="0 0 512 512".
- Padrão: deve ser tileável (seamless) usando pattern.
- Motion: animações simples (SMIL ou CSS embutido no SVG) e leves.
- Não use fontes externas.
- Gere 16 ícones (home, user, settings, search, mail, phone, location, calendar, check, x, plus, minus, arrow-right, arrow-left, download, upload).
- Gere 8 elementos abstratos.

Brandbook (JSON):
${JSON.stringify(brandbookData, null, 2)}
`;

    let raw = "";

    if (body.textProvider === "gemini") {
      const apiKey = body.googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "GOOGLE_API_KEY não configurada." }, { status: 500 });
      const ai = new GoogleGenAI({ apiKey });
      const resp = await ai.models.generateContent({
        model: resolveGoogleTextModel(body.googleModel),
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.35,
          maxOutputTokens: 8192,
        },
      });
      raw = resp.text ?? "";
    } else {
      const apiKey = body.openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: body.openaiModel?.trim() || "gpt-4o",
        temperature: 0.35,
        max_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      raw = completion.choices[0]?.message?.content ?? "";
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "IA retornou JSON inválido." }, { status: 500 });
    }

    const filesRaw = (parsed as { files?: unknown }).files;
    if (!Array.isArray(filesRaw)) {
      return NextResponse.json({ error: "IA não retornou files." }, { status: 500 });
    }

    const files: AssetPackFile[] = [];
    const MAX_FILES = 40;
    const MAX_CONTENT_CHARS = 260_000;

    for (const f of filesRaw.slice(0, MAX_FILES)) {
      if (!f || typeof f !== "object") continue;
      const path = safeRelPath((f as { path?: unknown }).path as string);
      const content = (f as { content?: unknown }).content;
      if (!path || typeof content !== "string") continue;
      const trimmed = content.trim();
      if (!trimmed) continue;
      if (trimmed.length > MAX_CONTENT_CHARS) continue;
      files.push({ path, content: trimmed + (trimmed.endsWith("\n") ? "" : "\n") });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo válido foi gerado." }, { status: 500 });
    }

    return NextResponse.json({ files });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
