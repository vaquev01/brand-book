import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";

export interface ConsistencyIssue {
  severity: "critical" | "warning" | "suggestion";
  section: string;
  issue: string;
  fix: string;
}

export interface ConsistencyReport {
  score: number;
  summary: string;
  issues: ConsistencyIssue[];
  strengths: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { brandbook, openaiKey, googleKey, provider = "openai", openaiModel, googleModel } =
      await request.json() as {
        brandbook: Record<string, unknown>;
        openaiKey?: string;
        googleKey?: string;
        provider?: string;
        openaiModel?: string;
        googleModel?: string;
      };

    if (!brandbook) {
      return NextResponse.json({ error: "brandbook é obrigatório." }, { status: 400 });
    }

    const systemPrompt = `Você é um auditor especialista em identidade de marca. Analise brandbooks e detecte inconsistências, problemas e oportunidades de melhoria. Seja específico, honesto e construtivo. Retorne EXCLUSIVAMENTE um JSON válido.`;

    const userPrompt = `Analise este brandbook da marca "${brandbook.brandName}" (${brandbook.industry}) e identifique:

1. Inconsistências entre seções (ex: tom de voz não refletido nos headlines, cor primária sem contraste WCAG, personalidade não refletida na tipografia)
2. Oportunidades de fortalecimento
3. Pontos fortes da identidade

Brandbook para análise:
${JSON.stringify(brandbook, null, 2)}

Retorne um JSON com esta estrutura exata:
{
  "score": <número de 0 a 100 representando a coerência geral da identidade>,
  "summary": "<resumo executivo de 2-3 frases sobre a saúde geral do brandbook>",
  "issues": [
    {
      "severity": "critical" | "warning" | "suggestion",
      "section": "<nome da seção>",
      "issue": "<descrição específica do problema>",
      "fix": "<como corrigir de forma específica>"
    }
  ],
  "strengths": ["<ponto forte 1>", "<ponto forte 2>", ...]
}

Seja específico. Mencione campos e valores reais do brandbook. Não dê feedback genérico.`;

    let result = "";

    if (provider === "gemini") {
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
              temperature: 0.4,
              maxOutputTokens: 4096,
            },
          }),
      });
      result = resp.text ?? "";
    } else {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: openaiModel?.trim() || "gpt-4o",
        temperature: 0.4,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      result = completion.choices[0]?.message?.content ?? "";
    }

    const parsed = JSON.parse(result) as ConsistencyReport;
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
