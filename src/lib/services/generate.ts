import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { BrandbookSchemaV2, formatZodIssues } from "@/lib/brandbookSchema";
import { fetchExternalReferences, formatExternalReferencesForPrompt } from "@/lib/externalReferences";
import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildChainStep1Prompt,
  buildChainStep2Prompt,
  buildChainStep3Prompt,
  buildChainSystemPrompt,
  compactStrategySummary,
  compactVisualSummary,
} from "@/lib/prompt";
import type { BrandbookData, CreativityLevel, GenerateScope } from "@/lib/types";

export type GenerateRequestPayload = {
  brandName?: string;
  industry?: string;
  briefing?: string;
  externalUrls?: string[];
  projectMode?: "new_brand" | "rebrand";
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
  projectMode: "new_brand" | "rebrand";
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
  [0, 4, "Analisando briefing e preparando IA..."],
  [4, 8, "Lendo referências externas..."],
  [8, 32, "Etapa 1/3 — Estratégia & Posicionamento..."],
  [32, 36, "Validando estratégia..."],
  [36, 58, "Etapa 2/3 — Identidade Visual..."],
  [58, 62, "Validando identidade visual..."],
  [62, 92, "Etapa 3/3 — Sistema, Aplicações & Image Briefing..."],
  [92, 96, "Montando brandbook completo..."],
  [96, 100, "Validando estrutura final..."],
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
    projectMode: body.projectMode || "new_brand",
    openaiKey: body.openaiKey,
    googleKey: body.googleKey,
    provider: body.provider || "openai",
    openaiModel: body.openaiModel,
    googleModel: body.googleModel,
    referenceImages,
    logoImage,
    scope: body.scope || "full",
    creativityLevel: body.creativityLevel || "balanced",
    intentionality: body.intentionality !== false,
  };
}

/**
 * Post-generation coherence enforcement.
 * Patches small structural issues the LLM may leave:
 * - Ensures typographyScale fontRoles reference actual typography keys
 * - Ensures imageGenerationBriefing.negativePrompt is never empty
 * - Ensures accessibility.contrastRules references actual palette color names
 */

function ensureArrayMin(obj: Record<string, unknown>, path: string[], min: number, factory: () => unknown) {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!cur || typeof cur !== "object") return;
    cur = cur[path[i]] as Record<string, unknown>;
  }
  const key = path[path.length - 1];
  if (!cur || typeof cur !== "object") return;
  if (!Array.isArray(cur[key])) cur[key] = [];
  const arr = cur[key] as unknown[];
  while (arr.length < min) arr.push(factory());
}

/**
 * Programmatically fixes the most common AI omissions/defects BEFORE schema
 * validation, so the repair LLM pass is less likely to be needed.
 */
