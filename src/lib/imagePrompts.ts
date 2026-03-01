import { BrandbookData, ImageProvider } from "./types";

export type AssetKey =
  | "logo_primary"
  | "logo_dark_bg"
  | "brand_pattern"
  | "hero_visual"
  | "hero_lifestyle"
  | "business_card"
  | "social_cover"
  | "social_post_square"
  | "app_mockup"
  | "brand_collateral"
  | "email_header"
  | "outdoor_billboard";

export const ASSET_CATALOG: {
  key: AssetKey;
  label: string;
  description: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "21:9";
  category: "logo" | "digital" | "social" | "print" | "mockup";
}[] = [
  {
    key: "logo_primary",
    label: "Logo — Fundo Claro",
    description: "Logotipo vetorial sobre fundo branco/neutro, versão principal",
    aspectRatio: "1:1",
    category: "logo",
  },
  {
    key: "logo_dark_bg",
    label: "Logo — Fundo Escuro",
    description: "Logotipo versão invertida para fundos escuros e vídeos",
    aspectRatio: "1:1",
    category: "logo",
  },
  {
    key: "brand_pattern",
    label: "Padrão Gráfico de Marca",
    description: "Textura/pattern seamless para embalagens, fundos e papelaria",
    aspectRatio: "1:1",
    category: "digital",
  },
  {
    key: "hero_visual",
    label: "Hero Institucional",
    description: "Visual hero conceitual para landing page, campanha e mídia paga",
    aspectRatio: "16:9",
    category: "digital",
  },
  {
    key: "hero_lifestyle",
    label: "Hero Lifestyle",
    description: "Foto lifestyle editorial com contexto de uso do produto/serviço",
    aspectRatio: "16:9",
    category: "digital",
  },
  {
    key: "business_card",
    label: "Cartão de Visitas",
    description: "Mockup 3D fotorrealista — frente e verso, iluminação de estúdio",
    aspectRatio: "16:9",
    category: "mockup",
  },
  {
    key: "social_cover",
    label: "Cover LinkedIn / YouTube",
    description: "Banner de capa 16:9 profissional para redes sociais",
    aspectRatio: "16:9",
    category: "social",
  },
  {
    key: "social_post_square",
    label: "Post Redes Sociais (1:1)",
    description: "Post quadrado para Instagram e Facebook — visual forte e marcante",
    aspectRatio: "1:1",
    category: "social",
  },
  {
    key: "app_mockup",
    label: "App / Dashboard Mockup",
    description: "Interface do produto em dispositivo real com UI fiel à marca",
    aspectRatio: "9:16",
    category: "mockup",
  },
  {
    key: "brand_collateral",
    label: "Papelaria Corporativa",
    description: "Flat-lay com kit completo: cartão, pasta, caneta, bloco, envelope",
    aspectRatio: "4:3",
    category: "mockup",
  },
  {
    key: "email_header",
    label: "Header de E-mail Marketing",
    description: "Banner topo para newsletter — 600px, visual limpo e clicável",
    aspectRatio: "21:9",
    category: "digital",
  },
  {
    key: "outdoor_billboard",
    label: "Outdoor / OOH",
    description: "Mockup de outdoor urbano com aplicação da identidade visual",
    aspectRatio: "16:9",
    category: "print",
  },
];

