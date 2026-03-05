import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { BrandbookSchemaLoose } from "@/lib/brandbookSchema";
import type { AssetPackFile, BrandbookData } from "@/lib/types";

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

function safeRelPath(path: string): string | null {
  const p = path.replace(/\\/g, "/").trim();
  if (!p) return null;
  if (p.startsWith("/") || p.startsWith("..") || p.includes("/../") || p.includes("\0")) return null;
  if (p.length > 180) return null;
  return p;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      brandbookData?: unknown;
      textProvider: TextProvider;
      openaiKey?: string;
      googleKey?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!body.brandbookData || !body.textProvider) {
      return NextResponse.json({ error: "brandbookData e textProvider são obrigatórios." }, { status: 400 });
    }

    const migrated = migrateBrandbook(body.brandbookData);
    const base = BrandbookSchemaLoose.safeParse(migrated);
    if (!base.success) {
      return NextResponse.json({ error: "brandbookData inválido." }, { status: 400 });
    }

    const brandbookData = base.data as unknown as BrandbookData;

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

═══════════════ INSTRUÇÃO CRÍTICA ═══════════════
NÃO gere ícones genéricos de UI (home, user, settings, etc.) — isso é PROIBIDO.
Em vez disso, DERIVE os ícones e elementos DO UNIVERSO SEMÂNTICO DA MARCA:
- Se a marca é de café → grão, xícara com vapor, folha de café, barista, colher, prensa, etc.
- Se é de tecnologia criativa → pixel, cursor, waveform, grid, nodo, etc.
- Se é de moda → ponto de costura, silhueta, agulha, botão, etc.
- Use os objetos, flora, fauna e símbolos listados acima como inspiração.
- Os ícones devem parecer que foram desenhados especificamente para "${brandName}".

═══════════════ REGRAS SVG ═══════════════
ÍCONES (16 arquivos):
- viewBox="0 0 24 24"
- Estilo coerente com: ${iconographyStyle || "linha clean com personalidade"}
- Use a cor primária ${primaryColor} no stroke ou fill quando apropriado (não apenas currentColor)
- stroke-linecap e stroke-linejoin devem refletir o border-radius da marca (${borderRadii || "round"})
- Cada ícone deve ter um nome descritivo derivado do universo da marca
- Misture: 8 ícones funcionais contextualizados + 8 ícones decorativos/expressivos da marca

ELEMENTOS ABSTRATOS (8 arquivos):
- viewBox="0 0 512 512"
- Elementos gráficos que poderiam aparecer em embalagens, posts, papelaria da marca
- Use a paleta completa: ${primaryColor}, ${secondaryColor}, ${accentColor}
- Inspire-se em: ${[flora, fauna, objects, symbols].filter(Boolean).join(" | ") || "formas geométricas da marca"}
- Cada elemento deve ser único e expressivo — parte do vocabulário visual da marca

PADRÃO SEAMLESS (1 arquivo):
- viewBox="0 0 400 400" com <defs><pattern> tileável
- Construído com motivos do universo da marca
- Cores: ${primaryColor} e ${secondaryColor} com transparências/opacidades variadas
- Deve parecer premium e on-brand

MOTION SVGs (2 arquivos — loading + success):
- viewBox="0 0 64 64"
- Animações SMIL leves (animateTransform, animate)
- loading-spinner: incorpore um elemento visual da marca na rotação (ex: o símbolo ${logoSymbol || "da marca"})
- success-check: celebração on-brand, não o check genérico verde

═══════════════ SAÍDA ═══════════════
{
  "files": [
    { "path": "vectors/icons/<nome-da-marca>.svg", "content": "<svg...>" },
    ... (16 ícones)
    { "path": "vectors/elements/<nome-expressivo>.svg", "content": "<svg...>" },
    ... (8 elementos)
    { "path": "vectors/patterns/pattern-${brandName.toLowerCase().replace(/\s+/g, "-")}.svg", "content": "<svg...>" },
    { "path": "motion/loading-spinner.svg", "content": "<svg...>" },
    { "path": "motion/success-check.svg", "content": "<svg...>" }
  ]
}

Brandbook completo para referência adicional:
${JSON.stringify({ brandName: bb.brandName, brandConcept: bb.brandConcept, keyVisual: bb.keyVisual, logo: bb.logo, colors: bb.colors, positioning: bb.positioning, motion: bb.motion }, null, 2)}
`;

    let raw = "";

    if (body.textProvider === "gemini") {
      const apiKey = body.googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "GOOGLE_API_KEY não configurada." }, { status: 500 });
      const ai = new GoogleGenAI({ apiKey });
      const { value: resp } = await withGoogleTextModelFallback({
        apiKey,
        preferredModel: body.googleModel,
        run: (model) =>
          ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature: 0.85,
              maxOutputTokens: 16384,
            },
          }),
      });
      raw = resp.text ?? "";
    } else {
      const apiKey = body.openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: body.openaiModel?.trim() || "gpt-4o",
        temperature: 0.75,
        max_tokens: 16384,
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

    const filesRaw = (parsed as { files?: unknown }).files;
    if (!Array.isArray(filesRaw)) {
      return NextResponse.json({ error: "IA não retornou files." }, { status: 500 });
    }

    const files: AssetPackFile[] = [];
    const MAX_FILES = 40;
    const MAX_CONTENT_CHARS = 260_000;

    for (const f of filesRaw.slice(0, MAX_FILES)) {
      if (!f || typeof f !== "object") continue;
      const path = safeRelPath((f as { path?: unknown }).path as string);
      const content = (f as { content?: unknown }).content;
      if (!path || typeof content !== "string") continue;
      const trimmed = content.trim();
      if (!trimmed) continue;
      if (trimmed.length > MAX_CONTENT_CHARS) continue;
      files.push({ path, content: trimmed + (trimmed.endsWith("\n") ? "" : "\n") });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo válido foi gerado." }, { status: 500 });
    }

    return NextResponse.json({ files });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
