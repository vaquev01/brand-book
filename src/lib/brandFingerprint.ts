import type { BrandbookData, GeneratedAsset } from "./types";

/**
 * Extracts the "visual essence" of a brand — the core properties that affect
 * how generated images should look. When any of these change, existing assets
 * become stale and should be regenerated.
 */
function extractVisualEssence(data: BrandbookData): string {
  const parts: string[] = [];

  // Brand name
  parts.push(data.brandName);

  // Colors (hex values only — the most impactful visual property)
  const primaryHexes = data.colors.primary.map((c) => c.hex).sort().join(",");
  const secondaryHexes = data.colors.secondary.map((c) => c.hex).sort().join(",");
  parts.push(`P:${primaryHexes}`);
  parts.push(`S:${secondaryHexes}`);

  // Logo description (symbol + primary describe the logo identity)
  if (data.logo?.symbol) parts.push(`LS:${data.logo.symbol.slice(0, 80)}`);
  if (data.logo?.primary) parts.push(`LP:${data.logo.primary.slice(0, 80)}`);

  // Key visual style
  if (data.keyVisual?.photographyStyle) parts.push(`KV:${data.keyVisual.photographyStyle.slice(0, 80)}`);

  // Typography names (affect visual identity)
  const typo = data.typography;
  if (typo?.primary?.name) parts.push(`TF:${typo.primary.name}`);
  if (typo?.secondary?.name) parts.push(`TF2:${typo.secondary.name}`);

  return parts.join("|");
}

/**
 * Simple hash of a string — fast, deterministic, collision-resistant enough
 * for fingerprinting (not crypto).
 */
function simpleHash(str: string): string {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return (h >>> 0).toString(36);
}

/**
 * Compute the brand fingerprint — a short hash representing the current
 * visual essence of the brand.
 */
export function computeBrandFingerprint(data: BrandbookData): string {
  return simpleHash(extractVisualEssence(data));
}

/**
 * Check how many generated assets are stale (generated with a different
 * brand fingerprint than the current one).
 */
export function countStaleAssets(
  assets: Record<string, GeneratedAsset>,
  currentFingerprint: string
): number {
  let count = 0;
  for (const asset of Object.values(assets)) {
    if (asset.brandFingerprint && asset.brandFingerprint !== currentFingerprint) {
      count++;
    }
  }
  return count;
}

/**
 * Get the keys of stale assets.
 */
export function getStaleAssetKeys(
  assets: Record<string, GeneratedAsset>,
  currentFingerprint: string
): string[] {
  return Object.values(assets)
    .filter((a) => a.brandFingerprint && a.brandFingerprint !== currentFingerprint)
    .map((a) => a.key);
}
