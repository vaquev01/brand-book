import { BrandbookData, ImageProvider } from "./types";

export const ASSET_CATALOG = [
  // ─── LOGO ──────────────────────────────────────────────────────────────────
  { key: "logo_primary",       label: "Logo — Fundo Claro",           description: "Símbolo + wordmark sobre fundo branco — versão principal da identidade", aspectRatio: "1:1",  category: "logo"    },
  { key: "logo_dark_bg",       label: "Logo — Versão Invertida",      description: "Logo em negativo sobre fundo escuro — dark mode, vídeos, eventos",       aspectRatio: "1:1",  category: "logo"    },
  // ─── DIGITAL ───────────────────────────────────────────────────────────────
  { key: "brand_pattern",      label: "Padrão Gráfico Seamless",      description: "Textura tileable infinita — fundos, embalagens, papelaria, slides",       aspectRatio: "1:1",  category: "digital" },
  { key: "brand_mascot",       label: "Mascote (Personagem)",         description: "Personagem da marca — ilustração on-brand para campanhas, social e materiais", aspectRatio: "1:1",  category: "digital" },
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
  { key: "delivery_packaging", label: "Embalagens Delivery (Kit)",    description: "Kit de embalagem: sacola, caixa, copo, adesivos e guardanapo — on-brand",    aspectRatio: "4:3",  category: "mockup"  },
  { key: "takeaway_bag",       label: "Sacola / Bag Delivery",        description: "Sacola kraft ou bag reutilizável com logo + padrões — cenário real",         aspectRatio: "4:3",  category: "mockup"  },
  { key: "food_container",     label: "Caixa / Pote Delivery",        description: "Embalagem principal (caixa/pote) com aplicação do logo — close premium",    aspectRatio: "4:3",  category: "mockup"  },
  { key: "uniform_tshirt",     label: "Uniforme (Camiseta)",          description: "Uniforme da equipe com logo e aplicação de padrão — fotografia realista",   aspectRatio: "4:3",  category: "mockup"  },
  { key: "uniform_apron",      label: "Uniforme (Avental)",           description: "Avental bordado/serigrafado com marca — look premium e coerente",           aspectRatio: "4:3",  category: "mockup"  },
  { key: "materials_board",    label: "Materiais & Texturas (Board)", description: "Moodboard de materiais (papel, tecido, metal, textura) com paleta da marca", aspectRatio: "1:1",  category: "mockup"  },
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
    return "Photography: glowing data nodes, abstract UI panels floating in depth, luminous gradient fields — ref. Linear/Stripe brand photography. Illustration: geometric circuit-like topology, isometric systems. Materiality: glass surfaces, frosted acrylic, backlit screens, holographic foil. Cultural ref: Dieter Rams precision meets Silicon Valley optimism.";
  if (/restauran|food|gastro|caf|coffee|bar|sushi|pizza|chef|culin|bistr|boteco|empório/.test(i))
    return "Photography: overhead plating (David Loftus style), macro ingredient textures, steam wisps, candlelit amber warmth 2700K, shallow DOF on garnish. Illustration: botanical engravings, hand-drawn menu art, woodcut prints. Materiality: kraft paper, ceramic, cast iron, reclaimed wood, linen napkin textures. Cultural ref: Bon Appétit editorial meets local terroir storytelling.";
  if (/fintech|financ|bank|invest|crédit|crypto|insurance|wealth|asset/.test(i))
    return "Photography: geometric precision, golden ratio compositions, architectural facades, metallic gradient fields (gold/platinum). Illustration: abstract data flow lines, topographic contours. Materiality: brushed metal, embossed paper, wax seal, heavy cotton stock. Cultural ref: Swiss Style grid discipline meets Bloomberg Terminal authority.";
  if (/health|saúde|medic|clinic|pharma|wellness|biotech|hospital/.test(i))
    return "Photography: clean whites and calming blues, human touch moments, scientific precision, soft clinical lighting 5000K. Illustration: cell/molecular forms, anatomical line art, organic flow diagrams. Materiality: surgical steel, white ceramic, frosted glass, cotton gauze. Cultural ref: Apple Health purity meets Mayo Clinic trust.";
  if (/fitness|gym|sport|treino|esport|atleta|performanc/.test(i))
    return "Photography: kinetic motion blur, muscle definition close-ups, outdoor dramatic light, explosive energy — ref. Nike campaign photography. Illustration: dynamic vector forms, speed lines, athletic silhouettes. Materiality: rubber, mesh fabric, carbon fiber, anodized aluminum. Cultural ref: Wieden+Kennedy intensity meets Olympic graphic language.";
  if (/fashion|moda|luxury|luxo|jewel|jóia|accessory|beauty|cosmetic|skin/.test(i))
    return "Photography: editorial negative space (Irving Penn approach), fabric texture close-ups, product on skin/body, dramatic shadow play, Rembrandt side lighting. Illustration: fashion croquis, minimal line drawings. Materiality: velvet, silk, marble, rose gold, hand-stitched leather. Cultural ref: Vogue Italia editorial meets Celine minimalism.";
  if (/education|educação|cours|learn|school|universit|ensino/.test(i))
    return "Photography: light streaming through windows, collaborative group moments, candid learning moments, bright optimistic environments 5600K. Illustration: open knowledge metaphors, growth diagrams, playful infographic elements. Materiality: chalk, worn wood, notebook paper, colored pencils. Cultural ref: TED visual identity meets Montessori warmth.";
  if (/construc|constru|architect|real estate|imobil|engenharia/.test(i))
    return "Photography: architectural perspective lines, material textures (exposed concrete, steel I-beams, glass curtain walls), morning golden light on facades — ref. Iwan Baan architectural photography. Illustration: blueprint line drawings, section cuts, axonometric projections. Materiality: concrete, Corten steel, terrazzo, travertine marble. Cultural ref: Zaha Hadid Studio meets Dezeen editorial.";
  if (/ecommerc|retail|loja|shop|market|varejo/.test(i))
    return "Photography: product hero shots on clean surfaces, lifestyle-in-context, packaging close-ups, aspirational home environments — ref. Kinfolk/Cereal magazine style. Illustration: product line drawings, packaging diagrams. Materiality: recycled cardboard, tissue paper, cotton bag, washi tape, embossed stickers. Cultural ref: Glossier unboxing experience meets Muji simplicity.";
  if (/creat|design|agência|agency|media|publicidad|estúdio|studio/.test(i))
    return "Photography: bold typographic compositions, Pantone swatches, creative process artifacts (sketches, screens, mockups), vibrant workspace — ref. Sagmeister & Walsh. Illustration: hand-lettering, experimental layouts. Materiality: Fedrigoni paper, letterpress, silkscreen ink, neon signage. Cultural ref: Pentagram case studies meets It's Nice That editorial.";
  if (/logistic|transport|frete|supply chain|entregas/.test(i))
    return "Photography: movement trails, infrastructure at scale, precise mechanical systems, aerial cargo perspectives. Illustration: network maps, route diagrams, isometric warehouse views. Materiality: corrugated cardboard, aluminum truck panels, reflective safety tape. Cultural ref: DHL brand system precision meets FedEx operational clarity.";
  if (/pet|animal|vet|cachorro|gato|cat|dog/.test(i))
    return "Photography: authentic pet portraits (not studio stock), playful candid moments, soft natural light, shallow DOF on fur texture. Illustration: character-driven pet illustrations, paw prints, playful shapes. Materiality: natural wool, cork, denim, sustainable rubber. Cultural ref: BarkBox playfulness meets Patagonia warmth.";
  if (/auto|car|motor|veículo|concessionária|oficina|moto/.test(i))
    return "Photography: dramatic rim lighting on bodywork, reflections on polished paint, motion blur on wheels, cinematic highway perspectives. Illustration: technical line art, cross-sections, blueprint renderings. Materiality: brushed aluminum, leather, carbon fiber, rubber tire texture. Cultural ref: Porsche visual precision meets Top Gear cinematography.";
  if (/travel|viagem|turismo|hotel|hostel|resort|airbnb/.test(i))
    return "Photography: golden hour landscapes, aerial drone perspectives, intimate cultural moments, authentic local scenes — ref. National Geographic Traveler. Illustration: hand-drawn maps, travel journal sketches, vintage postal stamps. Materiality: leather journal, aged paper, linen, natural stone. Cultural ref: Airbnb belonging meets Condé Nast Traveler aspiration.";
  if (/music|música|som|audio|podcast|rádio|dj|festival/.test(i))
    return "Photography: dramatic stage lighting, analog equipment close-ups, audience energy, sound wave visualizations. Illustration: psychedelic patterns, vinyl cover art, typographic experiments. Materiality: vinyl grooves, speaker mesh, guitar strings, neon tubes. Cultural ref: Spotify Wrapped meets Pitchfork editorial meets album cover art history.";
  if (/imobil|property|house|apartment|apart|condomin|loteamento/.test(i))
    return "Photography: architectural interiors with natural light streaming, lifestyle shots in aspirational living spaces, aerial perspectives of neighborhoods. Illustration: floor plans, elevation drawings, neighborhood maps. Materiality: marble, hardwood flooring, brushed brass, handmade tiles. Cultural ref: Architectural Digest meets WeWork spatial branding.";
  if (/agro|farm|agricultura|orgânic|natural|bio|horta|café|cacau/.test(i))
    return "Photography: sunrise over fields, macro textures of soil/seeds/leaves, farmer's hands at work, harvest abundance — ref. documentary agricultural photography. Illustration: botanical specimens, vintage seed packet art, woodcut rural scenes. Materiality: burlap, raw cotton, terracotta, dried botanicals, hand-stamped kraft. Cultural ref: Whole Foods Market storytelling meets terroir wine label craft.";
  if (/gaming|game|esport|jogo|console|streamer/.test(i))
    return "Photography: neon-lit setups, RGB keyboard close-ups, team competition moments, immersive dark environments. Illustration: pixel art meets vector, character splash art, HUD-inspired graphics. Materiality: matte black plastic, RGB LED strips, holographic stickers, metallic ink on dark stock. Cultural ref: Riot Games brand system meets Razer visual intensity.";
  if (/legal|law|advocacia|jurídic|escritório|direito/.test(i))
    return "Photography: architectural library interiors, leather-bound volumes, judicial balance symbolism, mahogany and marble textures. Illustration: serif-heavy monograms, classical engravings, heraldic elements. Materiality: heavy linen paper, gold foil stamping, leather emboss, wax seal. Cultural ref: British barristers' chambers meets Swiss private banking sobriety.";
  if (/infantil|child|kid|baby|bebê|brinquedo|toy|escola infantil/.test(i))
    return "Photography: bright high-key environments, playful compositions with saturated primary colors, authentic child laughter moments. Illustration: rounded friendly shapes, hand-drawn characters, crayon/watercolor textures. Materiality: soft-touch surfaces, rounded wooden toys, cotton fabric, non-toxic paint. Cultural ref: LEGO playfulness meets Montessori simplicity meets Studio Ghibli warmth.";
  return "Photography: purposeful negative space, controlled natural light, balanced compositions. Illustration: clean geometric abstraction, brand color field compositions. Materiality: premium paper stocks, subtle embossing, matte finishes. Cultural ref: Pentagram design thinking meets Wallpaper* magazine editorial quality.";
}

