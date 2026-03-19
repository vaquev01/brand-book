/**
 * Pattern Engine — generates creative multi-layer brand textures
 * by intelligently composing brand elements (flora, fauna, symbols, patterns).
 */

import type { BrandbookData } from "./types";

export type PatternVariant = "organic" | "geometric" | "mixed" | "minimal" | "maximal" | "textural";
export type PatternDensity = "sparse" | "balanced" | "dense";
export type PatternMood = "light" | "dark" | "accent" | "neutral";

export interface PatternRecipe {
  variant: PatternVariant;
  density: PatternDensity;
  mood: PatternMood;
  prompt: string;
  negativePrompt: string;
  /** Suggested aspect ratio */
  aspectRatio: "1:1" | "16:9" | "4:3";
}

interface BrandElements {
  brandName: string;
  industry: string;
  archetype: string;
  primaryColors: string[];
  secondaryColors: string[];
  allColorNames: string[];
  symbols: string[];
  patterns: string[];
  flora: string[];
  fauna: string[];
  objects: string[];
  structuredPatterns: Array<{ name: string; composition: string; density?: string }>;
  logoSymbol: string;
  visualStyle: string;
  photographyMood: string;
  patternStyle: string;
  emotionalCore: string;
  textureLanguage: string;
  moodKeywords: string[];
  mascots: Array<{ name: string; description: string }>;
  illustrationStyle: string;
}

export function extractElements(bb: BrandbookData): BrandElements {
  const primaryColors = (bb.colors?.primary ?? []).map((c) => `${c.name} ${c.hex}`);
  const secondaryColors = (bb.colors?.secondary ?? []).map((c) => `${c.name} ${c.hex}`);
  const allColorNames = [
    ...(bb.colors?.primary ?? []).map((c) => c.name),
    ...(bb.colors?.secondary ?? []).map((c) => c.name),
  ];
  const igb = bb.imageGenerationBriefing;

  return {
    brandName: bb.brandName,
    industry: bb.industry,
    archetype: bb.brandConcept?.brandArchetype ?? "Creator",
    primaryColors,
    secondaryColors,
    allColorNames,
    symbols: (bb.keyVisual?.symbols ?? []).slice(0, 8),
    patterns: (bb.keyVisual?.patterns ?? []).slice(0, 6),
    flora: (bb.keyVisual?.flora ?? []).slice(0, 6),
    fauna: (bb.keyVisual?.fauna ?? []).slice(0, 6),
    objects: (bb.keyVisual?.objects ?? []).slice(0, 6),
    structuredPatterns: (bb.keyVisual?.structuredPatterns ?? []).slice(0, 3),
    logoSymbol: bb.logo?.symbol ?? "",
    visualStyle: igb?.visualStyle ?? "",
    photographyMood: igb?.photographyMood ?? "",
    patternStyle: igb?.patternStyle ?? "",
    emotionalCore: igb?.emotionalCore ?? "",
    textureLanguage: igb?.textureLanguage ?? "",
    moodKeywords: (igb?.moodKeywords ?? []).slice(0, 8),
    mascots: (bb.keyVisual?.mascots ?? []).slice(0, 2).map((m) => ({ name: m.name, description: m.description })),
    illustrationStyle: bb.keyVisual?.iconography ?? igb?.visualStyle ?? "",
  };
}

export function buildMotifVocabulary(el: BrandElements): string {
  const motifs: string[] = [];

  if (el.flora.length > 0) motifs.push(`FLORA: ${el.flora.join(", ")} — use as organic rhythm elements, varying scale (large hero + small accent)`);
  if (el.fauna.length > 0) motifs.push(`FAUNA: ${el.fauna.join(", ")} — silhouettes and abstractions, not literal illustrations`);
  if (el.symbols.length > 0) motifs.push(`SYMBOLS: ${el.symbols.join(", ")} — geometric core motifs derived from brand DNA`);
  if (el.objects.length > 0) motifs.push(`OBJECTS: ${el.objects.join(", ")} — industry-specific elements as texture building blocks`);
  if (el.patterns.length > 0) motifs.push(`PATTERN DNA: ${el.patterns.join(", ")} — existing pattern language to extend`);
  if (el.logoSymbol) motifs.push(`LOGO ROOT: Deconstruct "${el.logoSymbol}" into fundamental shapes (arcs, angles, lines) and weave throughout`);

  if (motifs.length === 0) {
    motifs.push(`DERIVE from brand archetype "${el.archetype}" and industry "${el.industry}" — create proprietary geometric vocabulary`);
  }

  return motifs.join(". ");
}

