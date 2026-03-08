import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { BrandbookValidationError, validateLooseBrandbook } from "@/lib/brandbookValidation";
import {
  AssetPackGenerationError,
  buildAssetPackRepairPrompt,
  buildExpectedAssetPackPaths,
  parseAssetPackPlanResponse,
  type NormalizedAssetPackResult,
  normalizeAssetPackFiles,
  parseAssetPackModelResponse,
} from "@/lib/services/generateAssetPack";
import type { AssetPackFile, AssetPackPlan, BrandbookData } from "@/lib/types";
import { bbLog, captureMem, diffMem, getRequestId, memToJson, serializeError } from "@/lib/serverLog";

export const runtime = "nodejs";

type TextProvider = "openai" | "gemini";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "/api/generate-asset-pack",
      method: "POST",
    },
    { status: 200 }
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[áàãâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòõôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[ñ]/g, "n")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 32);
}

const FORBIDDEN_ICON_TOKENS = new Set([
  "http",
  "https",
  "www",
  "com",
  "placeholder",
  "undefined",
  "null",
  "temp",
  "sample",
  "mock",
  "image",
  "img",
  "icon",
  "icons",
  "asset",
  "assets",
  "vector",
  "svg",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "logo",
  "brand",
  "marca",
  "symbol",
  "simbolo",
]);

function cleanSemanticCandidate(value: string): string {
  const tokens = slugify(value)
    .split("-")
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .filter((token) => !FORBIDDEN_ICON_TOKENS.has(token))
    .filter((token) => !/^\d+$/.test(token));

  if (tokens.length === 0) return "";
  return tokens.slice(0, 3).join("-");
}

function collectSemanticCandidates(values: Array<string | null | undefined>, limit: number): string[] {
  const out: string[] = [];

  for (const value of values) {
    if (!value) continue;
    const cleaned = cleanSemanticCandidate(value);
    if (!cleaned) continue;
    if (!out.includes(cleaned)) out.push(cleaned);
    if (out.length >= limit) break;
  }

  return out;
}

function buildFallbackAssetPackPlan(params: {
  brandName: string;
  iconNames: string[];
  industry: string;
  flora: string;
  fauna: string;
  objects: string;
  symbols: string;
  patternDesc: string;
  motionDesc: string;
}): AssetPackPlan {
  const motifSource = [params.symbols, params.objects, params.flora, params.fauna]
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    creativeThesis: `Criar um sistema de assets próprio para ${params.brandName}, com leitura imediata de marca e zero aparência de biblioteca genérica.`,
    shapeLanguage: ["contornos distintivos", "ritmo proprietário", "formas com assinatura de marca"],
    coreMotifs: motifSource,
    avoidMotifs: ["ícones padrão de UI", "placeholders", "formas genéricas sem repertório da marca"],
    bucketDirectives: {
      icons: `Cada ícone deve traduzir um aspecto concreto do universo de ${params.brandName} em vez de símbolos genéricos do setor ${params.industry || "da marca"}.`,
      elements: `Elementos abstratos devem parecer peças premium de sistema visual derivadas de ${params.objects || params.symbols || params.brandName}.`,
      patterns: `O pattern deve ser seamless e nascer de ${params.patternDesc || params.brandName}, com ritmo reconhecível da marca.`,
      motion: `Os motions devem animar gestos ligados a ${params.motionDesc || params.brandName}, sem spinner circular genérico.`,
    },
    iconPlan: params.iconNames.map((name) => ({
      path: `vectors/icons/${name}.svg`,
      label: name.replace(/-/g, " "),
      concept: name.replace(/-/g, " "),
      rationale: `Representar ${name.replace(/-/g, " ")} como parte de uma família proprietária de ícones da marca.`,
    })),
  };
}