function patchCommonDefects(data: Record<string, unknown>) {
  if (!data || typeof data !== "object") return;

  // colors: Required — AI sometimes nests under "colorPalette" or omits entirely
  if (!data.colors) {
    if (data.colorPalette && typeof data.colorPalette === "object") {
      data.colors = data.colorPalette;
      delete data.colorPalette;
    } else {
      data.colors = {
        primary: [
          { name: "Primary", hex: "#111827", rgb: "17, 24, 39", cmyk: "80, 68, 53, 54", usage: "Main brand color" },
          { name: "Primary Light", hex: "#374151", rgb: "55, 65, 81", cmyk: "70, 56, 43, 36", usage: "Secondary usage" },
        ],
        secondary: [
          { name: "Accent", hex: "#6366F1", rgb: "99, 102, 241", cmyk: "62, 58, 0, 0", usage: "Accent & CTAs" },
        ],
      };
    }
  }
  const colors = data.colors as Record<string, unknown[]>;
  if (colors && typeof colors === "object") {
    if (!Array.isArray(colors.primary)) colors.primary = [];
    if (!Array.isArray(colors.secondary)) colors.secondary = [];
    while (colors.primary.length < 2) {
      colors.primary.push({ name: `Color ${colors.primary.length + 1}`, hex: "#555555", rgb: "85,85,85", cmyk: "0,0,0,67", usage: "General use" });
    }
    while (colors.secondary.length < 1) {
      colors.secondary.push({ name: "Secondary", hex: "#888888", rgb: "136,136,136", cmyk: "0,0,0,47", usage: "Secondary use" });
    }
  }

  // applications: min 3
  ensureArrayMin(data, ["applications"], 3, () => ({
    type: "Social Media Post",
    description: "Template para posts de redes sociais",
    imagePlaceholder: "https://placehold.co/1080x1080/111827/ffffff?text=Social",
    imageKey: "social_instagram_post",
    dimensions: "1080×1080px",
  }));

  // socialMediaGuidelines.platforms[*].doList min 2, dontList min 2
  const smg = data.socialMediaGuidelines as Record<string, unknown> | undefined;
  if (smg?.platforms && Array.isArray(smg.platforms)) {
    for (const p of smg.platforms as Record<string, unknown>[]) {
      if (!Array.isArray(p.doList)) p.doList = [];
      const doList = p.doList as string[];
      while (doList.length < 2) doList.push(doList.length === 0 ? "Manter consistência visual com a paleta da marca" : "Usar tom de voz alinhado ao canal");
      if (!Array.isArray(p.dontList)) p.dontList = [];
      const dontList = p.dontList as string[];
      while (dontList.length < 2) dontList.push(dontList.length === 0 ? "Não usar cores fora da paleta institucional" : "Não publicar sem revisão de copy");
    }
  }

  // productionGuidelines.deliverables min 2
  if (data.productionGuidelines) {
    ensureArrayMin(data, ["productionGuidelines", "deliverables"], 2, () => ({
      asset: "Logo Pack",
      formats: ["SVG", "PNG", "PDF"],
      specs: "Versões em alta resolução para print e digital",
    }));
  }

  // audiencePersonas min 2
  ensureArrayMin(data, ["audiencePersonas"], 2, () => ({
    name: "Persona Secundária",
    role: "Decisor complementar",
    context: "Profissional que influencia decisões de compra",
    goals: ["Eficiência", "Redução de custos", "Inovação"],
    painPoints: ["Falta de tempo", "Complexidade de ferramentas"],
    objections: ["Custo", "Curva de aprendizado"],
    channels: ["LinkedIn", "Email"],
  }));
}