const ARCHETYPE_VISUALS: Record<string, string> = {
  Hero: "triumphant intensity, upward momentum, golden dramatic light, monumental scale, victory gestures, Olympian proportions",
  Creator: "creative tension, unexpected camera angles, vivid palette contrasts, workshop-to-masterpiece energy, visible process marks, raw-material-to-art transformation",
  Sage: "contemplative clarity, structured geometry, cool intellectual light 5600K, library-to-cosmos depth, information-as-beauty, data-visualization aesthetics",
  Explorer: "vast horizons, atmospheric perspective, golden-hour adventure light, open landscapes, weather textures, journey-not-destination framing",
  Outlaw: "raw contrast, gritty textures, dramatic chiaroscuro, urban edge, punk energy, defiant angles, torn-and-remade surfaces",
  Magician: "ethereal glow, impossible perspectives, aurora-like color shifts, dreamlike depth of field, transformation mid-process, before-and-after implied in one frame",
  Caregiver: "warm embrace lighting 2800K, soft focus edges, intimate proximity, cocooning composition, hands-touching-hands, shelter metaphors",
  Lover: "intimate bokeh, velvet textures, warm skin-tone lighting, sensual close-ups, editorial elegance, magnetic tension between elements",
  Jester: "vibrant saturated pops, dynamic diagonal compositions, playful scale contrasts, comic energy, surprise elements, intentional rule-breaking",
  Everyman: "authentic natural light, documentary framing, relatable environments, honest imperfection, eye-level camera, unstaged moments",
  Ruler: "regal symmetry, deep contrast, metallic accents (gold/platinum), architectural grandeur, velvet-dark backgrounds, monumental scale with human absence",
  Innocent: "bright high-key lighting, clean whites, airy open spaces, optimistic upward compositions, morning-light warmth, childlike wonder perspective",
};

function deriveArchetype(personality: string[], toneOfVoice: string, explicitArchetype?: string): string {
  if (explicitArchetype) {
    const explicit = explicitArchetype.trim();
    for (const [name, visual] of Object.entries(ARCHETYPE_VISUALS)) {
      if (explicit.toLowerCase().includes(name.toLowerCase())) {
        return `${name} — ${visual}`;
      }
    }
    return explicit.includes(" — ") ? explicit : `${explicit.split(/\s*[-—]\s*/)[0]} — ${ARCHETYPE_VISUALS.Creator}`;
  }

  const all = [...personality, toneOfVoice].join(" ").toLowerCase();
  const archetypes: [RegExp, string][] = [
    [/hero|coraj|brav|forte|power|champion|lider|conquer|vitór|guerreir/, "Hero"],
    [/creat|innov|imagin|art|vision|origin|invent/, "Creator"],
    [/sage|sáb|wisdom|knowledge|expert|mentor|teach|intelli|analy/, "Sage"],
    [/explor|aventur|discover|freedom|curios|journey|pioneer|desbravar/, "Explorer"],
    [/rebel|outlaw|revolution|quebr|desafi|provoc|underground/, "Outlaw"],
    [/magic|encant|transform|mistic|wonder|surpr|miraculou|fantast/, "Magician"],
    [/cuidad|care|nurtur|protect|comfort|segur|acolh|empath|warm/, "Caregiver"],
    [/amant|lover|passion|seduc|beaut|sensual|desej|intim|elegant/, "Lover"],
    [/jest|humor|fun|playful|divert|alegr|leve|brincalh|irrever|entusias/, "Jester"],
    [/everyma|commu|perten|todos|simpl|autentic|real|honest|genuin/, "Everyman"],
    [/ruler|govern|control|premium|luxo|luxury|prestig|author|elite/, "Ruler"],
    [/innocen|pure|otimis|hope|fresh|novo|clean|simple|joy/, "Innocent"],
  ];

  const scores: Record<string, number> = {};
  for (const [re, name] of archetypes) {
    const matches = all.match(new RegExp(re.source, "gi"));
    if (matches) scores[name] = (scores[name] ?? 0) + matches.length;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const primary = sorted[0][0];
    const visual = ARCHETYPE_VISUALS[primary] ?? ARCHETYPE_VISUALS.Creator;
    return `${primary} — ${visual}`;
  }
  return `Creator — ${ARCHETYPE_VISUALS.Creator}`;
}

function deriveEmotionalCore(manifesto: string, purpose: string, moodWords: string, archetype: string, brandPromise?: string): string {
  const archetypeName = archetype.split(" — ")[0] ?? "Creator";
  const emotionMap: Record<string, string> = {
    Hero: "the viewer must feel empowered — a surge of confidence, the sense that greatness is within reach. Every composition should lift the gaze upward.",
    Creator: "the viewer must feel inspired — alive with creative possibility, the spark of invention. Every image should feel like an idea about to happen.",
    Sage: "the viewer must feel illuminated — intellectually stimulated, trusting in deep expertise. Every image should radiate quiet authority and clarity.",
    Explorer: "the viewer must feel free — hungry for discovery, called by the unknown. Every image should expand horizons and suggest journeys.",
    Outlaw: "the viewer must feel defiant — bold, electric, part of something that challenges the status quo. Every image should feel like a manifesto.",
    Magician: "the viewer must feel wonder — the impossible becoming real, transformation mid-process. Every image should suspend disbelief.",
    Caregiver: "the viewer must feel safe — nurtured, deeply understood, a warm exhale of relief. Every image should feel like arriving home.",
    Lover: "the viewer must feel captivated — magnetically drawn in, emotionally connected. Every image should create intimate tension.",
    Jester: "the viewer must feel joy — permission to play, lightness, an irresistible smile. Every image should break rules with a wink.",
    Everyman: "the viewer must feel belonging — honest connection, 'this is for me'. Every image should feel real, relatable, unstaged.",
    Ruler: "the viewer must feel prestige — aspiration, exclusive access, the weight of quality. Every image should command reverence.",
    Innocent: "the viewer must feel hope — freshness, optimistic simplicity, a bright new beginning. Every image should feel like morning light.",
  };
  const base = emotionMap[archetypeName] ?? emotionMap.Creator!;
  const soulParts: string[] = [];
  if (manifesto) soulParts.push(manifesto.slice(0, 500).replace(/\s+\S*$/, ""));
  if (purpose && purpose !== manifesto) soulParts.push(purpose.slice(0, 200));
  if (brandPromise) soulParts.push(`Promise: ${brandPromise.slice(0, 150)}`);
  const soulStr = soulParts.length > 0
    ? ` Brand soul distilled: "${soulParts.join(" — ")}". Mood essence: ${moodWords || "premium, intentional"}.`
    : moodWords ? ` Mood essence: ${moodWords}.` : "";
  return `${base}${soulStr}`;
}

function deriveDesignPhilosophy(ctx: {
  compositionPhilosophy: string;
  illustrationStyle: string;
  photoStyle: string;
  visualStyle: string;
  archetypalEnergy: string;
}): string {
  const parts: string[] = [];
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const philosophyMap: Record<string, string> = {
    Hero: "Bold, ascending, monumental. Negative space is earned, not default. Every element serves the upward narrative.",
    Creator: "Intentionally imperfect, process-visible. The hand of the maker should be felt. Tension between chaos and order.",
    Sage: "Structured, grid-aligned, information-beautiful. Clarity is the aesthetic. Swiss Style rigor with human warmth.",
    Explorer: "Expansive, breathing, horizon-seeking. Let the composition wander with purpose. Natural light always.",
    Outlaw: "Asymmetric, clashing, deliberately uncomfortable. Break one rule per composition — intentionally.",
    Magician: "Layered, dreamlike, depth-ambiguous. Foreground and background should blur. Light should feel impossible.",
    Caregiver: "Enveloping, soft-edged, proximate. Compositions should feel like an embrace. Warm tones dominant.",
    Lover: "Intimate, detail-obsessed, sensual surfaces. Everything is close-up, touchable, desirable.",
    Jester: "Diagonal, dynamic, playfully off-balance. Scale surprises. Color pops where you don't expect them.",
    Everyman: "Eye-level, unstaged, documentary. Imperfections are features. Natural light, natural moments.",
    Ruler: "Symmetrical, architectural, grand. Perfect proportions. Metallic accents. Dark backgrounds with illuminated subjects.",
    Innocent: "High-key, airy, upward. White space is generous. Morning light. Simple forms, pure colors.",
  };
  parts.push(philosophyMap[archetypeName] ?? philosophyMap.Creator);
  if (ctx.compositionPhilosophy) parts.push(ctx.compositionPhilosophy);
  if (ctx.illustrationStyle) parts.push(`Illustration language: ${ctx.illustrationStyle}`);
  return parts.join(" ");
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

  // ─── SOUL LAYER: Brand Story ─────────────────────────────────────────────
  const bs = data.brandStory;
  const brandManifesto = bs?.manifesto
    ? bs.manifesto.length > 500 ? bs.manifesto.slice(0, 500).replace(/\s+\S*$/, "") + "…" : bs.manifesto
    : "";
  const brandPromise = bs?.brandPromise ?? "";
  const brandBeliefs = bs?.brandBeliefs?.slice(0, 4).join("; ") ?? "";
  const originStory = bs?.originStory
    ? bs.originStory.length > 300 ? bs.originStory.slice(0, 300).replace(/\s+\S*$/, "") + "…" : bs.originStory
    : "";

  // ─── SOUL LAYER: Composition Philosophy ──────────────────────────────────
  const compositionPhilosophy = data.keyVisual.compositionPhilosophy ?? "";

  // ─── SOUL LAYER: Flora, Fauna, Objects ────────────────────────────────────
  const floraElements = data.keyVisual.flora?.slice(0, 6).join(", ") ?? "";
  const faunaElements = data.keyVisual.fauna?.slice(0, 6).join(", ") ?? "";
  const objectElements = data.keyVisual.objects?.slice(0, 6).join(", ") ?? "";
  const identityAssets = [floraElements, faunaElements, objectElements].filter(Boolean).join(" · ");
  const hasStrongIdentityAssets = identityAssets.length > 20;

  // ─── SOUL LAYER: Structured Patterns ──────────────────────────────────────
  const sp = data.keyVisual.structuredPatterns;
  const structuredPatternDetails = sp?.length
    ? sp.slice(0, 3).map((p) => `${p.name}: ${p.composition} (density: ${p.density ?? "moderate"}, background: ${p.background ?? "neutral"}, usage: ${p.usage ?? "general"})`).join(" | ")
    : "";
  const primaryPattern = sp?.[0];

  // ─── SOUL LAYER: Illustration & Iconography ──────────────────────────────
  const illustrationStyle = data.keyVisual.illustrations ?? "";
  const iconographyStyle = data.keyVisual.iconography ?? "";

  // ─── SOUL LAYER: Mascot Directive ──────────────────────────────────────────
  const mascot = data.keyVisual.mascots?.[0];
  const mascotDirective = mascot
    ? `MASCOT IDENTITY: ${mascot.name} — ${mascot.description}. Personality: ${mascot.personality}. Guidelines: ${mascot.usageGuidelines?.slice(0, 4).join("; ") ?? "versatile brand character"}.`
    : "";

  // ─── SOUL LAYER: Archetypal Energy ────────────────────────────────────────
  const explicitArchetype = data.brandConcept.brandArchetype || (igb as unknown as Record<string, unknown> | undefined)?.brandArchetype as string | undefined;
  const archetypalEnergy = deriveArchetype(data.brandConcept.personality, data.brandConcept.toneOfVoice, explicitArchetype);

  // ─── SOUL LAYER: Emotional Core ──────────────────────────────────────────
  const emotionalCore = deriveEmotionalCore(brandManifesto, purpose, moodWords, archetypalEnergy, brandPromise);

  // ─── SOUL LAYER: Design Philosophy ─────────────────────────────────────────
  const designPhilosophy = deriveDesignPhilosophy({
    compositionPhilosophy, illustrationStyle, photoStyle, visualStyle, archetypalEnergy,
  });

  // ─── SOUL LAYER: Sensory Profile ─────────────────────────────────────────
  const igbExt = igb as unknown as Record<string, unknown> | undefined;
  const textureLanguage = (igbExt?.textureLanguage as string) ?? "";
  const lightingSignature = (igbExt?.lightingSignature as string) ?? "";
  const cameraSignature = (igbExt?.cameraSignature as string) ?? "";
  const sensoryProfile = (igbExt?.sensoryProfile as string) ?? "";

  // ─── SOUL LAYER: Logo Variants ────────────────────────────────────────────
  const logoVariants = data.logoVariants;

  // ─── SOUL LAYER: Social Media Per-Platform ────────────────────────────────
  const socialGuidelines = data.socialMediaGuidelines;

  // ─── SOUL LAYER: Multiple Personas ────────────────────────────────────────
  const allPersonas = data.audiencePersonas ?? [];
  const personaSummary = allPersonas.length > 1
    ? allPersonas.slice(0, 3).map((p) => `${p.name} (${p.role})`).join(", ")
    : audienceDesc;

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
    // ─── Soul Layer ─────────────────────────────────────────────────────────
    brandManifesto, brandPromise, brandBeliefs, originStory,
    compositionPhilosophy, identityAssets, hasStrongIdentityAssets,
    floraElements, faunaElements, objectElements,
    structuredPatternDetails, primaryPattern, illustrationStyle, iconographyStyle,
    archetypalEnergy, emotionalCore, designPhilosophy,
    mascotDirective, mascot,
    textureLanguage, lightingSignature, cameraSignature, sensoryProfile,
    logoVariants, socialGuidelines, personaSummary,
  };
}

