import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { BrandbookValidationError, validateLooseBrandbook } from "@/lib/brandbookValidation";
import { generateBrandIcon, brandColorsToRecraft, type RecraftSubstyle } from "@/lib/services/recraftProvider";
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
  "http", "https", "www", "com", "co", "org", "net", "io",
  "placeholder", "placehol", "undefined", "null", "temp", "sample", "mock",
  "image", "img", "icon", "icons", "asset", "assets", "vector", "vectors",
  "svg", "png", "jpg", "jpeg", "gif", "webp", "avif",
  "logo", "brand", "marca", "symbol", "simbolo",
  "file", "upload", "download", "blob", "base64", "data",
  "default", "generic", "test", "example", "lorem",
  "400x400", "300x300", "200x200", "100x100",
]);

/** Returns true if a raw string looks like a URL or path, not a semantic concept */
function looksLikeUrlOrPath(value: string): boolean {
  return /^https?:|^www\.|\.com|\.co\b|\.svg|\.png|\.jpg|placehol|\/\/|%[0-9a-f]{2}/i.test(value);
}

function cleanSemanticCandidate(value: string): string {
  // Reject anything that looks like a URL/path before even trying
  if (looksLikeUrlOrPath(value)) return "";

  const tokens = slugify(value)
    .split("-")
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .filter((token) => !FORBIDDEN_ICON_TOKENS.has(token))
    .filter((token) => !/^\d+$/.test(token))
    // Also reject hex-looking tokens (color codes, hashes)
    .filter((token) => !/^[0-9a-f]{6,}$/i.test(token));

  if (tokens.length === 0) return "";
  return tokens.slice(0, 3).join("-");
}

function collectSemanticCandidates(values: Array<string | null | undefined>, limit: number): string[] {
  const out: string[] = [];

  for (const value of values) {
    if (!value) continue;
    if (looksLikeUrlOrPath(value)) continue;
    const cleaned = cleanSemanticCandidate(value);
    if (!cleaned) continue;
    if (cleaned.length < 3) continue; // Too short to be meaningful
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
    creativeThesis: `Criar um sistema de assets exclusivo para ${params.brandName} que transmita a alma da marca em cada traço. Nenhum asset deve parecer vindo de uma biblioteca — todos devem ser reconhecíveis como parte de ${params.brandName}.`,
    shapeLanguage: ["contornos com personalidade própria", "ritmo visual proprietário", "formas derivadas do universo da marca", "acabamentos consistentes entre si"],
    coreMotifs: motifSource.length > 0 ? motifSource : [params.brandName.toLowerCase(), "essência", "identidade", "expressão"],
    avoidMotifs: ["ícones de UI genéricos (home, user, settings, search)", "placeholders", "formas geométricas puras sem significado", "clichês do setor", "SVGs com menos de 3 primitivas"],
    bucketDirectives: {
      icons: `Cada ícone deve traduzir um aspecto CONCRETO e VISUAL do universo de ${params.brandName}. Use traços com personalidade, não linhas genéricas. Cada ícone deve ter no mínimo 2 paths/primitivas SVG e parecer parte de uma família coesa.`,
      elements: `Elementos são composições visuais premium para uso em embalagens, posts, papelaria e apresentações. Cada um deve ter no mínimo 6 primitivas SVG (paths, circles, rects). São: molduras, divisores, grafismos, badges, texturas. Derivados de ${params.objects || params.symbols || params.brandName}.`,
      patterns: `O pattern deve ser seamless com <defs><pattern> e patternUnits, nascido de ${params.patternDesc || params.brandName}. Ritmo visual reconhecível, não abstração vazia.`,
      motion: `Os motions devem animar um gesto que tenha a ver com ${params.motionDesc || params.brandName} — NUNCA um spinner circular genérico. Use <animate> ou <animateTransform>.`,
    },
    iconPlan: params.iconNames.map((name) => ({
      path: `vectors/icons/${name}.svg`,
      label: name.replace(/-/g, " "),
      concept: name.replace(/-/g, " "),
      rationale: `Desenhar "${name.replace(/-/g, " ")}" com a linguagem visual de ${params.brandName}, usando traços e formas que ecoem a personalidade da marca.`,
    })),
  };
}