function enforceCoherence(data: BrandbookData): BrandbookData {
  // 1. Fix typographyScale fontRoles that don't match actual typography keys
  if (data.typographyScale && data.typography) {
    const validRoles = new Set<string>();
    if (data.typography.marketing) validRoles.add("marketing");
    if (data.typography.ui) validRoles.add("ui");
    if (data.typography.monospace) validRoles.add("monospace");
    if (data.typography.primary) validRoles.add("primary");
    if (data.typography.secondary) validRoles.add("secondary");

    for (const item of data.typographyScale) {
      if (!validRoles.has(item.fontRole)) {
        // Map to closest valid role
        if (validRoles.has("marketing") && /display|h1|h2/i.test(item.name)) {
          item.fontRole = "marketing";
        } else if (validRoles.has("ui")) {
          item.fontRole = "ui";
        } else if (validRoles.has("primary")) {
          item.fontRole = "primary";
        }
      }
    }
  }

  // 2. Ensure negativePrompt is populated from archetype if empty
  if (data.imageGenerationBriefing && !data.imageGenerationBriefing.negativePrompt?.trim()) {
    const archetype = (data.brandConcept?.brandArchetype ?? "").toLowerCase();
    const archetypeNegatives: Record<string, string> = {
      "sábio": "caótico, desordenado, superficial, infantil, barulhento, clip art, stock genérico",
      "sage": "caótico, desordenado, superficial, infantil, barulhento, clip art, stock genérico",
      "criador": "genérico, template, corporativo frio, sem personalidade, clip art, stock photo",
      "creator": "genérico, template, corporativo frio, sem personalidade, clip art, stock photo",
      "herói": "passivo, fraco, hesitante, desbotado, sem energia, estático",
      "hero": "passivo, fraco, hesitante, desbotado, sem energia, estático",
      "explorador": "confinado, claustrofóbico, estático, previsível, doméstico, repetitivo",
      "explorer": "confinado, claustrofóbico, estático, previsível, doméstico, repetitivo",
      "rebelde": "convencional, burocrático, suave, conformista, pasteurizado, corporate",
      "outlaw": "convencional, burocrático, suave, conformista, pasteurizado, corporate",
      "mago": "mundano, literal, sem mistério, flat, prosaico, genérico",
      "magician": "mundano, literal, sem mistério, flat, prosaico, genérico",
      "cuidador": "agressivo, frio, distante, impessoal, cortante, duro",
      "caregiver": "agressivo, frio, distante, impessoal, cortante, duro",
      "amante": "ascético, duro, industrial, descuidado, mecânico, sem textura",
      "lover": "ascético, duro, industrial, descuidado, mecânico, sem textura",
      "bobo": "sério demais, rígido, sem humor, austero, monótono, pesado",
      "jester": "sério demais, rígido, sem humor, austero, monótono, pesado",
      "inocente": "cínico, sombrio, complexo demais, ambíguo, pesado, dark",
      "innocent": "cínico, sombrio, complexo demais, ambíguo, pesado, dark",
      "cara comum": "elitista, pretensioso, inacessível, ostentoso, artificial",
      "everyman": "elitista, pretensioso, inacessível, ostentoso, artificial",
      "governante": "desorganizado, amador, improvisado, barato, descuidado",
      "ruler": "desorganizado, amador, improvisado, barato, descuidado",
    };

    let negPrompt = "watermark, text overlay, blurry, low quality, distorted, stock photo genérico, clip art";
    for (const [key, val] of Object.entries(archetypeNegatives)) {
      if (archetype.includes(key)) {
        negPrompt = val + ", " + negPrompt;
        break;
      }
    }
    data.imageGenerationBriefing.negativePrompt = negPrompt;
  }

  // 3. Ensure accessibility contrastRules references actual color names
  if (data.accessibility && data.colors?.primary?.length) {
    const colorNames = [
      ...data.colors.primary.map((c) => c.name),
      ...(data.colors.secondary ?? []).map((c) => c.name),
    ];
    const rules = data.accessibility.contrastRules;
    const hasColorRef = colorNames.some((name) => rules.includes(name));
    if (!hasColorRef && colorNames.length >= 2) {
      data.accessibility.contrastRules +=
        ` Verificar contraste específico: ${colorNames[0]} sobre branco (#FFFFFF), ${colorNames[1] ?? colorNames[0]} sobre ${colorNames[0]}.`;
    }
  }

  // 4. Cross-validate: applications must reference actual palette colors
  if (data.applications && data.colors?.primary?.length) {
    const allHexes = new Set([
      ...data.colors.primary.map((c) => c.hex.toLowerCase()),
      ...(data.colors.secondary ?? []).map((c) => c.hex.toLowerCase()),
    ]);
    const allColorNames = [
      ...data.colors.primary.map((c) => c.name),
      ...(data.colors.secondary ?? []).map((c) => c.name),
    ];
    for (const app of data.applications) {
      // If imagePlaceholder uses placehold.co, ensure it references real palette colors
      if (app.imagePlaceholder?.includes("placehold.co")) {
        const hexMatch = app.imagePlaceholder.match(/[0-9a-fA-F]{6}/g);
        if (hexMatch) {
          const usesRealColor = hexMatch.some((h) => allHexes.has(`#${h.toLowerCase()}`));
          if (!usesRealColor && allHexes.size > 0) {
            const primaryHex = data.colors.primary[0].hex.replace("#", "");
            app.imagePlaceholder = `https://placehold.co/800x600/${primaryHex}/ffffff?text=${encodeURIComponent(app.type)}`;
          }
        }
      }
      // Ensure artDirection references actual color names if empty/vague
      if (!app.artDirection?.trim() && allColorNames.length >= 2) {
        app.artDirection = `Fundo em ${allColorNames[0]}, acentos em ${allColorNames[1]}. Tipografia conforme hierarquia do brandbook.`;
      }
    }
  }

  // 5. Cross-validate: keyVisual elements must be concrete visual forms, not abstract concepts
  if (data.keyVisual?.elements) {
    const abstractPatterns = /^(inovação|confiança|qualidade|excelência|crescimento|sucesso|transformação|liderança|innovation|trust|quality|excellence|growth|success|transformation|leadership)$/i;
    data.keyVisual.elements = data.keyVisual.elements.map((el) => {
      if (abstractPatterns.test(el.trim())) {
        // Convert abstract concept to visual form suggestion
        const visualForms: Record<string, string> = {
          "inovação": "formas angulares ascendentes que sugerem inovação",
          "innovation": "ascending angular shapes suggesting innovation",
          "confiança": "arcos protetores concêntricos que transmitem confiança",
          "trust": "concentric protective arcs conveying trust",
          "qualidade": "geometria precisa com acabamento premium que evoca qualidade",
          "quality": "precise geometry with premium finish evoking quality",
          "excelência": "elementos com proporção áurea que expressam excelência",
          "excellence": "golden-ratio elements expressing excellence",
          "crescimento": "linhas orgânicas ascendentes que representam crescimento",
          "growth": "ascending organic lines representing growth",
          "sucesso": "formas em V ou chevrons que simbolizam conquista",
          "success": "V-shapes or chevrons symbolizing achievement",
          "transformação": "espirais ou formas metamórficas que sugerem transformação",
          "transformation": "spirals or metamorphic shapes suggesting transformation",
          "liderança": "formas triangulares ou em coroa que remetem à liderança",
          "leadership": "triangular or crown-like shapes referencing leadership",
        };
        return visualForms[el.trim().toLowerCase()] ?? `formas abstratas inspiradas em "${el}"`;
      }
      return el;
    });
  }

  // 6. Cross-validate: imageGenerationBriefing.colorMood must reference actual palette colors
  if (data.imageGenerationBriefing && data.colors?.primary?.length) {
    const allColorNames = [
      ...data.colors.primary.map((c) => `${c.name} (${c.hex})`),
      ...(data.colors.secondary ?? []).map((c) => `${c.name} (${c.hex})`),
    ];
    const mood = data.imageGenerationBriefing.colorMood;
    const hasAnyColorRef = data.colors.primary.some((c) => mood.includes(c.name));
    if (!hasAnyColorRef) {
      data.imageGenerationBriefing.colorMood = `${mood}. Paleta exata: ${allColorNames.join(", ")}.`;
    }
  }

  return data;
}