function variantDirective(variant: PatternVariant, el: BrandElements): string {
  switch (variant) {
    case "organic":
      return `STYLE: Organic flowing composition. Art Nouveau-inspired curves, botanical rhythms, hand-drawn feeling. ${el.flora.length > 0 ? `Feature ${el.flora.slice(0, 3).join(" and ")} as hero motifs.` : "Nature-derived forms."} Irregular spacing creates visual breathing. Think William Morris meets modern branding.`;
    case "geometric":
      return `STYLE: Precise geometric construction. Mathematical grid, Swiss-design rigor. Deconstruct brand symbols into circles, triangles, lines, arcs. Think Bauhaus pattern systems. Clean intersections, deliberate proportions, zero organic randomness.`;
    case "mixed":
      return `STYLE: Controlled fusion — geometric backbone with organic accents. Start with a mathematical grid, then soften edges with brand flora/fauna elements. The geometry provides structure, the organic elements provide warmth and recognition. Think Hermès scarf meets tech startup.`;
    case "minimal":
      return `STYLE: Ultra-restrained. Maximum 3 motif types. Generous whitespace (60%+ of composition). Thin precise strokes. Zen-like breathing room. Single-color or duotone only. Think Apple packaging tissue. Less is memorability.`;
    case "maximal":
      return `STYLE: Rich, dense, immersive. Layer ALL brand elements — flora, fauna, symbols, objects — into a tapestry of controlled complexity. Horror vacui as strategy: every space serves the brand story. Think Gucci wallpaper or Versace textile. Dense but never chaotic.`;
    case "textural":
      return `STYLE: Tactile surface texture. ${el.textureLanguage ? `Texture language: ${el.textureLanguage}.` : "Focus on materiality — visible grain, paper fibers, fabric weave, embossed letterpress."} The pattern should make the viewer want to TOUCH it. Think craft paper, linen, concrete, leather. Monochrome base with brand color accent.`;
  }
}

function densityDirective(density: PatternDensity): string {
  switch (density) {
    case "sparse":
      return "DENSITY: Sparse — 30% motifs, 70% negative space. Each element breathes independently. Use for backgrounds, slides, stationery watermarks.";
    case "balanced":
      return "DENSITY: Balanced — 55% motifs, 45% negative space. Comfortable visual rhythm. Use for packaging, textiles, brand surfaces.";
    case "dense":
      return "DENSITY: Dense — 80% motifs, 20% breathing space. Rich surface coverage. Use for wrapping paper, wallpaper, immersive brand environments.";
  }
}

function moodPalette(mood: PatternMood, el: BrandElements): string {
  switch (mood) {
    case "light":
      return `PALETTE: Light mode — white/off-white ground. Motifs in ${el.primaryColors[0] ?? "primary"} at 100% and ${el.secondaryColors[0] ?? "secondary"} at 40% opacity. Airy, clean, elegant.`;
    case "dark":
      return `PALETTE: Dark mode — deep ${el.primaryColors[0] ?? "primary"} ground. Motifs in white/cream at varying opacities (20%, 50%, 80%). Dramatic, premium, nighttime.`;
    case "accent":
      return `PALETTE: Accent mode — ${el.secondaryColors[0] ?? "secondary"} ground. Motifs in ${el.primaryColors[0] ?? "primary"} + white. Bold, energetic, attention-grabbing. For feature walls, event backdrops.`;
    case "neutral":
      return `PALETTE: Neutral/monochrome — warm gray or kraft ground. Motifs in single brand color at varying tones (10%, 30%, 60%, 100%). Sophisticated, understated, premium.`;
  }
}

/**
 * Generate a creative pattern recipe that combines brand elements intelligently.
 */
