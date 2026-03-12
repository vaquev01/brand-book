/**
 * Icon Bank Service — fetches professional icons from Iconify API
 *
 * Uses Iconify's free API (200k+ icons, no API key needed) to get
 * high-quality SVG icons and customize them for the brand palette.
 *
 * Preferred icon sets (in order of quality for brand use):
 * 1. lucide — clean, consistent, modern line icons
 * 2. ph (Phosphor) — versatile, 6 weights, very complete
 * 3. tabler — 4000+ stroke icons, consistent style
 * 4. solar — modern, detailed, great for apps
 * 5. mdi — Material Design, huge catalog
 */

const ICONIFY_API = "https://api.iconify.design";

/** Preferred icon sets ordered by brand-suitability */
const PREFERRED_SETS = ["lucide", "ph", "tabler", "solar", "mdi"];

/** Search for icons matching a keyword, returns icon identifiers */
export async function searchIcons(
  query: string,
  limit = 8
): Promise<Array<{ prefix: string; name: string; id: string }>> {
  const url = `${ICONIFY_API}/search?query=${encodeURIComponent(query)}&limit=${limit}&prefixes=${PREFERRED_SETS.join(",")}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = (await res.json()) as { icons?: string[] };
  if (!data.icons) return [];
  return data.icons.map((id) => {
    const [prefix, ...rest] = id.split(":");
    return { prefix, name: rest.join(":"), id };
  });
}

/** Fetch the SVG content for a specific icon */
export async function fetchIconSvg(
  prefix: string,
  name: string,
  options?: { color?: string; size?: number }
): Promise<string | null> {
  const params = new URLSearchParams();
  if (options?.color) params.set("color", options.color);
  if (options?.size) {
    params.set("width", String(options.size));
    params.set("height", String(options.size));
  }
  const qs = params.toString() ? `?${params.toString()}` : "";
  const url = `${ICONIFY_API}/${prefix}/${name}.svg${qs}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.text();
}

/**
 * Concept-to-search-term mapping for brand icon generation.
 * Maps abstract brand concepts to concrete icon search terms.
 */
const CONCEPT_SEARCH_MAP: Record<string, string[]> = {
  // Industry concepts
  "café": ["coffee", "cup", "bean", "steam"],
  "coffee": ["coffee", "cup", "bean", "steam"],
  "restaurante": ["restaurant", "chef", "utensils", "plate"],
  "food": ["food", "chef", "cooking", "kitchen"],
  "moda": ["shirt", "hanger", "scissors", "fabric"],
  "fashion": ["shirt", "hanger", "scissors", "fabric"],
  "tech": ["code", "monitor", "cpu", "circuit"],
  "tecnologia": ["code", "monitor", "cpu", "circuit"],
  "saas": ["cloud", "server", "database", "api"],
  "startup": ["rocket", "lightbulb", "chart", "target"],
  "fitness": ["dumbbell", "heart-pulse", "timer", "medal"],
  "beleza": ["sparkle", "flower", "droplet", "palette"],
  "beauty": ["sparkle", "flower", "droplet", "palette"],
  "música": ["music", "headphones", "mic", "disc"],
  "music": ["music", "headphones", "mic", "disc"],
  "viagem": ["plane", "map", "compass", "globe"],
  "travel": ["plane", "map", "compass", "globe"],
  "educação": ["book", "graduation", "brain", "pen"],
  "saúde": ["heart", "shield", "leaf", "stethoscope"],
  "health": ["heart", "shield", "leaf", "stethoscope"],
  "finanças": ["wallet", "chart", "coins", "trending-up"],
  "finance": ["wallet", "chart", "coins", "trending-up"],
  "imobiliário": ["building", "home", "key", "blueprint"],
  "pet": ["paw", "bone", "heart", "star"],
  "ecommerce": ["shopping-bag", "tag", "box", "truck"],

  // Abstract brand concepts → concrete icon terms
  "inovação": ["lightbulb", "rocket", "sparkles", "zap"],
  "qualidade": ["award", "shield-check", "star", "gem"],
  "confiança": ["shield", "lock", "check-circle", "handshake"],
  "sustentabilidade": ["leaf", "recycle", "globe", "sprout"],
  "elegância": ["diamond", "crown", "feather", "sparkle"],
  "tradição": ["landmark", "book", "clock", "scroll"],
  "ousadia": ["flame", "bolt", "sword", "mountain"],
  "comunidade": ["users", "heart-handshake", "link", "network"],
  "criatividade": ["palette", "brush", "wand", "layers"],
  "velocidade": ["zap", "timer", "gauge", "arrow-right"],
  "segurança": ["shield", "lock", "eye", "fingerprint"],
  "natureza": ["tree", "sun", "mountain", "waves"],
  "luxo": ["gem", "crown", "star", "sparkles"],
  "tecnológico": ["cpu", "circuit", "binary", "satellite"],
  "acolhedor": ["heart", "home", "sun", "smile"],
  "profissional": ["briefcase", "award", "target", "chart"],
  "autêntico": ["fingerprint", "stamp", "badge", "check"],
  "moderno": ["smartphone", "globe", "wifi", "layers"],
};

