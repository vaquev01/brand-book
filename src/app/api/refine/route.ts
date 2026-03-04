import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { BrandbookSchemaV2, formatZodIssues } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { resolveGoogleTextModel } from "@/lib/googleModels";
import { fetchExternalReferences, formatExternalReferencesForPrompt } from "@/lib/externalReferences";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const {
      brandbook,
      instruction,
      externalUrls,
      openaiKey,
      googleKey,
      provider = "openai",
      openaiModel,
      googleModel,
    } = await request.json() as {
      brandbook: Record<string, unknown>;
      instruction: string;
      externalUrls?: string[];
      openaiKey?: string;
      googleKey?: string;
      provider?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!brandbook || !instruction) {
      return NextResponse.json({ error: "brandbook e instruction são obrigatórios." }, { status: 400 });
    }

    const systemPrompt = `Você é um Diretor de Arte Sênior e Estrategista de Marca. Você receberá um brandbook completo e uma instrução de refinamento. Aplique a instrução de forma cirúrgica e coerente em TODAS as seções afetadas. Mantenha o que está bom, melhore o que foi pedido. Sua saída DEVE SER EXCLUSIVAMENTE o JSON completo do brandbook atualizado — sem texto adicional, sem markdown.`;

    const MAX_EXTERNAL_URLS = 4;
    const safeExternalUrls = Array.isArray(externalUrls)
      ? externalUrls
          .filter((x) => typeof x === "string" && x.trim().length > 0)
          .map((x) => x.trim())
          .slice(0, MAX_EXTERNAL_URLS)
      : undefined;
    const externalRefs = safeExternalUrls && safeExternalUrls.length > 0
      ? await fetchExternalReferences(safeExternalUrls)
      : [];
    const externalRefsText = formatExternalReferencesForPrompt(externalRefs);

    const userPrompt = `Brandbook atual (JSON completo):
${JSON.stringify(brandbook, null, 2)}

Instrução de refinamento: "${instruction}"

${externalRefsText || ""}

Aplique esta instrução de forma precisa e coerente. Atualize todas as seções afetadas mantendo consistência sistêmica. Retorne o brandbook JSON COMPLETO e válido com as melhorias aplicadas.`;

    let result = "";

    if (provider === "gemini") {
      const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "GOOGLE_API_KEY não configurada." }, { status: 500 });
      const ai = new GoogleGenAI({ apiKey });
      const resp = await ai.models.generateContent({
        model: resolveGoogleTextModel(googleModel),
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.75,
          maxOutputTokens: 8192,
        },
      });
      result = resp.text ?? "";
    } else {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: openaiModel?.trim() || "gpt-4o",
        temperature: 0.75,
        max_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      result = completion.choices[0]?.message?.content ?? "";
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(result);
    } catch {
      return NextResponse.json({ error: "IA retornou JSON inválido." }, { status: 500 });
    }

    const migrated = migrateBrandbook(parsed);
    const validated = BrandbookSchemaV2.safeParse(migrated);

    if (!validated.success) {
      return NextResponse.json({
        error: "Brandbook refinado inválido:\n" + formatZodIssues(validated.error.issues),
      }, { status: 500 });
    }

    return NextResponse.json(validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