function providerQuality(provider: ImageProvider, key: AssetKey, archetypeName?: string): string {
  const isMockup = ["business_card", "brand_collateral", "app_mockup", "outdoor_billboard", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  const isLogo = key === "logo_primary" || key === "logo_dark_bg";
  const isPattern = key === "brand_pattern" || key === "presentation_bg";
  const isSocial = ["social_post_square", "instagram_carousel", "instagram_story", "social_cover", "youtube_thumbnail"].includes(key);
  const isMascot = key === "brand_mascot";

  const arch = archetypeName ?? "Creator";
  const archetypeQuality: Record<string, string> = {
    Ruler: "luxury advertising campaign quality, Hasselblad precision, velvet-dark tonality, editorial authority",
    Lover: "intimate editorial quality, skin-tone accuracy, warm sensual lighting, Vogue Italia standard",
    Jester: "vibrant pop-art energy, saturated colors, playful composition, Wieden+Kennedy campaign quality",
    Explorer: "National Geographic photographic quality, atmospheric depth, adventure-grade clarity",
    Sage: "Swiss Design precision, information-beautiful clarity, intellectual sharpness, Bloomberg editorial quality",
    Caregiver: "warm documentary quality, soft human intimacy, Kodak Portra tonality, empathetic framing",
    Outlaw: "raw editorial grit, high-contrast chiaroscuro, Vice magazine intensity, intentional grain",
    Hero: "Olympic-grade dramatic photography, heroic lighting, monumental scale, Nike campaign quality",
    Magician: "surreal editorial quality, dreamlike depth, impossible perspectives, Taschen art book standard",
    Everyman: "authentic documentary photography, honest natural light, relatable framing, unstaged moments",
    Innocent: "bright high-key clarity, morning-light purity, Apple-clean composition, optimistic warmth",
    Creator: "award-winning design craftsmanship, intentional imperfection, visible creative process, Pentagram studio quality",
  };
  const archQ = archetypeQuality[arch] ?? archetypeQuality.Creator;

  if (provider === "dalle3") {
    if (isLogo) return `professional brand identity mark, precise geometric construction, clean crisp edges, Pentagram/Wolff Olins studio quality, ${archQ}`;
    if (isMockup) return `hyperrealistic commercial product photography, ultra-sharp material textures, medium-format sensor quality, studio-grade three-point lighting, ${archQ}`;
    if (isPattern) return `precise geometric illustration, mathematically perfect seamless tile, professional brand pattern system, ${archQ}`;
    if (isSocial) return `social media design excellence, thumb-stopping visual hierarchy, mobile-optimized composition, ${archQ}`;
    if (isMascot) return `professional character design, clean modern 2D illustration, consistent line weights, animation-ready silhouette, ${archQ}`;
    return `ultra-high resolution commercial photography, award-winning brand campaign, ${archQ}`;
  }
  if (provider === "stability") {
    if (isMockup) return `hyperrealistic product photography, 8K UHD, professional studio lighting, photorealistic material texture, ${archQ}`;
    if (isLogo || isPattern) return `precise clean graphic illustration, sharp geometric edges, professional brand identity quality, ${archQ}`;
    if (isMascot) return `professional character illustration, clean linework, expressive simple shapes, ${archQ}`;
    return `8K UHD editorial photography, sharp focus, highly detailed, professional color grading, ${archQ}`;
  }
  if (provider === "imagen") {
    if (isMockup) return `photorealistic commercial photography, professional studio lighting, sharp material details, ${archQ}`;
    if (isLogo || isPattern) return `clean precise graphic design, sharp edges, professional illustration quality, ${archQ}`;
    if (isMascot) return `professional character illustration, clean 2D design, crisp edges, ${archQ}`;
    return `high-fidelity photorealistic image, professional photography quality, rich color, ${archQ}`;
  }
  if (isLogo) return `professional logo design, precise linework, clean scalable identity mark, ${archQ}`;
  if (isSocial) return `bold graphic design, high contrast, clear visual hierarchy, ${archQ}`;
  if (isMascot) return `professional character design, clean illustration, crisp linework, ${archQ}`;
  return `professional graphic design, crisp edges, bold visual impact, ${archQ}`;
}

function neg(ctx: ReturnType<typeof extractBrandContext>, provider: ImageProvider, extra = ""): string {
  const all = [ctx.negativeBase, ctx.avoid, extra].filter(Boolean).join(", ");
  if (provider === "stability") return ` --neg ${all}`;
  if (provider === "dalle3")    return ` Avoid including: ${all}.`;
  if (provider === "imagen")    return ` Do not include, do not generate: ${all}.`;
  /* ideogram */                return ` Do not include: ${all}.`;
}

function providerPrefix(provider: ImageProvider, key: AssetKey): string {
  if (provider === "imagen") {
    const isLogo = key === "logo_primary" || key === "logo_dark_bg";
    const isPattern = key === "brand_pattern" || key === "presentation_bg";
    return (isLogo || isPattern)
      ? "Create a high-quality graphic design image. "
      : "Create a high-quality photorealistic image. ";
  }
  if (provider === "ideogram") return "Design a professional graphic image. ";
  return "";
}

function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function visualSystemId(ctx: ReturnType<typeof extractBrandContext>, data: BrandbookData): string {
  const base = [
    data.brandName,
    data.industry,
    ctx.allColors,
    ctx.displayFont,
    ctx.bodyFont,
    ctx.logoSymbol,
    ctx.patternStyle,
    ctx.visualStyle,
    ctx.photoStyle,
  ].join("|");
  const hex = fnv1a32(base).toString(16).padStart(8, "0");
  return `BBVS-${hex}`;
}

function assetHierarchy(key: AssetKey): string {
  const isMockup = [
    "app_mockup",
    "business_card",
    "brand_collateral",
    "delivery_packaging",
    "takeaway_bag",
    "food_container",
    "uniform_tshirt",
    "uniform_apron",
    "materials_board",
    "outdoor_billboard",
  ].includes(key);
  const isSocial = [
    "social_post_square",
    "instagram_carousel",
    "instagram_story",
    "social_cover",
    "youtube_thumbnail",
  ].includes(key);

  if (key === "logo_primary" || key === "logo_dark_bg") {
    return "Logo lockup only (logomark + wordmark). No extra elements.";
  }
  if (key === "brand_mascot") {
    return "Mascot character is the hero. Keep background simple. No wordmarks or readable text. Use only motifs derived from the logo symbol.";
  }
  if (key === "brand_pattern" || key === "presentation_bg") {
    return "Pattern/texture is primary. Keep it subtle, systematic, and repeatable.";
  }
  if (isMockup) {
    return "1) real product/scene, 2) logo must be readable and correct, 3) pattern/accents support the logo.";
  }
  if (isSocial) {
    return "1) one dominant focal element, 2) clear negative space for copy (not rendered), 3) brand accents/pattern support.";
  }
  return "1) one focal subject, 2) supporting brand motifs/pattern, 3) balanced negative space.";
}

function styleAnchorTree(ctx: ReturnType<typeof extractBrandContext>, data: BrandbookData): string {
  const symbols = (data.keyVisual.symbols ?? []).slice(0, 4).join(", ");
  const patterns = (data.keyVisual.patterns ?? []).slice(0, 4).join(", ");
  const elements = (data.keyVisual.elements ?? []).slice(0, 6).join(", ");

  return [
    `STYLE_TREE: ROOT=${ctx.logoSymbol}.`,
    patterns ? `PATTERNS=${patterns}.` : `PATTERNS=${ctx.patternStyle}.`,
    symbols ? `SYMBOLS=${symbols}.` : "",
    elements ? `ELEMENTS=${elements}.` : "",
    "RULE: Everything must be derived from ROOT. Do not introduce unrelated motifs or a different art direction between assets.",
  ]
    .filter(Boolean)
    .join(" ");
}

function consistencyPrefix(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  key: AssetKey
): string {
  const logoRequired = [
    "business_card",
    "brand_collateral",
    "delivery_packaging",
    "takeaway_bag",
    "food_container",
    "uniform_tshirt",
    "uniform_apron",
    "outdoor_billboard",
  ].includes(key);

  const logoRule = (logoRequired || key === "logo_dark_bg")
    ? "LOGO REQUIRED: The logo must be present, readable, and match the exact reference logo (no redesign, no new symbol variants, no different typography, no distortion)."
    : "Do not invent new logos/symbols; only use motifs derived from the logo symbol.";

  return [
    `VISUAL_SYSTEM_ID: ${visualSystemId(ctx, data)}.`,
    `CONSISTENCY: All assets must look like one coherent brand system for "${data.brandName}".`,
    `PALETTE (strict): ${ctx.allColors}.`,
    `MOTIFS: derived from logo symbol: ${ctx.logoSymbol}.`,
    `STYLE: ${ctx.visualStyle}. Photography/art direction: ${ctx.photoStyle}.`,
    logoRule,
    `HIERARCHY: ${assetHierarchy(key)}`,
  ].join(" ");
}

function stabilityTags(ctx: ReturnType<typeof extractBrandContext>, key: AssetKey): string {
  const isPhoto = ["hero_visual", "hero_lifestyle", "app_mockup", "business_card", "brand_collateral", "outdoor_billboard", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  const isMascot = key === "brand_mascot";
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const archTags: Record<string, string> = {
    Ruler: "(regal:1.2), (luxury:1.2), (symmetry:1.1)",
    Lover: "(intimate:1.2), (warm tones:1.2), (soft bokeh:1.1)",
    Jester: "(vibrant:1.3), (playful:1.2), (dynamic:1.1)",
    Explorer: "(atmospheric:1.2), (vast:1.1), (adventure:1.1)",
    Sage: "(precise:1.2), (structured:1.1), (clarity:1.2)",
    Caregiver: "(warm:1.3), (soft:1.2), (nurturing:1.1)",
    Outlaw: "(gritty:1.2), (raw:1.2), (contrast:1.3)",
    Hero: "(dramatic:1.3), (heroic:1.2), (monumental:1.1)",
    Magician: "(ethereal:1.2), (dreamlike:1.2), (luminous:1.1)",
    Everyman: "(authentic:1.2), (natural:1.2), (honest:1.1)",
    Innocent: "(bright:1.3), (clean:1.2), (optimistic:1.1)",
    Creator: "(creative:1.2), (crafted:1.2), (intentional:1.1)",
  };
  const at = archTags[archetypeName] ?? archTags.Creator;
  if (isPhoto) return `(masterpiece:1.4), (best quality:1.3), (photorealistic:1.3), (8k uhd:1.2), (sharp focus:1.2), ${at}, ${ctx.primaryColor} color grade, ${ctx.moodWords}`;
  if (isMascot) return `(masterpiece:1.4), (best quality:1.3), (character illustration:1.3), (clean linework:1.2), (simple shapes:1.2), ${at}, ${ctx.primaryColor} dominant, ${ctx.moodWords}`;
  return `(masterpiece:1.4), (best quality:1.3), (crisp vector:1.3), (sharp edges:1.2), ${at}, professional graphic design, ${ctx.primaryColor} dominant`;
}

function soulAnchor(ctx: ReturnType<typeof extractBrandContext>): string {
  const lines: string[] = [];
  if (ctx.archetypalEnergy) lines.push(`ARCHETYPE: ${ctx.archetypalEnergy}.`);
  if (ctx.emotionalCore) lines.push(`EMOTIONAL_CORE: ${ctx.emotionalCore}`);
  if (ctx.brandManifesto) lines.push(`BRAND_SOUL: "${ctx.brandManifesto}"`);
  if (ctx.brandPromise) lines.push(`BRAND_PROMISE: "${ctx.brandPromise}"`);
  if (ctx.brandBeliefs) lines.push(`BELIEFS: ${ctx.brandBeliefs}.`);
  if (ctx.designPhilosophy) lines.push(`DESIGN_PHILOSOPHY: ${ctx.designPhilosophy}`);
  return lines.length > 0 ? lines.join(" ") : "";
}

function emotionalJourney(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const isSocial = ["social_post_square", "instagram_carousel", "instagram_story", "social_cover", "youtube_thumbnail"].includes(key);
  const isHero = key === "hero_visual" || key === "hero_lifestyle";
  const isMockup = ["business_card", "brand_collateral", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board", "outdoor_billboard", "app_mockup"].includes(key);
  const sensoryHint = ctx.sensoryProfile ? ` Sensory anchor: ${ctx.sensoryProfile.slice(0, 100)}.` : "";

  if (isSocial) return `VIEWER_JOURNEY: 0.3s → thumb stops: instant brand color + motif recognition (${ctx.primaryColor}). 1s → emotional hook: ${archetypeName} energy floods — viewer feels ${ctx.moodWords}. 3s → desire to save/share/follow. The image must earn those 3 seconds.${sensoryHint}`;
  if (isHero) return `VIEWER_JOURNEY: 0.5s → atmospheric immersion: the brand world envelops (${ctx.colorMood}). 2s → positioning decoded: viewer understands "${ctx.uniqueValue}". 5s → emotional resonance: viewer feels the brand promise in their body.${sensoryHint}`;
  if (isMockup) return `VIEWER_JOURNEY: 0.5s → "this is real, premium, designed with intention — not a template". 2s → brand details emerge: logo placement, pattern intelligence, material quality. 5s → the viewer imagines touching this object, feeling ${ctx.personality} through the material.${sensoryHint}`;
  if (key === "brand_pattern") return `VIEWER_JOURNEY: instant → visual rhythm captures the eye (derived from ${ctx.logoSymbol}). 2s → hidden relationships between motifs reveal themselves. 5s → the repetition becomes meditative, embodying ${ctx.moodWords}. The pattern must feel like the brand breathing.${sensoryHint}`;
  if (key === "brand_mascot") return `VIEWER_JOURNEY: 0.3s → instant warmth and approachability. 1s → personality decoded through expression and pose (${ctx.personality}). 3s → emotional bond forms — "I trust this character, I like this brand".${sensoryHint}`;
  if (key === "email_header") return `VIEWER_JOURNEY: 0.2s → brand recognition in inbox preview. 0.5s → visual primes the reader for the content below. 2s → the banner has done its job — viewer scrolls to CTA.${sensoryHint}`;
  if (key === "presentation_bg") return `VIEWER_JOURNEY: the background should be felt, not seen. It creates atmospheric brand presence while the audience reads slide content. It whispers ${ctx.moodWords} without competing.${sensoryHint}`;
  if (key === "outdoor_billboard") return `VIEWER_JOURNEY: 1s at 60km/h → ONE feeling, ONE recognition. 3s max → the brand is burned into memory. This is not nuance — this is impact.${sensoryHint}`;
  return `VIEWER_JOURNEY: 0.5s → brand recognition through color and motif. 2s → message clarity. 5s → emotional resonance — viewer feels ${ctx.moodWords}.${sensoryHint}`;
}

function sensoryDirectives(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  const lines: string[] = [];
  const isMockup = ["business_card", "brand_collateral", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  if (ctx.textureLanguage) lines.push(`TEXTURES (the viewer should almost feel these): ${ctx.textureLanguage}.`);
  if (ctx.sensoryProfile) lines.push(`SENSORY TRANSLATION: ${ctx.sensoryProfile}.`);
  if (ctx.lightingSignature) lines.push(`LIGHTING_SIGNATURE: ${ctx.lightingSignature}.`);
  if (isMockup && ctx.textureLanguage) lines.push(`MATERIAL CLOSE-UP PRIORITY: render material textures with haptic realism — the viewer should imagine touching the surface.`);
  return lines.length > 0 ? lines.join(" ") : "";
}

function cameraDirective(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  if (ctx.cameraSignature) return ctx.cameraSignature;
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const isLifestyle = key === "hero_lifestyle";
  const isProduct = ["business_card", "brand_collateral", "delivery_packaging", "takeaway_bag", "food_container", "uniform_tshirt", "uniform_apron", "materials_board"].includes(key);
  const isHero = key === "hero_visual";

  const archCamera: Record<string, string> = {
    Ruler: "85mm f/2.8, regal compression, controlled depth, low angle suggesting grandeur",
    Lover: "50mm f/1.4, intimate shallow DOF, warm skin-tone rendering, close proximity",
    Jester: "24mm f/4, wide playful perspective, slight barrel distortion for energy, eye-level",
    Explorer: "24mm f/8, vast deep focus, horizon visible, atmospheric haze in distance",
    Sage: "50mm f/4, balanced neutral perspective, structured depth layers, clinical precision",
    Caregiver: "35mm f/2.0, warm proximity, soft background, eye-level empathetic framing",
    Outlaw: "35mm f/2.8, handheld energy, slight tilt, gritty street-level perspective",
    Hero: "24mm f/2.8, low angle upward, dramatic foreshortening, sky visible, monumental",
    Magician: "85mm f/1.8, dreamlike compression, extreme shallow DOF, foreground blur elements",
    Everyman: "35mm f/2.8, eye-level documentary, natural depth, unstaged framing",
    Innocent: "50mm f/2.0, bright open framing, high vantage, generous negative space",
    Creator: "35mm f/2.0, dynamic angle, visible process elements, creative workshop depth",
  };

  if (isLifestyle) return `${archCamera[archetypeName] ?? archCamera.Creator}, shallow depth of field, natural light, documentary intimacy, slight motion blur on background`;
  if (isProduct) return "85mm f/4, product photography, controlled studio three-point light, sharp focus on brand details and material texture, subtle depth falloff";
  if (isHero) return `${archCamera[archetypeName] ?? "35mm f/2.0"}, cinematic wide composition, dramatic depth layers, foreground bokeh element, atmospheric perspective`;
  if (key === "app_mockup") return "65mm f/2.8, 3/4 device angle 15-20°, shallow DOF on background, razor-sharp screen, studio product photography";
  if (key === "outdoor_billboard") return "24mm f/8, street-level urban context, deep focus showing environmental scale, blue hour or golden hour";
  return `${archCamera[archetypeName] ?? "50mm f/2.8"}, balanced depth, professional studio, clean sharp focus`;
}

function socialPlatformContext(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>): string {
  const sg = ctx.socialGuidelines;
  if (!sg?.platforms?.length) return "";
  const platformMap: Record<string, string> = {
    instagram_carousel: "instagram",
    instagram_story: "instagram",
    social_post_square: "instagram",
    social_cover: "linkedin",
    youtube_thumbnail: "youtube",
  };
  const platformName = platformMap[key];
  if (!platformName) return "";
  const platform = sg.platforms.find((p) => p.platform.toLowerCase().includes(platformName));
  if (!platform) return "";
  const pillars = platform.contentPillars?.slice(0, 3).join(", ") ?? "";
  return [
    `PLATFORM_CONTEXT: ${platform.platform} — tone: ${platform.tone}.`,
    pillars ? `Content pillars: ${pillars}.` : "",
    platform.doList?.length ? `Best practices: ${platform.doList.slice(0, 2).join("; ")}.` : "",
  ].filter(Boolean).join(" ");
}

function identityAssetsDirective(ctx: ReturnType<typeof extractBrandContext>, key?: AssetKey): string {
  if (!ctx.identityAssets) return "";
  const parts: string[] = [];
  if (ctx.floraElements) parts.push(`Flora: ${ctx.floraElements}`);
  if (ctx.faunaElements) parts.push(`Fauna: ${ctx.faunaElements}`);
  if (ctx.objectElements) parts.push(`Objects: ${ctx.objectElements}`);
  if (parts.length === 0) return "";
  const isHeroOrLifestyle = key === "hero_visual" || key === "hero_lifestyle";
  const prominence = ctx.hasStrongIdentityAssets
    ? (isHeroOrLifestyle
      ? "IDENTITY_ASSETS (PROMINENT — these ARE the brand's visual DNA, feature them boldly as environmental and compositional elements)"
      : "IDENTITY_ASSETS (VISIBLE — weave into composition as recognizable brand elements, not merely background decoration)")
    : "IDENTITY_ASSETS (subtle environmental elements that reinforce brand identity)";
  return `${prominence}: ${parts.join(" · ")}.`;
}

function humanEssenceLayer(key: AssetKey, ctx: ReturnType<typeof extractBrandContext>, data: BrandbookData): string {
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const lines: string[] = [];

  const storyHint = ctx.originStory
    ? `ORIGIN STORY SUBTEXTURE: The visual should subtly echo the brand's origin — ${ctx.originStory.slice(0, 200)}.`
    : "";

  const archetypeRef: Record<string, string> = {
    Hero: "Reference: Nike 'Just Do It' campaigns, Gatorade athlete portraits, Olympic ceremony visuals.",
    Creator: "Reference: Adobe creative campaigns, Moleskine brand world, Bauhaus workshop aesthetic.",
    Sage: "Reference: Bloomberg editorial design, The Economist covers, MIT Media Lab visual identity.",
    Explorer: "Reference: Patagonia campaign photography, National Geographic visual storytelling, Land Rover adventure aesthetic.",
    Outlaw: "Reference: Diesel 'Be Stupid' campaign energy, Supreme brand drops, Vice magazine editorial.",
    Magician: "Reference: Cirque du Soleil visual world, Apple product reveals, Disney Imagineering concept art.",
    Caregiver: "Reference: Dove 'Real Beauty' campaign warmth, Johnson & Johnson heritage, IKEA family moments.",
    Lover: "Reference: Chanel editorial, Tom Ford campaign aesthetics, Dior beauty photography.",
    Jester: "Reference: Mailchimp brand illustration, M&M's character world, Old Spice campaign energy.",
    Everyman: "Reference: IKEA lifestyle photography, Uniqlo brand simplicity, Muji honest design.",
    Ruler: "Reference: Rolls-Royce brand photography, Rolex campaign imagery, Cartier jewellery editorial.",
    Innocent: "Reference: Innocent Drinks brand world, Glossier clean aesthetic, Apple product photography simplicity.",
  };

  if (storyHint && (key === "hero_visual" || key === "hero_lifestyle" || key === "brand_mascot")) {
    lines.push(storyHint);
  }
  lines.push(archetypeRef[archetypeName] ?? archetypeRef.Creator);

  if (ctx.mascotDirective && key !== "brand_mascot") {
    lines.push(`Brand character context: ${ctx.mascot?.name ?? "mascot"} may appear as subtle motif or environmental element.`);
  }

  return lines.filter(Boolean).join(" ");
}

function structuredPatternDirective(ctx: ReturnType<typeof extractBrandContext>): string {
  if (!ctx.structuredPatternDetails) return "";
  return `STRUCTURED_PATTERNS: ${ctx.structuredPatternDetails}.`;
}

function logoConstructionDirective(
  ctx: ReturnType<typeof extractBrandContext>,
  data: BrandbookData,
  variant: "light" | "dark"
): string {
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";

  const archetypeMarkStyle: Record<string, string> = {
    Hero: "bold, upward-thrusting geometry — strong diagonals, monumental proportions, decisive stroke weights",
    Creator: "asymmetric balance, visible construction logic — the mark looks hand-crafted yet precise, process visible in geometry",
    Sage: "grid-perfect alignment, mathematical proportions (golden ratio preferred), information-dense yet breathing negative space",
    Explorer: "open forms with implied direction — the mark suggests movement and horizon-seeking through open counter-spaces",
    Outlaw: "unexpected angles, deliberate rule-breaking in one element — tension between order and disruption within the mark",
    Magician: "hidden geometry reveals itself on inspection — the mark has an inner secret, dual readings or emergent shapes",
    Caregiver: "soft joins, enclosed forms, rounded terminals — the mark feels sheltering and protective without being childish",
    Lover: "refined contrast in stroke weight, elegant proportions, intimate spacing — the mark rewards close inspection",
    Jester: "playful scale relationships, a single unexpected visual element, energetic but not chaotic construction",
    Everyman: "approachable proportions, honest geometry, no visual tricks — the mark communicates immediate clarity",
    Ruler: "perfect symmetry, classical proportions, strong optical weight — the mark commands space and projects authority",
    Innocent: "generous negative space, clean simple geometry, open forms — the mark feels free and optimistic",
  };
  const markStyle = archetypeMarkStyle[archetypeName] ?? archetypeMarkStyle.Creator;

  const variantKeys = ctx.logoVariants
    ? Object.keys(ctx.logoVariants).filter((k) => !!(ctx.logoVariants as Record<string, unknown>)[k])
    : [];
  const logoVariantDetail = variantKeys.length > 0
    ? `LOGO VARIANTS ON FILE: ${variantKeys.join(", ")} — maintain consistent mark construction across all variants.`
    : "";

  const bg = variant === "light" ? "pure white #FFFFFF" : `flat solid dark (${ctx.primaryColor} deepened or near-black #0a0a0a)`;
  const logoColor = variant === "light"
    ? `${ctx.primaryColor} (${ctx.primaryColorName}) as primary mark color. Accent: ${ctx.accentColor} only if essential to symbol meaning.`
    : `white #FFFFFF or very light tint as mark color on the dark background. Preserve exact same symbol shape — ONLY invert the palette.`;

  return [
    `LOGO MARK CONSTRUCTION — ${archetypeName.toUpperCase()} ARCHETYPE:`,
    `Mark style: ${markStyle}.`,
    `Symbol derivation: ${ctx.logoSymbol}. The symbol must be a direct, iconic reduction of this concept — distilled to its simplest possible geometric truth.`,
    `Wordmark: "${data.brandName}" in ${ctx.displayFont}. The wordmark and symbol must form a cohesive lockup with studied optical spacing.`,
    `COLOR: ${logoColor}`,
    `NEGATIVE SPACE RULE: The negative space inside and around the mark is as designed as the mark itself. It must breathe.`,
    `SCALABILITY TEST: The mark must read perfectly at 16px (favicon) and at 1000px. Design to the smallest legible size.`,
    `CONSTRUCTION PRINCIPLES: Optical corrections applied (not mechanical perfection). Consistent stroke weights (or intentionally graduated if symbol logic requires). Closed forms where possible.`,
    `BRAND VALUES ENCODED: ${ctx.values}. These are not visual elements — they are the WHY behind every curve and angle in the mark.`,
    logoVariantDetail,
  ].filter(Boolean).join(" ");
}

export function buildImagePrompt(key: AssetKey, data: BrandbookData, provider: ImageProvider): string {
  const ctx = extractBrandContext(data);
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const q = providerQuality(provider, key, archetypeName);
  const B = `"${data.brandName}"`;
  const prefix = providerPrefix(provider, key) + consistencyPrefix(ctx, data, key) + " ";
  const sTags = provider === "stability" ? stabilityTags(ctx, key) : "";

  const parts = (...lines: (string | false | undefined | null)[]): string =>
    lines.filter(Boolean).join(" ");

  const soul = soulAnchor(ctx);
  const journey = emotionalJourney(key, ctx);
  const sensory = sensoryDirectives(key, ctx);
  const camera = cameraDirective(key, ctx);
  const tree = styleAnchorTree(ctx, data);
  const idAssets = identityAssetsDirective(ctx, key);
  const spDir = structuredPatternDirective(ctx);
  const platCtx = socialPlatformContext(key, ctx);
  const humanLayer = humanEssenceLayer(key, ctx, data);

  switch (key) {

    case "logo_primary": {
      const ideogramWord = provider === "ideogram"
        ? `Wordmark text "${data.brandName}" precisely lettered in ${ctx.displayFont} typography.` : "";
      const logoDir = logoConstructionDirective(ctx, data, "light");
      return parts(
        prefix,
        `Professional brand identity mark (logomark + wordmark lockup) for ${B}, a ${data.industry} brand.`,
        ideogramWord,
        logoDir,
        `LOGO CONCEPT: ${ctx.logoStyle}.`,
        `PHILOSOPHICAL INTENT: The mark distills the brand's entire worldview into a single visual gesture. It should feel inevitable — as if no other symbol could represent this brand.`,
        `PERSONALITY IN THE MARK (not in a scene): ${ctx.personality}. These traits must be readable in the geometry and spacing of the mark itself, not in a surrounding environment.`,
        tree,
        `TECHNICAL — OUTPUT SPEC: Isolated logomark + wordmark lockup only. Exported flat graphic file appearance.`,
        `Background: FLAT solid #FFFFFF. Absolutely no noise, texture, vignette, scene, paper, wood, or any surface.`,
        `2D flat vector mark. Consistent (or intentionally varied) stroke weights. Sharp anti-aliased edges. No gradients, no 3D, no perspective, no shadows, no glow, no bevel/emboss, no reflections.`,
        `Centered in frame with generous and equal margin on all four sides.`,
        sTags, q, neg(ctx, provider, "photography, photorealistic, scene, environment, background texture, table, wood, paper, fabric, bokeh, lighting, shadows, 3D rendering, perspective, gradient fill, bevel, emboss, glow, halo, watermark, multiple logo variations"),
      );
    }

    case "logo_dark_bg": {
      const ideogramWord = provider === "ideogram"
        ? `Wordmark text "${data.brandName}" precisely lettered in ${ctx.displayFont} typography, white/light version.` : "";
      const logoDir = logoConstructionDirective(ctx, data, "dark");
      return parts(
        prefix,
        `Brand identity mark — dark background (reversed/negative) version for ${B} (${data.industry}).`,
        ideogramWord,
        logoDir,
        `CRITICAL: This is the SAME logomark as the primary light version — IDENTICAL symbol shape, IDENTICAL wordmark letterforms, IDENTICAL proportions and lockup layout.`,
        `ONLY CHANGE: palette inversion for dark background. Do NOT redesign any part of the logo. Do NOT introduce new shapes, alternative symbols, or modified typography.`,
        tree,
        `USE CASES THIS MUST WORK FOR: dark websites, video intros, event backdrops, dark-mode UI, investor decks, nighttime OOH signage.`,
        `TECHNICAL — OUTPUT SPEC: Isolated logo lockup only. Exported flat graphic file appearance.`,
        `Background: FLAT solid dark (#0a0a0a or ${ctx.primaryColor} deeply darkened). No noise, texture, scene, environment, glow, halo, or any surface material.`,
        `2D flat mark, sharp edges, no gradients, no 3D, no perspective, no shadows, no bevel/emboss. Centered with generous equal margin.`,
        sTags, q, neg(ctx, provider, "photography, photorealistic, scene, environment, background texture, bokeh, lighting effects, shadows, 3D rendering, perspective, gradient fill, bevel, emboss, glow, halo, redesigned logo, different symbol, different proportions"),
      );
    }

    case "brand_pattern": {
      const patternEls = data.keyVisual.patterns?.length
        ? `Specific motifs: ${data.keyVisual.patterns.slice(0, 5).join(", ")}.`
        : `Derived from brand symbol: ${ctx.logoSymbol}.`;
      const ppat = ctx.primaryPattern;
      const patternDirective = ppat
        ? `PRIMARY PATTERN: "${ppat.name}" — ${ppat.composition}. Density: ${ppat.density ?? "moderate"}. Background: ${ppat.background ?? "neutral"}. Usage: ${ppat.usage ?? "packaging, stationery, backgrounds"}.`
        : `PATTERN DIRECTION: ${ctx.patternStyle}.`;
      return parts(
        prefix,
        `Seamless infinitely-tileable brand surface pattern for ${B} (${data.industry}).`,
        soul, journey, spDir, idAssets, tree,
        patternDirective,
        patternEls,
        `STRICT COLOR PALETTE — use ONLY these colors, no others: ${ctx.allPrimaryColors}.`,
        `VISUAL LANGUAGE: ${ctx.visualStyle}. Mood: ${ctx.moodWords}.`,
        ctx.illustrationStyle ? `ILLUSTRATION STYLE REFERENCE: ${ctx.illustrationStyle}.` : "",
        humanLayer,
        `PURPOSE: Packaging wraps, stationery backgrounds, website surfaces, slide decks, event materials, textile prints.`,
        `MATHEMATICAL PRECISION: The pattern must tile perfectly with zero visible seams at any scale.`,
        `Consistent line weights throughout. Square 1:1 composition. Abstract shapes only.`,
        `No text, no logos, no wordmarks, no photographic content. Pure geometric/organic motif system.`,
        sTags, q, neg(ctx, provider, "visible seams, text, logos, wordmarks, photographic content, random noise, asymmetric layout, gradient washes"),
      );
    }

    case "brand_mascot": {
      const m = ctx.mascot;
      const mascotIdentity = m
        ? `MASCOT CHARACTER: Name="${m.name}". Physical appearance: ${m.description}. Inner personality: ${m.personality}. This character IS the brand's human face — every trait connects to a brand value.`
        : `MASCOT: Create a brand mascot derived from the logo symbol (${ctx.logoSymbol}) and the STYLE_TREE motifs. The character should personify ${ctx.personality}.`;
      const usage = m?.usageGuidelines?.length
        ? `USAGE & POSE GUIDELINES: ${m.usageGuidelines.slice(0, 5).map((g, i) => `${i + 1}) ${g}`).join(". ")}. Translate these guidelines into the character's pose, expression, and context.`
        : "USAGE: Must work as a repeatable brand character across campaigns, social posts, stickers, and merchandise.";
      return parts(
        prefix,
        `Design a professional brand mascot character for ${B} (${data.industry}).`,
        soul, journey, tree,
        mascotIdentity,
        usage,
        ctx.illustrationStyle ? `ILLUSTRATION STYLE: ${ctx.illustrationStyle}. Apply this technique to the character.` : "",
        humanLayer,
        `DESIGN PHILOSOPHY: The mascot must be instantly recognizable in silhouette alone. Scalable from 64px favicon to poster. Animation-ready with consistent proportions. The character should feel like it has a life beyond this single image.`,
        `STYLE: premium modern 2D illustration, crisp edges, consistent line weights, minimal shading (flat color with max 2 shadow tones), no 3D, no photorealism.`,
        `PALETTE (strict): ${ctx.allColors}. ${ctx.primaryColor} as dominant body color, ${ctx.accentColor} for expressive details (eyes, accessories, small highlights).`,
        `EXPRESSION & POSE: The character's default expression should embody ${ctx.toneOfVoice}. Body language should communicate ${ctx.moodWords}.`,
        `COMPOSITION: centered full-body character, clear negative space around, square 1:1 framing. The character should feel grounded, not floating.`,
        `BACKGROUND: clean solid background (white or very light tint of ${ctx.secondaryColor}). No scene, no props.`,
        `NO TEXT. No wordmark. No readable lettering anywhere.`,
        sTags, q, neg(ctx, provider, "photorealistic, 3D render, complex background, clutter, gradients, heavy shadows, watermark, text, wordmark, deformed anatomy, extra limbs, inconsistent proportions"),
      );
    }

    case "hero_visual": {
      const intentCopy = ctx.sampleHeadline
        ? `This image appears beside headline: "${ctx.sampleHeadline}".`
        : `Must visually communicate: ${ctx.uniqueValue}.`;
      return parts(
        prefix,
        `PLATFORM: Website hero / key visual banner for ${B} (${data.industry}) — 16:9 widescreen cinematic composition.`,
        soul, journey,
        `INTENT: This is the brand's first visual handshake with the world. It must establish positioning, credibility, and emotional territory in one image. Not a generic "landing page" — this is a brandbook key visual.`,
        `TARGET VIEWER: ${ctx.userPsychographics}.`,
        `CORE MESSAGE TO VISUALIZE: ${ctx.messagingPillar}.`,
        intentCopy,
        ctx.tagline,
        `VISUAL SUBJECT: Cinematic interpretation of ${ctx.visualMetaphor}. The subject should feel like a still frame from the brand's origin story.`,
        `INDUSTRY-SPECIFIC VISUAL LANGUAGE: ${ctx.industryLang}.`,
        `Art direction: ${ctx.photoStyle}. Visual architecture: ${ctx.marketingArch}.`,
        `CREDIBILITY embedded in imagery: ${ctx.reasonsToBelieve}.`,
        ctx.competitiveAngle,
        `Brand elements: ${ctx.elements}. Artistic references: ${ctx.artisticRef}.`,
        tree, idAssets,
        humanLayer,
        `COLOR GRADING: ${ctx.colorMood}. Dominant ${ctx.primaryColor}, accent ${ctx.secondaryColor}. Cinematic LUT applied.`,
        sensory,
        `CAMERA: ${camera}.`,
        `LIGHTING: Dramatic three-point cinematic light adapted to ${archetypeName} archetype. Key light from upper-left. Deep shadow falloff creates depth and mystery.`,
        `COMPOSITION: ${ctx.composition}. Foreground-to-background depth layers. Rule of thirds with intentional tension point.`,
        `MOOD: ${ctx.moodWords}. The image should make the viewer pause and feel something before reading any text.`,
        sTags,
        `COPY SPACE: Keep a clean negative space area (left or right third) for website headline overlay. No text or logos in the image.`,
        q, neg(ctx, provider, "text overlays, logos, generic stock photography, flat even lighting, overcrowded scene, centered subject"),
      );
    }

    case "hero_lifestyle": {
      return parts(
        prefix,
        `PLATFORM: Editorial lifestyle photography for ${B} (${data.industry}) — brandbook application for web, campaigns, and social.`,
        soul, journey,
        `INTENT: Human storytelling. Show a real person living the brand promise — the AFTER state, the desired outcome achieved. This must feel like a documentary moment, not a stock photo.`,
        `SUBJECT: ${ctx.userPsychographics}. Authentic, unstaged moment in their natural environment. They are not performing for the camera.`,
        `NARRATIVE ARC: ${ctx.painPoints} → RESOLVED. The image shows the outcome, the relief, the success. The viewer should think "I want to be there."`,
        `SCENE: ${ctx.audienceDesc} in a realistic ${data.industry} context — relaxed, confident, successful.`,
        `INDUSTRY SCENE LANGUAGE: ${ctx.industryLang}.`,
        idAssets,
        humanLayer,
        `VISUAL LANGUAGE: ${ctx.photoStyle}. ${ctx.colorMood}.`,
        `Brand color ${ctx.primaryColor} organically present in environment — a clothing detail, a wall, a prop, natural light reflection. Never forced, never painted on.`,
        `EMOTIONAL CORE: ${ctx.messagingPillar}. Viewer should feel: ${ctx.moodWords}.`,
        ctx.competitiveAngle,
        sensory,
        `CAMERA: ${camera}.`,
        `LIGHTING: Golden hour or soft diffused daylight. Warm key 3200K, cool fill 5600K. Film-like tonal range — Kodak Portra 400 palette with subtle grain.`,
        `PEOPLE: Authentic, diverse, non-model-perfect. Real micro-expressions — not corporate smiling. Candid or near-candid. Hands doing something meaningful.`,
        `${ctx.artisticRef} editorial approach. Wide 16:9. Left or center third kept clear for optional copy overlay.`,
        `No logos visible, no text on clothing, no brand placement that breaks the documentary spell.`,
        sTags, q, neg(ctx, provider, `overly posed, fake corporate smile, stock photo aesthetic, generic office, plastic-looking skin, HDR overprocessing, visible branding on clothing${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "instagram_carousel": {
      return parts(
        prefix,
        `PLATFORM: Instagram carousel FIRST SLIDE — perfect square 1:1 format. This is the hook that determines if anyone sees the rest.`,
        soul, journey, platCtx,
        `MARKETING INTENT: Arrest thumb-scroll in 0.3 seconds. Create visual curiosity gap — must feel incomplete, make viewer SWIPE RIGHT.`,
        `WHO STOPS: ${ctx.userPsychographics} — they stop for ${ctx.moodWords} content that feels ${ctx.personality}.`,
        `VISUAL HOOK CONCEPT: Bold editorial visual suggesting "${ctx.pillarCopy || ctx.messagingPillar}" without showing text.`,
        ctx.tagline,
        `BRAND: ${B} — ${ctx.personality}. Industry: ${data.industry}.`,
        `VISUAL DESIGN: ${ctx.marketingArch}. Full-bleed ${ctx.primaryColor} dominant background.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        idAssets,
        `CENTRAL SUBJECT: ${ctx.visualMetaphor} — one element, hyper-sharp, maximum visual weight.`,
        `COLOR PALETTE (strict, no others): ${ctx.allPrimaryColors}. High-contrast accent pop: ${ctx.accentColor}.`,
        `COMPOSITION: Asymmetric tension — dominant element occupies 60% of frame, remaining 40% is intentional negative space.`,
        `TEXT ZONE: Reserve lower 25% as flat ${ctx.secondaryColor} strip for text overlay (not rendered in image).`,
        `PROOF POINTS to visualize: ${ctx.pillarProofPoints}.`,
        `MOOD: ${ctx.moodWords}. Energy: high-impact, thumb-stopping, premium, social-native.`,
        `${ctx.competitiveAngle}`,
        humanLayer,
        `Reference: Spotify, Apple, top-performing ${data.industry} carousel decks. No actual text.`,
        sTags, q, neg(ctx, provider, `cluttered, multiple competing elements, generic gradient, centered symmetry${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "instagram_story": {
      return parts(
        prefix,
        `PLATFORM: Instagram Story / Reels cover — full-bleed vertical 9:16 format (1080×1920px).`,
        soul, journey, platCtx,
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
        humanLayer,
        `Inspired by top brand stories: Apple, Spotify, Airbnb, Nike — adapted to ${data.industry}. No actual text.`,
        sTags, q, neg(ctx, provider, "horizontal elements, landscape framing, cluttered bottom, multiple focal points"),
      );
    }

    case "social_cover": {
      return parts(
        prefix,
        `PLATFORM: LinkedIn profile cover / YouTube channel banner — 16:9 widescreen (2560×1440px).`,
        soul, journey, platCtx,
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
        humanLayer,
        `No text, no lorem ipsum — pure brand graphic authority.`,
        sTags, q, neg(ctx, provider, "cluttered, multiple focal points, text overlays, generic corporate clip art, low contrast"),
      );
    }

    case "social_post_square": {
      return parts(
        prefix,
        `PLATFORM: Instagram/Facebook feed post — perfect square 1:1 format. Competes in a dense feed of content.`,
        soul, journey, platCtx,
        `MARKETING INTENT: Brand presence + saves + shares. Must be recognizable as ${B} in a feed thumbnail.`,
        `BRAND: ${B} — ${ctx.personality}. Core message: ${ctx.messagingPillar}.`,
        ctx.tagline,
        ctx.sampleCTA ? `VISUAL CTA ENERGY: The post visually suggests the feeling of "${ctx.sampleCTA}" — action, forward motion.` : "",
        `VISUAL CONCEPT: ${ctx.marketingArch}. Bold, single-minded composition.`,
        `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
        idAssets,
        `VISUAL SUBJECT: ${ctx.visualMetaphor} — rendered with maximum graphic intention.`,
        `COLOR PALETTE (brand-strict): ${ctx.allColors}. Dominant: ${ctx.primaryColor}.`,
        `COMPOSITION: ${ctx.composition}. ONE dominant focal element — all other elements serve it. Perfect square balance.`,
        `MOOD/ENERGY: ${ctx.moodWords}. Voice energy: ${ctx.toneOfVoice}. Visual vocabulary: ${ctx.preferredVocab || ctx.personality}.`,
        `${ctx.visualStyle}.`,
        `PHOTOGRAPHY (if lifestyle): ${ctx.photoStyle}. Camera: 35mm, f/2.0, square crop.`,
        `${ctx.competitiveAngle}`,
        humanLayer,
        `No text in image — pure brand visual language.`,
        sTags, q, neg(ctx, provider, `generic stock imagery, overcrowded, multiple competing focal points${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "youtube_thumbnail": {
      return parts(
        prefix,
        `PLATFORM: YouTube video thumbnail — 1280×720px 16:9 format. Will be shown at 168×94px in feed — must work at tiny scale.`,
        soul, journey, platCtx,
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
        humanLayer,
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
        journey,
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
        journey,
        `${ctx.visualStyle}. No actual text — graphic background layer only.`,
        sTags, q, neg(ctx, provider, `text, lorem ipsum, photographic busy background, centered composition, multiple elements${ctx.verbAvoid ? ", " + ctx.verbAvoid : ""}`),
      );
    }

    case "app_mockup": {
      const uxLayout = data.uxPatterns?.dashboardLayout ?? `clean ${data.industry} dashboard with data visualizations`;
      return parts(
        prefix,
        `PLATFORM: Product UI mockup in modern iPhone 15 Pro (portrait) or MacBook Pro 14\" (landscape) device frame.`,
        soul, journey,
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
        humanLayer,
        sTags, q, neg(ctx, provider, "generic UI template, lorem ipsum, fake stock data, flat perspective, plastic device"),
      );
    }

    case "business_card": {
      return parts(
        prefix,
        `PLATFORM: Premium business card mockup — both front and back visible, 16:9 scene.`,
        soul, journey, sensory,
        `MARKETING INTENT: Represent the brand's physical touchpoint — communicate quality and positioning at first touch.`,
        `BRAND APPLICATIONS: ${ctx.brandApplications}.`,
        `CARD FRONT: ${ctx.logoPrimary}, dominant color ${ctx.primaryColor}, white space, minimal layout.`,
        `CARD BACK: ${ctx.primaryColor} solid or brand pattern (${ctx.patternStyle}), minimal.`,
        `Typography on card: ${ctx.displayFont} for name, ${ctx.bodyFont} for contact info.`,
        `MOCKUP SCENE: Elegant 3/4 angle on premium surface — ${ctx.photoStyle}.`,
        `Surface: marble, dark stone, or fine textured paper. Matches brand: ${ctx.visualStyle}.`,
        `LIGHTING: Soft directional studio light 45°, long sharp shadow, premium paper stock texture visible.`,
        `Both cards arranged with intentional angle, depth of field, luxury photographic quality.`,
        `MOOD: ${ctx.moodWords}. Premium, confident, tasteful. The viewer should want to reach out and pick up this card.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "flat illustration, cartoon style, plastic-looking surface, harsh or flat lighting, cheap paper stock"),
      );
    }

    case "brand_collateral": {
      return parts(
        prefix,
        `PLATFORM: Corporate stationery collection flat-lay — overhead 4:3 format.`,
        soul, journey, sensory,
        `MARKETING INTENT: Showcase the complete physical brand identity system for pitches and brand guidelines.`,
        `BRAND APPLICATIONS IN USE: ${ctx.brandApplications}.`,
        `ITEMS: Business card front+back, A4 letterhead sheet, kraft/coated notebook with embossed logo,`,
        `quality ballpoint pen, branded envelope with wax seal, brand element sticker or stamp.`,
        `All items branded with ${B}: color ${ctx.primaryColor}, logo, pattern ${ctx.patternStyle}.`,
        `STRICT COLOR: ${ctx.allPrimaryColors} only — no off-brand colors on any item.`,
        `SURFACE: ${ctx.photoStyle} — marble, raw concrete, natural linen, or fine wood. Style: ${ctx.visualStyle}.`,
        `LIGHTING: Soft natural window light from 45°, crisp soft shadows, luxury editorial feel.`,
        `COMPOSITION: ${ctx.composition}. Artfully arranged with intentional negative space, slight overlapping.`,
        `MOOD: ${ctx.moodWords}. Tasteful, editorial, premium. Each item must feel like it was crafted by a world-class identity studio.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "plastic surfaces, harsh shadows, poor lighting, off-brand colors, generic office supplies, cheap materials"),
      );
    }

    case "delivery_packaging": {
      return parts(
        prefix,
        `PLATFORM: Restaurant delivery packaging system mockup — 4:3 format, premium product photography.`,
        soul, journey, sensory,
        `MARKETING INTENT: Show a cohesive real-world packaging system that feels designed by a top identity studio.`,
        `BRAND: ${B} (${data.industry}). Purpose: ${ctx.purpose}. Personality: ${ctx.personality}.`,
        `ITEMS: paper bag, main food box/container, drink cup, napkins, cutlery sleeve, receipt card, small stickers/seals.`,
        `BRANDING APPLICATIONS: logo lockups (${ctx.logoPrimary}), brand pattern (${ctx.patternStyle}), brand symbols (${ctx.logoSymbol}).`,
        `COLOR SYSTEM: strict palette only (${ctx.allColors}). Dominant ${ctx.primaryColor}, secondary ${ctx.secondaryColor}, accent ${ctx.accentColor}.`,
        `TYPOGRAPHY: ${ctx.displayFont} for bold labels, ${ctx.bodyFont} for small copy. No readable text required.`,
        `MATERIALS: premium matte paper, kraft paper, soft-touch coating, embossed stamp look, clean die-cuts.`,
        `SCENE: Overhead or 3/4 flat-lay on stylish surface consistent with brand: ${ctx.photoStyle}.`,
        `LIGHTING: soft natural window light, crisp soft shadows, editorial realism.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "generic fast-food branding, messy food spills, low-res print, random colors, illegible noisy text, cheap disposable look"),
      );
    }

    case "takeaway_bag": {
      return parts(
        prefix,
        `PLATFORM: Takeaway bag / delivery bag mockup — 4:3 product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `OBJECT: premium kraft paper bag or reusable delivery tote with high-quality print, logo and pattern applications.`,
        `BRANDING: ${ctx.logoPrimary} centered, brand symbol accents (${ctx.logoSymbol}), subtle pattern (${ctx.patternStyle}).`,
        `COLOR: strict palette ${ctx.allColors}. Dominant ${ctx.primaryColor}.`,
        `SCENE: realistic in-hand or on counter scene, no faces, clean background, editorial lifestyle realism.`,
        `LIGHTING: soft natural light, realistic shadows, premium material texture visible.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "cheap plastic bag, low-quality print, clutter, messy background, cartoon, generic branding"),
      );
    }

    case "food_container": {
      return parts(
        prefix,
        `PLATFORM: Branded primary delivery container (box/bowl) — 4:3 close-up premium product photography.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `OBJECT: main container with lid + seal sticker; show one closed and one slightly open (optional).`,
        `BRANDING: clean logo lockup (${ctx.logoPrimary}), simple icon mark (${ctx.logoSymbol}), brand pattern as subtle detail (${ctx.patternStyle}).`,
        `COLOR: strict palette only ${ctx.allColors}.`,
        `MATERIAL: matte coated cardboard or premium paper, crisp edges, realistic print alignment.`,
        `SCENE: minimal studio surface matching ${ctx.visualStyle}.`,
        `LIGHTING: soft studio light, shallow depth of field, premium editorial shot.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "messy food, grease stains, low-end packaging, random colors, noisy text, watermark"),
      );
    }

    case "uniform_tshirt": {
      return parts(
        prefix,
        `PLATFORM: Staff uniform t-shirt mockup — 4:3 editorial lifestyle product shot.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `WARDROBE: premium cotton t-shirt with embroidered or screen-printed logo; subtle pattern accent optional.`,
        `BRANDING: chest logo (${ctx.logoPrimary}) + sleeve symbol (${ctx.logoSymbol}).`,
        `COLOR: strict palette only ${ctx.allColors}.`,
        `SCENE: on a person with face out of frame OR clean flat-lay; realistic folds and fabric texture.`,
        `LIGHTING: soft natural light, editorial realism, premium feel.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "visible faces, cheap fabric, distorted logo, low-res print, messy background"),
      );
    }

    case "uniform_apron": {
      return parts(
        prefix,
        `PLATFORM: Staff uniform apron mockup — 4:3 premium product/lifestyle photo.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `OBJECT: high-quality apron with embroidered logo patch or clean screen print; adjustable straps.`,
        `BRANDING: centered logo (${ctx.logoPrimary}), optional subtle pattern detail (${ctx.patternStyle}).`,
        `COLOR: strict palette only ${ctx.allColors}.`,
        `SCENE: kitchen/work counter context, face out of frame, clean and premium, not stock photo.`,
        `LIGHTING: warm natural light, shallow depth of field, editorial texture.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "visible faces, greasy messy kitchen, cheap apron, distorted print, watermark"),
      );
    }

    case "materials_board": {
      return parts(
        prefix,
        `PLATFORM: Brand materials & textures board — 1:1 square moodboard composition.`,
        soul, journey, sensory,
        `BRAND: ${B} (${data.industry}).`,
        `CONTENT: curated set of 6-10 material swatches (paper stock, fabric, metal/foil, matte plastic, textured label) plus color chips.`,
        `BRAND SYSTEM: derived from ${ctx.logoSymbol} and pattern ${ctx.patternStyle}.`,
        `COLOR: strict palette only ${ctx.allColors}.`,
        `STYLE: ${ctx.visualStyle}. Mood: ${ctx.moodWords}.`,
        `COMPOSITION: clean top-down flat-lay, premium editorial, precise grid, soft shadows. Each material should feel like it was hand-selected by the creative director.`,
        humanLayer,
        sTags, q, neg(ctx, provider, "random unrelated materials, off-brand colors, messy collage, low-res textures, text"),
      );
    }

    case "outdoor_billboard": {
      return parts(
        prefix,
        `PLATFORM: Large-format OOH billboard mockup in busy urban street — 16:9 landscape.`,
        soul, journey,
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
        humanLayer,
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

export type AspectRatioOption = "1:1" | "16:9" | "9:16" | "4:3" | "21:9";

export interface SizeVariant {
  label: string;
  aspectRatio: AspectRatioOption;
  dims?: string;
}

export function detectSizeVariants(appType: string): SizeVariant[] {
  const t = appType.toLowerCase();

  if (/story|stories|reels/.test(t))
    return [
      { label: "Stories 9:16", aspectRatio: "9:16", dims: "1080×1920px" },
      { label: "Feed 1:1", aspectRatio: "1:1", dims: "1080×1080px" },
    ];

  if (/instagram|social|post|feed|redes/.test(t))
    return [
      { label: "Feed 1:1", aspectRatio: "1:1", dims: "1080×1080px" },
      { label: "Stories 9:16", aspectRatio: "9:16", dims: "1080×1920px" },
      { label: "Cover 16:9", aspectRatio: "16:9", dims: "1200×630px" },
    ];

  if (/outdoor|billboard|ooh|fachada|totem/.test(t))
    return [
      { label: "Outdoor 16:9", aspectRatio: "16:9", dims: "9×3m" },
      { label: "Banner 21:9", aspectRatio: "21:9", dims: "6×2m" },
      { label: "Totem 9:16", aspectRatio: "9:16", dims: "120×180cm" },
    ];

  if (/email|newsletter|mailing/.test(t))
    return [
      { label: "Header 21:9", aspectRatio: "21:9", dims: "600×200px" },
      { label: "Banner 16:9", aspectRatio: "16:9", dims: "600×338px" },
    ];

  if (/card|cartão|visita|business/.test(t))
    return [
      { label: "Padrão 16:9", aspectRatio: "16:9", dims: "85×55mm" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "60×60mm" },
    ];

  if (/\bapp\b|mobile|interface|tela|screen|dashboard/.test(t))
    return [
      { label: "Mobile 9:16", aspectRatio: "9:16", dims: "375×812px" },
      { label: "Desktop 16:9", aspectRatio: "16:9", dims: "1440×900px" },
    ];

  if (/banner|hero|site|web|landing|header|cover|capa/.test(t))
    return [
      { label: "Hero 16:9", aspectRatio: "16:9", dims: "1440×810px" },
      { label: "Banner 21:9", aspectRatio: "21:9", dims: "1440×614px" },
      { label: "Vertical 9:16", aspectRatio: "9:16", dims: "810×1440px" },
    ];

  if (/embalagem|packaging|sacola|caixa|bag|pote|copo|delivery/.test(t))
    return [
      { label: "Kit 4:3", aspectRatio: "4:3", dims: "800×600px" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "800×800px" },
    ];

  if (/uniforme|camiseta|avental|camisa|uniform|apron/.test(t))
    return [
      { label: "Produto 4:3", aspectRatio: "4:3", dims: "800×600px" },
    ];

  if (/menu|cardápio|folder|brochure|papelaria|colateral/.test(t))
    return [
      { label: "A4 4:3", aspectRatio: "4:3", dims: "210×297mm" },
      { label: "Quadrado 1:1", aspectRatio: "1:1", dims: "210×210mm" },
    ];

  return [
    { label: "Quadrado 1:1", aspectRatio: "1:1" },
    { label: "Paisagem 16:9", aspectRatio: "16:9" },
    { label: "Vertical 9:16", aspectRatio: "9:16" },
  ];
}

export function buildApplicationPrompt(
  app: {
    type: string;
    description: string;
    dimensions?: string;
    materialSpecs?: string;
    layoutGuidelines?: string;
    typographyHierarchy?: string;
    artDirection?: string;
    substrates?: string[];
  },
  data: BrandbookData,
  provider: ImageProvider,
  aspectRatio: AspectRatioOption = "1:1",
  customInstruction?: string
): string {
  const ctx = extractBrandContext(data);
  const archetypeName = ctx.archetypalEnergy.split(" — ")[0] ?? "Creator";
  const B = `"${data.brandName}"`;

  const t = app.type.toLowerCase();
  const detectedKey: AssetKey = /card|cartão|visita/.test(t) ? "business_card"
    : /outdoor|billboard|ooh/.test(t) ? "outdoor_billboard"
    : /story|stories|reels/.test(t) ? "instagram_story"
    : /instagram|social|post|feed/.test(t) ? "social_post_square"
    : /email|newsletter/.test(t) ? "email_header"
    : /embalagem|packaging|sacola|caixa|bag|delivery/.test(t) ? "delivery_packaging"
    : /uniforme|camiseta|avental|camisa/.test(t) ? "uniform_tshirt"
    : /menu|cardápio|folder|brochure/.test(t) ? "brand_collateral"
    : /\bapp\b|mobile|interface|tela|screen|dashboard/.test(t) ? "app_mockup"
    : /banner|hero|site|web|landing|header|cover|capa/.test(t) ? "hero_visual"
    : /apresentação|slide|presentation/.test(t) ? "presentation_bg"
    : "brand_collateral";

  const q = providerQuality(provider, detectedKey, archetypeName);
  const prefix = providerPrefix(provider, detectedKey) + consistencyPrefix(ctx, data, detectedKey) + " ";
  const sTags = provider === "stability" ? stabilityTags(ctx, detectedKey) : "";

  const parts = (...lines: (string | false | undefined | null)[]): string =>
    lines.filter(Boolean).join(" ");

  const soul = soulAnchor(ctx);
  const journey = emotionalJourney(detectedKey, ctx);
  const sensory = sensoryDirectives(detectedKey, ctx);
  const tree = styleAnchorTree(ctx, data);
  const idAssets = identityAssetsDirective(ctx, detectedKey);
  const humanLayer = humanEssenceLayer(detectedKey, ctx, data);

  return parts(
    prefix,
    `Professional brand application — ${app.type} for ${B} (${data.industry}).`,
    soul, journey,
    `APPLICATION: ${app.description}.`,
    app.dimensions ? `DIMENSIONS/FORMAT: ${app.dimensions}. Aspect ratio: ${aspectRatio}.` : `ASPECT RATIO: ${aspectRatio}.`,
    app.materialSpecs && `MATERIAL & FINISH (render with haptic realism): ${app.materialSpecs}.`,
    app.layoutGuidelines && `LAYOUT RULES: ${app.layoutGuidelines}.`,
    app.typographyHierarchy && `TYPOGRAPHY HIERARCHY: ${app.typographyHierarchy}.`,
    app.artDirection && `ART DIRECTION: ${app.artDirection}.`,
    (app.substrates && app.substrates.length > 0) ? `SUBSTRATES & MATERIALS: ${app.substrates.join(", ")}.` : null,
    `BRAND DNA: personality=${ctx.personality}. Values=${ctx.values}. Tone=${ctx.toneOfVoice}.`,
    `COLOR PALETTE (strict): ${ctx.allColors}.`,
    `LOGO: ${ctx.logoPrimary}. Symbol: ${ctx.logoSymbol}.`,
    tree, idAssets, sensory,
    `VISUAL STYLE: ${ctx.visualStyle}. Photography: ${ctx.photoStyle}.`,
    `INDUSTRY VISUAL LANGUAGE: ${ctx.industryLang}.`,
    `COMPOSITION: ${ctx.composition}. Mood: ${ctx.moodWords}.`,
    ctx.tagline,
    `REFERENCES: ${ctx.artisticRef}.`,
    ctx.competitiveAngle,
    humanLayer,
    customInstruction ? `CUSTOM CREATIVE DIRECTION: ${customInstruction}.` : null,
    sTags, q, neg(ctx, provider),
  );
}
