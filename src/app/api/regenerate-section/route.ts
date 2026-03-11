import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { fetchExternalReferences, formatExternalReferencesForPrompt } from "@/lib/externalReferences";

export const runtime = "nodejs";

/** Sections where creative freedom is appropriate */
const CREATIVE_SECTIONS = new Set([
  "brandStory", "brandConcept", "verbalIdentity", "keyVisual",
  "socialMediaGuidelines", "imageGenerationBriefing",
]);

/** Sections that must stay structurally precise */
const STRUCTURAL_SECTIONS = new Set([
  "colors", "typography", "typographyScale", "designTokens",
  "productionGuidelines", "governance",
]);

/** Required top-level keys per section for basic validation */
const SECTION_REQUIRED_KEYS: Record<string, string[]> = {
  colors: ["primary", "secondary"],
  typography: [],
  typographyScale: [],
  logo: ["primary", "clearSpace", "incorrectUsages"],
  brandConcept: ["purpose", "mission", "vision", "values", "personality", "toneOfVoice"],
  verbalIdentity: ["tagline", "oneLiner", "brandVoiceTraits", "messagingPillars", "vocabulary", "doDont"],
  positioning: ["category", "targetMarket", "positioningStatement", "primaryDifferentiators"],
  keyVisual: ["elements", "photographyStyle"],
  applications: [],
  designTokens: ["spacing", "borderRadii"],
  productionGuidelines: ["fileNamingConvention", "handoffChecklist", "printSpecs", "digitalSpecs"],
};

function validateSectionShape(sectionKey: string, data: unknown): string | null {
  const required = SECTION_REQUIRED_KEYS[sectionKey];
  if (!required || required.length === 0) return null;
  if (!data || typeof data !== "object") return `Seção "${sectionKey}" retornou tipo inválido (esperado objeto).`;
  const obj = data as Record<string, unknown>;
  const missing = required.filter((k) => !(k in obj));
  if (missing.length > 0) return `Seção "${sectionKey}" faltando campos obrigatórios: ${missing.join(", ")}`;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const {
      brandbook,
      sectionKey,
      instruction,
      externalUrls,
      openaiKey,
      googleKey,
      provider = "openai",
      openaiModel,
      googleModel,
    } = await request.json() as {
      brandbook: Record<string, unknown>;
      sectionKey: string;
      instruction?: string;
      externalUrls?: string[];
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

    // Adaptive temperature: structural sections need precision, creative sections need freedom
    const temperature = STRUCTURAL_SECTIONS.has(sectionKey) ? 0.3
      : CREATIVE_SECTIONS.has(sectionKey) ? 0.8
      : 0.55;

    const systemPrompt = `Você é um Diretor de Arte Sênior e Estrategista de Marca com 20+ anos de experiência. Você receberá um brandbook existente e deve regenerar APENAS a seção solicitada. Sua saída deve ser EXCLUSIVAMENTE o JSON da seção solicitada, sem texto adicional, sem chaves externas. Mantenha total coerência com o restante do brandbook.

REGRAS DE COERÊNCIA OBRIGATÓRIAS:
- Use NOMES EXATOS de cores da paleta (ex: "Verde Amazônia" não "verde escuro")
- Use NOMES EXATOS de fontes (ex: "Inter Bold" não "fonte principal")
- Mantenha consistência com o arquétipo: ${(brandbook.brandConcept as Record<string, unknown>)?.brandArchetype ?? "N/A"}
- Mantenha consistência com o tom de voz: ${(brandbook.brandConcept as Record<string, unknown>)?.toneOfVoice ?? "N/A"}`;

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

    // Build rich context — include all dependent sections
    const contextSections: Record<string, unknown> = {
      brandConcept: brandbook.brandConcept,
      colors: brandbook.colors,
      typography: brandbook.typography,
      positioning: brandbook.positioning,
    };
    // Add extra context based on which section is being regenerated
    if (["applications", "keyVisual", "imageGenerationBriefing", "socialMediaGuidelines"].includes(sectionKey)) {
      contextSections.logo = brandbook.logo;
      contextSections.keyVisual = brandbook.keyVisual;
      contextSections.verbalIdentity = brandbook.verbalIdentity;
      contextSections.designTokens = brandbook.designTokens;
    }
    if (["verbalIdentity", "brandStory"].includes(sectionKey)) {
      contextSections.audiencePersonas = brandbook.audiencePersonas;
      contextSections.brandStory = brandbook.brandStory;
    }
    if (sectionKey === "imageGenerationBriefing") {
      contextSections.brandStory = brandbook.brandStory;
      contextSections.applications = brandbook.applications;
    }

    const contextBlock = Object.entries(contextSections)
      .filter(([k]) => k !== sectionKey)
      .map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`)
      .join("\n");

    const userPrompt = `Brandbook da marca "${brandName}" (${industry}).

Contexto do brandbook completo para manter coerência:
${contextBlock}

${externalRefsText || ""}

Seção a regenerar: "${sectionKey}"
Conteúdo atual:
${currentSection}

${instruction ? `Instrução específica: ${instruction}` : "Regenere esta seção com mais criatividade e detalhamento, mantendo coerência total com o brandbook."}

REGRAS:
1. Retorne SOMENTE o JSON da seção "${sectionKey}" — sem chaves wrapper, sem texto fora do JSON.
2. Mantenha TODOS os campos obrigatórios da seção.
3. Use nomes EXATOS de cores e fontes do contexto acima.`;

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
              temperature,
              maxOutputTokens: 8192,
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
        temperature,
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

    // If the AI wrapped it in an outer key, unwrap it
    const parsedObj = parsed as Record<string, unknown>;
    const section = parsedObj[sectionKey] ?? parsed;

    // Validate required fields
    const validationError = validateSectionShape(sectionKey, section);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 422 });
    }

    return NextResponse.json({ section });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
