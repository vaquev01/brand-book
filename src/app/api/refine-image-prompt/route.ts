import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

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

    const systemPrompt = `Você é um especialista em prompt engineering para geração de imagens.

Tarefa: reescreva o prompt base para maximizar a qualidade do provider alvo, mantendo o MESMO conteúdo e intenção, porém com melhor estrutura, clareza e eficiência.

REGRAS GERAIS:
- Preserve: marca, contexto, marketing intent, composição, iluminação, paleta, restrições e proibições.
- Remova redundâncias e contradições.
- O prompt final deve ser direto e executável.
- Não invente novos fatos sobre a marca.

REGRAS POR PROVIDER:
- stability: use formato de tags/descritores (separado por vírgulas quando fizer sentido) e mantenha o bloco negativo no final como " --neg ...".
- dalle3: preferir linguagem natural. NÃO use "--neg".
- ideogram: preferir instruções de design gráfico. NÃO use "--neg".
- imagen: linguagem natural/imperativa. NÃO use "--neg".

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
      const resp = await ai.models.generateContent({
        model: googleModel?.trim() || "gemini-2.0-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.25,
          maxOutputTokens: 2048,
        },
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
