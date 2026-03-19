/**
 * Brand Style Anchor — ensures visual coherence across ALL generated assets.
 *
 * Problem: Each image is generated independently, leading to inconsistent styles.
 * Solution: Compute a deterministic "style DNA" from the brandbook that gets injected
 * into every prompt, plus use previously generated images as references.
 */

import type { BrandbookData, GeneratedAsset } from "./types";
import { fnv1a32 } from "./common";

export interface StyleAnchor {
  /** Deterministic style fingerprint for this brand */
  styleFingerprint: string;
  /** Core style rules that must be consistent across all assets */
  consistencyRules: string;
  /** Color usage instructions */
  colorProtocol: string;
  /** Typography style for any text that appears */
  typographyProtocol: string;
  /** Visual language summary */
  visualDNA: string;
  /** Reference asset keys to use as style anchors */
  referenceAssets: string[];
}

/**
 * Compute a deterministic style fingerprint from the brandbook.
 * Same brandbook always produces the same fingerprint.
 */
function computeStyleFingerprint(data: BrandbookData): string {
  const components = [
    data.brandName,
    data.industry,
    data.colors.primary.map((c) => c.hex).join(","),
    data.colors.secondary.map((c) => c.hex).join(","),
    data.typography?.marketing?.name ?? data.typography?.primary?.name ?? "",
    data.typography?.ui?.name ?? data.typography?.secondary?.name ?? "",
    data.brandConcept.brandArchetype ?? "",
    data.brandConcept.toneOfVoice,
    data.keyVisual?.photographyStyle ?? "",
    data.imageGenerationBriefing?.visualStyle ?? "",
  ].join("|");

  const hash = fnv1a32(components);
  return `BRAND_STYLE_${hash.toString(16).padStart(8, "0").toUpperCase()}`;
}

/**
 * Build the core consistency rules that MUST be applied to every single asset.
 */
function buildConsistencyRules(data: BrandbookData): string {
  const rules: string[] = [];

  // 1. Color hierarchy — most critical for coherence
  const primary = data.colors.primary[0];
  const secondary = data.colors.primary[1] ?? data.colors.secondary[0];
  if (primary) {
    rules.push(`PRIMARY_COLOR_DOMINANT: ${primary.name} (${primary.hex}) must be the recognizable color anchor in every asset. It appears as the dominant hue in backgrounds, accents, or key elements.`);
  }
  if (secondary) {
    rules.push(`SECONDARY_COLOR_SUPPORT: ${secondary.name} (${secondary.hex}) provides contrast and depth. Used for secondary elements, highlights, or supporting graphics.`);
  }

  // 2. Typography feel (even when no text is shown)
  const displayFont = data.typography?.marketing?.name ?? data.typography?.primary?.name;
  if (displayFont) {
    rules.push(`TYPOGRAPHY_CHARACTER: Even in images without text, the visual weight and rhythm should echo ${displayFont} — ${displayFont.includes("serif") ? "refined, editorial, authoritative" : "clean, modern, precise"}.`);
  }

  // 3. Photography/illustration style lock
  const photoStyle = data.imageGenerationBriefing?.photographyMood ?? data.keyVisual?.photographyStyle;
  if (photoStyle) {
    rules.push(`PHOTOGRAPHY_LOCK: All photographic elements must follow: ${photoStyle}. Do not deviate to a different photographic style.`);
  }

  // 4. Composition philosophy lock
  if (data.keyVisual?.compositionPhilosophy) {
    rules.push(`COMPOSITION_LOCK: ${data.keyVisual.compositionPhilosophy}. This composition approach must be consistent across all assets.`);
  }

  // 5. Texture/material language
  const textureLanguage = (data.imageGenerationBriefing as Record<string, unknown> | undefined)?.textureLanguage as string | undefined;
  if (textureLanguage) {
    rules.push(`MATERIAL_LANGUAGE_LOCK: ${textureLanguage}. These materials and textures define the tactile identity of the brand.`);
  }

  // 6. Lighting signature
  const lightingSignature = (data.imageGenerationBriefing as Record<string, unknown> | undefined)?.lightingSignature as string | undefined;
  if (lightingSignature) {
    rules.push(`LIGHTING_SIGNATURE: ${lightingSignature}. Consistent lighting across all assets creates immediate visual recognition.`);
  }

  // 7. Pattern/motif coherence
  const patternStyle = data.imageGenerationBriefing?.patternStyle;
  if (patternStyle) {
    rules.push(`PATTERN_SYSTEM: ${patternStyle}. When patterns appear in any asset, they must derive from this same system.`);
  }

  // 8. Avoid list — what NEVER appears
  const avoidElements = data.imageGenerationBriefing?.avoidElements;
  if (avoidElements) {
    rules.push(`ABSOLUTE_AVOID: ${avoidElements}. These elements are banned across all assets.`);
  }

  return rules.join("\n");
}

/**
 * Build color protocol — exact instructions for how colors should be used.
 */