/** Industry-specific icon vocabularies — each word is a CONCRETE, drawable concept */
const INDUSTRY_ICON_VOCAB: [string[], string[]][] = [
  // [keywords to match industry], [icon concepts]
  [["bar", "drinks", "bebida", "cocktail"], ["brinde", "coquetel", "balcao", "chama", "espeto", "copo-artesanal", "destilado", "gelo", "barril", "taco-de-limao"]],
  [["café", "coffee"], ["grao-cafe", "xicara-fumegante", "coador-artesanal", "vapor-aroma", "torra", "barista-mao", "latte-art", "moedor", "sachê", "borra"]],
  [["restaurante", "food", "gastro", "alimenta", "culinaria"], ["prato-servido", "fogo-fogao", "talheres-cruzados", "panela", "tempero-erva", "mesa-posta", "azeite", "receita-aberta", "cebolinha", "fatia"]],
  [["moda", "fashion", "roupa", "vestuario"], ["tecido-dobra", "etiqueta-costura", "cabide-minimal", "agulha-linha", "atelier-manequim", "retalho", "botao", "caimento", "alfaiate", "textura-trama"]],
  [["tech", "tecnologia", "software", "saas", "startup", "digital"], ["circuito-nodo", "malha-dados", "cursor-ponteiro", "pixel-grid", "pulso-digital", "conexao-api", "deploy-seta", "terminal-prompt", "cloud-sync", "modulo-bloco"]],
  [["fitness", "esporte", "gym", "academia", "wellness"], ["energia-raio", "pulso-batimento", "movimento-corpo", "haltere", "medalha-conquista", "pista-corrida", "cronometro", "resistencia-mola", "yoga-pose", "hidratacao"]],
  [["beleza", "beauty", "cosmetic", "estetica", "skincare"], ["petala-flor", "pincel-aplicador", "frasco-gota", "brilho-estrela", "ritual-mao", "espelho-reflexo", "textura-pele", "essencia-aroma", "mascara-facial", "conta-gotas"]],
  [["música", "music", "audio", "som", "podcast"], ["vinil-disco", "onda-sonora", "batida-ritmo", "equalizador-barra", "palco-arco", "partitura", "amplificador", "fone-ouvido", "mic-captacao", "frequencia"]],
  [["viagem", "travel", "turismo", "hotel", "hospeda"], ["horizonte-montanha", "rota-caminho", "mala-viajante", "compasso-direcao", "asa-voo", "ancora-porto", "mapa-dobrado", "tenda-aventura", "farol-guia", "passaporte"]],
  [["educação", "educa", "escola", "curso", "ensino", "edtech"], ["livro-aberto", "lampada-ideia", "lousa-giz", "diploma-selo", "lapis-criativo", "cerebro-sinapse", "palestra-mic", "caderno-nota", "globo-mundo", "graduacao"]],
  [["saude", "health", "medic", "farma", "clinica", "hospital"], ["batimento-coracao", "capsula-remedio", "estetoscopio", "folha-natural", "escudo-protecao", "gota-pura", "dna-helice", "termometro", "mao-cuidado", "balanca-equilibrio"]],
  [["finança", "financ", "fintech", "banco", "invest", "pagamento"], ["grafico-crescimento", "cofre-seguro", "moeda-empilhada", "transferencia-seta", "carteira-digital", "escudo-transacao", "porcentagem", "balanca-justica", "chave-acesso", "relatorio-dash"]],
  [["imobili", "construc", "arquitetura", "engenharia"], ["planta-projeto", "tijolo-modular", "telhado-casa", "compasso-tecnico", "viga-estrutura", "janela-luz", "grua-obra", "piso-pavimento", "blueprint", "nivel-bolha"]],
  [["pet", "veterinar", "animal"], ["pata-pegada", "osso-brinquedo", "coleira-tag", "racao-tigela", "bigode-gato", "cauda-alegre", "casinha-pet", "pegada-trilha", "orelha-levantada", "cobrinha-brincalhona"]],
  [["ecommerce", "loja", "varejo", "retail", "marketplace"], ["sacola-compra", "etiqueta-preco", "carrinho-compra", "caixa-entrega", "estrela-avaliacao", "filtro-busca", "codigo-barras", "oferta-selo", "embalagem-presente", "rastreio-rota"]],
];

