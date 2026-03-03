import { BrandbookData, ImageProvider } from "./types";

export const ASSET_CATALOG = [
  // ─── LOGO ──────────────────────────────────────────────────────────────────
  { key: "logo_primary",       label: "Logo — Fundo Claro",           description: "Símbolo + wordmark sobre fundo branco — versão principal da identidade", aspectRatio: "1:1",  category: "logo"    },
  { key: "logo_dark_bg",       label: "Logo — Versão Invertida",      description: "Logo em negativo sobre fundo escuro — dark mode, vídeos, eventos",       aspectRatio: "1:1",  category: "logo"    },
  // ─── DIGITAL ───────────────────────────────────────────────────────────────
  { key: "brand_pattern",      label: "Padrão Gráfico Seamless",      description: "Textura tileable infinita — fundos, embalagens, papelaria, slides",       aspectRatio: "1:1",  category: "digital" },
  { key: "hero_visual",        label: "Hero do Site (Key Visual)",     description: "Imagem principal do site — traduz posicionamento e estilo visual (sem texto)", aspectRatio: "16:9", category: "digital" },
  { key: "hero_lifestyle",     label: "Foto Lifestyle (Editorial)",   description: "Público-alvo em contexto real — estética editorial, aspiracional e autêntica", aspectRatio: "16:9", category: "digital" },
  { key: "youtube_thumbnail",  label: "Thumbnail YouTube",            description: "Para o scroll — alto contraste, bold, CTR elevado em 0,5 segundos",        aspectRatio: "16:9", category: "digital" },
  { key: "presentation_bg",    label: "Fundo de Apresentação",        description: "Background para slides — on-brand, sutil, não compete com conteúdo",       aspectRatio: "16:9", category: "digital" },
  { key: "email_header",       label: "Header E-mail Marketing",      description: "Banner topo 600px — visual que aumenta abertura e CTR da newsletter",       aspectRatio: "21:9", category: "digital" },
  // ─── SOCIAL ────────────────────────────────────────────────────────────────
  { key: "instagram_carousel", label: "Carrossel Instagram — Slide 1", description: "Primeiro slide: para o scroll, gera curiosidade, força o deslize",        aspectRatio: "1:1",  category: "social"  },
  { key: "instagram_story",    label: "Story / Reels Cover",          description: "Full-bleed 9:16 — identidade instantânea, legível em 3 segundos",           aspectRatio: "9:16", category: "social"  },
  { key: "social_cover",       label: "Cover LinkedIn / YouTube",     description: "Banner de perfil — posicionamento, autoridade e estética profissional",      aspectRatio: "16:9", category: "social"  },
  { key: "social_post_square", label: "Feed Instagram / Facebook",    description: "Post quadrado — forte, marcante e reconhecível no feed",                    aspectRatio: "1:1",  category: "social"  },
  // ─── MOCKUP ────────────────────────────────────────────────────────────────
  { key: "app_mockup",         label: "App / Dashboard Mockup",       description: "Interface real do produto em dispositivo — não um template genérico",       aspectRatio: "9:16", category: "mockup"  },
  { key: "business_card",      label: "Cartão de Visitas 3D",         description: "Mockup fotorrealista frente+verso — materialidade e qualidade premium",     aspectRatio: "16:9", category: "mockup"  },
  { key: "brand_collateral",   label: "Kit Papelaria Corporativa",    description: "Flat-lay completo: cartão, letterhead, bloco, caneta, envelope, wax seal",  aspectRatio: "4:3",  category: "mockup"  },
  // ─── PRINT ─────────────────────────────────────────────────────────────────
  { key: "outdoor_billboard",  label: "Outdoor Urbano / OOH",         description: "Billboard em contexto urbano real — impacto máximo em 3 segundos",          aspectRatio: "16:9", category: "print"   },
 ] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "21:9";
  category: "logo" | "digital" | "social" | "print" | "mockup";
}>;

export type AssetKey = (typeof ASSET_CATALOG)[number]["key"];

function industryVisualLanguage(industry: string): string {
  const i = industry.toLowerCase();
  if (/saas|software|tech|cloud|ai|data|platform|digital|startup|api|b2b/.test(i))
    return "glowing data nodes, interconnected digital flows, floating UI panels, luminous gradient fields, geometric circuit-like patterns, abstract network topology";
  if (/restauran|food|gastro|caf|coffee|bar|sushi|pizza|chef|culin|bistr/.test(i))
    return "food textures and macro close-ups, steam wisps, overhead plating photography, ingredient details, warm candlelit or amber kitchen light";
  if (/fintech|financ|bank|invest|crédit|crypto|insurance|wealth|asset/.test(i))
    return "geometric precision, golden ratio compositions, metallic gradient fields (gold/platinum), abstract data flow lines, architectural security-suggesting forms";
  if (/health|saúde|medic|clinic|pharma|wellness|biotech|hospital/.test(i))
    return "clean whites and calming blues, human touch moments, scientific precision, cell/molecular abstract forms, soft clinical lighting";
  if (/fitness|gym|sport|treino|esport|atleta|performanc/.test(i))
    return "kinetic motion blur, muscle definition close-ups, outdoor dramatic light, explosive energy gestures, high-contrast athletic body forms";
  if (/fashion|moda|luxury|luxo|jewel|jóia|accessory|beauty|cosmetic|skin/.test(i))
    return "editorial negative space, fabric texture close-ups, product on skin/body, dramatic shadow play, high-fashion side lighting";
  if (/education|educação|cours|learn|school|universit|ensino/.test(i))
    return "open knowledge metaphors, light streaming through windows, collaborative group moments, books and growth symbolism, bright optimistic environments";
  if (/construc|constru|architect|real estate|imobil|engenharia/.test(i))
    return "architectural perspective lines, material textures (concrete, glass, steel), spatial depth through structures, morning golden light on facades";
  if (/ecommerc|retail|loja|shop|market|varejo/.test(i))
    return "product hero shots, lifestyle-in-context, clean product-on-surface photography, packaging details, aspirational home/lifestyle environments";
  if (/creat|design|agência|agency|media|publicidad|estúdio|studio/.test(i))
    return "bold typographic compositions, Pantone color chips, creative process artifacts, sketches and screens, vibrant creative workspace environments";
  if (/logistic|transport|frete|supply chain|entregas/.test(i))
    return "movement and speed trails, infrastructure scale, precise mechanical systems, global network maps, urban logistics contexts";
  return "clean geometric abstraction, purposeful negative space, brand color field compositions, minimal premium design language";
}

