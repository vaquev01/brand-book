export interface BrandNameFidelity {
  canonicalName: string;
  structuralCharacters: string[];
  prohibitedVariants: string[];
}

const ACCENT_DRIFT_MAP: Record<string, string[]> = {
  a: ["á", "à", "â", "ã", "ä"],
  c: ["ç"],
  e: ["é", "è", "ê", "ë"],
  i: ["í", "ì", "î", "ï"],
  n: ["ñ"],
  o: ["ó", "ò", "ô", "õ", "ö"],
  u: ["ú", "ù", "û", "ü"],
  y: ["ý", "ÿ"],
};

const MAX_ACCENT_DRIFT_VARIANTS = 16;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeVariantKey(value: string): string {
  return normalizeWhitespace(stripDiacritics(value).toLowerCase())
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pushIfUseful(target: Set<string>, candidate: string, canonicalName: string) {
  const normalizedCandidate = normalizeWhitespace(candidate);
  if (!normalizedCandidate) return;
  if (normalizedCandidate === canonicalName) return;
  if (normalizeVariantKey(normalizedCandidate) === normalizeVariantKey(canonicalName)) {
    target.add(normalizedCandidate);
    return;
  }
  target.add(normalizedCandidate);
}

function extractIncorrectNameVariants(incorrectUsages: string[], canonicalName: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /n[ãa]o\s+[ée]\s+["“”']?([^,.;]+?)["“”']?(?:\s*,\s*[ée]\s+|\.|;|$)/iu,
    /nunca\s+chamar\s+de\s+["“”']?([^,.;]+?)["“”']?(?:\.|;|,|$)/iu,
    /nunca\s+escrever\s+["“”']?([^,.;]+?)["“”']?(?:\.|;|,|$)/iu,
  ];

  for (const usage of incorrectUsages) {
    const normalizedUsage = normalizeWhitespace(usage);
    for (const pattern of patterns) {
      const match = normalizedUsage.match(pattern);
      const candidate = match?.[1]?.trim();
      if (!candidate) continue;
      if (normalizeVariantKey(candidate) === normalizeVariantKey(canonicalName)) continue;
      pushIfUseful(found, candidate, canonicalName);
    }
  }

  return [...found];
}

function addAccentDriftVariants(found: Set<string>, baseValue: string, canonicalName: string) {
  let accentDriftCount = 0;
  for (let index = 0; index < baseValue.length; index += 1) {
    const sourceChar = baseValue[index];
    const replacements = ACCENT_DRIFT_MAP[sourceChar.toLowerCase()];
    if (!replacements) continue;
    for (const replacement of replacements) {
      if (accentDriftCount >= MAX_ACCENT_DRIFT_VARIANTS) break;
      const drifted = `${baseValue.slice(0, index)}${sourceChar === sourceChar.toUpperCase() ? replacement.toUpperCase() : replacement}${baseValue.slice(index + 1)}`;
      pushIfUseful(found, drifted, canonicalName);
      accentDriftCount += 1;
    }
    if (accentDriftCount >= MAX_ACCENT_DRIFT_VARIANTS) break;
  }
}

function generateDefaultForbiddenVariants(canonicalName: string): string[] {
  const found = new Set<string>();
  const noPunctuation = normalizeWhitespace(canonicalName.replace(/[^\p{L}\p{N}\s]/gu, ""));
  const noDiacritics = normalizeWhitespace(stripDiacritics(canonicalName));
  const noDiacriticsOrPunctuation = normalizeWhitespace(stripDiacritics(canonicalName).replace(/[^\p{L}\p{N}\s]/gu, ""));

  pushIfUseful(found, noPunctuation, canonicalName);
  pushIfUseful(found, noDiacritics, canonicalName);
  pushIfUseful(found, noDiacriticsOrPunctuation, canonicalName);

  const plain = stripDiacritics(canonicalName);
  addAccentDriftVariants(found, plain, canonicalName);
  if (noDiacriticsOrPunctuation && noDiacriticsOrPunctuation !== plain) {
    addAccentDriftVariants(found, noDiacriticsOrPunctuation, canonicalName);
  }

  return [...found];
}

export function getBrandNameFidelity(brandName: string, incorrectUsages: string[] = []): BrandNameFidelity {
  const canonicalName = normalizeWhitespace(brandName);
  const structuralCharacters = [...new Set(canonicalName.match(/[^\p{L}\p{N}\s]/gu) ?? [])];
  const prohibitedVariants = [
    ...extractIncorrectNameVariants(incorrectUsages, canonicalName),
    ...generateDefaultForbiddenVariants(canonicalName),
  ].filter((variant, index, list) => list.indexOf(variant) === index);

  return {
    canonicalName,
    structuralCharacters,
    prohibitedVariants,
  };
}

export function buildBrandNameFidelityLines(
  brandName: string,
  incorrectUsages: string[] = [],
  context: "logo" | "brand_visible" = "logo"
): string[] {
  const fidelity = getBrandNameFidelity(brandName, incorrectUsages);
  const lines = [
    `CANONICAL_BRAND_NAME: ${fidelity.canonicalName}.`,
    context === "logo"
      ? `EXACT_BRAND_TEXT: The wordmark must render exactly "${fidelity.canonicalName}" with identical spelling, spacing, capitalization, punctuation, and diacritics.`
      : `EXACT_BRAND_TEXT: Any readable brand text or logo text must match "${fidelity.canonicalName}" exactly whenever the brand name appears.`,
    fidelity.structuralCharacters.length > 0
      ? `STRUCTURAL_CHARACTERS: ${fidelity.structuralCharacters.join(" ")} are structural parts of the canonical brand name and must not be removed, substituted, added, or transformed into different characters.`
      : "",
    "NAME_FIDELITY_RULES: Never misspell, autocorrect, translate, localize, phoneticize, sanitize, simplify, or reinterpret the brand name. Never add diacritics that are not present in the canonical name. Never remove diacritics or punctuation that are present in the canonical name.",
    fidelity.prohibitedVariants.length > 0
      ? `FORBIDDEN_NAME_VARIANTS: ${fidelity.prohibitedVariants.slice(0, 16).map((variant) => `"${variant}"`).join(", ")}.`
      : "",
  ];

  return lines.filter(Boolean);
}

export function buildBrandNameFidelityBlock(
  brandName: string,
  incorrectUsages: string[] = [],
  context: "logo" | "brand_visible" = "logo"
): string {
  return buildBrandNameFidelityLines(brandName, incorrectUsages, context).join(" ");
}

export function buildBrandNameFidelityNegativeTerms(brandName: string, incorrectUsages: string[] = []): string[] {
  const fidelity = getBrandNameFidelity(brandName, incorrectUsages);
  return [
    "misspelled brand name",
    "wrong wordmark text",
    "accent drift",
    "punctuation drift",
    ...fidelity.prohibitedVariants,
  ].filter((term, index, list) => list.indexOf(term) === index);
}