function deriveBrandIconNames(bb: BrandbookData, brandName: string, industry: string): string[] {
  const logoSymbol = (bb.logo?.symbol ?? "").trim();
  const objects = (bb.keyVisual?.objects ?? []).slice(0, 8);
  const flora = (bb.keyVisual?.flora ?? []).slice(0, 5);
  const fauna = (bb.keyVisual?.fauna ?? []).slice(0, 5);
  const symbols = (bb.keyVisual?.symbols ?? []).slice(0, 6);
  const mascots = (bb.keyVisual?.mascots ?? []).flatMap((m) => [m.name ?? "", m.description ?? ""]).slice(0, 4);
  const patterns = (bb.keyVisual?.structuredPatterns ?? []).flatMap((pattern) => [pattern.name, pattern.description]).slice(0, 4);

  const named = collectSemanticCandidates([
    logoSymbol,
    ...symbols,
    ...objects,
    ...fauna,
    ...flora,
    ...mascots,
    ...patterns,
  ], 12);

  const industryLower = industry.toLowerCase();
  const industryIconSets: [string, string[]][] = [
    ["bar", ["brinde", "coquetel", "balcao", "selo-da-casa", "ritmo", "chama", "espeto", "copo"]],
    ["café", ["grao", "xicara", "vapor", "coador", "torra", "barista"]],
    ["restaurante", ["prato", "fogo", "menu", "garfo-faca", "receita", "mesa"]],
    ["food", ["sabor", "ingrediente", "prato", "fogo", "cozinha", "tempero"]],
    ["moda", ["tecido", "etiqueta", "costura", "cabide", "dobra", "atelier"]],
    ["tecnologia", ["circuito", "malha-digital", "cursor", "pixel", "nodo", "sinal"]],
    ["fitness", ["energia", "pulso", "movimento", "resistencia", "medalha", "ritmo"]],
    ["beleza", ["petala", "espelho", "pincel", "frasco", "brilho", "ritual"]],
    ["música", ["vinil", "onda", "batida", "microfone", "equalizador", "palco"]],
    ["viagem", ["horizonte", "rota", "mala", "pin", "asa", "compasso"]],
  ];

  const matched = industryIconSets.find(([key]) => industryLower.includes(key));
  const fillIcons = matched ? matched[1] : [
    `${cleanSemanticCandidate(brandName) || "brand"}-selo`,
    `${cleanSemanticCandidate(brandName) || "brand"}-gesto`,
    `${cleanSemanticCandidate(brandName) || "brand"}-ritmo`,
    `${cleanSemanticCandidate(brandName) || "brand"}-materia`,
    `${cleanSemanticCandidate(brandName) || "brand"}-assinatura`,
  ];

  let fillIdx = 0;
  while (named.length < 16 && fillIdx < fillIcons.length * 3) {
    const candidate = cleanSemanticCandidate(fillIcons[fillIdx % fillIcons.length]) + (fillIdx >= fillIcons.length ? `-${Math.floor(fillIdx / fillIcons.length)}` : "");
    if (!named.includes(candidate)) named.push(candidate);
    fillIdx++;
  }

  return named.slice(0, 16);
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();
  const memBefore = captureMem();

  function respond(status: number, body: Record<string, unknown>, extra: Record<string, unknown> = {}) {
    const memAfter = captureMem();
    const durationMs = Date.now() - startedAt;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    bbLog(level, status >= 400 ? "api.generate-asset-pack.error" : "api.generate-asset-pack.ok", {
      requestId,
      status,
      durationMs,
      memDelta: diffMem(memBefore, memAfter),
      ...extra,
    });
    return NextResponse.json(body, { status, headers: { "x-request-id": requestId } });
  }

  bbLog("info", "api.generate-asset-pack.start", {
    requestId,
    mem: memToJson(memBefore),
  });

  try {
    const body = await request.json() as {
      brandbookData?: unknown;
      textProvider: TextProvider;
      openaiKey?: string;
      googleKey?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    bbLog("debug", "api.generate-asset-pack.payload", {
      requestId,
      textProvider: body.textProvider,
      hasBrandbookData: !!body.brandbookData,
    });

    if (!body.brandbookData || !body.textProvider) {
      return respond(400, { error: "brandbookData e textProvider são obrigatórios." });
    }

    const brandbookData = validateLooseBrandbook(body.brandbookData, {
      action: "gerar o Asset Pack",
      subject: "brandbookData",
    }) as BrandbookData;

    const bb = brandbookData;
    const primaryColor = bb.colors?.primary?.[0]?.hex ?? "#000000";
    const secondaryColor = bb.colors?.secondary?.[0]?.hex ?? "#666666";
    const accentColor = bb.colors?.primary?.[1]?.hex ?? bb.colors?.secondary?.[1]?.hex ?? "#999999";
    const personality = (bb.brandConcept?.personality ?? []).join(", ");
    const archetype = bb.brandConcept?.brandArchetype ?? "";
    const industry = bb.positioning?.category ?? "";
    const brandName = bb.brandName ?? "";
    const illustrationStyle = bb.keyVisual?.illustrations ?? "";
    const iconographyStyle = bb.keyVisual?.iconography ?? "";
    const flora = (bb.keyVisual?.flora ?? []).slice(0, 5).join(", ");
    const fauna = (bb.keyVisual?.fauna ?? []).slice(0, 5).join(", ");
    const objects = (bb.keyVisual?.objects ?? []).slice(0, 8).join(", ");
    const symbols = (bb.keyVisual?.symbols ?? []).slice(0, 6).join(", ");
    const mascots = (bb.keyVisual?.mascots ?? []).map((m) => m.name ?? m.description).slice(0, 3).join(", ");
    const patternDesc = bb.keyVisual?.structuredPatterns?.[0]?.description ?? bb.keyVisual?.patterns?.[0] ?? "";
    const toneOfVoice = bb.brandConcept?.toneOfVoice ?? "";
    const values = (bb.brandConcept?.values ?? []).slice(0, 4).join(", ");
    const tagline = bb.verbalIdentity?.tagline ?? "";
    const motionDesc = bb.motion?.microinteractions ?? bb.motion?.transitions ?? "";
    const borderRadii = (bb.designTokens?.borderRadii ?? []).join(", ");
    const logoSymbol = bb.logo?.symbol ?? "";

    const iconNames = deriveBrandIconNames(bb, brandName, industry);
    const patternSlug = slugify(brandName) || "brand";
    const expectedPaths = buildExpectedAssetPackPaths(iconNames, patternSlug);

    const systemPrompt =
      "Você é um Diretor de Arte e Brand Designer Sênior especializado em identidade visual. " +
      "Sua missão é criar ativos vetoriais que EXPRESSEM a alma da marca, não ícones genéricos de UI. " +
      "Cada SVG deve ser inconfundível — qualquer pessoa que veja deve reconhecer que pertence a ESTA marca específica. " +
      "Retorne EXCLUSIVAMENTE JSON válido, sem markdown e sem texto fora do JSON.";

    const planningPrompt = `Crie um PLANO CRIATIVO para o Asset Pack da marca "${brandName}" antes de desenhar qualquer SVG.

Retorne EXCLUSIVAMENTE JSON válido com esta estrutura:
{
  "creativeThesis": "...",
  "shapeLanguage": ["..."],
  "coreMotifs": ["..."],
  "avoidMotifs": ["..."],
  "bucketDirectives": {
    "icons": "...",
    "elements": "...",
    "patterns": "...",
    "motion": "..."
  },
  "iconPlan": [
    { "path": "vectors/icons/${iconNames[0] ?? "brand-icon"}.svg", "label": "...", "concept": "...", "rationale": "..." }
  ]
}

Regras obrigatórias:
- O plano deve orientar um sistema visual proprietário, não biblioteca genérica.
- Os 16 paths de ícone devem ser exatamente estes, na mesma ordem:
${expectedPaths.icons.map((path, index) => `${String(index + 1).padStart(2, "0")}. ${path}`).join("\n")}
- Não invente outros paths para ícones.
- Priorize repertório visual de marca, materialidade, gesto, composição e símbolos realmente distintivos.
- Evite totalmente placeholders, nomes contaminados, semântica de UI genérica e clichês.

Contexto da marca:
${JSON.stringify({ brandName: bb.brandName, brandConcept: bb.brandConcept, keyVisual: bb.keyVisual, logo: bb.logo, colors: bb.colors, positioning: bb.positioning, motion: bb.motion }, null, 2)}
`;

    let assetPlan = buildFallbackAssetPackPlan({
      brandName,
      iconNames,
      industry,
      flora,
      fauna,
      objects,
      symbols,
      patternDesc,
      motionDesc,
    });

    try {
      const planRaw = await generateRaw(planningPrompt);
      assetPlan = parseAssetPackPlanResponse(planRaw, expectedPaths);
    } catch (error: unknown) {
      bbLog("warn", "api.generate-asset-pack.plan-fallback", {
        requestId,
        error: serializeError(error),
      });
    }

    const userPrompt = `Gere um asset pack de identidade visual AUTÊNTICO e com PERSONALIDADE FORTE para a marca "${brandName}".

═══════════════ DNA DA MARCA ═══════════════
Marca: ${brandName}
Tagline: ${tagline}
Setor/Categoria: ${industry}
Arquétipo: ${archetype}
Personalidade: ${personality}
Valores: ${values}
Tom de voz: ${toneOfVoice}

═══════════════ LINGUAGEM VISUAL ═══════════════
Símbolo/logo: ${logoSymbol}
Estilo de ilustração: ${illustrationStyle}
Estilo de iconografia: ${iconographyStyle}
Flora (referências naturais): ${flora}
Fauna (referências animais): ${fauna}
Objetos do universo da marca: ${objects}
Símbolos/ícones da marca: ${symbols}
Mascotes: ${mascots}
Padrão visual: ${patternDesc}
Border-radii / forma visual: ${borderRadii}
Motion/microinterações: ${motionDesc}

═══════════════ PALETA ═══════════════
Primária: ${primaryColor}
Secundária: ${secondaryColor}
Acento: ${accentColor}

═══════════════ PLANO CRIATIVO OBRIGATÓRIO ═══════════════
Tese criativa: ${assetPlan.creativeThesis}
Linguagem formal: ${assetPlan.shapeLanguage.join(", ")}
Motivos centrais: ${assetPlan.coreMotifs.join(", ")}
Evitar: ${assetPlan.avoidMotifs.join(", ")}

Diretriz para ícones: ${assetPlan.bucketDirectives.icons}
Diretriz para elementos: ${assetPlan.bucketDirectives.elements}
Diretriz para pattern: ${assetPlan.bucketDirectives.patterns}
Diretriz para motion: ${assetPlan.bucketDirectives.motion}

═══════════════ ÍCONES — LISTA OBRIGATÓRIA (NÃO ALTERE OS NOMES) ═══════════════
Você DEVE gerar EXATAMENTE esses 16 arquivos de ícone, com esses PATHS EXATOS.
PROIBIDO usar home.svg, user.svg, settings.svg, search.svg, mail.svg, phone.svg, calendar.svg, ou qualquer ícone genérico de UI.
Os nomes abaixo já foram derivados do universo semântico de "${brandName}" — apenas desenhe o SVG para cada um, seguindo o plano criativo e a rationale específica:

${assetPlan.iconPlan.map((entry, i) => `${String(i + 1).padStart(2, "0")}. ${entry.path}  ← conceito: "${entry.concept}" | rationale: ${entry.rationale}`).join("\n")}

Cada ícone: viewBox="0 0 24 24", use ${primaryColor} como cor principal no stroke/fill, stroke-linecap="${borderRadii?.includes("0") ? "square" : "round"}", stroke-linejoin="${borderRadii?.includes("0") ? "miter" : "round"}", stroke-width="1.5".

═══════════════ ELEMENTOS ABSTRATOS — 8 ARQUIVOS ═══════════════
Inspire-se DIRETAMENTE em: ${[flora, fauna, objects, symbols].filter(Boolean).join(" | ") || "universo visual da marca"}
- viewBox="0 0 512 512"
- Use a paleta completa: ${primaryColor}, ${secondaryColor}, ${accentColor}
- Gráficos premium para embalagens, posts, papelaria — não ícones simples
- Cada elemento = uma composição artística do vocabulário visual da marca

═══════════════ PADRÃO SEAMLESS ═══════════════
Path: vectors/patterns/pattern-${patternSlug}.svg
- viewBox="0 0 400 400" com <defs><pattern id="tile"> tileável
- Motivos derivados de: ${[flora, fauna, objects].filter(Boolean).join(", ") || brandName}
- Cores: ${primaryColor} e ${secondaryColor} com opacidades variadas — premium e on-brand

═══════════════ MOTION SVGs ═══════════════
- motion/loading-spinner.svg: viewBox="0 0 64 64", animate um elemento de "${logoSymbol || brandName}", não círculo genérico
- motion/success-check.svg: viewBox="0 0 64 64", celebração on-brand com cor ${primaryColor}

═══════════════ SAÍDA JSON OBRIGATÓRIA ═══════════════
{
  "files": [
    { "path": "vectors/icons/${iconNames[0] ?? "brand-icon"}.svg", "content": "<svg viewBox=\\"0 0 24 24\\" ...>...</svg>" },
    ... (todos os 16 ícones da lista acima)
    { "path": "vectors/elements/element-01.svg", "content": "<svg viewBox=\\"0 0 512 512\\" ...>...</svg>" },
    ... (8 elementos)
    { "path": "vectors/patterns/pattern-${patternSlug}.svg", "content": "<svg viewBox=\\"0 0 400 400\\" ...>...</svg>" },
    { "path": "motion/loading-spinner.svg", "content": "<svg viewBox=\\"0 0 64 64\\" ...>...</svg>" },
    { "path": "motion/success-check.svg", "content": "<svg viewBox=\\"0 0 64 64\\" ...>...</svg>" }
  ]
}

Contexto do brandbook:
${JSON.stringify({ brandName: bb.brandName, brandConcept: bb.brandConcept, keyVisual: bb.keyVisual, logo: bb.logo, colors: bb.colors, positioning: bb.positioning, motion: bb.motion }, null, 2)}

Plano criativo em JSON:
${JSON.stringify(assetPlan, null, 2)}
`;

    async function generateRaw(prompt: string): Promise<string> {
      if (body.textProvider === "gemini") {
        const apiKey = body.googleKey?.trim() || process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada.");
        const ai = new GoogleGenAI({ apiKey });
        const { value: resp } = await withGoogleTextModelFallback({
          apiKey,
          preferredModel: body.googleModel,
          run: (model) =>
            ai.models.generateContent({
              model,
              contents: prompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                temperature: 0.85,
                maxOutputTokens: 16384,
              },
            }),
        });
        return resp.text ?? "";
      }

      const apiKey = body.openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.");
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: body.openaiModel?.trim() || "gpt-4o",
        temperature: 0.75,
        max_tokens: 16384,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      });
      return completion.choices[0]?.message?.content ?? "";
    }

    function finalizeRaw(raw: string) {
      const parsed = parseAssetPackModelResponse(raw);
      return normalizeAssetPackFiles(parsed, expectedPaths, {
        brandName,
        plan: assetPlan,
      });
    }

    const firstRaw = await generateRaw(userPrompt);
    let normalized: NormalizedAssetPackResult;
    let repairAttempted = false;

    try {
      normalized = finalizeRaw(firstRaw);
      if (!normalized.isComplete) {
        repairAttempted = true;
        const repairPrompt = buildAssetPackRepairPrompt({
          brandName,
          expected: expectedPaths,
          raw: firstRaw,
          plan: assetPlan,
          issues: [
            ...normalized.issues,
            ...normalized.missingPaths.map((path) => `Faltou o path obrigatório ${path}.`),
            ...normalized.invalidSvgPaths.map((path) => `O path ${path} não contém SVG válido.`),
            ...normalized.suspiciousPaths.map((path) => `O path ${path} contém nome contaminado ou suspeito.`),
          ],
        });
        const repairedRaw = await generateRaw(repairPrompt);
        normalized = finalizeRaw(repairedRaw);
      }
    } catch (error: unknown) {
      if (!(error instanceof AssetPackGenerationError)) throw error;
      repairAttempted = true;
      const repairPrompt = buildAssetPackRepairPrompt({
        brandName,
        expected: expectedPaths,
        raw: firstRaw,
        plan: assetPlan,
        issues: error.issues.length > 0 ? error.issues : [error.message],
      });
      const repairedRaw = await generateRaw(repairPrompt);
      normalized = finalizeRaw(repairedRaw);
    }

    if (!normalized.isComplete) {
      const issueSummary = [
        ...normalized.issues,
        ...normalized.missingPaths.slice(0, 8).map((path) => `Ausente: ${path}`),
        ...normalized.invalidSvgPaths.slice(0, 8).map((path) => `SVG inválido: ${path}`),
      ];
      return respond(
        500,
        {
          error: `Asset Pack personalizado reprovado após validação${repairAttempted ? " e reparo" : ""}.\n${issueSummary.slice(0, 12).join("\n")}`,
          plan: assetPlan,
          quality: normalized.quality,
          coverage: normalized.coverage,
        },
        {
          repairAttempted,
          filesCount: normalized.files.length,
          coverage: normalized.coverage,
          quality: normalized.quality,
        }
      );
    }

    return respond(
      200,
      {
        files: normalized.files as AssetPackFile[],
        plan: assetPlan,
        quality: normalized.quality,
        coverage: normalized.coverage,
      },
      {
        repairAttempted,
        filesCount: normalized.files.length,
        coverage: normalized.coverage,
        quality: normalized.quality,
      }
    );
  } catch (error: unknown) {
    if (error instanceof BrandbookValidationError) {
      return respond(400, { error: error.message });
    }
    bbLog("error", "api.generate-asset-pack.exception", {
      requestId,
      durationMs: Date.now() - startedAt,
      error: serializeError(error),
      mem: memToJson(captureMem()),
    });
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return respond(500, { error: message });
  }
}
