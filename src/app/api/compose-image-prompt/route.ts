import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import type { BrandbookData } from "@/lib/types";
import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { fnv1a32 } from "@/lib/common";

export const runtime = "nodejs";

function visualSystemId(brandbook: BrandbookData): string {
  const allColors = [...(brandbook.colors?.primary ?? []), ...(brandbook.colors?.secondary ?? [])]
    .map((c) => `${c.name} ${c.hex}`)
    .join(" · ");
  const displayFont = brandbook.typography?.marketing?.name ?? brandbook.typography?.primary?.name ?? "";
  const bodyFont = brandbook.typography?.ui?.name ?? brandbook.typography?.secondary?.name ?? "";
  const logoSymbol = brandbook.logo?.symbol ?? "";
  const patternStyle = brandbook.imageGenerationBriefing?.patternStyle ?? "";
  const visualStyle = brandbook.imageGenerationBriefing?.visualStyle ?? "";
  const photoStyle = brandbook.imageGenerationBriefing?.photographyMood ?? brandbook.keyVisual?.photographyStyle ?? "";

  const base = [
    brandbook.brandName,
    brandbook.industry,
    allColors,
    displayFont,
    bodyFont,
    logoSymbol,
    patternStyle,
    visualStyle,
    photoStyle,
  ].join("|");
  const hex = fnv1a32(base).toString(16).padStart(8, "0");
  return `BBVS-${hex}`;
}

