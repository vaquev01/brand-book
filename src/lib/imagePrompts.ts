import { BrandbookData, ImageProvider } from "./types";

export type AssetKey =
  | "logo_primary"
  | "logo_dark_bg"
  | "brand_pattern"
  | "hero_visual"
  | "hero_lifestyle"
  | "youtube_thumbnail"
  | "presentation_bg"
  | "email_header"
  | "instagram_carousel"
  | "instagram_story"
  | "social_cover"
  | "social_post_square"
  | "app_mockup"
  | "business_card"
  | "brand_collateral"
  | "outdoor_billboard";

export const ASSET_CATALOG: {
  key: AssetKey;
  label: string;
  description: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "21:9";
  category: "logo" | "digital" | "social" | "print" | "mockup";
}[] = [
  // ─── LOGO ──────────────────────────────────────────────────────────────────
  { key: "logo_primary",       label: "Logo — Fundo Claro",           description: "Símbolo + wordmark sobre fundo branco — versão principal da identidade", aspectRatio: "1:1",  category: "logo"    },
  { key: "logo_dark_bg",       label: "Logo — Versão Invertida",      description: "Logo em negativo sobre fundo escuro — dark mode, vídeos, eventos",       aspectRatio: "1:1",  category: "logo"    },
  // ─── DIGITAL ───────────────────────────────────────────────────────────────
  { key: "brand_pattern",      label: "Padrão Gráfico Seamless",      description: "Textura tileable infinita — fundos, embalagens, papelaria, slides",       aspectRatio: "1:1",  category: "digital" },
  { key: "hero_visual",        label: "Hero Landing Page",            description: "Above the fold — converte visitante em lead. Valor único sem texto.",      aspectRatio: "16:9", category: "digital" },
  { key: "hero_lifestyle",     label: "Lifestyle Editorial",          description: "Público-alvo usando produto/serviço em contexto real — aspiração autêntica", aspectRatio: "16:9", category: "digital" },
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
];

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
  if (provider !== "stability") return "";
  const extras = extra ? `, ${extra}` : "";
  return ` --neg ${ctx.negativeBase}, ${ctx.avoid}${extras}`.trim();
}

