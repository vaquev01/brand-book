import { NextRequest } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { BrandbookSchemaV2, formatZodIssues } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import type { GenerateScope, CreativityLevel } from "@/lib/types";

export const runtime = "nodejs";

const CREATIVITY_TEMPERATURE: Record<CreativityLevel, number> = {
  conservative: 0.45,
  balanced: 0.72,
  creative: 0.92,
  experimental: 1.0,
};

const PROGRESS_PHASES: [number, number, string][] = [
  [0, 8, "Analisando briefing e preparando IA..."],
  [8, 18, "Definindo DNA e propósito da marca..."],
  [18, 30, "Criando posicionamento e personas..."],
  [30, 44, "Desenvolvendo identidade verbal e tagline..."],
  [44, 58, "Construindo identidade visual e logo..."],
  [58, 72, "Criando design system e componentes..."],
  [72, 84, "Finalizando aplicações da marca..."],
  [84, 92, "Compondo briefing de geração de imagens..."],
  [92, 98, "Validando estrutura do brandbook..."],
];

function getPhaseLabel(pct: number): string {
  for (const [start, end, label] of PROGRESS_PHASES) {
    if (pct >= start && pct < end) return label;
  }
  return "Finalizando...";
}

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

function stripCodeFences(text: string): string {
  const t = text.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (m ? m[1] : t).trim();
}

function extractFirstJsonObject(text: string): string {
  const t = stripCodeFences(text);
  const start = t.indexOf("{");
  if (start === -1) return t.trim();

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      depth++;
      continue;
    }
    if (ch === "}") {
      depth--;
      if (depth === 0) return t.slice(start, i + 1).trim();
    }
  }
  return t.slice(start).trim();
}

