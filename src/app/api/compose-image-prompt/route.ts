import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import type { BrandbookData } from "@/lib/types";

export const runtime = "nodejs";

function resolveGoogleTextModel(model?: string): string {
  const DEFAULT_MODEL = "gemini-1.5-flash";
  const raw = model?.trim();
  const m = raw?.startsWith("models/") ? raw.slice("models/".length) : raw;
  if (!m) return DEFAULT_MODEL;
  const lower = m.toLowerCase();
  if (lower.startsWith("imagen")) return DEFAULT_MODEL;
  if (lower.includes("image-preview")) return DEFAULT_MODEL;
  if (lower === "gemini-2.0-flash") return DEFAULT_MODEL;
  return m;
}

function compactBrandContext(brandbook: BrandbookData): string {
  const brandName = brandbook.brandName ?? "";
  const industry = brandbook.industry ?? "";

  const purpose = brandbook.brandConcept?.purpose ?? "";
  const personality = Array.isArray(brandbook.brandConcept?.personality)
    ? brandbook.brandConcept.personality.slice(0, 6).join(", ")
    : "";
  const tone = brandbook.brandConcept?.toneOfVoice ?? "";

  const primaryColors = (brandbook.colors?.primary ?? [])
    .slice(0, 3)
    .map((c) => `${c.name} ${c.hex}`)
    .join(" · ");
  const secondaryColors = (brandbook.colors?.secondary ?? [])
    .slice(0, 4)
    .map((c) => `${c.name} ${c.hex}`)
    .join(" · ");

  const displayFont = brandbook.typography?.marketing?.name ?? brandbook.typography?.primary?.name ?? "";
  const bodyFont = brandbook.typography?.ui?.name ?? brandbook.typography?.secondary?.name ?? "";

  const visualStyle = brandbook.imageGenerationBriefing?.visualStyle ?? "";
  const colorMood = brandbook.imageGenerationBriefing?.colorMood ?? "";
  const compositionNotes = brandbook.imageGenerationBriefing?.compositionNotes ?? "";
  const moodKeywords = (brandbook.imageGenerationBriefing?.moodKeywords ?? []).slice(0, 8).join(", ");
  const artisticReferences = brandbook.imageGenerationBriefing?.artisticReferences ?? "";
  const avoidElements = brandbook.imageGenerationBriefing?.avoidElements ?? "";
  const negativePrompt = brandbook.imageGenerationBriefing?.negativePrompt ?? "";

  const logoStyleGuide = brandbook.imageGenerationBriefing?.logoStyleGuide ?? "";
  const patternStyle = brandbook.imageGenerationBriefing?.patternStyle ?? "";

  const elements = (brandbook.keyVisual?.elements ?? []).slice(0, 6).join(" | ");

  return [
    `Brand: ${brandName} (${industry})`,
    purpose ? `Purpose: ${purpose}` : "",
    personality ? `Personality: ${personality}` : "",
    tone ? `Tone of voice: ${tone}` : "",
    displayFont || bodyFont ? `Typography: display=${displayFont || "-"}; body=${bodyFont || "-"}` : "",
    primaryColors ? `Primary colors: ${primaryColors}` : "",
    secondaryColors ? `Secondary colors: ${secondaryColors}` : "",
    elements ? `Key visual elements: ${elements}` : "",
    visualStyle ? `Visual style: ${visualStyle}` : "",
    colorMood ? `Color mood: ${colorMood}` : "",
    compositionNotes ? `Composition: ${compositionNotes}` : "",
    moodKeywords ? `Mood keywords: ${moodKeywords}` : "",
    artisticReferences ? `Artistic references: ${artisticReferences}` : "",
    logoStyleGuide ? `Logo style guide: ${logoStyleGuide}` : "",
    patternStyle ? `Pattern style: ${patternStyle}` : "",
    avoidElements ? `Avoid elements: ${avoidElements}` : "",
    negativePrompt ? `Global negative prompt: ${negativePrompt}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brandbook?: BrandbookData;
      brief?: string;
      imageProvider?: string;
      aspectRatio?: string;
      textProvider?: "openai" | "gemini";
      openaiKey?: string;
      googleKey?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!body.brandbook) {
      return NextResponse.json({ error: "brandbook é obrigatório" }, { status: 400 });
    }
    const brief = body.brief?.trim();
    if (!brief) {
      return NextResponse.json({ error: "brief é obrigatório" }, { status: 400 });
    }
    const imageProvider = body.imageProvider?.trim();
    if (!imageProvider) {
      return NextResponse.json({ error: "imageProvider é obrigatório" }, { status: 400 });
    }

    const textProvider = body.textProvider ?? "openai";
    const ratio = (body.aspectRatio?.trim() || "1:1") as string;

    const systemPrompt = `Você é um Diretor de Arte Sênior e especialista em prompt engineering para geração de imagens.

Tarefa: Dado o contexto do brandbook e uma intenção curta do usuário, gere um prompt FINAL e completo para gerar uma imagem com altíssima qualidade.

Regras:
- Integre SEMPRE o brandbook (paleta, tipografia, estilo visual, mood, composição, elementos) de forma coerente.
- Não invente fatos sobre a marca. Se faltar detalhe, complete com escolhas genéricas mas compatíveis com o brandbook (não com o setor).
- Não escreva textos legíveis na imagem, a menos que o usuário peça explicitamente.
- Obedeça o aspect ratio solicitado.

Regras por provider:
- stability: use tags/descritores e inclua um bloco negativo ao final no formato " --neg ...".
- dalle3: linguagem natural, sem "--neg".
- ideogram: linguagem de design gráfico; se o usuário quiser texto, inclua instrução clara de texto; sem "--neg".
- imagen: linguagem natural/imperativa, sem "--neg".

Saída: retorne EXCLUSIVAMENTE um JSON válido no formato { "prompt": "..." }.`;

    const userPrompt = `IMAGE PROVIDER: ${imageProvider}
ASPECT RATIO: ${ratio}

BRANDBOOK CONTEXT:
${compactBrandContext(body.brandbook)}

USER INTENT (short):
${brief}`;

    let raw = "";

    if (textProvider === "gemini") {
      const apiKey = body.googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "GOOGLE_API_KEY não configurada." }, { status: 500 });
      const ai = new GoogleGenAI({ apiKey });
      const resp = await ai.models.generateContent({
        model: resolveGoogleTextModel(body.googleModel),
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.55,
          maxOutputTokens: 2048,
        },
      });
      raw = resp.text ?? "";
    } else {
      const apiKey = body.openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: body.openaiModel?.trim() || "gpt-4o",
        temperature: 0.55,
        max_tokens: 2048,
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

    const prompt = (parsed as { prompt?: string }).prompt;
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "IA não retornou campo prompt." }, { status: 500 });
    }

    return NextResponse.json({ prompt: prompt.trim().slice(0, 4000) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
