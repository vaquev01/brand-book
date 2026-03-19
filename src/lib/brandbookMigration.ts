import type { BrandbookData } from "./types";
import { AssetKeySchema, type AssetKey } from "./brandbookSchema";

export const LATEST_SCHEMA_VERSION = "2.0";

const LEGACY_ASSET_KEY_MAP: Record<string, AssetKey> = {
  social_story: "instagram_story",
};

const KEYWORD_MAP: [string[], AssetKey][] = [
  [["cartão", "cartao", "card", "visita", "business"], "business_card"],
  [["app", "mobile", "interface", "tela", "dashboard"], "app_mockup"],
  [["outdoor", "billboard", "fachada", "placa", "ooh"], "outdoor_billboard"],
  [["instagram", "social", "post", "feed"], "social_post_square"],
  [["capa", "cover", "linkedin", "youtube"], "social_cover"],
  [["email", "newsletter", "e-mail", "mail"], "email_header"],
  [["papelaria", "kit", "folder", "brochure", "menu", "cardápio", "cardapio", "coaster", "bolacha"], "brand_collateral"],
  [["hero", "banner", "landing", "site", "web"], "hero_visual"],
  [["pattern", "padrão", "padrao", "textura", "texture", "estampa"], "brand_pattern"],
  [["logo", "logotipo", "marca", "símbolo", "simbolo"], "logo_primary"],
];

function inferAssetKeyFromText(text: string): AssetKey | undefined {
  const lc = text.toLowerCase();
  for (const [keywords, key] of KEYWORD_MAP) {
    if (keywords.some((k) => lc.includes(k))) return key;
  }
  return undefined;
}

function normalizeLegacyAssetKey(imageKey?: string): string | undefined {
  if (!imageKey) return undefined;
  return LEGACY_ASSET_KEY_MAP[imageKey] ?? imageKey;
}

export function migrateBrandbook(raw: unknown): BrandbookData {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("JSON inválido: esperado um objeto.");
  }

  const data = raw as BrandbookData;

  if (!data.schemaVersion) data.schemaVersion = LATEST_SCHEMA_VERSION;

  // Migrate old brandbooks that stored symbol concept in clearSpace
  if (data.logo && typeof data.logo === "object") {
    const logo = data.logo as unknown as Record<string, unknown>;
    if (!logo.symbolConcept && logo.clearSpace && typeof logo.clearSpace === "string") {
      // Old brandbooks stored the concept in clearSpace
      // Extract it if it looks like a concept (longer than spacing rules)
      if (logo.clearSpace.length > 100) {
        logo.symbolConcept = logo.clearSpace;
        logo.clearSpace = "Area minima de protecao igual a 1x a altura do mark em todos os lados.";
      }
    }
  }

  if (Array.isArray(data.applications)) {
    data.applications = data.applications.map((app) => {
      const normalizedImageKey = normalizeLegacyAssetKey(app.imageKey);
      if (normalizedImageKey) {
        return {
          ...app,
          imageKey: normalizedImageKey,
        };
      }
      const inferred = inferAssetKeyFromText(app.type);
      return {
        ...app,
        imageKey: inferred && AssetKeySchema.safeParse(inferred).success ? inferred : undefined,
      };
    });
  }

  return data;
}