/**
 * Core LLM call abstraction — streams a single step and returns the text.
 * Supports both Gemini and OpenAI with images on first call.
 */
async function callLLM(opts: {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  useGemini: boolean;
  googleKey?: string;
  openaiKey?: string;
  googleModel?: string;
  openaiModel?: string;
  logoImage?: string;
  referenceImages?: string[];
  includeImages?: boolean;
  onProgress: (label: string, pct: number) => void;
  pctStart: number;
  pctEnd: number;
  phaseLabel: string;
}): Promise<string> {
  const {
    systemPrompt, userPrompt, temperature, useGemini,
    googleKey, openaiKey, googleModel, openaiModel,
    logoImage, referenceImages, includeImages,
    onProgress, pctStart, pctEnd, phaseLabel,
  } = opts;

  const estimatedChars = 20000;
  let fullContent = "";
  let lastPct = pctStart;

  const updatePct = () => {
    const pct = Math.min(pctEnd - 2, Math.round((fullContent.length / estimatedChars) * (pctEnd - pctStart - 2)) + pctStart);
    if (pct >= lastPct + 2) {
      onProgress(phaseLabel, pct);
      lastPct = pct;
    }
  };

  if (useGemini) {
    const apiKey = googleKey?.trim() || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada. Configure em ⚙ APIs.");

    const ai = new GoogleGenAI({ apiKey });
    const contentParts: unknown[] = [{ text: userPrompt }];

    if (includeImages && logoImage) {
      const match = logoImage.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
      if (match) contentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
    if (includeImages && referenceImages) {
      for (const imgDataUrl of referenceImages) {
        const match = imgDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
        if (match) contentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    }

    const geminiContents = contentParts.length === 1
      ? userPrompt
      : (contentParts as Parameters<typeof ai.models.generateContent>[0]["contents"]);

    onProgress(phaseLabel, pctStart);

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
        updatePct();
      }
    } catch {
      onProgress(phaseLabel, pctStart + 2);
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

    const userMsgContent: ContentPart[] = [{ type: "text", text: userPrompt }];
    const hasImages = includeImages && (!!logoImage || (referenceImages && referenceImages.length > 0));

    if (includeImages && logoImage) {
      userMsgContent.push({ type: "image_url", image_url: { url: logoImage, detail: "high" } });
    }
    if (includeImages && referenceImages) {
      for (const imgDataUrl of referenceImages) {
        userMsgContent.push({ type: "image_url", image_url: { url: imgDataUrl, detail: "high" } });
      }
    }

    onProgress(phaseLabel, pctStart);

    const openaiStream = await openai.chat.completions.create({
      model: resolvedModel,
      stream: true,
      temperature,
      max_tokens: 32768,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: hasImages ? userMsgContent : userPrompt },
      ],
    });

    for await (const chunk of openaiStream) {
      const text = chunk.choices[0]?.delta?.content || "";
      fullContent += text;
      updatePct();
    }
  }

  return fullContent;
}