function compactBrandContext(brandbook: BrandbookData): string {
  const brandName = brandbook.brandName ?? "";
  const industry = brandbook.industry ?? "";

  const purpose = brandbook.brandConcept?.purpose ?? "";
  const personality = Array.isArray(brandbook.brandConcept?.personality)
    ? brandbook.brandConcept.personality.slice(0, 6).join(", ")
    : "";
  const tone = brandbook.brandConcept?.toneOfVoice ?? "";
  const archetype = brandbook.brandConcept?.brandArchetype ?? "";

  const primaryColors = (brandbook.colors?.primary ?? [])
    .slice(0, 3)
    .map((c) => `${c.name} ${c.hex}`)
    .join(" · ");
  const secondaryColors = (brandbook.colors?.secondary ?? [])
    .slice(0, 4)
    .map((c) => `${c.name} ${c.hex}`)
    .join(" · ");

  const displayFont = brandbook.typography?.marketing?.name ?? brandbook.typography?.primary?.name ?? "";
  const bodyFont = brandbook.typography?.ui?.name ?? brandbook.typography?.secondary?.name ?? "";

  const igb = brandbook.imageGenerationBriefing;
  const igbExt = igb as unknown as Record<string, unknown> | undefined;
  const visualStyle = igb?.visualStyle ?? "";
  const colorMood = igb?.colorMood ?? "";
  const compositionNotes = igb?.compositionNotes ?? "";
  const moodKeywords = (igb?.moodKeywords ?? []).slice(0, 8).join(", ");
  const artisticReferences = igb?.artisticReferences ?? "";
  const avoidElements = igb?.avoidElements ?? "";
  const negativePrompt = igb?.negativePrompt ?? "";
  const emotionalCore = (igbExt?.emotionalCore as string) ?? "";
  const textureLanguage = (igbExt?.textureLanguage as string) ?? "";
  const lightingSignature = (igbExt?.lightingSignature as string) ?? "";
  const cameraSignature = (igbExt?.cameraSignature as string) ?? "";
  const sensoryProfile = (igbExt?.sensoryProfile as string) ?? "";

  const logoStyleGuide = igb?.logoStyleGuide ?? "";
  const patternStyle = igb?.patternStyle ?? "";

  const logoSymbol = brandbook.logo?.symbol ?? "";
  const symbols = (brandbook.keyVisual?.symbols ?? []).slice(0, 6).join(" | ");
  const patterns = (brandbook.keyVisual?.patterns ?? []).slice(0, 6).join(" | ");
  const elements = (brandbook.keyVisual?.elements ?? []).slice(0, 6).join(" | ");
  const flora = (brandbook.keyVisual?.flora ?? []).slice(0, 4).join(", ");
  const fauna = (brandbook.keyVisual?.fauna ?? []).slice(0, 4).join(", ");
  const objects = (brandbook.keyVisual?.objects ?? []).slice(0, 4).join(", ");

  const manifesto = brandbook.brandStory?.manifesto
    ? brandbook.brandStory.manifesto.slice(0, 400)
    : "";
  const brandPromise = brandbook.brandStory?.brandPromise ?? "";

  const mascot = brandbook.keyVisual?.mascots?.[0];
  const mascotInfo = mascot ? `Mascot: ${mascot.name} — ${mascot.description}. Personality: ${mascot.personality}` : "";

  const spList = brandbook.keyVisual?.structuredPatterns;
  const structuredPatterns = spList?.length
    ? spList.slice(0, 2).map((p) => `${p.name}: ${p.composition} (${p.density ?? "moderate"})`).join(" | ")
    : "";

  const tree = [
    logoSymbol ? `STYLE_TREE: ROOT=${logoSymbol}.` : "",
    patterns ? `PATTERNS=${patterns}.` : (patternStyle ? `PATTERNS=${patternStyle}.` : ""),
    symbols ? `SYMBOLS=${symbols}.` : "",
    elements ? `ELEMENTS=${elements}.` : "",
    "RULE: Everything must be derived from ROOT. Do not introduce unrelated motifs or a different art direction between assets.",
  ].filter(Boolean).join(" ");

  return [
    `VISUAL_SYSTEM_ID: ${visualSystemId(brandbook)}.`,
    `Brand: ${brandName} (${industry})`,
    purpose ? `Purpose: ${purpose}` : "",
    personality ? `Personality: ${personality}` : "",
    tone ? `Tone of voice: ${tone}` : "",
    archetype ? `Brand archetype: ${archetype}` : "",
    manifesto ? `Brand manifesto: "${manifesto}"` : "",
    brandPromise ? `Brand promise: "${brandPromise}"` : "",
    displayFont || bodyFont ? `Typography: display=${displayFont || "-"}; body=${bodyFont || "-"}` : "",
    primaryColors ? `Primary colors: ${primaryColors}` : "",
    secondaryColors ? `Secondary colors: ${secondaryColors}` : "",
    tree ? tree : "",
    elements ? `Key visual elements: ${elements}` : "",
    flora ? `Flora: ${flora}` : "",
    fauna ? `Fauna: ${fauna}` : "",
    objects ? `Objects: ${objects}` : "",
    mascotInfo,
    structuredPatterns ? `Structured patterns: ${structuredPatterns}` : "",
    visualStyle ? `Visual style: ${visualStyle}` : "",
    colorMood ? `Color mood: ${colorMood}` : "",
    compositionNotes ? `Composition: ${compositionNotes}` : "",
    moodKeywords ? `Mood keywords: ${moodKeywords}` : "",
    artisticReferences ? `Artistic references: ${artisticReferences}` : "",
    emotionalCore ? `Emotional core: ${emotionalCore}` : "",
    textureLanguage ? `Texture language: ${textureLanguage}` : "",
    lightingSignature ? `Lighting signature: ${lightingSignature}` : "",
    cameraSignature ? `Camera signature: ${cameraSignature}` : "",
    sensoryProfile ? `Sensory profile: ${sensoryProfile}` : "",
    logoStyleGuide ? `Logo style guide: ${logoStyleGuide}` : "",
    patternStyle ? `Pattern style: ${patternStyle}` : "",
    avoidElements ? `Avoid elements: ${avoidElements}` : "",
    negativePrompt ? `Global negative prompt: ${negativePrompt}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function dataUrlToInlineData(dataUrl: string): { inlineData: { mimeType: string; data: string } } {
  const m = dataUrl.trim().match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!m) throw new Error("Imagem de referência inválida.");
  return { inlineData: { mimeType: m[1], data: m[2] } };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      brandbook?: BrandbookData;
      brief?: string;
      imageProvider?: string;
      aspectRatio?: string;
      creativity?: "consistent" | "balanced" | "creative";
      referenceImageDataUrl?: string;
      referenceImageMode?: "strict" | "guided" | "loose" | "remix";
      textProvider?: "openai" | "gemini";
      openaiKey?: string;
      googleKey?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!body.brandbook) {
      return NextResponse.json({ error: "brandbook é obrigatório" }, { status: 400 });
    }
    const brief = body.brief?.trim();
    if (!brief) {
      return NextResponse.json({ error: "brief é obrigatório" }, { status: 400 });
    }
    const imageProvider = body.imageProvider?.trim();
    if (!imageProvider) {
      return NextResponse.json({ error: "imageProvider é obrigatório" }, { status: 400 });
    }

    const textProvider = body.textProvider ?? "openai";
    const ratio = (body.aspectRatio?.trim() || "1:1") as string;
    const creativity = body.creativity ?? "balanced";
    const referenceImageDataUrl = body.referenceImageDataUrl?.trim() || "";
    const referenceImageMode = body.referenceImageMode ?? "guided";

    const temperature = creativity === "consistent" ? 0.35 : creativity === "creative" ? 0.75 : 0.55;

    const rebrandModeRules = referenceImageDataUrl
      ? (
        referenceImageMode === "strict" ?
          "- REFERENCE_IMAGE_MODE=strict: preserve layout/grid/placement almost 1:1 (hierarchy, spacing, crop, framing, number of elements). Only change brand styling (palette, typography style, motifs, materials, lighting) to match the brandbook.\n" :
        referenceImageMode === "guided" ?
          "- REFERENCE_IMAGE_MODE=guided: preserve key hierarchy and core composition (main subject placement and reading order), but you can refine proportions, margins, and styling for a cleaner on-brand result.\n" :
        referenceImageMode === "loose" ?
          "- REFERENCE_IMAGE_MODE=loose: use the piece as inspiration. Keep the same intent and a few recognizable composition cues, but you may redesign the layout to better fit the brandbook.\n" :
          "- REFERENCE_IMAGE_MODE=remix: reimagine boldly. Keep only the intent/idea of the piece, not the exact layout. Still remain strictly within the brandbook visual system and style tree.\n"
      )
      : "";

    const systemPrompt = `Você é um Diretor de Arte Sênior de classe mundial — referência em branding, prompt engineering para IA e design com alma. Você pensa como Paula Scher, Stefan Sagmeister e David Carson combinados: cada decisão visual carrega intenção, emoção e significado.

Tarefa: Dado o contexto do brandbook e uma intenção curta do usuário, gere um prompt FINAL e completo para gerar uma imagem com qualidade de estúdio top-tier.

COMO PENSAR (antes de escrever o prompt):
1. CONCEITO → O que esta imagem SIGNIFICA para a marca? Qual é a história que ela conta?
2. EMOÇÃO → O que o espectador deve SENTIR nos primeiros 0.5 segundos?
3. MATERIALIDADE → Quais texturas, superfícies e materiais traduzem a alma da marca?
4. EXECUÇÃO → Como a câmera, a luz e a composição servem ao conceito?

Controle de criatividade (CREATIVITY_MODE):
- consistent: máxima fidelidade ao briefing e ao brandbook. Sem improvisação.
- balanced: equilíbrio entre precisão e refinamento estético. Pequenas surpresas visuais bem-vindas.
- creative: soluções ousadas (metáforas visuais, composição cinematográfica, referências culturais), mas SEM quebrar o brandbook e SEM introduzir elementos fora da árvore de estilo.

Regras:
- Integre SEMPRE o brandbook (paleta, tipografia, estilo visual, mood, composição, elementos, arquétipo, alma emocional) de forma coerente.
- Não invente fatos sobre a marca.
- Não escreva textos legíveis na imagem, a menos que o usuário peça explicitamente.
- Obedeça o aspect ratio solicitado.
- Se houver uma imagem de referência, interprete-a com precisão e gere um prompt que rebrand em 100% para o sistema visual do brandbook.
${rebrandModeRules}

ALMA & INTENCIONALIDADE (OBRIGATÓRIO):
- SEMPRE inclua: ARCHETYPE (arquétipo com tradução visual), EMOTIONAL_CORE (o que o espectador SENTE), VIEWER_JOURNEY (timing adaptado ao medium).
- Se o brandbook tem STYLE_TREE, replique literalmente.
- Se há flora/fauna/objects, use-os como elementos visuais com protagonismo proporcional à importância na marca (marcas com identidade forte em flora/fauna → elementos PROEMINENTES, não sutis).
- Se há structuredPatterns, referencie nome, composição e densidade.
- Se há manifesto/brandPromise, deixe a essência emocional permear a direção de arte.
- Se há sensoryProfile/textureLanguage, traduza em instruções visuais concretas (materiais, superfícies, temperatura tátil).

ESSÊNCIA HUMANA:
- O prompt deve soar como se um diretor de arte sênior o tivesse escrito à mão — não como um template.
- Inclua referências culturais reais (fotógrafos, revistas, movimentos artísticos, campanhas) conectadas ao arquétipo da marca.
- Use metáforas sensoriais: "warm 3200K candlelight reflecting off kraft paper" > "warm lighting".
- Cada prompt deve ter um "conceito" — uma ideia central que unifica todos os elementos visuais.

Formato do prompt (obrigatório):
- Use blocos claros: SUBJECT / STYLE / EMOTION / COMPOSITION / LIGHTING / CAMERA / MATERIALS / BACKGROUND / NEGATIVE.
- Sempre inclua bloco negativo no final.
  - stability: " --neg ..."
  - demais providers: "\\n\\nNEGATIVE: ..."

Regras por provider:
- stability: tags com pesos (tag:1.3). Estruture: qualidade → sujeito → estilo → composição → iluminação → cor → mood. " --neg ..." no final. Máximo ~2000 chars.
- dalle3: linguagem natural cinematográfica e experiencial ("you are looking at..."). Parágrafos narrativos. "Do not include:" no final. Máximo ~3500 chars.
- ideogram: linguagem de design gráfico profissional. Instruções tipográficas precisas se há texto. "Do not include:" no final. Máximo ~1800 chars.
- imagen: linguagem natural/imperativa direta. "Do not include, do not generate:" no final. Máximo ~1600 chars.

Saída: retorne EXCLUSIVAMENTE um JSON válido no formato { "prompt": "..." }.`;

    const userPrompt = `IMAGE PROVIDER: ${imageProvider}
ASPECT RATIO: ${ratio}
CREATIVITY_MODE: ${creativity}
REFERENCE_IMAGE_MODE: ${referenceImageDataUrl ? referenceImageMode : "none"}

BRANDBOOK CONTEXT:
${compactBrandContext(body.brandbook)}

USER INTENT (short):
${brief}`;

    let raw = "";

    if (textProvider === "gemini") {
      const apiKey = body.googleKey?.trim() || process.env.GOOGLE_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "GOOGLE_API_KEY não configurada." }, { status: 500 });
      const ai = new GoogleGenAI({ apiKey });

      const contents = referenceImageDataUrl
        ? ([
          { text: userPrompt },
          dataUrlToInlineData(referenceImageDataUrl),
        ] as Parameters<typeof ai.models.generateContent>[0]["contents"])
        : userPrompt;

      const { value: resp } = await withGoogleTextModelFallback({
        apiKey,
        preferredModel: body.googleModel,
        run: (model) =>
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              temperature,
              maxOutputTokens: 2048,
            },
          }),
      });
      raw = resp.text ?? "";
    } else {
      const apiKey = body.openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });

      const userMessage: OpenAI.ChatCompletionMessageParam = referenceImageDataUrl
        ? {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: referenceImageDataUrl } },
          ],
        }
        : { role: "user", content: userPrompt };

      const completion = await openai.chat.completions.create({
        model: body.openaiModel?.trim() || "gpt-4o",
        temperature,
        max_tokens: 2048,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          userMessage,
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

    const prompt = (parsed as { prompt?: string }).prompt;
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "IA não retornou campo prompt." }, { status: 500 });
    }

    return NextResponse.json({ prompt: prompt.trim().slice(0, 4000) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
