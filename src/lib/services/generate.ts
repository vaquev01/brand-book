import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { BrandbookSchemaV2, formatZodIssues } from "@/lib/brandbookSchema";
import { fetchExternalReferences, formatExternalReferencesForPrompt } from "@/lib/externalReferences";
import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import type { BrandbookData, CreativityLevel, GenerateScope } from "@/lib/types";

export type GenerateRequestPayload = {
  brandName?: string;
  industry?: string;
  briefing?: string;
  externalUrls?: string[];
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

export type GenerateInput = {
  brandName: string;
  industry: string;
  briefing: string;
  externalUrls?: string[];
  openaiKey?: string;
  googleKey?: string;
  provider: string;
  openaiModel?: string;
  googleModel?: string;
  referenceImages?: string[];
  logoImage?: string;
  scope: GenerateScope;
  creativityLevel: CreativityLevel;
  intentionality: boolean;
};

export class GenerateInputError extends Error {}

const CREATIVITY_TEMPERATURE: Record<CreativityLevel, number> = {
  conservative: 0.45,
  balanced: 0.72,
  creative: 0.92,
  experimental: 0.95,
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

const MAX_IMAGE_DATAURL_CHARS = 3_500_000;
const MAX_REFERENCE_IMAGES = 6;
const MAX_EXTERNAL_URLS = 4;

function getPhaseLabel(pct: number): string {
  for (const [start, end, label] of PROGRESS_PHASES) {
    if (pct >= start && pct < end) return label;
  }
  return "Finalizando...";
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (match ? match[1] : trimmed).trim();
}

function extractFirstJsonObject(text: string): string {
  const trimmed = stripCodeFences(text);
  const start = trimmed.indexOf("{");
  if (start === -1) return trimmed.trim();

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
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
      if (depth === 0) return trimmed.slice(start, i + 1).trim();
    }
  }

  return trimmed.slice(start).trim();
}

export function safeParseJson(text: string): unknown | null {
  const candidates = [extractFirstJsonObject(text), stripCodeFences(text), text.trim()];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === "string") {
        try {
          return JSON.parse(parsed);
        } catch {
          return parsed;
        }
      }
      return parsed;
    } catch {}
  }
  return null;
}

export function parseGenerateInput(body: GenerateRequestPayload): GenerateInput {
  const brandName = typeof body.brandName === "string" ? body.brandName : "";
  const industry = typeof body.industry === "string" ? body.industry : "";
  if (!brandName || !industry) {
    throw new GenerateInputError("brandName e industry são obrigatórios.");
  }

  const logoImage = typeof body.logoImage === "string" && body.logoImage.length > 0 ? body.logoImage : undefined;
  if (logoImage && logoImage.length > MAX_IMAGE_DATAURL_CHARS) {
    throw new GenerateInputError("Logo muito pesado para enviar. Use uma versão menor.");
  }

  const referenceImages = Array.isArray(body.referenceImages)
    ? body.referenceImages.filter((item) => typeof item === "string" && item.length > 0).slice(0, MAX_REFERENCE_IMAGES)
    : undefined;

  if (referenceImages) {
    for (const image of referenceImages) {
      if (image.length > MAX_IMAGE_DATAURL_CHARS) {
        throw new GenerateInputError("Uma das imagens de referência está muito pesada. Tente enviar versões menores.");
      }
    }
  }

  const externalUrls = Array.isArray(body.externalUrls)
    ? body.externalUrls
        .filter((item) => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim())
        .slice(0, MAX_EXTERNAL_URLS)
    : undefined;

  return {
    brandName,
    industry,
    briefing: body.briefing || "",
    externalUrls,
    openaiKey: body.openaiKey,
    googleKey: body.googleKey,
    provider: body.provider || "openai",
    openaiModel: body.openaiModel,
    googleModel: body.googleModel,
    referenceImages,
    logoImage,
    scope: body.scope || "full",
    creativityLevel: body.creativityLevel || "balanced",
    intentionality: body.intentionality || false,
  };
}