/**
 * Parse step output, with repair if needed.
 */
async function parseStepOutput(
  rawContent: string,
  stepLabel: string,
  repairOpts: {
    systemPrompt: string;
    useGemini: boolean;
    googleKey?: string;
    openaiKey?: string;
    googleModel?: string;
    openaiModel?: string;
  }
): Promise<Record<string, unknown>> {
  let parsed = safeParseJson(rawContent);
  if (parsed != null && typeof parsed === "object") return parsed as Record<string, unknown>;

  // Attempt repair
  const repairPrompt =
    `Extraia e reescreva o JSON COMPLETO e válido da ${stepLabel} a partir do texto abaixo. ` +
    "Retorne SOMENTE o objeto JSON (sem markdown, sem texto fora do JSON).\n\n" +
    "TEXTO:\n" + rawContent.slice(0, 120000);

  let repairedContent = "";
  if (repairOpts.useGemini) {
    const apiKey = repairOpts.googleKey?.trim() || process.env.GOOGLE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const { value: response } = await withGoogleTextModelFallback({
      apiKey: apiKey!,
      preferredModel: repairOpts.googleModel,
      run: (model) =>
        ai.models.generateContent({
          model,
          contents: repairPrompt,
          config: {
            systemInstruction: repairOpts.systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 32768,
          },
        }),
    });
    repairedContent = response.text ?? "";
  } else {
    const apiKey = repairOpts.openaiKey?.trim() || process.env.OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey: apiKey! });
    const completion = await openai.chat.completions.create({
      model: repairOpts.openaiModel?.trim() || "gpt-4o",
      temperature: 0.2,
      max_tokens: 32768,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: repairOpts.systemPrompt },
        { role: "user", content: repairPrompt },
      ],
    });
    repairedContent = completion.choices[0]?.message?.content ?? "";
  }

  parsed = safeParseJson(repairedContent);
  if (parsed == null || typeof parsed !== "object") {
    throw new Error(`A IA retornou JSON inválido na ${stepLabel}. Tente novamente.`);
  }
  return parsed as Record<string, unknown>;
}

