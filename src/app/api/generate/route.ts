import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { BrandbookSchemaV2, formatZodIssues } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import type { GenerateScope, CreativityLevel } from "@/lib/types";

const CREATIVITY_TEMPERATURE: Record<CreativityLevel, number> = {
  conservative: 0.45,
  balanced: 0.72,
  creative: 0.92,
  experimental: 1.0,
};

export async function POST(request: NextRequest) {
  try {
    const {
      brandName,
      industry,
      briefing,
      openaiKey,
      googleKey,
      provider = "openai",
      openaiModel,
      googleModel,
      referenceImages,
      scope = "full",
      creativityLevel = "balanced",
      intentionality = false,
    } = await request.json() as {
      brandName: string;
      industry: string;
      briefing?: string;
      openaiKey?: string;
      googleKey?: string;
      provider?: string;
      openaiModel?: string;
      googleModel?: string;
      referenceImages?: string[];
      scope?: GenerateScope;
      creativityLevel?: CreativityLevel;
      intentionality?: boolean;
    };

    if (!brandName || !industry) {
      return NextResponse.json(
        { error: "brandName e industry são obrigatórios." },
        { status: 400 }
      );
    }

    const temperature = CREATIVITY_TEMPERATURE[creativityLevel] ?? 0.72;
    const systemPrompt = buildSystemPrompt(scope, creativityLevel, intentionality);
    const useGemini = provider === "gemini";
    const hasImages = Array.isArray(referenceImages) && referenceImages.length > 0;

    let generateOnce: (userContent: string, temperature?: number) => Promise<string | null | undefined>;

    if (useGemini) {
      const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "GOOGLE_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho para configurar." },
          { status: 500 }
        );
      }
      const ai = new GoogleGenAI({ apiKey });
      generateOnce = async (userContent: string, temp = temperature) => {
        const contentParts: unknown[] = [{ text: userContent }];
        if (hasImages) {
          for (const imgDataUrl of referenceImages!) {
            const match = imgDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
            if (match) {
              contentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }
        }
        const resp = await ai.models.generateContent({
          model: googleModel?.trim() || "gemini-2.0-flash",
          contents: contentParts.length === 1 ? userContent : (contentParts as Parameters<typeof ai.models.generateContent>[0]["contents"]),
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: temp,
            maxOutputTokens: 8192,
          },
        });
        return resp.text;
      };
    } else {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OPENAI_API_KEY não configurada. Clique em ⚙ APIs no cabeçalho para configurar." },
          { status: 500 }
        );
      }
      const openai = new OpenAI({ apiKey });
      const resolvedOpenAIModel = openaiModel?.trim() || "gpt-4o";
      generateOnce = async (userContent: string, temp = temperature) => {
        type ContentPart =
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string; detail: "high" } };
        const userMessageContent: ContentPart[] = [{ type: "text", text: userContent }];
        if (hasImages) {
          for (const imgDataUrl of referenceImages!) {
            userMessageContent.push({ type: "image_url", image_url: { url: imgDataUrl, detail: "high" } });
          }
        }
        const completion = await openai.chat.completions.create({
          model: resolvedOpenAIModel,
          temperature: temp,
          max_tokens: 8192,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: hasImages ? userMessageContent : userContent },
          ],
        });
        return completion.choices[0]?.message?.content;
      };
    }

    const content = await generateOnce(buildUserPrompt(brandName, industry, briefing || "", scope));
    if (!content) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo." },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "A IA retornou JSON inválido." },
        { status: 500 }
      );
    }

    const migrated1 = migrateBrandbook(parsed);
    const validated1 = BrandbookSchemaV2.safeParse(migrated1);
    if (validated1.success) {
      return NextResponse.json(validated1.data);
    }

    const fixPrompt =
      "Você gerou um JSON que NÃO passou na validação do schema. Reescreva o JSON COMPLETO e válido, " +
      "mantendo o máximo de conteúdo possível, mas corrigindo campos obrigatórios, tipos e arrays mínimos. " +
      "NÃO adicione texto fora do JSON.\n\n" +
      "Erros de validação:\n" +
      formatZodIssues(validated1.error.issues) +
      "\n\nJSON atual (corrija):\n" +
      content;

    const fixedContent = await generateOnce(fixPrompt, 0.2);
    if (!fixedContent) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo ao tentar corrigir o JSON." },
        { status: 500 }
      );
    }

    let fixedParsed: unknown;
    try {
      fixedParsed = JSON.parse(fixedContent);
    } catch {
      return NextResponse.json(
        { error: "A IA retornou JSON inválido na correção." },
        { status: 500 }
      );
    }

    const migrated2 = migrateBrandbook(fixedParsed);
    const validated2 = BrandbookSchemaV2.safeParse(migrated2);
    if (!validated2.success) {
      return NextResponse.json(
        {
          error:
            "Brandbook gerado mas inválido/incompleto. Erros:\n" +
            formatZodIssues(validated2.error.issues),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(validated2.data);
  } catch (error: unknown) {
    console.error("Erro na geração:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