/** Universal fallback searches for any brand */
const UNIVERSAL_SEARCHES = [
  "star", "heart", "arrow-right", "check", "sparkle",
  "shield", "award", "bookmark", "globe", "flag",
  "crown", "gem", "zap", "target", "eye",
];

/**
 * Given brand concepts (values, personality, industry), returns search terms
 * that will yield relevant, high-quality icons.
 */
export function mapBrandConceptsToSearchTerms(concepts: {
  values?: string[];
  personality?: string[];
  industry?: string;
  keywords?: string[];
}): string[] {
  const terms = new Set<string>();

  const allConcepts = [
    ...(concepts.values ?? []),
    ...(concepts.personality ?? []),
    ...(concepts.keywords ?? []),
    concepts.industry ?? "",
  ]
    .map((c) => c.toLowerCase().trim())
    .filter(Boolean);

  for (const concept of allConcepts) {
    // Check exact matches
    if (CONCEPT_SEARCH_MAP[concept]) {
      for (const term of CONCEPT_SEARCH_MAP[concept]) terms.add(term);
      continue;
    }
    // Check partial matches
    for (const [key, searchTerms] of Object.entries(CONCEPT_SEARCH_MAP)) {
      if (concept.includes(key) || key.includes(concept)) {
        for (const term of searchTerms.slice(0, 2)) terms.add(term);
      }
    }
    // If no map match, use the concept itself as search term
    if (![...terms].length) terms.add(concept);
  }

  // Ensure we have enough terms
  if (terms.size < 8) {
    for (const fallback of UNIVERSAL_SEARCHES) {
      terms.add(fallback);
      if (terms.size >= 16) break;
    }
  }

  return [...terms].slice(0, 20);
}

export interface BrandIcon {
  name: string;
  svg: string;
  source: string; // e.g. "lucide:coffee"
  searchTerm: string;
}

/**
 * Fetch a complete set of brand-appropriate icons.
 * Returns 16 high-quality SVG icons customized with brand color.
 */
export async function fetchBrandIcons(params: {
  values?: string[];
  personality?: string[];
  industry?: string;
  keywords?: string[];
  color?: string;
  size?: number;
}): Promise<BrandIcon[]> {
  const searchTerms = mapBrandConceptsToSearchTerms(params);
  const icons: BrandIcon[] = [];
  const usedNames = new Set<string>();

  for (const term of searchTerms) {
    if (icons.length >= 16) break;

    const results = await searchIcons(term, 4);
    for (const result of results) {
      if (icons.length >= 16) break;
      if (usedNames.has(result.name)) continue;

      const svg = await fetchIconSvg(result.prefix, result.name, {
        color: params.color,
        size: params.size ?? 24,
      });

      if (svg) {
        usedNames.add(result.name);
        icons.push({
          name: result.name,
          svg,
          source: result.id,
          searchTerm: term,
        });
      }
    }
  }

  return icons;
}