function safeParseJson(text: string): unknown | null {
  const candidates = [
    extractFirstJsonObject(text),
    stripCodeFences(text),
    text.trim(),
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      const parsed = JSON.parse(c);
      if (typeof parsed === "string") {
        try {
          return JSON.parse(parsed);
        } catch {
          return parsed;
        }
      }
      return parsed;
    } catch {
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const body = await request.json() as {
    brandName: string;
    industry: string;
    briefing?: string;
    openaiKey?: string;
    googleKey?: string;
    provider?: string;
    openaiModel?: string;
    googleModel?: string;
    referenceImages?: string[];
    logoImage?: string;
    scope?: GenerateScope;
    creativityLevel?: CreativityLevel;
    intentionality?: boolean;
  };

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
    logoImage,
    scope = "full",
    creativityLevel = "balanced",
    intentionality = false,
  } = body;

  const MAX_IMAGE_DATAURL_CHARS = 3_500_000;
  const MAX_REFERENCE_IMAGES = 6;

  const safeLogoImage = (typeof logoImage === "string" && logoImage.length > 0)
    ? logoImage
    : undefined;

  if (safeLogoImage && safeLogoImage.length > MAX_IMAGE_DATAURL_CHARS) {
    return new Response(
      "data: " + JSON.stringify({ type: "error", error: "Logo muito pesado para enviar. Use uma versão menor." }) + "\n\n",
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const safeReferenceImages = Array.isArray(referenceImages)
    ? referenceImages.filter((x) => typeof x === "string" && x.length > 0).slice(0, MAX_REFERENCE_IMAGES)
    : undefined;

  if (safeReferenceImages) {
    for (const img of safeReferenceImages) {
      if (img.length > MAX_IMAGE_DATAURL_CHARS) {
        return new Response(
          "data: " + JSON.stringify({ type: "error", error: "Uma das imagens de referência está muito pesada. Tente enviar versões menores." }) + "\n\n",
          { headers: { "Content-Type": "text/event-stream" } }
        );
      }
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        if (!brandName || !industry) {
          send({ type: "error", error: "brandName e industry são obrigatórios." });
          controller.close();
          return;
        }

        const temperature = CREATIVITY_TEMPERATURE[creativityLevel] ?? 0.72;
        const hasLogoImage = !!safeLogoImage;
        const hasImages = Array.isArray(safeReferenceImages) && safeReferenceImages.length > 0;
        const systemPrompt = buildSystemPrompt(scope, creativityLevel, intentionality);
        const userPromptText = buildUserPrompt(brandName, industry, briefing || "", scope, hasImages, undefined, hasLogoImage);
        const useGemini = provider === "gemini";
        const resolvedGoogleModel = useGemini ? resolveGoogleTextModel(googleModel) : "";
        const resolvedGoogleJsonModel = useGemini ? resolveGoogleTextModel("gemini-1.5-flash") : "";
        const ESTIMATED_CHARS = 13000;

        const firstPhase = hasLogoImage
          ? "Analisando logo da marca..."
          : "Preparando geração...";
        send({ type: "progress", phase: firstPhase, pct: 2 });

        let fullContent = "";

        if (useGemini) {
          const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
          if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada. Configure em ⚙ APIs.");

          const ai = new GoogleGenAI({ apiKey });
          const contentParts: unknown[] = [{ text: userPromptText }];
          if (hasLogoImage) {
            const m = safeLogoImage!.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
            if (m) contentParts.push({ inlineData: { mimeType: m[1], data: m[2] } });
          }
          if (hasImages) {
            for (const imgDataUrl of safeReferenceImages!) {
              const match = imgDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
              if (match) contentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }

          send({ type: "progress", phase: "Iniciando Gemini...", pct: 5 });

          const geminiContents = contentParts.length === 1
            ? userPromptText
            : (contentParts as Parameters<typeof ai.models.generateContent>[0]["contents"]);

          let lastPct = 5;
          try {
            const genStream = await ai.models.generateContentStream({
              model: resolvedGoogleModel,
              contents: geminiContents,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                temperature,
                maxOutputTokens: 8192,
              },
            });
            for await (const chunk of genStream) {
              const text = (chunk as { text?: string }).text ?? "";
              fullContent += text;
              const pct = Math.min(90, Math.round((fullContent.length / ESTIMATED_CHARS) * 85) + 5);
              if (pct >= lastPct + 2) {
                send({ type: "progress", phase: getPhaseLabel(pct), pct });
                lastPct = pct;
              }
            }
          } catch {
            send({ type: "progress", phase: "Gerando brandbook com Gemini...", pct: 20 });
            const resp = await ai.models.generateContent({
              model: resolvedGoogleModel,
              contents: geminiContents,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                temperature,
                maxOutputTokens: 8192,
              },
            });
            fullContent = resp.text ?? "";
          }
        } else {
          const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
          if (!apiKey) throw new Error("OPENAI_API_KEY não configurada. Configure em ⚙ APIs.");

          const openai = new OpenAI({ apiKey });
          const resolvedModel = openaiModel?.trim() || "gpt-4o";

          type ContentPart =
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string; detail: "high" } };
          const userMsgContent: ContentPart[] = [{ type: "text", text: userPromptText }];
          if (hasLogoImage) {
            userMsgContent.push({ type: "image_url", image_url: { url: safeLogoImage!, detail: "high" } });
          }
          if (hasImages) {
            for (const imgDataUrl of safeReferenceImages!) {
              userMsgContent.push({ type: "image_url", image_url: { url: imgDataUrl, detail: "high" } });
            }
          }

          send({ type: "progress", phase: "Iniciando GPT-4o...", pct: 5 });

          const openaiStream = await openai.chat.completions.create({
            model: resolvedModel,
            stream: true,
            temperature,
            max_tokens: 8192,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: (hasLogoImage || hasImages) ? userMsgContent : userPromptText },
            ],
          });

          let lastPct = 5;
          for await (const chunk of openaiStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            fullContent += text;
            const pct = Math.min(90, Math.round((fullContent.length / ESTIMATED_CHARS) * 85) + 5);
            if (pct >= lastPct + 2) {
              send({ type: "progress", phase: getPhaseLabel(pct), pct });
              lastPct = pct;
            }
          }
        }

        send({ type: "progress", phase: "Validando estrutura do brandbook...", pct: 92 });

        let parsed: unknown | null = safeParseJson(fullContent);

        if (parsed == null) {
          send({ type: "progress", phase: "Corrigindo formato do JSON...", pct: 93 });

          const repairPrompt =
            "Extraia e reescreva o JSON COMPLETO e válido do brandbook a partir do texto abaixo. " +
            "Retorne SOMENTE o objeto JSON (sem markdown, sem texto fora do JSON).\n\n" +
            "TEXTO:\n" +
            fullContent.slice(0, 120000);

          let repairedContent = "";
          if (useGemini) {
            const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
            const ai = new GoogleGenAI({ apiKey: apiKey! });
            const resp = await ai.models.generateContent({
              model: resolvedGoogleJsonModel,
              contents: repairPrompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                temperature: 0.2,
                maxOutputTokens: 8192,
              },
            });
            repairedContent = resp.text ?? "";
          } else {
            const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
            const openai = new OpenAI({ apiKey: apiKey! });
            const completion = await openai.chat.completions.create({
              model: openaiModel?.trim() || "gpt-4o",
              temperature: 0.2,
              max_tokens: 8192,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: repairPrompt },
              ],
            });
            repairedContent = completion.choices[0]?.message?.content ?? "";
          }

          parsed = safeParseJson(repairedContent);
          if (parsed == null) {
            throw new Error("A IA retornou JSON inválido. Tente novamente.");
          }
          fullContent = JSON.stringify(parsed);
        }

        const migrated1 = migrateBrandbook(parsed);
        const validated1 = BrandbookSchemaV2.safeParse(migrated1);

        if (validated1.success) {
          send({ type: "progress", phase: "Brandbook pronto! ✓", pct: 100 });
          send({ type: "complete", data: validated1.data });
          controller.close();
          return;
        }

        send({ type: "progress", phase: "Corrigindo e refinando brandbook...", pct: 94 });

        const fixPrompt =
          "Você gerou um JSON que NÃO passou na validação do schema. Reescreva o JSON COMPLETO e válido, " +
          "mantendo o máximo de conteúdo possível, mas corrigindo campos obrigatórios, tipos e arrays mínimos. " +
          "NÃO adicione texto fora do JSON.\n\nErros:\n" +
          formatZodIssues(validated1.error.issues) +
          "\n\nJSON atual (corrija):\n" +
          fullContent;

        let fixedContent = "";
        if (useGemini) {
          const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
          const ai = new GoogleGenAI({ apiKey: apiKey! });
          const resp = await ai.models.generateContent({
            model: resolvedGoogleJsonModel,
            contents: fixPrompt,
            config: {
              systemInstruction: buildSystemPrompt(scope, creativityLevel, intentionality),
              responseMimeType: "application/json",
              temperature: 0.2,
              maxOutputTokens: 8192,
            },
          });
          fixedContent = resp.text ?? "";
        } else {
          const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
          const openai = new OpenAI({ apiKey: apiKey! });
          const completion = await openai.chat.completions.create({
            model: openaiModel?.trim() || "gpt-4o",
            temperature: 0.2,
            max_tokens: 8192,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: buildSystemPrompt(scope, creativityLevel, intentionality) },
              { role: "user", content: fixPrompt },
            ],
          });
          fixedContent = completion.choices[0]?.message?.content ?? "";
        }

        let fixedParsed: unknown;
        try {
          fixedParsed = JSON.parse(fixedContent);
        } catch {
          throw new Error("A IA retornou JSON inválido na correção.");
        }

        const migrated2 = migrateBrandbook(fixedParsed);
        const validated2 = BrandbookSchemaV2.safeParse(migrated2);

        if (!validated2.success) {
          throw new Error(
            "Brandbook gerado mas inválido. Erros:\n" + formatZodIssues(validated2.error.issues)
          );
        }

        send({ type: "progress", phase: "Brandbook pronto! ✓", pct: 100 });
        send({ type: "complete", data: validated2.data });
        controller.close();
      } catch (error: unknown) {
        console.error("Erro na geração:", error);
        send({ type: "error", error: error instanceof Error ? error.message : "Erro desconhecido" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
