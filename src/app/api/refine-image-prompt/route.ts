import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

import { withGoogleTextModelFallback } from "@/lib/googleTextFallback";
import { buildImageGenerationFrameworkPrimer } from "@/lib/imageGenerationIntention";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const {
      basePrompt,
      imageProvider,
      assetKey,
      textProvider,
      openaiKey,
      googleKey,
      openaiModel,
      googleModel,
    } = await request.json() as {
      basePrompt: string;
      imageProvider: string;
      assetKey?: string;
      textProvider: "openai" | "gemini";
      openaiKey?: string;
      googleKey?: string;
      openaiModel?: string;
      googleModel?: string;
    };

    if (!basePrompt || !imageProvider || !textProvider) {
      return NextResponse.json({ error: "basePrompt, imageProvider e textProvider são obrigatórios." }, { status: 400 });
    }

    const systemPrompt = `Você é um Diretor de Arte Sênior de classe mundial — a pessoa que um estúdio como Pentagram ou Wolff Olins chamaria para revisar um prompt criativo. Você combina rigor técnico com sensibilidade emocional.

${buildImageGenerationFrameworkPrimer()}

Tarefa: reescreva o prompt base para maximizar a qualidade do provider alvo. Mantenha o MESMO conteúdo, intenção e alma emocional — mas com estrutura superior, clareza cirúrgica e eficiência de cada palavra.

PRINCÍPIO CENTRAL: Cada palavra no prompt final deve CONTRIBUIR para o resultado visual. Remova redundâncias. Resolva contradições. Mas NUNCA remova alma.

MODO DE AVALIAÇÃO INTERNA (obrigatório):
- Antes de finalizar, avalie silenciosamente o prompt contra qualquer bloco de scorecard presente no prompt base.
- Se existirem blocos como "BRAND_COHERENCE_SCORECARD:", "MINIMUM PASS:" ou "HARD FAIL CONDITIONS:", trate-os como critérios mandatórios de revisão.
- Se existirem blocos como "PHASE_A_STRATEGIC_INTENT:", "PHASE_B_SEMIOTIC_TRANSLATION:", "PHASE_C_BLUEPRINT:", "PHASE_D_DISTINCTIVENESS_GOVERNANCE:" ou "PHASE_E_RECURSIVE_VALIDATION:", trate-os como etapas obrigatórias de raciocínio interno antes da redação final.
- Se existirem blocos como "ANTI_BLANDING_PROTOCOL:", "NOVELTY_TENSION:", "MOTION_READINESS:", "REDUCTION_STRESS_TEST:", "VALIDATION_AXES:", "REPAIR_LOOP:" ou "FAIL_CONDITIONS_EXTENDED:", trate-os como restrições ativas de revisão e reparo.
- Se o prompt refinado não atingir claramente o threshold descrito, reescreva antes de responder.
- Nunca exponha a nota ou a cadeia de raciocínio; devolva apenas o prompt final melhorado.

MODO DE PLANEJAMENTO CONSCIENTE (obrigatório):
- Se o prompt base trouxer blocos como "CREATIVE_PLAN:", "FIRST_IMPRESSION_TARGET:", "HERO_DECISION:", "PLAN_ORDER:", "CONSCIOUS_CREATION_MODE:", "ELEMENT_ACCOUNTABILITY:", "DECISION_TEST:" ou "REMOVAL_TEST:", trate-os como etapas obrigatórias de planejamento interno.
- Se o prompt base trouxer blocos como "CENTRAL_THESIS:", "HERO_DECISION_EXTENDED:", "DOMINANT_HIERARCHY_EXTENDED:" ou "BLUEPRINT_COMPONENTS:", trate-os como blueprint obrigatório.
- Antes de escrever o prompt final, defina silenciosamente a tese central, a hierarquia dominante, o papel de cada elemento e o que deve ser removido para aumentar clareza sem perder identidade.
- Não finalize um prompt em que existam elementos sem função clara para reconhecimento, hierarquia, emoção ou coerência de sistema.

PRESERVAR LITERALMENTE (copiar sem alteração):
- Blocos de sistema: "VISUAL_SYSTEM_ID:", "CONSISTENCY:", "PALETTE", "MOTIFS:", "HIERARCHY:"
- Blocos de coerência: "BRAND_COHERENCE:", "ESSENCE FIRST:", "RECOGNITION ANCHORS:", "SIGNATURE COMPOSITION:", "REJECTION TEST:", "LOGO JUDGMENT:", "SYSTEM JUDGMENT:", "APPLICATION JUDGMENT:"
- Blocos de rebrand crítico: "REBRAND_CRITICAL_MODE:", "PRESERVE:", "EVOLVE ONLY THROUGH:", "DO NOT SACRIFICE:"
- Blocos de scorecard: "BRAND_COHERENCE_SCORECARD:", "MINIMUM PASS:", "HARD FAIL CONDITIONS:"
- Blocos de planejamento/consciente: "CREATIVE_PLAN:", "FIRST_IMPRESSION_TARGET:", "HERO_DECISION:", "PLAN_ORDER:", "CONSCIOUS_CREATION_MODE:", "ELEMENT_ACCOUNTABILITY:", "DECISION_TEST:", "REMOVAL_TEST:"
- Blocos de alma: "STYLE_TREE:", "ARCHETYPE:", "EMOTIONAL_CORE:", "BRAND_SOUL:", "BRAND_PROMISE:", "VIEWER_JOURNEY:", "DESIGN_PHILOSOPHY:", "IDENTITY_ASSETS:", "STRUCTURED_PATTERNS:"
- Blocos de logo: "MASTER_LOGO:", "LOGO_REPLICATION:", "LOGO_SAFETY:", "CANONICAL_BRAND_NAME:", "EXACT_BRAND_TEXT:", "STRUCTURAL_CHARACTERS:", "NAME_FIDELITY_RULES:", "FORBIDDEN_NAME_VARIANTS:", "LOGO_CLEAR_SPACE:", "LOGO_MINIMUM_SIZE:", "LOGO_INCORRECT_USAGES:", "FAVICON_HINT:"
- Blocos da intenção gerativa: "PHASE_A_STRATEGIC_INTENT:", "JOBS_TO_BE_DONE:", "PAINS_TO_RESOLVE:", "GAINS_TO_DELIVER:", "RECOGNITION_ANCHORS_EXTENDED:", "NON_NEGOTIABLES:", "PHASE_B_SEMIOTIC_TRANSLATION:", "ICONIC_CUES:", "INDEXICAL_CUES:", "SYMBOLIC_CUES:", "GESTALT_RULES:", "SHAPE_PSYCHOLOGY_ADVANCED:", "NEGATIVE_SPACE_OPPORTUNITY:", "BOUBA_KIKI_BIAS:", "PHASE_C_BLUEPRINT:", "CENTRAL_THESIS:", "HERO_DECISION_EXTENDED:", "DOMINANT_HIERARCHY_EXTENDED:", "BLUEPRINT_COMPONENTS:", "PRODUCTION_CONSTRAINTS:", "PHASE_D_DISTINCTIVENESS_GOVERNANCE:", "ANTI_BLANDING_PROTOCOL:", "NOVELTY_TENSION:", "MOTION_READINESS:", "REDUCTION_STRESS_TEST:", "PHASE_E_RECURSIVE_VALIDATION:", "VALIDATION_AXES:", "REPAIR_LOOP:", "VISUAL_USABILITY_HEURISTICS:", "FAIL_CONDITIONS_EXTENDED:"

AMPLIFICAR (não apenas preservar):
- Metáforas sensoriais — se o prompt usa "warm 3200K candlelight on kraft paper", preserve e contextualize.
- Referências culturais — se cita fotógrafos, revistas ou campanhas específicas, mantenha.
- Direção emocional — se diz "the viewer must feel...", preserve a intenção completa.
- Flora/fauna/objects — se são identity assets da marca, mantenha a proeminência indicada.

NÃO SANITIZAR:
- Não transforme linguagem poética em linguagem técnica seca.
- Não remova "the viewer should want to reach out and touch" — isso é essência humana, não redundância.
- Não substitua referências específicas ("Kodak Portra 400 palette") por genéricas ("film aesthetic").

REGRA ABSOLUTA PARA LOGOS (asset key "logo_primary" ou "logo_dark_bg"):
Se o asset key for um logo, você está refinando um prompt de MARCA GRÁFICA — não uma foto, não uma cena, não uma composição ambiental.
PROIBIDO ABSOLUTAMENTE adicionar ao prompt:
- qualquer linguagem fotográfica (iluminação, bokeh, câmera, DOF, grain, atmosfera)
- qualquer cena ou ambiente (mesa, madeira, papel, natureza, studio background, contexto de uso)
- referências de campanha publicitária fotográfica (Nike campaigns, Gatorade portraits, etc.)
- efeitos visuais (shadows realistas, glow, halo, reflexo, bevel, emboss, 3D)
- texturas de superfície, materiais, mockups
OBRIGATÓRIO para logos: reforçar construção geométrica do mark, negative space, consistência de stroke weights, escalabilidade, cores planas, fundo sólido puro.
O bloco negativo do logo DEVE incluir: photography, photorealistic, scene, background texture, bokeh, lighting effects, shadows, 3D rendering, gradient fill, bevel, emboss, glow, halo.
Ao refinar logos, preserve também o que o prompt disser sobre warmth, spontaneity, signature energy, colloquial humanity, conceptual specificity, recognition anchors e fidelidade textual do nome. Não empurre o resultado para estética corporativa fria só porque o logo é vetorial.
Se houver qualquer bloco de naming fidelity, preserve-o literalmente e trate-o como restrição dura: o wordmark deve permanecer idêntico ao nome canônico, sem drift de ortografia, pontuação, acento, spacing ou substituição de caracteres.

CHECKLIST DE QUALIDADE (o prompt refinado DEVE ter TODOS):
✓ Conceito visual claro (o que a imagem SIGNIFICA, não apenas MOSTRA)
✓ Paleta de cores específica (hex ou nomes)
✓ Composição com regras espaciais (proporções, zonas, hierarquia)
✓ Iluminação com direção, temperatura e qualidade (EXCETO logos — sem iluminação)
✓ Mood/emoção com arco temporal (o que o espectador sente em 0.5s, 2s, 5s) (EXCETO logos — emoção via geometria do mark)
✓ Materialidade (texturas, superfícies quando aplicável) (EXCETO logos — sem texturas)
✓ Bloco negativo coerente, específico à marca, sem conflitos com o positivo

REGRAS POR PROVIDER:
- stability: tags/descritores com pesos (tag:1.3). Qualidade → sujeito → estilo → composição → iluminação → cor → mood. " --neg ..." no final. ~2000 chars positivo.
- dalle3: linguagem natural cinematográfica e experiencial. Parágrafos narrativos. "Do not include:" no final. ~3500 chars.
- ideogram: linguagem de design gráfico profissional. Tipografia precisa se há texto. "Do not include:" no final. ~1800 chars.
- imagen: linguagem natural/imperativa direta e concisa. "Do not include, do not generate:" no final. ~1600 chars.

SAÍDA: retorne EXCLUSIVAMENTE um JSON válido no formato:
{ "prompt": "..." }`;

    const userPrompt = `Provider de imagem: ${imageProvider}
Asset key: ${assetKey ?? ""}

Prompt base:
${basePrompt}`;

    let raw = "";

    if (textProvider === "gemini") {
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
              temperature: 0.25,
              maxOutputTokens: 2048,
            },
          }),
      });
      raw = resp.text ?? "";
    } else {
      const apiKey = openaiKey?.trim() || process.env.OPENAI_API_KEY;
      if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada." }, { status: 500 });
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: openaiModel?.trim() || "gpt-4o",
        temperature: 0.25,
        max_tokens: 2048,
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

    const prompt = (parsed as { prompt?: string }).prompt;
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "IA não retornou campo prompt." }, { status: 500 });
    }

    const trimmed = prompt.trim();
    const capped = imageProvider === "stability" ? trimmed.slice(0, 2400) : trimmed.slice(0, 4000);

    return NextResponse.json({ prompt: capped });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