export function buildPatternRecipe(
  brandbook: BrandbookData,
  variant: PatternVariant = "mixed",
  density: PatternDensity = "balanced",
  mood: PatternMood = "light"
): PatternRecipe {
  const el = extractElements(brandbook);
  const motifs = buildMotifVocabulary(el);

  const structuredPatternBlock = el.structuredPatterns.length > 0
    ? `STRUCTURED PATTERN SPECS: ${el.structuredPatterns.map((p) => `"${p.name}" — ${p.composition} (density: ${p.density ?? "moderate"})`).join(". ")}.`
    : "";

  const mascotBlock = el.mascots.length > 0
    ? `MASCOT ELEMENTS: Integrate silhouettes/abstractions of ${el.mascots.map((m) => `"${m.name}" (${m.description})`).join(", ")} as secondary motifs — NOT literal character drawings.`
    : "";

  const prompt = [
    `Create a world-class seamless tileable surface pattern for brand "${el.brandName}" (${el.industry}).`,
    `BRAND ARCHETYPE: ${el.archetype}. Visual style: ${el.visualStyle || "modern, premium"}.`,
    el.emotionalCore ? `EMOTIONAL CORE: ${el.emotionalCore}.` : "",
    variantDirective(variant, el),
    densityDirective(density),
    moodPalette(mood, el),
    `MOTIF VOCABULARY (use ONLY these — do not invent unrelated elements): ${motifs}`,
    structuredPatternBlock,
    mascotBlock,
    el.patternStyle ? `PATTERN DIRECTION: ${el.patternStyle}.` : "",
    `COLOR CONSTRAINT: Use ONLY brand colors: ${[...el.primaryColors, ...el.secondaryColors].join(", ")}. No other colors allowed.`,
    `MULTI-LAYER COMPOSITION:`,
    `  Layer 1 (GROUND): Solid color or very subtle texture base`,
    `  Layer 2 (RHYTHM): Primary motifs at regular intervals creating the visual pulse`,
    `  Layer 3 (ACCENT): Secondary motifs filling gaps, creating depth and interest`,
    `  Layer 4 (DETAIL): Micro-elements (dots, lines, tiny symbols) adding refinement`,
    `SEAMLESS TILING: The pattern MUST tile perfectly in all directions. Edges connect mathematically. Use a grid system (square, hex, or diamond).`,
    `QUALITY STANDARD: This is for a premium brand. Think Hermès, Gucci, or Apple level craft. Every element has a reason to exist.`,
    `FORMAT: Square 1:1 composition showing the complete repeat unit. Flat vector style. Clean, precise.`,
    el.moodKeywords.length > 0 ? `MOOD: ${el.moodKeywords.join(", ")}.` : "",
  ].filter(Boolean).join("\n");

  const negativePrompt = [
    "text, words, letters, logos, wordmarks, brand name written",
    "photographic elements, lens flare, bokeh, depth of field",
    "3D effects, drop shadows, gradients, glow, bevel",
    "human figures, faces, hands, realistic objects",
    "visible seams, edge artifacts, asymmetric scatter",
    "random noise, overcrowded composition, blurry edges",
    "inconsistent stroke weights, amateur illustration",
    "watermark, signature, copyright text",
  ].join(", ");

  return {
    variant,
    density,
    mood,
    prompt,
    negativePrompt,
    aspectRatio: "1:1",
  };
}

/**
 * Generate a full set of pattern recipes for a brand — 6 essential variations.
 * Covers different use cases: stationery, packaging, digital, events, etc.
 */
export function buildPatternCollection(brandbook: BrandbookData): PatternRecipe[] {
  return [
    buildPatternRecipe(brandbook, "mixed", "balanced", "light"),    // Primary — stationery, slides
    buildPatternRecipe(brandbook, "mixed", "balanced", "dark"),     // Dark mode — digital, events
    buildPatternRecipe(brandbook, "minimal", "sparse", "neutral"),  // Subtle — watermark, backgrounds
    buildPatternRecipe(brandbook, "organic", "dense", "accent"),    // Bold — wrapping paper, wallpaper
    buildPatternRecipe(brandbook, "geometric", "balanced", "light"),// Structured — tech, corporate
    buildPatternRecipe(brandbook, "textural", "balanced", "neutral"),// Tactile — premium, physical
  ];
}