/** Per-step temperature offsets: Step 1 = more creative, Step 3 = more precise */
const STEP_TEMP_OFFSET: Record<number, number> = { 1: 0.05, 2: 0, 3: -0.08 };

/** Minimum expected top-level keys per chain step */
const STEP_EXPECTED_KEYS: Record<number, string[]> = {
  1: ["brandConcept", "positioning", "verbalIdentity"],
  2: ["logo", "colors", "typography"],
  3: ["keyVisual", "applications", "imageGenerationBriefing"],
};

/**
 * Validate that a step output has minimum expected keys. Throws if missing critical fields.
 */
function validateStepKeys(data: Record<string, unknown>, step: number, label: string): void {
  const expected = STEP_EXPECTED_KEYS[step] ?? [];
  const missing = expected.filter((k) => !(k in data) || data[k] == null);
  if (missing.length > 0) {
    throw new Error(`${label}: campos obrigatórios ausentes — ${missing.join(", ")}`);
  }
}

/**
 * Chain generation — 3 sequential LLM calls with compact summaries between steps.
 */
async function generateBrandbookChain(
  input: GenerateInput,
  onProgress: (phase: string, pct: number) => void,
  externalRefs: Awaited<ReturnType<typeof fetchExternalReferences>>,
  externalRefsText: string,
): Promise<BrandbookData> {
  const {
    brandName, industry, briefing, projectMode,
    openaiKey, googleKey, provider, openaiModel, googleModel,
    referenceImages, logoImage, scope, creativityLevel, intentionality,
  } = input;

  const baseTemp = CREATIVITY_TEMPERATURE[creativityLevel] ?? 0.72;
  const hasLogoImage = !!logoImage;
  const hasImages = Array.isArray(referenceImages) && referenceImages.length > 0;
  const useGemini = provider === "gemini";

  const repairOpts = {
    systemPrompt: buildSystemPrompt(scope, creativityLevel, intentionality),
    useGemini, googleKey, openaiKey, googleModel, openaiModel,
  };

  // ══════════════════════════════════════════════════════════════
  // STEP 1: Strategy & Positioning (temperature +0.05 for creativity)
  // ══════════════════════════════════════════════════════════════
  const step1Temp = Math.min(baseTemp + STEP_TEMP_OFFSET[1], 0.98);

  const step1UserPrompt = buildChainStep1Prompt(
    brandName, industry, briefing || "", projectMode, scope, creativityLevel,
    hasImages, hasLogoImage, externalRefs.length > 0, externalRefsText
  );

  const step1Raw = await callLLM({
    systemPrompt: buildChainSystemPrompt(1, scope, creativityLevel, intentionality),
    userPrompt: step1UserPrompt,
    temperature: step1Temp,
    useGemini, googleKey, openaiKey, googleModel, openaiModel,
    logoImage, referenceImages,
    includeImages: true,
    onProgress, pctStart: 8, pctEnd: 32,
    phaseLabel: "Etapa 1/3 — Estratégia & Posicionamento...",
  });

  onProgress("Validando estratégia...", 32);
  const step1Data = await parseStepOutput(step1Raw, "Etapa 1 (estratégia)", repairOpts);
  validateStepKeys(step1Data, 1, "Etapa 1");

  // Build compact summary for downstream steps (~2-3k chars instead of ~15-20k)
  const strategySummary = compactStrategySummary(step1Data);

  // ══════════════════════════════════════════════════════════════
  // STEP 2: Visual Identity (base temperature)
  // ══════════════════════════════════════════════════════════════
  const step2Temp = baseTemp + STEP_TEMP_OFFSET[2];

  const step2UserPrompt = buildChainStep2Prompt(
    strategySummary, creativityLevel, hasLogoImage, hasImages
  );

  const step2Raw = await callLLM({
    systemPrompt: buildChainSystemPrompt(2, scope, creativityLevel, intentionality),
    userPrompt: step2UserPrompt,
    temperature: step2Temp,
    useGemini, googleKey, openaiKey, googleModel, openaiModel,
    logoImage, referenceImages,
    includeImages: hasLogoImage || hasImages, // Re-analyze images for visual extraction
    onProgress, pctStart: 36, pctEnd: 58,
    phaseLabel: "Etapa 2/3 — Identidade Visual...",
  });

  onProgress("Validando identidade visual...", 58);
  const step2Data = await parseStepOutput(step2Raw, "Etapa 2 (visual)", repairOpts);
  validateStepKeys(step2Data, 2, "Etapa 2");

  // Build compact visual summary + extract full details for cross-referencing
  const visualSummary = compactVisualSummary(step2Data);
  const fullColorsJson = JSON.stringify(step2Data.colors ?? {});
  const fullTypographyJson = JSON.stringify(step2Data.typography ?? {});
  const fullLogoJson = JSON.stringify({
    clearSpace: (step2Data.logo as Record<string, unknown>)?.clearSpace,
    shapePsychology: (step2Data.logo as Record<string, unknown>)?.shapePsychology,
    evolutionaryStage: (step2Data.logo as Record<string, unknown>)?.evolutionaryStage,
    incorrectUsages: (step2Data.logo as Record<string, unknown>)?.incorrectUsages,
  });

  // ══════════════════════════════════════════════════════════════
  // STEP 3: System + Applications + Operations + Image Briefing
  // (temperature -0.08 for cross-referencing precision)
  // ══════════════════════════════════════════════════════════════
  const step3Temp = Math.max(baseTemp + STEP_TEMP_OFFSET[3], 0.3);

  const step3UserPrompt = buildChainStep3Prompt(
    strategySummary, visualSummary, fullColorsJson, fullTypographyJson, fullLogoJson
  );

  const step3Raw = await callLLM({
    systemPrompt: buildChainSystemPrompt(3, scope, creativityLevel, intentionality),
    userPrompt: step3UserPrompt,
    temperature: step3Temp,
    useGemini, googleKey, openaiKey, googleModel, openaiModel,
    includeImages: false,
    onProgress, pctStart: 62, pctEnd: 92,
    phaseLabel: "Etapa 3/3 — Sistema, Aplicações & Image Briefing...",
  });

  onProgress("Montando brandbook completo...", 92);
  const step3Data = await parseStepOutput(step3Raw, "Etapa 3 (sistema)", repairOpts);
  validateStepKeys(step3Data, 3, "Etapa 3");

  // ══════════════════════════════════════════════════════════════
  // MERGE all steps — Step 1 (strategy) + Step 2 (visual) + Step 3 (system)
  // ══════════════════════════════════════════════════════════════
  return {
    schemaVersion: "2.0",
    ...step1Data,
    ...step2Data,
    ...step3Data,
    brandName,
    industry,
  } as unknown as BrandbookData;
}

