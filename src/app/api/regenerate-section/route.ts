import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

function resolveGoogleTextModel(model?: string): string {
  const DEFAULT_MODEL = "gemini-1.5-flash";
  const raw = model?.trim();
  const m = raw?.startsWith("models/") ? raw.slice("models/".length) : raw;
  if (!m) return DEFAULT_MODEL;
  const lower = m.toLowerCase();
  if (lower.startsWith("imagen")) return DEFAULT_MODEL;
  if (lower === "gemini-2.0-flash") return DEFAULT_MODEL;
  return m;
}

export async function POST(request: NextRequest) {
  try {
    const {
      brandbook,
      sectionKey,
      instruction,
      openaiKey,
      googleKey,
      provider = "openai",
      openaiModel,
      googleModel,
    } = await request.json() as {
      brandbook: Record<string, unknown>;
      sectionKey: string;
      instruction?: string;
      openaiKey?: string;
      googleKey?: string;
      provider?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!brandbook || !sectionKey) {
      return NextResponse.json({ error: "brandbook e sectionKey são obrigatórios." }, { status: 400 });
    }

    const brandName = brandbook.brandName as string;
    const industry = brandbook.industry as string;
    const currentSection = JSON.stringify(brandbook[sectionKey], null, 2);

    const systemPrompt = `Você é um Diretor de Arte Sênior e Estrategista de Marca. Você receberá um brandbook existente e deve regenerar APENAS a seção solicitada. Sua saída deve ser EXCLUSIVAMENTE o JSON da seção solicitada, sem texto adicional, sem chaves externas. Mantenha total coerência com o restante do brandbook.`;

    const userPrompt = `Brandbook da marca "${brandName}" (${industry}).

Contexto do brandbook completo para manter coerência:
- DNA: ${JSON.stringify(brandbook.brandConcept)}
- Cores: ${JSON.stringify((brandbook as Record<string, unknown>).colors)}
- Tipografia: ${JSON.stringify((brandbook as Record<string, unknown>).typography)}
- Posicionamento: ${JSON.stringify((brandbook as Record<string, unknown>).positioning)}

Seção a regenerar: "${sectionKey}"
Conteúdo atual:
${currentSection}

${instruction ? `Instrução específica: ${instruction}` : "Regenere esta seção com mais criatividade e detalhamento, mantendo coerência total com o brandbook."}

Retorne SOMENTE o JSON da seção "${sectionKey}" — sem chaves wrapper, sem texto fora do JSON.`;

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
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      });
      result = resp.text ?? "";
    } else {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: openaiModel?.trim() || "gpt-4o",
        temperature: 0.8,
        max_tokens: 4096,
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

    // If the AI wrapped it in an outer key, unwrap it
    const parsedObj = parsed as Record<string, unknown>;
    if (parsedObj[sectionKey]) {
      return NextResponse.json({ section: parsedObj[sectionKey] });
    }

    return NextResponse.json({ section: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