function extractBrandContext(data: BrandbookData) {
  const igb = data.imageGenerationBriefing;
  const pos = data.positioning;
  const vi = data.verbalIdentity;
  const persona = data.audiencePersonas?.[0];

  // Colors
  const primaryColor = data.colors.primary[0]?.hex ?? "#1a1a1a";
  const primaryColorName = data.colors.primary[0]?.name ?? "primary";
  const secondaryColor = data.colors.primary[1]?.hex ?? data.colors.secondary[0]?.hex ?? "#ffffff";
  const accentColor = data.colors.secondary[0]?.hex ?? data.colors.primary[1]?.hex ?? "#888888";
  const allPrimaryColors = data.colors.primary.map((c) => `${c.name} (${c.hex})`).join(", ");
  const allColors = [...data.colors.primary, ...data.colors.secondary].map((c) => `${c.name} ${c.hex}`).join(" · ");

  // Typography
  const displayFont = data.typography.marketing?.name ?? data.typography.primary?.name ?? "modern sans-serif";
  const bodyFont = data.typography.ui?.name ?? data.typography.secondary?.name ?? displayFont;

  // Brand Concept
  const personality = data.brandConcept.personality.slice(0, 5).join(", ");
  const values = data.brandConcept.values.slice(0, 4).join(", ");
  const mission = data.brandConcept.mission ?? `${data.brandName} serves ${data.industry}`;
  const toneOfVoice = data.brandConcept.toneOfVoice ?? "professional and confident";
  const uniqueValue = data.brandConcept.uniqueValueProposition ?? pos?.positioningStatement ?? `leading ${data.industry} solution`;

  // Positioning
  const targetMarket = pos?.targetMarket ?? `${data.industry} professionals and businesses`;
  const differentiators = pos?.primaryDifferentiators?.slice(0, 3).join(", ") ?? "innovation, quality, reliability";

  // Verbal Identity
  const tagline = vi?.tagline ? `Brand tagline: "${vi.tagline}".` : "";
  const sampleHeadline = vi?.sampleHeadlines?.[0] ?? "";
  const voiceTraits = vi?.brandVoiceTraits?.slice(0, 3).join(", ") ?? personality;

  // Key Visual
  const photoStyle = igb?.photographyMood ?? data.keyVisual.photographyStyle ?? "editorial professional photography";
  const elements = data.keyVisual.elements.slice(0, 5).join(", ");
  const visualStyle = igb?.visualStyle ?? `premium ${data.industry} brand design`;
  const colorMood = igb?.colorMood ?? `dominant ${primaryColorName} (${primaryColor}), contrasting ${secondaryColor}`;
  const composition = igb?.compositionNotes ?? "clean asymmetric layout, generous negative space";
  const artisticRef = igb?.artisticReferences ?? "Pentagram, Apple brand photography, Wallpaper magazine";
  const moodWords = igb?.moodKeywords?.join(", ") ?? personality;
  const marketingLanguage = igb?.marketingVisualLanguage ?? "bold editorial graphic design with cinematic quality";
  const negativeBase = igb?.negativePrompt ?? "blurry, low quality, watermark, amateur, pixelated, deformed, ugly";
  const avoid = igb?.avoidElements ?? "clutter, low quality, stock-photo clichés, generic";

  // Logo
  const logoSymbol = data.logo.symbol ?? `abstract symbol for ${data.brandName}`;
  const logoPrimary = data.logo.primary ?? `clean logotype for ${data.brandName}`;
  const logoStyle = igb?.logoStyleGuide ?? `precise vector, ${logoPrimary}`;
  const patternStyle = igb?.patternStyle ?? `geometric repeating motifs derived from brand symbol`;

  // Audience
  const audienceDesc = persona
    ? `${persona.role} — ${persona.context} — goals: ${persona.goals.slice(0, 2).join(", ")}`
    : targetMarket;

  // Messaging
  const messagingPillar = vi?.messagingPillars?.[0]
    ? `${vi.messagingPillars[0].title} — ${vi.messagingPillars[0].description}`
    : uniqueValue;
  const preferredVocab = vi?.vocabulary?.preferred?.slice(0, 5).join(", ") ?? "";
  const reasonsToBelieve = [
    ...(data.brandConcept.reasonsToBelieve ?? []),
    ...(pos?.reasonsToBelieve ?? []),
  ].slice(0, 3).join(", ") || differentiators;
  const userPsychographics = data.brandConcept.userPsychographics ?? audienceDesc;
  const marketingArch = data.keyVisual.marketingArchitecture ?? marketingLanguage;
  const competitiveAngle = pos?.competitiveAlternatives?.length
    ? `Visually distinct from ${pos.competitiveAlternatives.slice(0, 2).join(" / ")}: ${differentiators}.`
    : `Visually superior to generic ${data.industry} imagery — ${differentiators}.`;
  const purpose = data.brandConcept.purpose ?? mission;
  const visualMetaphor = `${elements} — abstract representation of ${moodWords} through ${data.industry} lens`;

  // Industry visual language (specific to sector)
  const industryLang = industryVisualLanguage(data.industry);

  // Brand applications (real use cases defined in brandbook)
  const brandApplications = data.applications
    .slice(0, 5)
    .map((a) => `${a.type}: ${a.description}`)
    .join(" | ");

  // Messaging pillar depth
  const firstPillar = vi?.messagingPillars?.[0];
  const pillarProofPoints = firstPillar?.proofPoints?.slice(0, 3).join(", ") ?? reasonsToBelieve;
  const pillarCopy = firstPillar?.exampleCopy?.[0] ?? vi?.sampleHeadlines?.[0] ?? "";

  // Persona pain points (the "before" state)
  const painPoints = persona?.painPoints?.slice(0, 2).join("; ") ?? `challenges in ${data.industry}`;

  // Verbal identity — vocabulary to avoid (feeds negative prompts)
  const verbAvoid = vi?.vocabulary?.avoid?.slice(0, 4).join(", ") ?? "";

  // CTAs
  const sampleCTA = vi?.sampleCTAs?.[0] ?? "";

  return {
    primaryColor, primaryColorName, secondaryColor, accentColor,
    allPrimaryColors, allColors,
    displayFont, bodyFont,
    personality, values, mission, toneOfVoice, uniqueValue,
    targetMarket, differentiators,
    tagline, sampleHeadline, voiceTraits,
    photoStyle, elements, visualStyle, colorMood, composition,
    artisticRef, moodWords, marketingLanguage, negativeBase, avoid,
    logoSymbol, logoPrimary, logoStyle, patternStyle,
    audienceDesc, messagingPillar, preferredVocab, reasonsToBelieve,
    userPsychographics, marketingArch, competitiveAngle, purpose, visualMetaphor,
    industryLang, brandApplications,
    pillarProofPoints, pillarCopy, painPoints, verbAvoid, sampleCTA,
  };
}