function buildColorProtocol(data: BrandbookData): string {
  const primary = data.colors.primary;
  const secondary = data.colors.secondary;

  const parts: string[] = [
    "COLOR PROTOCOL (apply to every asset):",
    `Primary palette: ${primary.map((c) => `${c.name} ${c.hex}`).join(" | ")}`,
    `Secondary palette: ${secondary.map((c) => `${c.name} ${c.hex}`).join(" | ")}`,
  ];

  // Color proportions
  if (primary.length >= 2) {
    parts.push(`Color ratio: ~60% ${primary[0].name}, ~25% ${primary[1]?.name ?? secondary[0]?.name ?? "neutral"}, ~15% accent/highlight.`);
  }

  // Semantic colors
  if (data.colors.semantic) {
    parts.push(`Semantic: success=${data.colors.semantic.success.hex}, error=${data.colors.semantic.error.hex}, warning=${data.colors.semantic.warning.hex}, info=${data.colors.semantic.info.hex}.`);
  }

  return parts.join("\n");
}

/**
 * Determine which already-generated assets should be used as style references.
 * Priority: logo > pattern > hero > mascot.
 */
function pickReferenceAssets(existingAssets: Record<string, GeneratedAsset>): string[] {
  const priority = [
    "logo_primary",
    "brand_pattern",
    "hero_visual",
    "brand_mascot",
    "hero_lifestyle",
    "business_card",
    "brand_collateral",
  ];

  const refs: string[] = [];
  for (const key of priority) {
    if (existingAssets[key]?.url) {
      refs.push(key);
      if (refs.length >= 3) break; // Max 3 reference images
    }
  }
  return refs;
}

/**
 * Build a compact visual DNA string that summarizes the brand's visual identity.
 */
function buildVisualDNA(data: BrandbookData): string {
  const parts: string[] = [];

  // Archetype-driven visual direction
  const archetype = data.brandConcept.brandArchetype;
  if (archetype) {
    parts.push(`ARCHETYPE: ${archetype}`);
  }

  // Core visual elements
  const elements = data.keyVisual?.elements?.slice(0, 5);
  if (elements?.length) {
    parts.push(`VISUAL_ELEMENTS: ${elements.join(", ")}`);
  }

  // Flora/Fauna/Objects — brand-specific imagery
  const flora = data.keyVisual?.flora?.slice(0, 3);
  const fauna = data.keyVisual?.fauna?.slice(0, 3);
  const objects = data.keyVisual?.objects?.slice(0, 3);
  const natureElements = [
    ...(flora ?? []).map((f) => `🌿${f}`),
    ...(fauna ?? []).map((f) => `🐾${f}`),
    ...(objects ?? []).map((o) => `📦${o}`),
  ];
  if (natureElements.length > 0) {
    parts.push(`IDENTITY_ASSETS: ${natureElements.join(", ")}`);
  }

  // Mascot
  const mascot = data.keyVisual?.mascots?.[0];
  if (mascot) {
    parts.push(`MASCOT: ${mascot.name} — ${mascot.description}`);
  }

  // Logo symbol
  if (data.logo?.symbol) {
    parts.push(`SYMBOL_ROOT: ${data.logo.symbol}`);
  }

  return parts.join(" | ");
}

/**
 * Build a complete StyleAnchor for a brandbook.
 * This should be injected into every image generation prompt.
 */
export function buildStyleAnchor(
  data: BrandbookData,
  existingAssets: Record<string, GeneratedAsset> = {}
): StyleAnchor {
  return {
    styleFingerprint: computeStyleFingerprint(data),
    consistencyRules: buildConsistencyRules(data),
    colorProtocol: buildColorProtocol(data),
    typographyProtocol: buildTypographyProtocol(data),
    visualDNA: buildVisualDNA(data),
    referenceAssets: pickReferenceAssets(existingAssets),
  };
}

function buildTypographyProtocol(data: BrandbookData): string {
  const display = data.typography?.marketing ?? data.typography?.primary;
  const body = data.typography?.ui ?? data.typography?.secondary;

  const parts = ["TYPOGRAPHY PROTOCOL:"];
  if (display) {
    parts.push(`Display: ${display.name} (${display.weights?.join(", ") ?? "Regular"}). ${display.category ?? ""}`);
  }
  if (body && body.name !== display?.name) {
    parts.push(`Body: ${body.name} (${body.weights?.join(", ") ?? "Regular"}). ${body.category ?? ""}`);
  }
  if (display && body) {
    parts.push(`Pairing rationale: contrast between ${display.name} (expressive) and ${body.name} (readable).`);
  }
  return parts.join("\n");
}

/**
 * Format the style anchor as a block to inject into image prompts.
 */
export function formatStyleAnchorForPrompt(anchor: StyleAnchor): string {
  return [
    `\n═══ BRAND STYLE ANCHOR: ${anchor.styleFingerprint} ═══`,
    "",
    "CRITICAL: All assets for this brand MUST share the same visual DNA.",
    "Deviation from these rules breaks brand coherence.",
    "",
    anchor.consistencyRules,
    "",
    anchor.colorProtocol,
    "",
    anchor.typographyProtocol,
    "",
    `VISUAL DNA: ${anchor.visualDNA}`,
    "",
    anchor.referenceAssets.length > 0
      ? `STYLE REFERENCE ASSETS: Use ${anchor.referenceAssets.join(", ")} as visual coherence anchors. Match their style, lighting, and color treatment.`
      : "No reference assets yet — establish the visual direction with this first asset.",
    "",
    `═══ END STYLE ANCHOR ═══`,
  ].join("\n");
}