/** Universal icon concepts that work for any brand — based on brand primitives, not UI */
const UNIVERSAL_BRAND_ICONS = [
  "selo-qualidade", "gesto-assinatura", "ritmo-visual", "textura-materia",
  "origem-raiz", "horizonte-visao", "conexao-ponte", "escudo-confianca",
  "chama-energia", "folha-crescimento", "onda-fluxo", "prisma-perspectiva",
  "ancora-solidez", "farol-direcao", "cristal-clareza", "espiral-evolucao",
];

function deriveBrandIconNames(bb: BrandbookData, brandName: string, industry: string): string[] {
  const brandSlug = cleanSemanticCandidate(brandName) || "marca";

  // 1. Collect semantic candidates from brandbook data (safe extraction)
  const rawSources: Array<string | null | undefined> = [];

  // Logo symbol — often the most brand-specific element
  const logoSymbol = (bb.logo?.symbol ?? "").trim();
  if (logoSymbol && !looksLikeUrlOrPath(logoSymbol)) rawSources.push(logoSymbol);

  // KeyVisual elements — the richest source
  for (const s of (bb.keyVisual?.symbols ?? []).slice(0, 6)) rawSources.push(s);
  for (const o of (bb.keyVisual?.objects ?? []).slice(0, 8)) rawSources.push(o);
  for (const f of (bb.keyVisual?.fauna ?? []).slice(0, 5)) rawSources.push(f);
  for (const f of (bb.keyVisual?.flora ?? []).slice(0, 5)) rawSources.push(f);

  // Mascot names (not descriptions — those are too long/noisy)
  for (const m of (bb.keyVisual?.mascots ?? []).slice(0, 3)) {
    if (m.name) rawSources.push(m.name);
  }

  // Pattern names
  for (const p of (bb.keyVisual?.structuredPatterns ?? []).slice(0, 3)) {
    if (p.name) rawSources.push(p.name);
  }

  // Personality traits can inspire icons (e.g., "ousado" → "chama-ousadia")
  for (const trait of (bb.brandConcept?.personality ?? []).slice(0, 4)) {
    rawSources.push(trait);
  }

  // Brand values
  for (const val of (bb.brandConcept?.values ?? []).slice(0, 4)) {
    rawSources.push(val);
  }

  const named = collectSemanticCandidates(rawSources, 10);

  // 2. Fill with industry-specific vocabulary
  const industryLower = (industry || "").toLowerCase();
  const matchedSets = INDUSTRY_ICON_VOCAB.filter(([keys]) =>
    keys.some((key) => industryLower.includes(key))
  );

  const industryIcons: string[] = matchedSets.flatMap(([, icons]) => icons);

  // Add industry icons that aren't already in named
  for (const icon of industryIcons) {
    if (named.length >= 14) break;
    if (!named.includes(icon)) named.push(icon);
  }

  // 3. Fill remaining with universal brand concepts, prefixed with brand name for uniqueness
  for (const icon of UNIVERSAL_BRAND_ICONS) {
    if (named.length >= 16) break;
    const candidate = `${brandSlug}-${icon}`;
    const cleaned = cleanSemanticCandidate(candidate);
    if (cleaned && !named.includes(cleaned)) named.push(cleaned);
  }

  // 4. Final safety: ensure exactly 16, all clean
  const result = named
    .slice(0, 16)
    .map((name, i) => {
      // Last resort: if any name is still suspicious, replace with safe fallback
      if (looksLikeUrlOrPath(name) || name.length < 3) {
        return `${brandSlug}-motivo-${String(i + 1).padStart(2, "0")}`;
      }
      return name;
    });

  // Pad to 16 if needed
  while (result.length < 16) {
    const idx = result.length + 1;
    result.push(`${brandSlug}-elemento-${String(idx).padStart(2, "0")}`);
  }

  return result;
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
      recraftKey?: string;
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
      "Você é um Diretor de Arte e Brand Designer Sênior com 20+ anos de experiência em identidade visual premium para marcas globais. " +
      "Sua missão é criar ativos vetoriais de QUALIDADE WORLD-CLASS que EXPRESSEM a alma da marca com personalidade forte e utilidade real. " +
      "Cada SVG deve ser: (1) INCONFUNDÍVEL — pertencer claramente a ESTA marca específica, não a uma biblioteca genérica; " +
      "(2) ÚTIL — pronto para uso em embalagens, UI, redes sociais, papelaria e apresentações; " +
      "(3) VISUALMENTE RICO — cada SVG deve ter composição elaborada com múltiplos paths, formas e detalhes. Um ícone BOM tem no mínimo 3 primitivas SVG, um elemento BOM tem no mínimo 8; " +
      "(4) COESO — todos os assets devem parecer parte da mesma família visual, com linguagem formal consistente; " +
      "(5) CRIATIVO — trazer repertório visual proprietário, não clichês do setor. " +
      "PROIBIDO: placeholders, URLs no nome, ícones de UI genéricos (home, user, settings, search, mail), formas abstratas sem significado, SVGs com poucos detalhes (menos de 3 primitivas para ícones, menos de 6 para elementos). " +
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
MÍNIMO OBRIGATÓRIO: cada ícone deve ter pelo menos 4 tags primitivas SVG (<path>, <circle>, <rect>, <ellipse>, <polygon>, <line>). Ícones com menos de 4 primitivas serão REJEITADOS automaticamente.

TÉCNICA DE DESENHO: Construa cada ícone como um designer faria — decomponha o objeto em formas geométricas:
- Um COPO = trapézio (path com 4 pontos), linhas horizontais para borda/base, arco para líquido, elipse para boca
- Uma FOLHA = path curvo principal + veio central + 3-4 veias laterais como paths menores
- Uma CHAMA = path curvo externo + path interno menor + base arredondada
- Um LIVRO = 2 retângulos (capas) + path curvo (lombada) + linhas horizontais (páginas)
NUNCA entregue um único <path> e chame de ícone. Cada objeto tem MÚLTIPLAS PARTES visíveis.

═══ EXEMPLO 1: Ícone de COPO (nível mínimo aceitável) ═══
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 3h10l-1.5 13H8.5L7 3z"/>
  <ellipse cx="12" cy="3" rx="5" ry="1"/>
  <path d="M9 8h6"/>
  <line x1="10" y1="16" x2="10" y2="19"/>
  <line x1="14" y1="16" x2="14" y2="19"/>
  <path d="M8 19h8"/>
</svg>

═══ EXEMPLO 2: Ícone de FOLHA/PLANTA ═══
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22V8"/>
  <path d="M5 3c0 5.5 3.5 10 7 10s7-4.5 7-10c-3.5 0-7 1.5-7 5-1-3.5-3.5-5-7-5z"/>
  <path d="M9 12c1-1 2-2.5 3-3"/>
  <path d="M15 10c-1-1-2-2-3-2.5"/>
  <path d="M8 8c1.5-.5 2.5-1.5 4-2"/>
  <circle cx="12" cy="20" r="1.5" fill="${primaryColor}" opacity="0.2"/>
</svg>

═══ EXEMPLO 3: Ícone de CHAMA/ENERGIA ═══
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-5-4-7-6-11z"/>
  <path d="M12 8c-1 2-3 3-3 5.5a3 3 0 0 0 6 0c0-2.5-2-3.5-3-5.5z" fill="${primaryColor}" opacity="0.15"/>
  <path d="M10 15.5c0 1.1.9 2 2 2s2-.9 2-2"/>
  <ellipse cx="12" cy="19" rx="4" ry="1" opacity="0.3" fill="${primaryColor}"/>
</svg>

═══════════════ ELEMENTOS ABSTRATOS — 8 ARQUIVOS ═══════════════
Inspire-se DIRETAMENTE em: ${[flora, fauna, objects, symbols].filter(Boolean).join(" | ") || "universo visual da marca"}
- viewBox="0 0 512 512"
- Use a paleta completa: ${primaryColor}, ${secondaryColor}, ${accentColor}
- CADA elemento deve ter MÍNIMO 10 primitivas SVG (<path>, <circle>, <rect>, <ellipse>, <polygon>, <g>)
- NUNCA entregue um SVG com menos de 10 tags primitivas — será rejeitado automaticamente

Os 8 elementos devem cobrir estes TIPOS de uso real:
element-01.svg → Moldura/frame decorativo (para emoldurar fotos em posts/papelaria)
element-02.svg → Divisor/separador horizontal (para headers de documentos)
element-03.svg → Grafismo de canto (para cantos de cartões/slides)
element-04.svg → Composição central/badge (selo decorativo da marca)
element-05.svg → Textura/pattern fragment (trecho de padrão para fundos parciais)
element-06.svg → Faixa decorativa/ribbon (para banners e destaques)
element-07.svg → Ilustração abstrata da marca (composição artística que expressa a personalidade)
element-08.svg → Ícone hero/statement (versão grande e detalhada do conceito central da marca)

TÉCNICA PARA ELEMENTOS: Cada elemento é uma COMPOSIÇÃO rica com múltiplas camadas:
- Uma MOLDURA = 4 cantos decorativos (paths curvos) + bordas com ornamentos + linhas internas
- Um BADGE = círculo externo + círculo interno + texto-path decorativo + estrelas/folhas ao redor + linhas de detalhe
- Um DIVISOR = linha central + ornamentos simétricos em cada ponta + elemento central (losango/flor/símbolo)
- Uma FAIXA/RIBBON = path curvo principal + dobras nas pontas + sombra sutil + textura interna

═══ EXEMPLO: Elemento BADGE/SELO (complexidade mínima esperada) ═══
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="200" fill="none" stroke="${primaryColor}" stroke-width="3"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="${primaryColor}" stroke-width="1" stroke-dasharray="8 4"/>
  <circle cx="256" cy="256" r="160" fill="${primaryColor}" opacity="0.08"/>
  <path d="M256 96l12 36h38l-30 22 12 36-32-24-32 24 12-36-30-22h38z" fill="${accentColor}"/>
  <path d="M256 344l12 36h38l-30 22 12 36-32-24-32 24 12-36-30-22h38z" fill="${accentColor}"/>
  <path d="M152 200l-20 10 20 10" fill="none" stroke="${secondaryColor}" stroke-width="2"/>
  <path d="M360 200l20 10-20 10" fill="none" stroke="${secondaryColor}" stroke-width="2"/>
  <rect x="196" y="230" width="120" height="2" fill="${primaryColor}" rx="1"/>
  <rect x="206" y="270" width="100" height="2" fill="${primaryColor}" rx="1" opacity="0.5"/>
  <circle cx="256" cy="256" r="40" fill="none" stroke="${accentColor}" stroke-width="2"/>
  <path d="M240 256l10 10 20-20" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
</svg>

═══ EXEMPLO: Elemento MOLDURA (complexidade mínima esperada) ═══
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="40" width="432" height="432" rx="8" fill="none" stroke="${primaryColor}" stroke-width="2"/>
  <rect x="56" y="56" width="400" height="400" rx="4" fill="none" stroke="${primaryColor}" stroke-width="1" opacity="0.4"/>
  <path d="M40 100 Q70 70 100 40" fill="none" stroke="${accentColor}" stroke-width="3"/>
  <path d="M412 40 Q442 70 472 100" fill="none" stroke="${accentColor}" stroke-width="3"/>
  <path d="M472 412 Q442 442 412 472" fill="none" stroke="${accentColor}" stroke-width="3"/>
  <path d="M100 472 Q70 442 40 412" fill="none" stroke="${accentColor}" stroke-width="3"/>
  <circle cx="40" cy="40" r="6" fill="${accentColor}"/>
  <circle cx="472" cy="40" r="6" fill="${accentColor}"/>
  <circle cx="472" cy="472" r="6" fill="${accentColor}"/>
  <circle cx="40" cy="472" r="6" fill="${accentColor}"/>
  <line x1="180" y1="40" x2="332" y2="40" stroke="${primaryColor}" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
  <line x1="180" y1="472" x2="332" y2="472" stroke="${primaryColor}" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>
</svg>

PROIBIDO: formas geométricas simples (um círculo isolado, um quadrado isolado, um triângulo isolado). Cada elemento deve ter COMPOSIÇÃO com múltiplas partes visíveis.

═══════════════ PADRÃO SEAMLESS ═══════════════
Path: vectors/patterns/pattern-${patternSlug}.svg
- viewBox="0 0 400 400" com <defs><pattern id="tile"> tileável
- Motivos derivados de: ${[flora, fauna, objects].filter(Boolean).join(", ") || brandName}
- Cores: ${primaryColor} e ${secondaryColor} com opacidades variadas — premium e on-brand

═══ EXEMPLO: Pattern seamless (estrutura obrigatória) ═══
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="tile" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="none"/>
      <circle cx="50" cy="50" r="8" fill="${primaryColor}" opacity="0.15"/>
      <circle cx="0" cy="0" r="8" fill="${primaryColor}" opacity="0.15"/>
      <circle cx="100" cy="0" r="8" fill="${primaryColor}" opacity="0.15"/>
      <circle cx="0" cy="100" r="8" fill="${primaryColor}" opacity="0.15"/>
      <circle cx="100" cy="100" r="8" fill="${primaryColor}" opacity="0.15"/>
      <path d="M25 0 L50 25 L75 0" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.2"/>
      <path d="M25 100 L50 75 L75 100" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.2"/>
      <path d="M0 25 L25 50 L0 75" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.2"/>
      <path d="M100 25 L75 50 L100 75" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.2"/>
    </pattern>
  </defs>
  <rect width="400" height="400" fill="url(#tile)"/>
</svg>
IMPORTANTE: O pattern DEVE usar <defs><pattern> com patternUnits="userSpaceOnUse". Substitua os motivos genéricos por motivos da marca. O tile deve ter pelo menos 6 elementos visuais.

═══════════════ MOTION SVGs ═══════════════
- motion/loading-spinner.svg: viewBox="0 0 64 64", animate um elemento de "${logoSymbol || brandName}", não círculo genérico
- motion/success-check.svg: viewBox="0 0 64 64", celebração on-brand com cor ${primaryColor}

═══ EXEMPLO: Motion spinner (estrutura obrigatória) ═══
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="24" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.2"/>
  <path d="M32 8 A24 24 0 0 1 56 32" fill="none" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1s" repeatCount="indefinite"/>
  </path>
  <circle cx="32" cy="32" r="4" fill="${primaryColor}" opacity="0.3">
    <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="32" cy="8" r="3" fill="${accentColor}">
    <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1s" repeatCount="indefinite"/>
  </circle>
</svg>
NÃO faça um simples círculo girando. Anime elementos da marca com personalidade.

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
                temperature: 0.8,
                maxOutputTokens: 32768,
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
        temperature: 0.7,
        max_tokens: 32768,
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

    const MAX_REPAIR_ATTEMPTS = 3;
    const firstRaw = await generateRaw(userPrompt);
    let normalized: NormalizedAssetPackResult;
    let repairAttempts = 0;
    let lastRaw = firstRaw;

    try {
      normalized = finalizeRaw(firstRaw);
    } catch (error: unknown) {
      if (!(error instanceof AssetPackGenerationError)) throw error;
      normalized = { files: [], coverage: { icons: 0, elements: 0, patterns: 0, motion: 0, total: 0, expectedTotal: expectedPaths.all.length }, quality: { status: "fail", score: 0, summary: error.message, strengths: [], warnings: [], issues: error.issues, buckets: [] }, issues: error.issues, missingPaths: expectedPaths.all, unexpectedPaths: [], invalidSvgPaths: [], suspiciousPaths: [], isStructurallyComplete: false, passesQualityGate: false, isComplete: false };
    }

    // Retry loop: up to MAX_REPAIR_ATTEMPTS
    while (!normalized.isComplete && repairAttempts < MAX_REPAIR_ATTEMPTS) {
      repairAttempts++;
      bbLog("info", "api.generate-asset-pack.repair", {
        requestId,
        attempt: repairAttempts,
        coverage: normalized.coverage,
        issues: normalized.issues.slice(0, 6),
      });

      const repairPrompt = buildAssetPackRepairPrompt({
        brandName,
        expected: expectedPaths,
        raw: lastRaw,
        plan: assetPlan,
        issues: [
          ...normalized.issues,
          ...normalized.missingPaths.map((path) => `Faltou o path obrigatório ${path}.`),
          ...normalized.invalidSvgPaths.map((path) => `O path ${path} não contém SVG válido.`),
          ...normalized.suspiciousPaths.map((path) => `O path ${path} contém nome contaminado ou suspeito.`),
        ],
      });

      try {
        lastRaw = await generateRaw(repairPrompt);
        normalized = finalizeRaw(lastRaw);
      } catch (error: unknown) {
        if (!(error instanceof AssetPackGenerationError)) throw error;
        bbLog("warn", "api.generate-asset-pack.repair-parse-fail", {
          requestId,
          attempt: repairAttempts,
          error: serializeError(error),
        });
      }
    }

    // ─── Recraft SVG Enhancement ─────────────────────────────────────────────
    // If Recraft key is available, replace LLM-generated icons with real SVG vectors
    const recraftKey = body.recraftKey?.trim() || process.env.RECRAFT_API_KEY;
    if (recraftKey && normalized.files.length > 0) {
      const brandColors = brandColorsToRecraft([primaryColor, secondaryColor, accentColor].filter(Boolean));
      const iconFiles = normalized.files.filter((f) => f.path.startsWith("vectors/icons/"));
      let recraftUpgraded = 0;

      for (const iconFile of iconFiles) {
        try {
          const iconName = iconFile.path.replace("vectors/icons/", "").replace(".svg", "").replace(/-/g, " ");
          const iconPrompt = `Brand icon for "${brandName}" (${industry}): ${iconName}. Style: ${iconographyStyle || "modern flat"}. Personality: ${personality}. Clean, minimal, 24x24 grid, consistent stroke weight.`;
          const svgDataUrl = await generateBrandIcon({
            prompt: iconPrompt,
            apiKey: recraftKey,
            colors: brandColors,
            substyle: "flat_2" as RecraftSubstyle,
          });
          // Extract SVG content from data URL
          if (svgDataUrl.startsWith("data:image/svg+xml;base64,")) {
            const svgContent = Buffer.from(svgDataUrl.split(",")[1], "base64").toString("utf-8");
            iconFile.content = svgContent;
            recraftUpgraded++;
          }
        } catch (err) {
          bbLog("warn", "api.generate-asset-pack.recraft-icon-fail", {
            requestId,
            iconPath: iconFile.path,
            error: serializeError(err),
          });
          // Keep original LLM-generated icon as fallback
        }
      }

      if (recraftUpgraded > 0) {
        bbLog("info", "api.generate-asset-pack.recraft-upgrade", {
          requestId,
          upgraded: recraftUpgraded,
          total: iconFiles.length,
        });
      }
    }

    // Soft acceptance: if structurally almost complete (≥90% coverage) and quality isn't hard-fail on all buckets, accept with warnings
    const coverageRatio = normalized.coverage.expectedTotal > 0
      ? normalized.coverage.total / normalized.coverage.expectedTotal
      : 0;
    const hardFailBuckets = normalized.quality.buckets?.filter(b => b.status === "fail").length ?? 0;
    const isSoftAcceptable = coverageRatio >= 0.92 && hardFailBuckets <= 1;

    if (!normalized.isComplete && !isSoftAcceptable) {
      const issueSummary = [
        ...normalized.issues,
        ...normalized.missingPaths.slice(0, 8).map((path) => `Ausente: ${path}`),
        ...normalized.invalidSvgPaths.slice(0, 8).map((path) => `SVG inválido: ${path}`),
      ];
      return respond(
        500,
        {
          error: `Asset Pack personalizado reprovado após validação${repairAttempts > 0 ? ` e ${repairAttempts} tentativa(s) de reparo` : ""}.\n${issueSummary.slice(0, 12).join("\n")}`,
          plan: assetPlan,
          quality: normalized.quality,
          coverage: normalized.coverage,
        },
        {
          repairAttempts,
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
        softAccepted: !normalized.isComplete && isSoftAcceptable,
      },
      {
        repairAttempts,
        softAccepted: !normalized.isComplete && isSoftAcceptable,
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