function providerQuality(provider: ImageProvider, key: AssetKey): string {
  const isMockup = ["business_card", "brand_collateral", "app_mockup", "outdoor_billboard"].includes(key);
  const isLogo = key === "logo_primary" || key === "logo_dark_bg";
  const isPattern = key === "brand_pattern" || key === "presentation_bg";
  const isSocial = ["social_post_square", "instagram_carousel", "instagram_story", "social_cover", "youtube_thumbnail"].includes(key);

  if (provider === "dalle3") {
    if (isLogo)    return "vector-perfect illustration, sharp crisp edges, Pentagram identity studio quality, clean professional logo design, award-winning brand identity";
    if (isMockup)  return "hyperrealistic commercial product photography, ultra-sharp, Hasselblad medium format quality, octane render 8K, studio-grade lighting, advertising campaign quality";
    if (isPattern) return "precise geometric illustration, crisp vector-quality edges, perfect seamless tile, professional brand pattern system, Dribbble-quality design";
    if (isSocial)  return "social media design excellence, Dribbble award-winning, sharp bold graphic, thumb-stopping visual hierarchy, mobile-optimized for 2x retina";
    return "ultra-high resolution commercial photography, award-winning brand campaign, shot on Phase One IQ4, published in Wallpaper magazine, masterpiece quality";
  }
  if (provider === "stability") {
    if (isMockup)  return "hyperrealistic product photography, 8K UHD, Hasselblad medium format, professional studio lighting, octane render, photorealistic material texture";
    if (isLogo || isPattern) return "precise clean graphic illustration, sharp geometric edges, professional brand identity quality, crisp details";
    return "8K UHD, award-winning editorial photography, sharp focus, highly detailed, Kodak Portra 400 film aesthetic, professional color grading";
  }
  if (provider === "imagen") {
    if (isMockup)  return "photorealistic commercial photography, professional studio lighting, sharp details, high fidelity";
    if (isLogo || isPattern) return "clean precise graphic design, sharp edges, professional illustration quality";
    return "high-fidelity photorealistic image, professional photography quality, rich color, balanced exposure";
  }
  // ideogram
  if (isLogo)   return "vector logo design, precise linework, professional brand identity, clean scalable symbol";
  if (isSocial) return "bold graphic design, high contrast, clear visual hierarchy, professional design quality";
  return "professional graphic design, crisp edges, bold visual impact, commercial quality";
}

function neg(ctx: ReturnType<typeof extractBrandContext>, provider: ImageProvider, extra = ""): string {
  const all = [ctx.negativeBase, ctx.avoid, extra].filter(Boolean).join(", ");
  if (provider === "stability") return ` --neg ${all}`;
  if (provider === "dalle3")    return ` Avoid including: ${all}.`;
  if (provider === "imagen")    return ` Do not include, do not generate: ${all}.`;
  /* ideogram */                return ` Do not include: ${all}.`;
}

function providerPrefix(provider: ImageProvider): string {
  if (provider === "imagen") return "Create a high-quality photorealistic image. ";
  if (provider === "ideogram") return "Design a professional graphic image. ";
  return "";
}

