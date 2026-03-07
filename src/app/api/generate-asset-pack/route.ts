import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import {
  AssetPackGenerationError,
  buildAssetPackRepairPrompt,
  buildExpectedAssetPackPaths,
  normalizeAssetPackFiles,
  parseAssetPackModelResponse,
} from "@/lib/services/generateAssetPack";
import type { AssetPackFile, BrandbookData } from "@/lib/types";
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

function deriveBrandIconNames(bb: BrandbookData, brandName: string, industry: string): string[] {
  const candidates: string[] = [];

  const logoSymbol = (bb.logo?.symbol ?? "").trim();
  const objects = (bb.keyVisual?.objects ?? []).slice(0, 6);
  const flora = (bb.keyVisual?.flora ?? []).slice(0, 3);
  const fauna = (bb.keyVisual?.fauna ?? []).slice(0, 4);
  const symbols = (bb.keyVisual?.symbols ?? []).slice(0, 4);
  const mascots = (bb.keyVisual?.mascots ?? []).map((m) => m.name ?? m.description).slice(0, 2);

  if (logoSymbol) candidates.push(logoSymbol);
  candidates.push(...symbols);
  candidates.push(...objects);
  candidates.push(...fauna);
  candidates.push(...flora);
  candidates.push(...mascots);

  const named = [...new Set(candidates.map(slugify).filter(Boolean))].slice(0, 12);

  const industryLower = industry.toLowerCase();
  const industryIconSets: [string, string[]][] = [
    ["bar",       ["cocktail-glass", "cerveja-bottle", "music-wave", "cheers-toast", "shot-glass"]],
    ["café",      ["coffee-cup", "coffee-bean", "steam-swirl", "chemex", "barista-hand"]],
    ["restaurante",["fork-knife", "chef-hat", "fire-flame", "plate-cover", "chopping-board"]],
    ["food",      ["fork-knife", "chef-hat", "fire-flame", "plate-cover", "spice-jar"]],
    ["moda",      ["hanger", "needle-thread", "scissors", "label-tag", "fabric-fold"]],
    ["tecnologia",["circuit-node", "cursor-spark", "waveform", "code-bracket", "pixel-grid"]],
    ["fitness",   ["dumbbell", "heartbeat-pulse", "flame-streak", "medal", "sprint-figure"]],
    ["beleza",    ["lipstick-tube", "bloom-petal", "mirror-oval", "brush-stroke", "perfume-bottle"]],
    ["música",    ["vinyl-record", "microphone-stand", "sound-wave", "music-note", "equalizer"]],
    ["viagem",    ["compass", "suitcase", "map-pin", "airplane-wing", "horizon-line"]],
  ];

  const matched = industryIconSets.find(([key]) => industryLower.includes(key));
  const fillIcons = matched ? matched[1] : [
    `${slugify(brandName)}-star`,
    `${slugify(brandName)}-spark`,
    `${slugify(brandName)}-diamond`,
    `${slugify(brandName)}-emblem`,
    `${slugify(brandName)}-mark`,
  ];

  let fillIdx = 0;
  while (named.length < 16 && fillIdx < fillIcons.length * 3) {
    const candidate = fillIcons[fillIdx % fillIcons.length] + (fillIdx >= fillIcons.length ? `-${Math.floor(fillIdx / fillIcons.length)}` : "");
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

═══════════════ ÍCONES — LISTA OBRIGATÓRIA (NÃO ALTERE OS NOMES) ═══════════════
Você DEVE gerar EXATAMENTE esses 16 arquivos de ícone, com esses PATHS EXATOS.
PROIBIDO usar home.svg, user.svg, settings.svg, search.svg, mail.svg, phone.svg, calendar.svg, ou qualquer ícone genérico de UI.
Os nomes abaixo já foram derivados do universo semântico de "${brandName}" — apenas desenhe o SVG para cada um:

${iconNames.map((n, i) => `${String(i + 1).padStart(2, "0")}. vectors/icons/${n}.svg  ← desenhe um ícone que represente "${n.replace(/-/g, " ")}"`).join("\n")}

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
      return normalizeAssetPackFiles(parsed, expectedPaths);
    }

    const firstRaw = await generateRaw(userPrompt);
    let normalized;
    let repairAttempted = false;

    try {
      normalized = finalizeRaw(firstRaw);
      if (!normalized.isComplete) {
        repairAttempted = true;
        const repairPrompt = buildAssetPackRepairPrompt({
          brandName,
          expected: expectedPaths,
          raw: firstRaw,
          issues: [
            ...normalized.issues,
            ...normalized.missingPaths.map((path) => `Faltou o path obrigatório ${path}.`),
            ...normalized.invalidSvgPaths.map((path) => `O path ${path} não contém SVG válido.`),
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
          error: `Asset Pack personalizado incompleto após validação${repairAttempted ? " e reparo" : ""}.\n${issueSummary.slice(0, 12).join("\n")}`,
        },
        {
          repairAttempted,
          filesCount: normalized.files.length,
          coverage: normalized.coverage,
        }
      );
    }

    return respond(
      200,
      { files: normalized.files as AssetPackFile[] },
      {
        repairAttempted,
        filesCount: normalized.files.length,
        coverage: normalized.coverage,
      }
    );
  } catch (error: unknown) {
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