export async function generateBrandbook(
  input: GenerateInput,
  onProgress: (phase: string, pct: number) => void
): Promise<BrandbookData> {
  const {
    brandName,
    industry,
    briefing,
    externalUrls,
    openaiKey,
    googleKey,
    provider,
    openaiModel,
    googleModel,
    referenceImages,
    logoImage,
    scope,
    creativityLevel,
    intentionality,
  } = input;

  const temperature = CREATIVITY_TEMPERATURE[creativityLevel] ?? 0.72;
  const hasLogoImage = !!logoImage;
  const hasImages = Array.isArray(referenceImages) && referenceImages.length > 0;
  const systemPrompt = buildSystemPrompt(scope, creativityLevel, intentionality);
  const useGemini = provider === "gemini";
  const estimatedChars = 25000;

  onProgress(hasLogoImage ? "Analisando logo da marca..." : "Preparando geração...", 2);

  if (externalUrls && externalUrls.length > 0) {
    onProgress("Lendo referências externas...", 4);
  }

  const externalRefs = externalUrls && externalUrls.length > 0 ? await fetchExternalReferences(externalUrls) : [];
  const externalRefsText = formatExternalReferencesForPrompt(externalRefs);
  const userPromptText =
    buildUserPrompt(brandName, industry, briefing || "", scope, hasImages, undefined, hasLogoImage) + externalRefsText;

  let fullContent = "";

  if (useGemini) {
    const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada. Configure em ⚙ APIs.");

    const ai = new GoogleGenAI({ apiKey });
    const contentParts: unknown[] = [{ text: userPromptText }];

    if (hasLogoImage) {
      const match = logoImage!.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
      if (match) contentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }

    if (hasImages) {
      for (const imgDataUrl of referenceImages!) {
        const match = imgDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
        if (match) contentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    }

    onProgress("Iniciando Gemini...", 5);

    const geminiContents = contentParts.length === 1
      ? userPromptText
      : (contentParts as Parameters<typeof ai.models.generateContent>[0]["contents"]);

    let lastPct = 5;
    try {
      const { value: genStream } = await withGoogleTextModelFallback({
        apiKey,
        preferredModel: googleModel,
        run: (model) =>
          ai.models.generateContentStream({
            model,
            contents: geminiContents,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature,
              maxOutputTokens: 32768,
            },
          }),
      });
      for await (const chunk of genStream) {
        const text = (chunk as { text?: string }).text ?? "";
        fullContent += text;
        const pct = Math.min(90, Math.round((fullContent.length / estimatedChars) * 85) + 5);
        if (pct >= lastPct + 2) {
          onProgress(getPhaseLabel(pct), pct);
          lastPct = pct;
        }
      }
    } catch {
      onProgress("Gerando brandbook com Gemini...", 20);
      const { value: response } = await withGoogleTextModelFallback({
        apiKey,
        preferredModel: googleModel,
        run: (model) =>
          ai.models.generateContent({
            model,
            contents: geminiContents,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature,
              maxOutputTokens: 32768,
            },
          }),
      });
      fullContent = response.text ?? "";
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
      userMsgContent.push({ type: "image_url", image_url: { url: logoImage!, detail: "high" } });
    }
    if (hasImages) {
      for (const imgDataUrl of referenceImages!) {
        userMsgContent.push({ type: "image_url", image_url: { url: imgDataUrl, detail: "high" } });
      }
    }

    onProgress("Iniciando GPT-4o...", 5);

    const openaiStream = await openai.chat.completions.create({
      model: resolvedModel,
      stream: true,
      temperature,
      max_tokens: 16384,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: hasLogoImage || hasImages ? userMsgContent : userPromptText },
      ],
    });

    let lastPct = 5;
    for await (const chunk of openaiStream) {
      const text = chunk.choices[0]?.delta?.content || "";
      fullContent += text;
      const pct = Math.min(90, Math.round((fullContent.length / estimatedChars) * 85) + 5);
      if (pct >= lastPct + 2) {
        onProgress(getPhaseLabel(pct), pct);
        lastPct = pct;
      }
    }
  }

  onProgress("Validando estrutura do brandbook...", 92);

  let parsed = safeParseJson(fullContent);
  if (parsed == null) {
    onProgress("Corrigindo formato do JSON...", 93);
    const repairPrompt =
      "Extraia e reescreva o JSON COMPLETO e válido do brandbook a partir do texto abaixo. " +
      "Retorne SOMENTE o objeto JSON (sem markdown, sem texto fora do JSON).\n\n" +
      "TEXTO:\n" +
      fullContent.slice(0, 120000);

    let repairedContent = "";
    if (useGemini) {
      const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const { value: response } = await withGoogleTextModelFallback({
        apiKey: apiKey!,
        preferredModel: googleModel,
        run: (model) =>
          ai.models.generateContent({
            model,
            contents: repairPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature: 0.2,
              maxOutputTokens: 32768,
            },
          }),
      });
      repairedContent = response.text ?? "";
    } else {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      const openai = new OpenAI({ apiKey: apiKey! });
      const completion = await openai.chat.completions.create({
        model: openaiModel?.trim() || "gpt-4o",
        temperature: 0.2,
        max_tokens: 16384,
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
    onProgress("Brandbook pronto! ✓", 100);
    return validated1.data;
  }

  onProgress("Corrigindo e refinando brandbook...", 94);

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
    const { value: response } = await withGoogleTextModelFallback({
      apiKey: apiKey!,
      preferredModel: googleModel,
      run: (model) =>
        ai.models.generateContent({
          model,
          contents: fixPrompt,
          config: {
            systemInstruction: buildSystemPrompt(scope, creativityLevel, intentionality),
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 32768,
          },
        }),
    });
    fixedContent = response.text ?? "";
  } else {
    const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey: apiKey! });
    const completion = await openai.chat.completions.create({
      model: openaiModel?.trim() || "gpt-4o",
      temperature: 0.2,
      max_tokens: 16384,
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
    throw new Error("Brandbook gerado mas inválido. Erros:\n" + formatZodIssues(validated2.error.issues));
  }

  onProgress("Brandbook pronto! ✓", 100);
  return validated2.data;
}