function extractBrandContext(data: BrandbookData) {
  const igb = data.imageGenerationBriefing;
  const primaryColor = data.colors.primary[0]?.hex ?? "#1a1a1a";
  const secondaryColor = data.colors.primary[1]?.hex ?? data.colors.secondary[0]?.hex ?? "#ffffff";
  const accentColor = data.colors.secondary[0]?.hex ?? "#888888";
  const allPrimaryColors = data.colors.primary.map((c) => `${c.name} (${c.hex})`).join(", ");
  const allSecondaryColors = data.colors.secondary.map((c) => `${c.name} (${c.hex})`).join(", ");
  const personality = data.brandConcept.personality.slice(0, 4).join(", ");
  const values = data.brandConcept.values.slice(0, 3).join(", ");
  const displayFont = data.typography.marketing?.name ?? data.typography.primary?.name ?? "Inter";
  const bodyFont = data.typography.ui?.name ?? data.typography.secondary?.name ?? displayFont;
  const photoStyle = igb?.photographyMood ?? data.keyVisual.photographyStyle;
  const elements = data.keyVisual.elements.slice(0, 4).join(", ");
  const moodWords = igb?.moodKeywords?.join(", ") ?? personality;
  const visualStyle = igb?.visualStyle ?? `professional brand identity for ${data.industry}`;
  const colorMood = igb?.colorMood ?? `palette centered on ${primaryColor} and ${secondaryColor}`;
  const composition = igb?.compositionNotes ?? "clean balanced composition with generous whitespace";
  const artisticRef = igb?.artisticReferences ?? "contemporary professional brand photography";
  const avoid = igb?.avoidElements ?? "clutter, low quality, amateur";
  const negativeBase = igb?.negativePrompt ?? "blurry, low quality, watermark, amateur, pixelated, deformed, distorted, ugly, overexposed";

  return {
    primaryColor, secondaryColor, accentColor,
    allPrimaryColors, allSecondaryColors,
    personality, values, displayFont, bodyFont,
    photoStyle, elements, moodWords, visualStyle,
    colorMood, composition, artisticRef, avoid,
    negativeBase,
    logoStyle: igb?.logoStyleGuide ?? `clean logotype for ${data.brandName}`,
    patternStyle: igb?.patternStyle ?? `geometric repeating pattern using ${primaryColor}`,
    marketingLanguage: igb?.marketingVisualLanguage ?? "bold editorial graphic design",
  };
}

function providerQuality(provider: ImageProvider, assetKey: AssetKey): string {
  if (provider === "dalle3") {
    return "ultra-high resolution, professional commercial photography, award-winning design, printed in Wallpaper magazine, shot on Phase One, masterpiece quality";
  }
  if (provider === "stability") {
    const isMockup = ["business_card", "brand_collateral", "app_mockup", "outdoor_billboard"].includes(assetKey);
    return isMockup
      ? "hyperrealistic product photography, 8k uhd, Hasselblad medium format, studio lighting, octane render, photorealistic"
      : "8k uhd, professional editorial photography, award-winning, sharp focus, detailed, Kodak Portra 400 film aesthetic";
  }
  return "vector-perfect, crisp edges, flat design, brand identity system, Pentagram-quality design studio output";
}

function negativePromptBlock(ctx: ReturnType<typeof extractBrandContext>, provider: ImageProvider, extra = ""): string {
  if (provider !== "stability") return "";
  return ` --neg ${ctx.negativeBase}, ${ctx.avoid}, ${extra}`.trim();
}

