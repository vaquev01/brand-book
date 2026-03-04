import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const {
      basePrompt,
      imageProvider,
      assetKey,
      textProvider,
      openaiKey,
      googleKey,
      openaiModel,
      googleModel,
    } = await request.json() as {
      basePrompt: string;
      imageProvider: string;
      assetKey?: string;
      textProvider: "openai" | "gemini";
      openaiKey?: string;
      googleKey?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!basePrompt || !imageProvider || !textProvider) {
      return NextResponse.json({ error: "basePrompt, imageProvider e textProvider são obrigatórios." }, { status: 400 });
    }

    const systemPrompt = `Você é um Diretor de Arte Sênior e especialista mundial em prompt engineering para geração de imagens com IA.

Tarefa: reescreva o prompt base para maximizar a qualidade do provider alvo, mantendo o MESMO conteúdo, intenção e alma emocional, porém com melhor estrutura, clareza e eficiência.

REGRAS GERAIS:
- Preserve: marca, contexto, marketing intent, composição, iluminação, paleta, restrições e proibições.
- Preserve literalmente os trechos de consistência/sistema visual, especialmente linhas/segmentos que começam com: "VISUAL_SYSTEM_ID:", "CONSISTENCY:", "PALETTE", "MOTIFS:", "HIERARCHY:".
- Preserve literalmente também: "STYLE_TREE:", "MASTER_LOGO:", "LOGO_REPLICATION:", "LOGO_SAFETY:", "ARCHETYPE:", "EMOTIONAL_CORE:", "BRAND_SOUL:", "VIEWER_JOURNEY:", "IDENTITY_ASSETS:", "STRUCTURED_PATTERNS:", "COMPOSITION_PHILOSOPHY:".
- Remova redundâncias e contradições.
- O prompt final deve ser direto e executável.
- Não invente novos fatos sobre a marca.

CHECKLIST DE QUALIDADE (o prompt refinado DEVE ter todos):
✓ Uma intenção visual clara (o que a imagem MOSTRA)
✓ Paleta de cores específica (hex ou nomes)
✓ Composição com regras espaciais (proporções, zonas, hierarquia)
✓ Iluminação com direção e temperatura
✓ Mood/emoção que o espectador deve SENTIR
✓ Bloco negativo coerente e sem conflitos com o positivo

INTEGRIDADE EMOCIONAL: Se o prompt original contém ARCHETYPE, EMOTIONAL_CORE ou BRAND_SOUL, o prompt refinado DEVE preservar essa energia emocional. Não sanitize a alma da marca.

REGRAS POR PROVIDER:
- stability: use formato de tags/descritores com pesos (tag:1.3). Estruture: qualidade → sujeito → estilo → composição → iluminação → cor → mood. Mantenha " --neg ..." no final. Máximo ~2000 chars positivo.
- dalle3: linguagem natural cinematográfica, descritiva e experiencial ("you are looking at..."). Estruture em parágrafos narrativos. Use "Do not include:" no final. Máximo ~3500 chars.
- ideogram: linguagem de design gráfico profissional. Se há texto na peça, instruções tipográficas precisas. Use "Do not include:" no final. Máximo ~1800 chars.
- imagen: linguagem natural/imperativa direta. Seja conciso mas completo. Use "Do not include, do not generate:" no final. Máximo ~1600 chars.

SAÍDA: retorne EXCLUSIVAMENTE um JSON válido no formato:
{ "prompt": "..." }`;

    const userPrompt = `Provider de imagem: ${imageProvider}
Asset key: ${assetKey ?? ""}

Prompt base:
${basePrompt}`;

    let raw = "";

    if (textProvider === "gemini") {
      const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "GOOGLE_API_KEY não configurada." }, { status: 500 });
      const ai = new GoogleGenAI({ apiKey });
      const { value: resp } = await withGoogleTextModelFallback({
        apiKey,
        preferredModel: googleModel,
        run: (model) =>
          ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature: 0.25,
              maxOutputTokens: 2048,
            },
          }),
      });
      raw = resp.text ?? "";
    } else {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: openaiModel?.trim() || "gpt-4o",
        temperature: 0.25,
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

    const trimmed = prompt.trim();
    const capped = imageProvider === "stability" ? trimmed.slice(0, 2400) : trimmed.slice(0, 4000);

    return NextResponse.json({ prompt: capped });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