/**
 * Single-shot generation fallback — the original method for when chain fails.
 */
async function generateBrandbookSingleShot(
  input: GenerateInput,
  onProgress: (phase: string, pct: number) => void,
  externalRefs: Awaited<ReturnType<typeof fetchExternalReferences>>,
  externalRefsText: string,
): Promise<string> {
  const {
    brandName, industry, briefing, projectMode,
    openaiKey, googleKey, provider, openaiModel, googleModel,
    referenceImages, logoImage, scope, creativityLevel, intentionality,
  } = input;

  const temperature = CREATIVITY_TEMPERATURE[creativityLevel] ?? 0.72;
  const hasLogoImage = !!logoImage;
  const hasImages = Array.isArray(referenceImages) && referenceImages.length > 0;
  const systemPrompt = buildSystemPrompt(scope, creativityLevel, intentionality);

  const userPromptText =
    buildUserPrompt(
      brandName, industry, briefing || "", projectMode, scope,
      hasImages, undefined, hasLogoImage, externalRefs.length > 0
    ) + externalRefsText;

  return callLLM({
    systemPrompt,
    userPrompt: userPromptText,
    temperature,
    useGemini: provider === "gemini",
    googleKey, openaiKey, googleModel, openaiModel,
    logoImage, referenceImages,
    includeImages: true,
    onProgress, pctStart: 8, pctEnd: 90,
    phaseLabel: "Gerando brandbook completo...",
  });
}