export function buildImagePrompt(key: AssetKey, data: BrandbookData, provider: ImageProvider): string {
  const ctx = extractBrandContext(data);
  const quality = providerQuality(provider, key);
  const neg = negativePromptBlock(ctx, provider);

  switch (key) {
    case "logo_primary": {
      const ideogramExtra = provider === "ideogram"
        ? `The wordmark text "${data.brandName}" rendered in perfect legible ${ctx.displayFont} typography. `
        : "";
      return (
        `Professional brand logo design for "${data.brandName}", a ${data.industry} company. ` +
        ideogramExtra +
        `${ctx.logoStyle}. ` +
        `Primary color ${ctx.primaryColor} on pure white (#FFFFFF) background. ` +
        `Brand personality: ${ctx.personality}. Brand values: ${ctx.values}. ` +
        `Visual style: ${ctx.visualStyle}. ` +
        `Isolated logomark + wordmark lockup, clean vector graphic, sharp edges, scalable symbol, no gradients unless brand-required, ` +
        `isolated on white, no shadows, no background elements, no decorative frames. ` +
        `${quality}${neg}`
      );
    }

    case "logo_dark_bg": {
      const ideogramExtra = provider === "ideogram"
        ? `The wordmark text "${data.brandName}" rendered in perfect legible ${ctx.displayFont} typography. `
        : "";
      return (
        `Professional brand logo design for "${data.brandName}" — dark background version. ` +
        ideogramExtra +
        `${ctx.logoStyle} inverted/white version. ` +
        `White or light-colored logo on deep dark background ${ctx.primaryColor}. ` +
        `Brand personality: ${ctx.personality}. ` +
        `Inverted logomark + wordmark lockup, high contrast, clean edges, no background noise, ` +
        `pure dark background color ${ctx.primaryColor}, centered composition. ` +
        `${quality}${neg}`
      );
    }

    case "brand_pattern": {
      return (
        `Seamless tileable surface pattern for brand "${data.brandName}" (${data.industry}). ` +
        `Pattern style: ${ctx.patternStyle}. ` +
        `Strict color palette: primary ${ctx.primaryColor}, secondary ${ctx.secondaryColor}, accent ${ctx.accentColor}. ` +
        `No other colors. Inspired by brand elements: ${ctx.elements}. ` +
        `${ctx.visualStyle} aesthetic. Mood: ${ctx.moodWords}. ` +
        `Geometric precision, infinitely tileable, no visible seams, no text, no logos, ` +
        `${ctx.composition}. ` +
        `${quality}${negativePromptBlock(ctx, provider, "visible seams, random elements, photographic content")}`
      );
    }

    case "hero_visual": {
      return (
        `Cinematic hero image for "${data.brandName}" brand campaign. Industry: ${data.industry}. ` +
        `${ctx.visualStyle}. Photography/art direction: ${ctx.photoStyle}. ` +
        `Color grading: ${ctx.colorMood}. Dominant hue ${ctx.primaryColor}, accent ${ctx.secondaryColor}. ` +
        `Mood: ${ctx.moodWords}. Artistic references: ${ctx.artisticRef}. ` +
        `${ctx.composition}. ${ctx.marketingLanguage}. ` +
        `Wide cinematic 16:9 format, dramatic professional lighting, deep focus or selective bokeh. ` +
        `No text, no logos, no watermarks, pure visual storytelling. ` +
        `${quality}${negativePromptBlock(ctx, provider, "text overlays, logos, watermarks, stock photo clichés")}`
      );
    }

    case "hero_lifestyle": {
      return (
        `Editorial lifestyle photography for "${data.brandName}" brand. Industry: ${data.industry}. ` +
        `Scene: authentic real-world usage context of ${data.industry} service/product. ` +
        `Photography mood: ${ctx.photoStyle}. ${ctx.colorMood}. ` +
        `Subtle brand color ${ctx.primaryColor} present in props, clothing or environment. ` +
        `Human subjects if applicable: diverse, authentic, not model-posed. ` +
        `Mood keywords: ${ctx.moodWords}. ${ctx.artisticRef}. ` +
        `Natural or soft studio lighting, 35mm or 50mm lens feel, shallow depth of field. ` +
        `No text, no logos on subjects, editorial authenticity. ` +
        `${quality}${negativePromptBlock(ctx, provider, "stock photo aesthetic, overly posed, fake smile, generic office")}`
      );
    }

    case "business_card": {
      return (
        `Premium business card mockup for "${data.brandName}", ${data.industry}. ` +
        `Card design: ${ctx.logoStyle}. Primary design color ${ctx.primaryColor}. ` +
        `Typography: ${ctx.displayFont} for name/title, ${ctx.bodyFont} for contact details. ` +
        `Both front and back visible in elegant 3/4 angle. ` +
        `Realistic mockup scene: ${ctx.photoStyle}. ` +
        `Surface: marble, dark stone or textured paper — matches brand aesthetic ${ctx.visualStyle}. ` +
        `Soft directional studio light, long shadow, premium paper stock texture visible, ` +
        `photorealistic depth of field. 16:9 landscape composition. ` +
        `${quality}${negativePromptBlock(ctx, provider, "flat illustration, cartoon, fake texture, plastic-looking")}`
      );
    }

    case "social_cover": {
      return (
        `Professional social media cover banner for "${data.brandName}". ` +
        `Platform: LinkedIn/YouTube — strict 16:9 ratio. ` +
        `${ctx.marketingLanguage}. Visual style: ${ctx.visualStyle}. ` +
        `Dominant color: ${ctx.primaryColor}. Accent: ${ctx.secondaryColor}. ` +
        `${ctx.composition}. Mood: ${ctx.moodWords}. ` +
        `Bold graphic design, strong visual hierarchy, ample safe zone for text overlay (left or center). ` +
        `Brand elements: ${ctx.elements}. ${ctx.colorMood}. ` +
        `No placeholder text, no lorem ipsum, graphic only. ` +
        `${quality}${negativePromptBlock(ctx, provider, "text overlays, lorem ipsum, cluttered layout")}`
      );
    }

    case "social_post_square": {
      return (
        `Instagram/Facebook square post design for "${data.brandName}" brand. ` +
        `1:1 format, strong visual impact. ${ctx.marketingLanguage}. ` +
        `Color palette: ${ctx.allPrimaryColors}. Accent: ${ctx.allSecondaryColors}. ` +
        `Visual style: ${ctx.visualStyle}. Composition: ${ctx.composition}. ` +
        `Thumb-stopping design, bold geometry or editorial photography. ` +
        `Mood: ${ctx.moodWords}. Brand personality: ${ctx.personality}. ` +
        `No text/copy needed — pure visual brand language. ` +
        `${quality}${negativePromptBlock(ctx, provider, "text overlays, generic stock")}`
      );
    }

    case "app_mockup": {
      const uxLayout = data.uxPatterns?.dashboardLayout ?? "clean SaaS dashboard layout";
      return (
        `Mobile/web app UI mockup for "${data.brandName}" (${data.industry}). ` +
        `Interface design follows: ${uxLayout}. ` +
        `Color system: primary ${ctx.primaryColor}, secondary ${ctx.secondaryColor}, neutral ${ctx.accentColor}. ` +
        `Typography: ${ctx.displayFont} for headings, ${ctx.bodyFont} for body text. ` +
        `Design tokens: rounded corners, generous spacing, clean card components. ` +
        `Displayed on modern iPhone 15 Pro or MacBook Pro device frame, realistic perspective. ` +
        `Screen shows realistic branded UI — not generic template. ` +
        `Dark or light mode matching brand: ${ctx.visualStyle}. ` +
        `Studio white or contextual background, bokeh. ` +
        `${quality}${negativePromptBlock(ctx, provider, "generic app template, lorem ipsum text, fake UI")}`
      );
    }

    case "brand_collateral": {
      return (
        `Branded corporate stationery flat-lay for "${data.brandName}". ` +
        `Collection items: business cards (front+back), A4 letterhead, kraft notebook with logo, ` +
        `ballpoint pen, branded envelope, wax seal or stamp. ` +
        `All items in strict brand color palette: ${ctx.allPrimaryColors}. ` +
        `Overhead flat-lay, 4:3 or square crop. ` +
        `Surface: ${ctx.photoStyle} — marble, concrete, linen or wood matching brand aesthetic ${ctx.visualStyle}. ` +
        `Soft natural window light from 45°, crisp shadows, premium luxury feel. ` +
        `Composition: ${ctx.composition}. ` +
        `${quality}${negativePromptBlock(ctx, provider, "plastic-looking surfaces, poor lighting, generic props")}`
      );
    }

    case "email_header": {
      return (
        `Professional email marketing header banner for "${data.brandName}". ` +
        `Ultra-wide 21:9 format (600px email standard). ${ctx.marketingLanguage}. ` +
        `Color: ${ctx.primaryColor} dominant, ${ctx.secondaryColor} accent. ` +
        `Clean minimal graphic with strong left-to-right reading flow. ` +
        `Safe zone for headline text overlay (light/dark background allowing text legibility). ` +
        `Visual style: ${ctx.visualStyle}. Brand elements: ${ctx.elements}. ` +
        `No actual text — graphic layer only. Horizontal composition optimized for email clients. ` +
        `${quality}${negativePromptBlock(ctx, provider, "text, lorem ipsum, cluttered")}`
      );
    }

    case "outdoor_billboard": {
      return (
        `Outdoor billboard mockup for "${data.brandName}" campaign in urban setting. ` +
        `Billboard displays: pure brand visual with color ${ctx.primaryColor} dominant. ` +
        `${ctx.marketingLanguage}. Visual concept: ${ctx.visualStyle}. ` +
        `Urban context: city street, golden hour or blue hour lighting. ` +
        `Realistic OOH advertising mockup — billboard panel with brand design applied. ` +
        `${ctx.composition}. Mood: ${ctx.moodWords}. ` +
        `Photorealistic scene, people passing in background (blurred), evening light. ` +
        `${quality}${negativePromptBlock(ctx, provider, "fake billboard, CGI plastic, daytime overexposed")}`
      );
    }

    default: {
      return (
        `Professional brand visual for "${data.brandName}" (${data.industry}). ` +
        `${ctx.visualStyle}. ${ctx.colorMood}. ${ctx.composition}. ` +
        `${quality}${neg}`
      );
    }
  }
}