function stabilityTags(ctx: ReturnType<typeof extractBrandContext>, key: AssetKey): string {
  const isPhoto = ["hero_visual","hero_lifestyle","app_mockup","business_card","brand_collateral","outdoor_billboard"].includes(key);
  if (isPhoto) return `(masterpiece:1.4), (best quality:1.3), (photorealistic:1.3), (8k uhd:1.2), (sharp focus:1.2), ${ctx.primaryColor} color grade, ${ctx.moodWords}`;
  return `(masterpiece:1.4), (best quality:1.3), (crisp vector:1.3), (sharp edges:1.2), professional graphic design, ${ctx.primaryColor} dominant`;
}

export function buildImagePrompt(key: AssetKey, data: BrandbookData, provider: ImageProvider): string {
  const ctx = extractBrandContext(data);
  const q = providerQuality(provider, key);
  const B = `"${data.brandName}"`;
  const prefix = providerPrefix(provider);
  const sTags = provider === "stability" ? stabilityTags(ctx, key) : "";

  const parts = (...lines: (string | false | undefined | null)[]): string =>
    lines.filter(Boolean).join(" ");

  switch (key) {

    case "logo_primary": {
      const ideogramWord = provider === "ideogram"
        ? `Wordmark text "${data.brandName}" precisely lettered in ${ctx.displayFont} typography.` : "";
      return parts(
        prefix,
        `Professional brand identity logo for ${B}, a ${data.industry} company.`,
        ideogramWord,
        `BRAND PURPOSE: ${ctx.purpose}.`,
        `LOGO CONCEPT: ${ctx.logoStyle}. Symbol concept: ${ctx.logoSymbol} — evokes ${ctx.moodWords}.`,
        `COLOR: ${ctx.primaryColor} (${ctx.primaryColorName}) on pure white (#FFFFFF). Accent: ${ctx.accentColor}.`,
        `TYPOGRAPHY: ${ctx.displayFont} wordmark. PERSONALITY: ${ctx.personality}. VALUES: ${ctx.values}.`,
        `VISUAL STYLE: ${ctx.visualStyle}. ${ctx.competitiveAngle}`,
        `TECHNICAL: Isolated logomark + wordmark lockup, crisp vector graphic, sharp edges, scalable symbol,`,
        `flat 2D vector mark (SVG-like), consistent line weights, no gradients, no 3D, no mockups, no perspective, no lighting effects,`,
        `no drop shadows, no textures, no bevel/emboss, pure white background, centered composition.`,
        sTags, q, neg(ctx, provider, "3D, photorealistic, mockup, perspective, gradients, bevel, emboss, realistic lighting, shadows"),
      );
    }

    case "logo_dark_bg": {
      const ideogramWord = provider === "ideogram"
        ? `Wordmark text "${data.brandName}" precisely lettered in ${ctx.displayFont} typography, white/light version.` : "";
      return parts(
        prefix,
        `Brand identity logo — dark background version for ${B} (${data.industry}).`,
        ideogramWord,
        `BRAND PURPOSE: ${ctx.purpose}.`,
        `LOGO: ${ctx.logoPrimary} — inverted/reversed color version. ${ctx.logoSymbol} — evokes ${ctx.moodWords}.`,
        `COLOR: White or very light (#FFFFFF or near-white) logo on solid deep dark background ${ctx.primaryColor}.`,
        `PERSONALITY: ${ctx.personality}. Tone: ${ctx.toneOfVoice}.`,
        `PURPOSE: Dark websites, video intros, event backdrops, dark mode UI, investor decks.`,
        `TECHNICAL: Maximum contrast inverted lockup, flat 2D vector mark (SVG-like), pure flat solid dark background,`,
        `no gradients, no textures, no halos, no glow, no 3D, no mockups, centered.`,
        sTags, q, neg(ctx, provider, "3D, photorealistic, mockup, perspective, gradients, glow, bevel, emboss, realistic lighting, shadows"),
      );
    }

    case "brand_pattern": {
      const patternEls = data.keyVisual.patterns?.length
        ? `Specific motifs: ${data.keyVisual.patterns.slice(0, 4).join(", ")}.`
        : `Derived from brand symbol: ${ctx.logoSymbol}.`;
      return parts(
        prefix,
        `Seamless infinitely-tileable brand surface pattern for ${B} (${data.industry}).`,
        `PATTERN DESIGN: ${ctx.patternStyle}. ${patternEls}`,
        `STRICT COLOR PALETTE — no other colors: ${ctx.allPrimaryColors}.`,
        `VISUAL LANGUAGE: ${ctx.visualStyle}. Brand elements: ${ctx.elements}. Mood: ${ctx.moodWords}.`,
        `PURPOSE: Packaging, stationery, website backgrounds, slide decks, event materials.`,
        `TECHNICAL: Geometric precision, perfect tile zero visible seams, flat design,`,
        `consistent line weights, square composition, abstract shapes — no text, no logos, no photographic content.`,
        sTags, q, neg(ctx, provider, "visible seams, text, logos, photographic content, random noise"),
      );
    }

    case "hero_visual": {
      const intentCopy = ctx.sampleHeadline
        ? `This image appears beside headline: "${ctx.sampleHeadline}".`
        : `Must visually communicate: ${ctx.uniqueValue}.`;
      return parts(
        prefix,
        `PLATFORM: Website hero / key visual banner for ${B} (${data.industry}) — 16:9 widescreen.`,
        `INTENT: Establish immediate brand impression (positioning + credibility + mood). This is a brandbook application image, not a generic "landing page" template.`,
        `TARGET VIEWER: ${ctx.userPsychographics}.`,
        `CORE MESSAGE TO VISUALIZE: ${ctx.messagingPillar}.`,
        intentCopy,
        ctx.tagline,
        `VISUAL SUBJECT: Abstract-cinematic interpretation of ${ctx.visualMetaphor}.`,
        `INDUSTRY-SPECIFIC VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `Art direction: ${ctx.photoStyle}. Visual language: ${ctx.marketingArch}.`,
        `CREDIBILITY SIGNALS embedded in imagery: ${ctx.reasonsToBelieve}.`,
        `${ctx.competitiveAngle}`,
        `Brand elements present: ${ctx.elements}. References: ${ctx.artisticRef}.`,
        `COLOR GRADING: ${ctx.colorMood}. Dominant ${ctx.primaryColor}, accent ${ctx.secondaryColor}. Cinematic color cast.`,
        `LIGHTING: Dramatic three-point studio-cinematic light. Key light warm ${ctx.primaryColor} from upper-left. Deep shadow falloff to right.`,
        `COMPOSITION: ${ctx.composition}. Strong depth of field, foreground-to-background layers. Rule of thirds.`,
        `MOOD: ${ctx.moodWords}. Mission: ${ctx.mission}.`,
        sTags,
        `No text, no logos — keep a clean copy-safe negative space area for website headline.`,
        q, neg(ctx, provider, "text overlays, logos, generic stock, flat even lighting, overcrowded scene"),
      );
    }

    case "hero_lifestyle": {
      return parts(
        prefix,
        `PLATFORM: Editorial lifestyle photography for ${B} (${data.industry}) — brandbook application for web and campaigns.`,
        `INTENT: Human, believable brand storytelling. Show the audience living the brand values and desired outcome — without looking like stock photo.`,
        `SUBJECT: ${ctx.userPsychographics}. Authentic unstaged moment in their real environment.`,
        `PAIN CONTEXT (the problem being solved): ${ctx.painPoints} — the image shows the AFTER state, not the pain itself.`,
        `SCENE: ${ctx.audienceDesc} in a realistic ${data.industry} context — relaxed, confident, successful outcome.`,
        `INDUSTRY SCENE LANGUAGE: ${ctx.industryLang}.`,
        `VISUAL LANGUAGE: ${ctx.photoStyle}. ${ctx.colorMood}.`,
        `Brand color ${ctx.primaryColor} organically present in environment, clothing detail, or prop — subtle, never forced.`,
        `EMOTIONAL CORE: ${ctx.messagingPillar}. Viewer should feel: ${ctx.moodWords}.`,
        `${ctx.competitiveAngle}`,
        `CAMERA: 50mm f/1.8 lens, shallow depth of field, slight motion blur on background. Natural or soft window light.`,
        `LIGHTING: Golden hour or diffused natural daylight. Warm key light, cool fill. Film-like tonal range.`,
        `PEOPLE: Authentic, diverse, non-model-perfect. Real emotion — not corporate smiling. Candid or near-candid.`,
        `${ctx.artisticRef} editorial approach. Wide 16:9. Left or center clear zone for optional copy overlay.`,
        `No logos visible, no text on clothing, pure documentary editorial quality.`,
        sTags, q, neg(ctx, provider, `overly posed, fake corporate smile, stock photo aesthetic, generic office, plastic-looking, HDR${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "instagram_carousel": {
      return parts(
        prefix,
        `PLATFORM: Instagram carousel FIRST SLIDE — perfect square 1:1 format. This is the hook that determines if anyone sees the rest.`,
        `MARKETING INTENT: Arrest thumb-scroll in 0.3 seconds. Create visual curiosity gap — must feel incomplete, make viewer SWIPE RIGHT.`,
        `WHO STOPS: ${ctx.userPsychographics} — they stop for ${ctx.moodWords} content that feels ${ctx.personality}.`,
        `VISUAL HOOK CONCEPT: Bold editorial visual suggesting "${ctx.pillarCopy || ctx.messagingPillar}" without showing text.`,
        ctx.tagline,
        `BRAND: ${B} — ${ctx.personality}. Industry: ${data.industry}.`,
        `VISUAL DESIGN: ${ctx.marketingArch}. Full-bleed ${ctx.primaryColor} dominant background.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `CENTRAL SUBJECT: ${ctx.visualMetaphor} — one element, hyper-sharp, maximum visual weight.`,
        `COLOR PALETTE (strict, no others): ${ctx.allPrimaryColors}. High-contrast accent pop: ${ctx.accentColor}.`,
        `COMPOSITION: Asymmetric tension — dominant element occupies 60% of frame, remaining 40% is intentional negative space.`,
        `TEXT ZONE: Reserve lower 25% as flat ${ctx.secondaryColor} strip for text overlay (not rendered in image).`,
        `PROOF POINTS to visualize: ${ctx.pillarProofPoints}.`,
        `MOOD: ${ctx.moodWords}. Energy: high-impact, thumb-stopping, premium, social-native.`,
        `${ctx.competitiveAngle}`,
        `Reference: Spotify, Apple, top-performing ${data.industry} carousel decks. No actual text.`,
        sTags, q, neg(ctx, provider, `cluttered, multiple competing elements, generic gradient, centered symmetry${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "instagram_story": {
      return parts(
        prefix,
        `PLATFORM: Instagram Story / Reels cover — full-bleed vertical 9:16 format (1080×1920px).`,
        `MARKETING INTENT: Instant brand recognition in 3 seconds of full-screen mobile attention. Drive profile visits, product clicks.`,
        `BRAND PURPOSE: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `VISUAL SUBJECT: ${ctx.visualMetaphor} — central element in upper half, vertically oriented, bold and large.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `VISUAL DESIGN: Full-bleed vertical. Dominant color: ${ctx.primaryColor}. Secondary: ${ctx.secondaryColor}.`,
        `${ctx.visualStyle}. Key visual: ${ctx.elements}.`,
        ctx.tagline,
        `CORE MESSAGE: ${ctx.messagingPillar}.`,
        `COMPOSITION (strict vertical zones):
        - Top 10%: safe zone (status bar area) — keep clear
        - Top 10–50%: dominant brand visual/graphic, maximum visual weight here
        - Middle 50–75%: breathing space, soft continuation of visual
        - Bottom 75–85%: text overlay zone (flat or gradient, design only — no actual text)
        - Bottom 85–100%: CTA/link sticker zone — keep flat ${ctx.primaryColor} or ${ctx.secondaryColor}`,
        `MOOD: ${ctx.moodWords}. Immediate, bold, vertically dynamic, recognizable even as a 60px thumbnail.`,
        `${ctx.competitiveAngle}`,
        `Inspired by top brand stories: Apple, Spotify, Airbnb, Nike — adapted to ${data.industry}. No actual text.`,
        sTags, q, neg(ctx, provider, "horizontal elements, landscape framing, cluttered bottom, multiple focal points"),
      );
    }

    case "social_cover": {
      return parts(
        prefix,
        `PLATFORM: LinkedIn profile cover / YouTube channel banner — 16:9 widescreen (2560×1440px).`,
        `MARKETING INTENT: First impression on professional profile. Must establish authority and positioning in 1 second.`,
        `Viewer: ${ctx.targetMarket} — evaluating ${B} for the first time. They judge credibility instantly.`,
        `BRAND MESSAGE: ${ctx.messagingPillar}. Proof: ${ctx.reasonsToBelieve}.`,
        ctx.tagline,
        `${ctx.competitiveAngle}`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `VISUAL DESIGN: ${ctx.marketingArch}. ${ctx.visualStyle}.`,
        `COLOR: ${ctx.primaryColor} dominant background. ${ctx.secondaryColor} structural accent. ${ctx.accentColor} highlight.`,
        `COMPOSITION (strict horizontal zones):
        - Left 35%: clear flat zone — profile photo safe area (LinkedIn standard)
        - Center-right 65%: bold brand graphic — ${ctx.visualMetaphor} — strong geometric or abstract forms
        - Right edge: ${ctx.accentColor} vertical accent stripe (optional depth element)`,
        `VISUAL ELEMENTS: ${ctx.elements}. Bold, architectural, professional. Not decorative — structural.`,
        `MOOD: ${ctx.moodWords}. Confident, credible, premium, memorable.`,
        `No text, no lorem ipsum — pure brand graphic authority.`,
        sTags, q, neg(ctx, provider, "cluttered, multiple focal points, text overlays, generic corporate clip art, low contrast"),
      );
    }

    case "social_post_square": {
      return parts(
        prefix,
        `PLATFORM: Instagram/Facebook feed post — perfect square 1:1 format. Competes in a dense feed of content.`,
        `MARKETING INTENT: Brand presence + saves + shares. Must be recognizable as ${B} in a feed thumbnail.`,
        `BRAND: ${B} — ${ctx.personality}. Core message: ${ctx.messagingPillar}.`,
        ctx.tagline,
        ctx.sampleCTA ? `VISUAL CTA ENERGY: The post visually suggests the feeling of "${ctx.sampleCTA}" — action, forward motion.` : "",
        `VISUAL CONCEPT: ${ctx.marketingArch}. Bold, single-minded composition.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `VISUAL SUBJECT: ${ctx.visualMetaphor} — rendered with maximum graphic intention.`,
        `COLOR PALETTE (brand-strict): ${ctx.allColors}. Dominant: ${ctx.primaryColor}.`,
        `COMPOSITION: ${ctx.composition}. ONE dominant focal element — all other elements serve it. Perfect square balance.`,
        `MOOD/ENERGY: ${ctx.moodWords}. Voice energy: ${ctx.toneOfVoice}. Visual vocabulary: ${ctx.preferredVocab || ctx.personality}.`,
        `${ctx.visualStyle}.`,
        `PHOTOGRAPHY (if lifestyle): ${ctx.photoStyle}. Camera: 35mm, f/2.0, square crop.`,
        `${ctx.competitiveAngle}`,
        `No text in image — pure brand visual language.`,
        sTags, q, neg(ctx, provider, `generic stock imagery, overcrowded, multiple competing focal points${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "youtube_thumbnail": {
      return parts(
        prefix,
        `PLATFORM: YouTube video thumbnail — 1280×720px 16:9 format. Will be shown at 168×94px in feed — must work at tiny scale.`,
        `MARKETING INTENT: Maximize CTR against competing thumbnails. Viewer must feel compelled in 0.5 seconds.`,
        `PSYCHOLOGICAL HOOK: ${ctx.messagingPillar} — create curiosity + authority simultaneously.`,
        `${ctx.competitiveAngle}`,
        `BRAND: ${B} (${data.industry}). ${ctx.tagline}`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `VISUAL SUBJECT: High-drama close-up — ${ctx.visualMetaphor}. Foreground element takes 50% of frame, hyper-sharp.`,
        `BACKGROUND: Solid bold ${ctx.primaryColor} or strong gradient ${ctx.primaryColor} → ${ctx.secondaryColor}. No photographic background.`,
        `COLOR: Maximum contrast. ${ctx.primaryColor} field, ${ctx.accentColor} focal highlight. Brand palette: ${ctx.allPrimaryColors}.`,
        `COMPOSITION: Subject occupies left 55%, right 45% reserved (clear flat zone for text overlay not rendered here).`,
        `Rule of thirds — subject eyes/peak at upper-right third intersection if human subject.`,
        `MOOD: ${ctx.moodWords}. Energy: bold, premium, unmistakably clickable.`,
        `LIGHTING: Dramatic rim light in ${ctx.accentColor}, dark background shadow — creates depth and intrigue.`,
        `Reference: MrBeast, Kurzgesagt, top ${data.industry} premium channels. No actual text. Works at 1/10th scale.`,
        sTags, q, neg(ctx, provider, "low contrast, muddy mid-tones, text, cluttered background, flat even lighting"),
      );
    }

    case "presentation_bg": {
      return parts(
        prefix,
        `PLATFORM: Presentation slide background — 16:9 widescreen for PowerPoint/Keynote/Google Slides.`,
        `DESIGN INTENT: Silent brand presence. Must NOT compete with slide text or charts. Audience reads the slide content, not the background.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `VISUAL SUBJECT: Extremely subtle ${ctx.visualMetaphor} — abstracted to near-invisibility.`,
        `DESIGN: Semi-abstract micro-geometry from ${ctx.logoSymbol}. Elements: ${ctx.elements} — suggested, not shown.`,
        `BASE TONE: ${ctx.primaryColor} very dark or very light interpretation — maximum 15% saturation.`,
        `Geometric motifs in ${ctx.accentColor} at 8–15% opacity. Gradient vignette toward edges.`,
        `COLOR RULE: Monochromatic brand palette only. Varying opacity 5–20%. Never full-saturation. Never photographic.`,
        `COMPOSITION: Visual texture in far corners and edges. Center 60% of frame must be plain and flat — this is the content zone.`,
        `Bottom-left or top-right: subtle brand motif at 10% opacity.`,
        `MOOD: ${ctx.moodWords} — but whispered, not shouted. Background is the frame, not the art.`,
        sTags, q, neg(ctx, provider, "busy pattern, high saturation, distracting, photographic, text, logos, centered elements"),
      );
    }

    case "email_header": {
      return parts(
        prefix,
        `PLATFORM: E-mail marketing header banner — ultra-wide 21:9 (600px email standard, will render as thin horizontal strip).`,
        `MARKETING INTENT: Increase open-to-click rate. First visual after subject line. 70% of opens are mobile — must work at 320px wide.`,
        `Viewer context: ${ctx.audienceDesc} who just opened a ${B} email. They have 2 seconds before deciding to scroll or close.`,
        `CORE MESSAGE TO SUPPORT: ${ctx.messagingPillar}. Proof: ${ctx.pillarProofPoints}.`,
        ctx.sampleCTA ? `EMOTIONAL DIRECTION: The banner visually primes the viewer for the CTA "${ctx.sampleCTA}" below it.` : "",
        ctx.tagline,
        `VISUAL DESIGN: ${ctx.marketingArch}. Clean, horizontal, immediately branded.`,
        `COLOR: ${ctx.primaryColor} dominant field. ${ctx.secondaryColor} accent. Flat or subtle gradient — never photographic background.`,
        `VISUAL ELEMENT: ${ctx.elements} — abstracted, single motif, left-anchored. Thin horizontal strip composition.`,
        `COMPOSITION: Left 30%: brand visual/motif in ${ctx.accentColor} or ${ctx.secondaryColor}. Right 70%: clean flat ${ctx.primaryColor} field for headline text overlay.`,
        `MOOD: ${ctx.moodWords}. Tone: ${ctx.toneOfVoice}. Minimal, premium, brand-consistent.`,
        `${ctx.visualStyle}. No actual text — graphic background layer only.`,
        sTags, q, neg(ctx, provider, `text, lorem ipsum, photographic busy background, centered composition, multiple elements${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "app_mockup": {
      const uxLayout = data.uxPatterns?.dashboardLayout ?? `clean ${data.industry} dashboard with data visualizations`;
      return parts(
        prefix,
        `PLATFORM: Product UI mockup in modern iPhone 15 Pro (portrait) or MacBook Pro 14\" (landscape) device frame.`,
        `MARKETING INTENT: Show the actual product value, not a template. Viewer is ${ctx.targetMarket} in evaluation mode.`,
        `This must look like ${B}'s REAL interface — specific to ${data.industry}, not a generic UI kit.`,
        `BRAND APPLICATIONS CONTEXT: ${ctx.brandApplications}.`,
        `UI LAYOUT: ${uxLayout}. Core feature shown: ${ctx.messagingPillar}.`,
        `COLOR SYSTEM: Primary ${ctx.primaryColor} for key actions/accents, ${ctx.secondaryColor} for surfaces, neutral for text/backgrounds.`,
        `TYPOGRAPHY on screen: ${ctx.displayFont} Bold for headers, ${ctx.bodyFont} Regular for body, ${ctx.primaryColor} for interactive labels.`,
        `SCREEN CONTENT: Realistic ${data.industry} data — meaningful charts, metrics, workflow progress, branded status indicators.`,
        `PROOF POINTS visible in UI: ${ctx.reasonsToBelieve} — make these feel real through specific UI elements.`,
        `Brand visual signature in UI: ${ctx.elements}. ${ctx.visualStyle}.`,
        `MOCKUP SCENE: Device on minimal studio desk surface. Soft ambient bokeh background in ${ctx.primaryColor} dark tint.`,
        `LIGHTING: Subtle edge screen glow, realistic device reflections, soft top-down studio light on device body.`,
        `Perspective: natural 3/4 tilt, 15–20° rotation, professional product photography angle.`,
        sTags, q, neg(ctx, provider, "generic UI template, lorem ipsum, fake stock data, flat perspective, plastic device"),
      );
    }

    case "business_card": {
      return parts(
        prefix,
        `PLATFORM: Premium business card mockup — both front and back visible, 16:9 scene.`,
        `MARKETING INTENT: Represent the brand's physical touchpoint — communicate quality and positioning at first touch.`,
        `BRAND APPLICATIONS: ${ctx.brandApplications}.`,
        `CARD FRONT: ${ctx.logoPrimary}, dominant color ${ctx.primaryColor}, white space, minimal layout.`,
        `CARD BACK: ${ctx.primaryColor} solid or brand pattern (${ctx.patternStyle}), minimal.`,
        `Typography on card: ${ctx.displayFont} for name, ${ctx.bodyFont} for contact info.`,
        `MOCKUP SCENE: Elegant 3/4 angle on premium surface — ${ctx.photoStyle}.`,
        `Surface: marble, dark stone, or fine textured paper. Matches brand: ${ctx.visualStyle}.`,
        `LIGHTING: Soft directional studio light 45°, long sharp shadow, premium paper stock texture visible.`,
        `Both cards arranged with intentional angle, depth of field, luxury photographic quality.`,
        `MOOD: ${ctx.moodWords}. Premium, confident, tasteful.`,
        sTags, q, neg(ctx, provider, "flat illustration, cartoon style, plastic-looking surface, harsh or flat lighting"),
      );
    }

    case "brand_collateral": {
      return parts(
        prefix,
        `PLATFORM: Corporate stationery collection flat-lay — overhead 4:3 format.`,
        `MARKETING INTENT: Showcase the complete physical brand identity system for pitches and brand guidelines.`,
        `BRAND APPLICATIONS IN USE: ${ctx.brandApplications}.`,
        `ITEMS: Business card front+back, A4 letterhead sheet, kraft/coated notebook with embossed logo,`,
        `quality ballpoint pen, branded envelope with wax seal, brand element sticker or stamp.`,
        `All items branded with ${B}: color ${ctx.primaryColor}, logo, pattern ${ctx.patternStyle}.`,
        `STRICT COLOR: ${ctx.allPrimaryColors} only — no off-brand colors on any item.`,
        `SURFACE: ${ctx.photoStyle} — marble, raw concrete, natural linen, or fine wood. Style: ${ctx.visualStyle}.`,
        `LIGHTING: Soft natural window light from 45°, crisp soft shadows, luxury editorial feel.`,
        `COMPOSITION: ${ctx.composition}. Artfully arranged with intentional negative space, slight overlapping.`,
        `MOOD: ${ctx.moodWords}. Tasteful, editorial, premium.`,
        sTags, q, neg(ctx, provider, "plastic surfaces, harsh shadows, poor lighting, off-brand colors, generic office supplies"),
      );
    }

    case "outdoor_billboard": {
      return parts(
        prefix,
        `PLATFORM: Large-format OOH billboard mockup in busy urban street — 16:9 landscape.`,
        `MARKETING INTENT: Single-message brand awareness at 60 km/h. No one reads paragraphs — one image, one feeling.`,
        `Viewer: ${ctx.userPsychographics} commuting through a city — 3-second attention maximum.`,
        `BILLBOARD MESSAGE: ${ctx.messagingPillar} — expressed in ONE dominant visual, no copy needed.`,
        ctx.tagline,
        `${ctx.competitiveAngle}`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `BILLBOARD DESIGN: ${ctx.visualMetaphor} — maximum visual impact. Dominant color: ${ctx.primaryColor}.`,
        `Brand element: ${ctx.elements}. Visual style: ${ctx.marketingArch}.`,
        `COLOR: ${ctx.primaryColor} field, ${ctx.accentColor} focal highlight, ${ctx.secondaryColor} structural contrast.`,
        `MOCKUP SCENE: Realistic metal-frame billboard on urban commercial street.`,
        `City context: tall buildings, street level perspective, blurred pedestrians and traffic in foreground.`,
        `TIME OF DAY: Blue hour (just after sunset) — dramatic sky gradient, artificial street lighting creating depth.`,
        `LIGHTING on billboard: Bright billboard illumination against dim urban atmosphere — creates maximum contrast.`,
        `MOOD: ${ctx.moodWords}. Culturally present, confident, unmistakable at speed.`,
        sTags, q, neg(ctx, provider, "CGI plastic billboard, flat daytime lighting, empty street, cartoon quality, dark unlit billboard"),
      );
    }

    default: {
      return parts(
        `Professional brand visual for ${B} (${data.industry}).`,
        ctx.visualStyle, ctx.colorMood, ctx.composition, q,
        sTags, neg(ctx, provider),
      );
    }
  }
}