export async function generateBrandbook(
  input: GenerateInput,
  onProgress: (phase: string, pct: number) => void
): Promise<BrandbookData> {
  const {
    brandName, industry, externalUrls, logoImage, scope, creativityLevel, intentionality,
    openaiKey, googleKey, provider, openaiModel, googleModel,
  } = input;

  const useGemini = provider === "gemini";

  // ── Fetch external references (shared by both chain and fallback) ──
  onProgress(!!logoImage ? "Analisando logo da marca..." : "Preparando geração...", 2);
  if (externalUrls && externalUrls.length > 0) {
    onProgress("Lendo referências externas...", 4);
  }
  const externalRefs = externalUrls && externalUrls.length > 0 ? await fetchExternalReferences(externalUrls) : [];
  const externalRefsText = formatExternalReferencesForPrompt(externalRefs);

  let merged: Record<string, unknown> | null = null;

  // ══════════════════════════════════════════════════════════════
  // Try chain generation (3 steps) first
  // ══════════════════════════════════════════════════════════════
  try {
    const chainResult = await generateBrandbookChain(input, onProgress, externalRefs, externalRefsText);
    merged = chainResult as unknown as Record<string, unknown>;
  } catch (chainError) {
    // ── Chain failed → fallback to single-shot ──
    console.error("[chain-generation] Chain failed, falling back to single-shot:", chainError);
    onProgress("Modo alternativo — gerando brandbook completo...", 8);

    const singleShotRaw = await generateBrandbookSingleShot(input, onProgress, externalRefs, externalRefsText);
    const parsed = safeParseJson(singleShotRaw);
    if (parsed == null) {
      throw new Error("A IA retornou JSON inválido. Tente novamente.");
    }
    merged = parsed as Record<string, unknown>;
    merged.brandName = brandName;
    merged.industry = industry;
  }

  // ══════════════════════════════════════════════════════════════
  // Validate & repair merged output
  // ══════════════════════════════════════════════════════════════
  onProgress("Validando estrutura final...", 96);

  // Programmatic patch for common AI omissions before schema validation
  patchCommonDefects(merged);

  const migrated1 = migrateBrandbook(merged);
  const validated1 = BrandbookSchemaV2.safeParse(migrated1);
  if (validated1.success) {
    const coherent = enforceCoherence(validated1.data);
    onProgress("Brandbook pronto! ✓", 100);
    return coherent;
  }

  // ── Repair pass ──
  onProgress("Corrigindo e refinando brandbook...", 97);

  const fullContent = JSON.stringify(merged);
  const fixPrompt =
    "Você gerou um JSON que NÃO passou na validação do schema. Reescreva o JSON COMPLETO e válido, " +
    "mantendo o máximo de conteúdo possível, mas corrigindo campos obrigatórios, tipos e arrays mínimos. " +
    "NÃO adicione texto fora do JSON.\n\nErros:\n" +
    formatZodIssues(validated1.error.issues) +
    "\n\nJSON atual (corrija):\n" +
    fullContent.slice(0, 120000);

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
      max_tokens: 32768,
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

  patchCommonDefects(fixedParsed as Record<string, unknown>);
  const migrated2 = migrateBrandbook(fixedParsed);
  const validated2 = BrandbookSchemaV2.safeParse(migrated2);
  if (!validated2.success) {
    throw new Error("Brandbook gerado mas inválido. Erros:\n" + formatZodIssues(validated2.error.issues));
  }

  const coherent2 = enforceCoherence(validated2.data);
  onProgress("Brandbook pronto! ✓", 100);
  return coherent2;
}