export function buildImagePrompt(key: AssetKey, data: BrandbookData, provider: ImageProvider): string {
  const ctx = extractBrandContext(data);
  const q = providerQuality(provider, key);
  const B = `"${data.brandName}"`;

  const parts = (...lines: (string | false | undefined | null)[]): string =>
    lines.filter(Boolean).join(" ");

  switch (key) {

    case "logo_primary": {
      const ideogramWord = provider === "ideogram"
        ? `Wordmark text "${data.brandName}" precisely lettered in ${ctx.displayFont} typography.` : "";
      return parts(
        `Professional brand identity logo for ${B}, a ${data.industry} company.`,
        ideogramWord,
        `LOGO CONCEPT: ${ctx.logoStyle}. Symbol: ${ctx.logoSymbol}.`,
        `COLOR: ${ctx.primaryColor} (${ctx.primaryColorName}) on pure white (#FFFFFF) background.`,
        `TYPOGRAPHY: ${ctx.displayFont} wordmark. PERSONALITY: ${ctx.personality}. VALUES: ${ctx.values}.`,
        `VISUAL STYLE: ${ctx.visualStyle}.`,
        `TECHNICAL: Isolated logomark + wordmark lockup, crisp vector graphic, sharp edges, scalable symbol,`,
        `no drop shadows, no textures, pure white background, centered composition.`,
        q, neg(ctx, provider),
      );
    }

    case "logo_dark_bg": {
      const ideogramWord = provider === "ideogram"
        ? `Wordmark text "${data.brandName}" precisely lettered in ${ctx.displayFont} typography, white/light version.` : "";
      return parts(
        `Brand identity logo — dark background version for ${B} (${data.industry}).`,
        ideogramWord,
        `LOGO: ${ctx.logoPrimary} — inverted/reversed color version. ${ctx.logoSymbol}.`,
        `COLOR: White or very light logo on solid dark background ${ctx.primaryColor}.`,
        `PURPOSE: Dark websites, video intros, event backdrops, dark mode UI.`,
        `TECHNICAL: High-contrast inverted lockup, pure flat dark background, no textures, no shadows, centered.`,
        q, neg(ctx, provider),
      );
    }

    case "brand_pattern": {
      const patternEls = data.keyVisual.patterns?.length
        ? `Specific motifs: ${data.keyVisual.patterns.slice(0, 4).join(", ")}.`
        : `Derived from brand symbol: ${ctx.logoSymbol}.`;
      return parts(
        `Seamless infinitely-tileable brand surface pattern for ${B} (${data.industry}).`,
        `PATTERN DESIGN: ${ctx.patternStyle}. ${patternEls}`,
        `STRICT COLOR PALETTE — no other colors: ${ctx.allPrimaryColors}.`,
        `VISUAL LANGUAGE: ${ctx.visualStyle}. Brand elements: ${ctx.elements}. Mood: ${ctx.moodWords}.`,
        `PURPOSE: Packaging, stationery, website backgrounds, slide decks, event materials.`,
        `TECHNICAL: Geometric precision, perfect tile zero visible seams, flat design,`,
        `consistent line weights, square composition, abstract shapes — no text, no logos, no photographic content.`,
        q, neg(ctx, provider, "visible seams, text, logos, photographic content, random noise"),
      );
    }

    case "hero_visual": {
      const intentCopy = ctx.sampleHeadline
        ? `This image appears beside headline: "${ctx.sampleHeadline}".`
        : `Communicates visually: ${ctx.uniqueValue}.`;
      return parts(
        `PLATFORM: Above-the-fold landing page hero for ${B} (${data.industry}) — 16:9 widescreen.`,
        `MARKETING INTENT: Convert first-time visitors into leads or trial users in under 3 seconds.`,
        `TARGET VIEWER: ${ctx.audienceDesc}.`,
        intentCopy,
        ctx.tagline,
        `VISUAL CONCEPT: ${ctx.visualStyle}. Art direction: ${ctx.photoStyle}.`,
        `Cinematic concept visual that communicates ${ctx.uniqueValue} without any text.`,
        `Brand elements present: ${ctx.elements}. References: ${ctx.artisticRef}.`,
        `COLOR GRADING: ${ctx.colorMood}. Dominant ${ctx.primaryColor}, accent ${ctx.secondaryColor}.`,
        `MOOD: ${ctx.moodWords}. Personality: ${ctx.personality}. Mission: ${ctx.mission}.`,
        `COMPOSITION: ${ctx.composition}. Dramatic depth, professional lighting with ${ctx.primaryColor} color cast.`,
        `No text, no logos, no watermarks — pure visual storytelling triggering emotion and desire.`,
        q, neg(ctx, provider, "text overlays, logos, generic stock photography, flat lighting, overcrowded"),
      );
    }

    case "hero_lifestyle": {
      return parts(
        `PLATFORM: Editorial lifestyle photography for ${B} (${data.industry}) — website hero, paid media ads, social.`,
        `MARKETING INTENT: Aspiration + relatability — viewer sees themselves succeeding with this product/service.`,
        `SUBJECT: ${ctx.audienceDesc} — authentic moment of someone using/experiencing ${data.industry} in real context.`,
        `VISUAL LANGUAGE: ${ctx.photoStyle}. ${ctx.colorMood}.`,
        `Brand color ${ctx.primaryColor} subtly present in props, clothing, or environment — not forced.`,
        `MOOD: ${ctx.moodWords}. Tone: ${ctx.toneOfVoice}. Personality: ${ctx.personality}.`,
        `COMPOSITION: 35–50mm lens feel, shallow depth of field, natural or soft directional light.`,
        `People: authentic, diverse, genuine emotion — not model-perfect or corporate-posed.`,
        `${ctx.artisticRef} editorial approach. Wide 16:9, left/center clear area for optional text overlay.`,
        `No text on subjects, no logos visible, documentary editorial quality.`,
        q, neg(ctx, provider, "overly posed, fake smile, stock photo aesthetic, generic office, plastic-looking"),
      );
    }

    case "instagram_carousel": {
      return parts(
        `PLATFORM: Instagram carousel FIRST SLIDE — perfect square 1:1 format.`,
        `MARKETING INTENT: Stop the thumb-scroll in 0.3 seconds. Make the viewer SWIPE RIGHT to see next slides.`,
        `This is the hook slide — bold, intriguing, visually unresolved (suggests there is more to see).`,
        ctx.tagline,
        `BRAND: ${B} — ${ctx.personality} personality. Industry: ${data.industry}.`,
        `VISUAL DESIGN: ${ctx.marketingLanguage}. Full-bleed ${ctx.primaryColor} dominant background.`,
        `Central focal element: single powerful brand visual — ${ctx.elements}.`,
        `Color palette (strict): ${ctx.allPrimaryColors}. Accent pop: ${ctx.accentColor}.`,
        `COMPOSITION: Bold, minimal, asymmetric. Strong visual tension. One dominant element, rest is breathing room.`,
        `Reserve lower 20% as flat zone in ${ctx.secondaryColor} — space for text overlay (not included in image).`,
        `MOOD: ${ctx.moodWords}. Energy: high-impact, confident, premium, social-native.`,
        `Reference: top-performing ${data.industry} Instagram brand grids. No actual text in image.`,
        q, neg(ctx, provider, "cluttered layout, multiple competing focal points, generic gradient"),
      );
    }

    case "instagram_story": {
      return parts(
        `PLATFORM: Instagram Story / Reels cover — full-bleed vertical 9:16 format (1080×1920px).`,
        `MARKETING INTENT: Instant brand recognition in 3 seconds full-screen on mobile. Drive profile visits and swipe-up.`,
        `BRAND: ${B} (${data.industry}). Personality: ${ctx.personality}.`,
        `VISUAL DESIGN: Full-bleed vertical composition. Dominant color: ${ctx.primaryColor}.`,
        `Strong brand visual element in upper-center of frame (safe zone above bottom UI area).`,
        `${ctx.visualStyle}. Key visual elements: ${ctx.elements}.`,
        ctx.tagline,
        `COMPOSITION: Visual weight in upper two-thirds. Reserve bottom 15% (link/sticker zone) as clean flat area.`,
        `Reserve center vertical strip for 1–2 line headline text overlay (design shows the background only).`,
        `MOOD: ${ctx.moodWords}. Bold, immediate, vertically dynamic, recognizable in thumbnail.`,
        `Inspired by top-performing brand stories — Apple, Airbnb, Spotify adapted to ${data.industry}. No actual text.`,
        q, neg(ctx, provider, "horizontal elements, landscape orientation, cluttered bottom area"),
      );
    }

    case "social_cover": {
      return parts(
        `PLATFORM: LinkedIn profile cover / YouTube channel banner — 16:9 widescreen (2560×1440px).`,
        `MARKETING INTENT: First impression on professional profile — establish authority, positioning, brand identity.`,
        `Viewer is ${ctx.targetMarket} evaluating ${B} for the first time.`,
        `BRAND MESSAGE: ${ctx.uniqueValue}. Differentiators: ${ctx.differentiators}.`,
        ctx.tagline,
        `VISUAL DESIGN: ${ctx.marketingLanguage}. ${ctx.visualStyle}.`,
        `Color: ${ctx.primaryColor} dominant background. ${ctx.secondaryColor} and ${ctx.accentColor} for contrast.`,
        `COMPOSITION: Strong horizontal left-to-right flow.`,
        `Left 40%: clear flat zone (profile photo/logo area on LinkedIn).`,
        `Right 60%: bold brand graphic — ${ctx.elements}. Strong geometric or abstract design.`,
        `${ctx.composition}. MOOD: ${ctx.moodWords}. Confident, credible, premium.`,
        `No placeholder text, no lorem ipsum — pure brand graphic language.`,
        q, neg(ctx, provider, "cluttered layout, multiple focal points, text overlays, generic corporate imagery"),
      );
    }

    case "social_post_square": {
      return parts(
        `PLATFORM: Instagram feed post / Facebook post — perfect square 1:1 format.`,
        `MARKETING INTENT: Brand presence in timeline. Strong visual recognition, saves, and shares.`,
        `BRAND: ${B} — ${ctx.personality}. Industry: ${data.industry}.`,
        ctx.tagline,
        `VISUAL CONCEPT: ${ctx.marketingLanguage}. Bold on-brand graphic or editorial photo.`,
        `COLOR PALETTE: ${ctx.allColors}. Dominant: ${ctx.primaryColor}.`,
        `COMPOSITION: ${ctx.composition}. Thumb-stopping hierarchy — one clear focal point.`,
        `Central element: ${ctx.elements} — graphic interpretation, emotionally resonant.`,
        `MOOD: ${ctx.moodWords}. ${ctx.visualStyle}. Voice: ${ctx.toneOfVoice}.`,
        `Photography direction if lifestyle: ${ctx.photoStyle}.`,
        `No actual text in image — pure brand visual language. Reserve bottom strip for caption context.`,
        q, neg(ctx, provider, "generic stock imagery, overcrowded layout, multiple competing elements"),
      );
    }

    case "youtube_thumbnail": {
      return parts(
        `PLATFORM: YouTube video thumbnail — 1280×720px 16:9 format.`,
        `MARKETING INTENT: Achieve above-average CTR. Compete against dozens of thumbnails in feed.`,
        `Make viewer think "I NEED to watch this" in under 0.5 seconds.`,
        `BRAND: ${B} (${data.industry}). ${ctx.tagline}`,
        `VISUAL DESIGN: Maximum foreground-to-background contrast.`,
        `Background: bold flat ${ctx.primaryColor} or dramatic gradient ${ctx.primaryColor} → ${ctx.secondaryColor}.`,
        `Foreground: dramatic close-up of product/service concept, abstract visual, or key brand element: ${ctx.elements}.`,
        `COLOR: High contrast. ${ctx.primaryColor} bg, ${ctx.accentColor} accent highlights. Brand palette: ${ctx.allPrimaryColors}.`,
        `COMPOSITION: Rule of thirds. Strong left-to-right flow. Reserve right 40% as clear zone for text overlay.`,
        `MOOD: Curiosity + confidence. ${ctx.moodWords}. Energy: bold, premium, clickable.`,
        `Reference: top-performing YouTube thumbnails from premium ${data.industry} channels.`,
        `No actual text in image. High contrast only — no muddy mid-tones.`,
        q, neg(ctx, provider, "low contrast, muddy colors, complex cluttered composition, text"),
      );
    }

    case "presentation_bg": {
      return parts(
        `PLATFORM: Presentation slide background — 16:9 widescreen for PowerPoint/Keynote/Google Slides.`,
        `DESIGN INTENT: Subtle brand presence — does NOT compete with slide content (text, charts, data).`,
        `Background must be visually rich yet low-contrast — slide content layers on top legibly.`,
        `BRAND: ${B} (${data.industry}). ${ctx.visualStyle}.`,
        `DESIGN: Semi-abstract geometric composition using brand elements: ${ctx.elements}.`,
        `Base color: ${ctx.primaryColor} — or very light/very dark interpretation of brand palette.`,
        `Motifs: subtle patterns or geometry derived from ${ctx.logoSymbol} at 10–20% opacity.`,
        `COLOR: Monochromatic brand palette, varying opacity, maximum 30% saturation — must NOT distract.`,
        `${ctx.colorMood} — subdued, desaturated version.`,
        `COMPOSITION: Visual weight in edges/corners — center and left areas clear for slide content.`,
        `MOOD: Professional, premium, confident — background role only. Personality: ${ctx.personality}.`,
        q, neg(ctx, provider, "busy complex pattern, high contrast, distracting elements, text, logos"),
      );
    }

    case "email_header": {
      return parts(
        `PLATFORM: E-mail marketing header banner — ultra-wide 21:9 (600px standard email width).`,
        `MARKETING INTENT: Increase click-through rate. First visual after subject line — must load fast and look premium.`,
        `Viewer: ${ctx.audienceDesc} who just opened a ${B} email.`,
        ctx.tagline,
        `VISUAL DESIGN: ${ctx.marketingLanguage}. Clean, minimal, horizontally impactful.`,
        `COLOR: ${ctx.primaryColor} dominant, ${ctx.secondaryColor} accent. Gradient or flat — not photographic background.`,
        `COMPOSITION: Strong left-to-right horizontal reading flow.`,
        `Left zone: brand graphic element (${ctx.elements}) or abstract brand motif.`,
        `Center/right zone: flat or gradient area reserved for headline text overlay.`,
        `${ctx.visualStyle}. MOOD: ${ctx.moodWords}. Tone: ${ctx.toneOfVoice}.`,
        `No actual text in image — graphic layer only. Ultra-wide horizontal strip format.`,
        q, neg(ctx, provider, "text, lorem ipsum, photographic busy background, cluttered, multiple focal points"),
      );
    }

    case "app_mockup": {
      const uxLayout = data.uxPatterns?.dashboardLayout ?? `clean ${data.industry} dashboard with data visualizations`;
      return parts(
        `PLATFORM: Product UI mockup displayed in modern iPhone 15 Pro and/or MacBook Pro device frame.`,
        `MARKETING INTENT: Show the actual product experience — viewers are ${ctx.targetMarket} evaluating the product.`,
        `This is NOT a generic template — it shows ${B}'s specific branded interface.`,
        `UI DESIGN: ${uxLayout}. Color system: primary ${ctx.primaryColor}, secondary ${ctx.secondaryColor}, neutral backgrounds.`,
        `Typography on screen: ${ctx.displayFont} headings, ${ctx.bodyFont} body. Consistent with brand system.`,
        `UI components: clean cards, rounded corners, generous spacing, ${ctx.primaryColor} accent buttons.`,
        `SCREEN CONTENT: Realistic ${data.industry} data — charts, metrics, workflow panels, branded components.`,
        `Brand-specific UI elements: ${ctx.elements}. ${ctx.visualStyle}.`,
        `MOCKUP SCENE: Device on clean studio surface, subtle workspace context, professional bokeh background.`,
        `Perspective: natural 3/4 angle, realistic screen glow, authentic device materials and reflections.`,
        q, neg(ctx, provider, "generic app template, lorem ipsum placeholder text, fake stock UI data"),
      );
    }

    case "business_card": {
      return parts(
        `PLATFORM: Premium business card mockup — both front and back visible, 16:9 scene.`,
        `MARKETING INTENT: Represent the brand's physical touchpoint — communicate quality and positioning at first touch.`,
        `CARD FRONT: ${ctx.logoPrimary}, dominant color ${ctx.primaryColor}, white space, minimal layout.`,
        `CARD BACK: ${ctx.primaryColor} solid or brand pattern (${ctx.patternStyle}), minimal.`,
        `Typography on card: ${ctx.displayFont} for name, ${ctx.bodyFont} for contact info.`,
        `MOCKUP SCENE: Elegant 3/4 angle on premium surface — ${ctx.photoStyle}.`,
        `Surface: marble, dark stone, or fine textured paper. Matches brand: ${ctx.visualStyle}.`,
        `LIGHTING: Soft directional studio light 45°, long sharp shadow, premium paper stock texture visible.`,
        `Both cards arranged with intentional angle, depth of field, luxury photographic quality.`,
        `MOOD: ${ctx.moodWords}. Premium, confident, tasteful.`,
        q, neg(ctx, provider, "flat illustration, cartoon style, plastic-looking surface, harsh or flat lighting"),
      );
    }

    case "brand_collateral": {
      return parts(
        `PLATFORM: Corporate stationery collection flat-lay — overhead 4:3 format.`,
        `MARKETING INTENT: Showcase the complete physical brand identity system for pitches and brand guidelines.`,
        `ITEMS: Business card front+back, A4 letterhead sheet, kraft/coated notebook with embossed logo,`,
        `quality ballpoint pen, branded envelope with wax seal, brand element sticker or stamp.`,
        `All items branded with ${B}: color ${ctx.primaryColor}, logo, pattern ${ctx.patternStyle}.`,
        `STRICT COLOR: ${ctx.allPrimaryColors} only — no off-brand colors on any item.`,
        `SURFACE: ${ctx.photoStyle} — marble, raw concrete, natural linen, or fine wood. Style: ${ctx.visualStyle}.`,
        `LIGHTING: Soft natural window light from 45°, crisp soft shadows, luxury editorial feel.`,
        `COMPOSITION: ${ctx.composition}. Artfully arranged with intentional negative space, slight overlapping.`,
        `MOOD: ${ctx.moodWords}. Tasteful, editorial, premium.`,
        q, neg(ctx, provider, "plastic surfaces, harsh shadows, poor lighting, off-brand colors, generic office supplies"),
      );
    }

    case "outdoor_billboard": {
      return parts(
        `PLATFORM: Outdoor advertising billboard (OOH) mockup in urban street — 16:9 landscape.`,
        `MARKETING INTENT: Maximum brand awareness in 3 seconds at 60 km/h. Must communicate in one glance.`,
        `Viewer: ${ctx.targetMarket} in an urban environment.`,
        `BILLBOARD DESIGN: Single powerful brand visual. Dominant color ${ctx.primaryColor}.`,
        `Concept communicates: ${ctx.uniqueValue} — without long copy.`,
        `Brand element: ${ctx.elements}. ${ctx.marketingLanguage}.`,
        ctx.tagline,
        `COLOR: ${ctx.primaryColor} dominant, high-contrast accents ${ctx.accentColor}.`,
        `MOCKUP SCENE: Realistic urban billboard — city street, buildings, blurred pedestrians in foreground.`,
        `Golden hour or blue hour dramatic sky lighting. Authentic metal-frame billboard structure.`,
        `MOOD: ${ctx.moodWords}. Impressive, culturally present, confident. ${ctx.composition}.`,
        q, neg(ctx, provider, "fake CGI plastic billboard, overexposed flat daytime, empty street, cartoon quality"),
      );
    }

    default: {
      return parts(
        `Professional brand visual for ${B} (${data.industry}).`,
        ctx.visualStyle, ctx.colorMood, ctx.composition, q,
        neg(ctx, provider),
      );
    }
  }
}
