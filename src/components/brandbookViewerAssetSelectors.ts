import type { Application, BrandbookData, GeneratedAsset, UploadedAsset } from "@/lib/types";

export type AssetLookup = (key: string) => string | null;

export type AvailableAsset = {
  label: string;
  url: string;
};

export type AssetCatalogItem = {
  key: string;
  label: string;
};

export type CoverVisualCard = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
};

export type CoverVisualSummary = {
  hero: CoverVisualCard | null;
  cards: CoverVisualCard[];
};

function compactText(value: string | null | undefined, max = 110): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function firstText(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const next = compactText(value);
    if (next) return next;
  }
  return "";
}

function coverProfile(industry: string): "food" | "retail" | "digital" | "service" {
  const normalized = industry.toLowerCase();
  if (/restauran|food|gastro|caf|coffee|bar|sushi|pizza|chef|culin|bistr|boteco|empório/.test(normalized)) {
    return "food";
  }
  if (/saas|software|tech|cloud|ai|data|platform|digital|startup|api|b2b/.test(normalized)) {
    return "digital";
  }
  if (/fashion|moda|beauty|cosmetic|luxury|luxo|retail|loja|shop|market|varejo|ecommerc|lifestyle/.test(normalized)) {
    return "retail";
  }
  return "service";
}

function pickUniqueUrl(used: Set<string>, candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    if (!candidate || used.has(candidate)) continue;
    used.add(candidate);
    return candidate;
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    used.add(candidate);
    return candidate;
  }

  return null;
}

function pickApplicationPlaceholder(
  applications: Application[],
  imageKeys: string[] = [],
  typeMatch?: RegExp
): string | null {
  for (const key of imageKeys) {
    const match = applications.find((application) => application.imageKey === key && application.imagePlaceholder);
    if (match?.imagePlaceholder) return match.imagePlaceholder;
  }

  if (typeMatch) {
    const match = applications.find((application) =>
      typeMatch.test(
        `${application.type} ${application.description} ${application.artDirection ?? ""} ${application.layoutGuidelines ?? ""}`
      )
    );
    if (match?.imagePlaceholder) return match.imagePlaceholder;
  }

  return applications.find((application) => application.imagePlaceholder)?.imagePlaceholder ?? null;
}

function buildCoverCard({
  applications,
  data,
  getAssetUrl,
  id,
  imageKeys,
  title,
  subtitle,
  typeMatch,
  uploadedAssets,
  uploadedTypes = [],
  used,
}: {
  applications: Application[];
  data: BrandbookData;
  getAssetUrl: AssetLookup;
  id: string;
  imageKeys: string[];
  title: string;
  subtitle: string;
  typeMatch?: RegExp;
  uploadedAssets: UploadedAsset[];
  uploadedTypes?: UploadedAsset["type"][];
  used: Set<string>;
}): CoverVisualCard {
  const uploaded = uploadedTypes.length > 0
    ? uploadedAssets.find((asset) => uploadedTypes.includes(asset.type))?.dataUrl ?? null
    : null;

  return {
    id,
    title,
    subtitle: firstText(subtitle, data.verbalIdentity?.oneLiner, data.positioning?.positioningStatement, data.brandConcept?.mission),
    imageUrl: pickUniqueUrl(used, [
      ...imageKeys.map((key) => getAssetUrl(key)),
      pickApplicationPlaceholder(applications, imageKeys, typeMatch),
      uploaded,
    ]),
  };
}

export function buildCoverVisualSummary({
  data,
  generatedAssets,
  generatedImages,
  uploadedAssets,
}: {
  data: BrandbookData;
  generatedAssets: Record<string, GeneratedAsset>;
  generatedImages: Record<string, string>;
  uploadedAssets: UploadedAsset[];
}): CoverVisualSummary {
  const getAssetUrl = createAssetLookup(generatedAssets, generatedImages);
  const applications = data.applications ?? [];
  const used = new Set<string>();
  const profile = coverProfile(data.industry);
  const materialText = firstText(
    applications.find((application) => application.materialSpecs)?.materialSpecs,
    applications.find((application) => application.substrates?.length)?.substrates?.slice(0, 3).join(" · "),
    data.keyVisual.objects?.slice(0, 3).join(" · "),
    data.keyVisual.flora?.slice(0, 3).join(" · ")
  );
  const systemText = firstText(
    data.keyVisual.structuredPatterns?.[0]?.name,
    data.keyVisual.patterns?.[0],
    data.keyVisual.symbols?.[0],
    data.keyVisual.elements?.[0],
    data.keyVisual.iconography
  );
  const contextText = firstText(
    applications[0]?.description,
    data.brandStory?.brandPromise,
    data.positioning?.positioningStatement,
    data.verbalIdentity?.messagingPillars?.[0]?.description
  );
  const productText = firstText(
    data.verbalIdentity?.messagingPillars?.[1]?.description,
    applications.find((application) => /produto|product|drink|prato|porção|menu|cardápio|dashboard|landing|hero|service|experi/.test(`${application.type} ${application.description}`.toLowerCase()))?.description,
    data.keyVisual.marketingArchitecture,
    data.keyVisual.photographyStyle
  );

  if (profile === "food") {
    return {
      hero: buildCoverCard({
        applications,
        data,
        getAssetUrl,
        id: "hero",
        imageKeys: ["hero_lifestyle", "hero_visual", "social_post_square", "delivery_packaging", "food_container"],
        title: "Produto & atmosfera",
        subtitle: firstText(productText, contextText),
        typeMatch: /instagram|feed|story|delivery|cardápio|drink|prato|porção|lanches|ambiente|fachada/i,
        uploadedAssets,
        uploadedTypes: ["reference"],
        used,
      }),
      cards: [
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "usage",
          imageKeys: ["social_post_square", "instagram_story", "hero_lifestyle", "outdoor_billboard"],
          title: "Situação de uso",
          subtitle: contextText,
          typeMatch: /instagram|feed|story|clientes|nosso bar|ambiente|fachada/i,
          uploadedAssets,
          uploadedTypes: ["reference"],
          used,
        }),
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "material",
          imageKeys: ["materials_board", "brand_collateral", "delivery_packaging", "takeaway_bag"],
          title: "Materialidade",
          subtitle: materialText,
          typeMatch: /delivery|embalagem|sacola|cardápio|uniforme|material/i,
          uploadedAssets,
          uploadedTypes: ["pattern", "reference"],
          used,
        }),
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "system",
          imageKeys: ["brand_pattern", "brand_mascot", "logo_primary"],
          title: "Elemento visual",
          subtitle: systemText,
          typeMatch: /destaques|highlights|social|fachada/i,
          uploadedAssets,
          uploadedTypes: ["pattern", "element", "mascot"],
          used,
        }),
      ],
    };
  }

  if (profile === "digital") {
    return {
      hero: buildCoverCard({
        applications,
        data,
        getAssetUrl,
        id: "hero",
        imageKeys: ["app_mockup", "hero_visual", "presentation_bg", "social_cover"],
        title: "Produto em uso",
        subtitle: firstText(productText, data.brandConcept.uniqueValueProposition),
        typeMatch: /dashboard|app|hero|landing|modal|interface|produto/i,
        uploadedAssets,
        uploadedTypes: ["reference"],
        used,
      }),
      cards: [
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "benefit",
          imageKeys: ["hero_lifestyle", "social_cover", "presentation_bg"],
          title: "Situação de uso",
          subtitle: contextText,
          typeMatch: /hero|landing|workflow|dashboard|usuário|equipe/i,
          uploadedAssets,
          uploadedTypes: ["reference"],
          used,
        }),
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "system",
          imageKeys: ["presentation_bg", "brand_pattern", "app_mockup"],
          title: "Sistema visual",
          subtitle: systemText,
          typeMatch: /modal|component|dashboard|hero|empty state/i,
          uploadedAssets,
          uploadedTypes: ["pattern", "element"],
          used,
        }),
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "color",
          imageKeys: ["presentation_bg", "materials_board", "social_cover"],
          title: "Cor & ritmo",
          subtitle: firstText(data.colors.primary?.[0]?.name, data.colors.secondary?.[0]?.name, systemText),
          typeMatch: /hero|landing|cover|brand/i,
          uploadedAssets,
          uploadedTypes: ["pattern", "reference"],
          used,
        }),
      ],
    };
  }

  if (profile === "retail") {
    return {
      hero: buildCoverCard({
        applications,
        data,
        getAssetUrl,
        id: "hero",
        imageKeys: ["hero_visual", "brand_collateral", "social_post_square", "business_card"],
        title: "Produto & desejo",
        subtitle: firstText(productText, data.brandConcept.uniqueValueProposition),
        typeMatch: /produto|coleção|feed|social|packaging|embalagem|vitrine/i,
        uploadedAssets,
        uploadedTypes: ["reference"],
        used,
      }),
      cards: [
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "styling",
          imageKeys: ["hero_lifestyle", "social_post_square", "instagram_story"],
          title: "Situação de uso",
          subtitle: contextText,
          typeMatch: /feed|story|social|campanha|vitrine|coleção/i,
          uploadedAssets,
          uploadedTypes: ["reference"],
          used,
        }),
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "material",
          imageKeys: ["materials_board", "brand_collateral", "takeaway_bag"],
          title: "Materialidade",
          subtitle: materialText,
          typeMatch: /embalagem|packaging|material|sacola|uniforme/i,
          uploadedAssets,
          uploadedTypes: ["pattern", "reference"],
          used,
        }),
        buildCoverCard({
          applications,
          data,
          getAssetUrl,
          id: "system",
          imageKeys: ["brand_pattern", "logo_primary", "social_cover"],
          title: "Elemento visual",
          subtitle: systemText,
          typeMatch: /brand|cover|social|packaging|embalagem/i,
          uploadedAssets,
          uploadedTypes: ["pattern", "element", "logo"],
          used,
        }),
      ],
    };
  }

  return {
    hero: buildCoverCard({
      applications,
      data,
      getAssetUrl,
      id: "hero",
      imageKeys: ["hero_lifestyle", "hero_visual", "presentation_bg", "social_cover"],
      title: "Experiência da marca",
      subtitle: firstText(contextText, data.brandConcept.uniqueValueProposition),
      typeMatch: /hero|social|story|cover|ambiente|serviço|experi/i,
      uploadedAssets,
      uploadedTypes: ["reference"],
      used,
    }),
    cards: [
      buildCoverCard({
        applications,
        data,
        getAssetUrl,
        id: "environment",
        imageKeys: ["hero_visual", "social_post_square", "outdoor_billboard"],
        title: "Ambiente",
        subtitle: contextText,
        typeMatch: /ambiente|fachada|social|story|cover|serviço/i,
        uploadedAssets,
        uploadedTypes: ["reference"],
        used,
      }),
      buildCoverCard({
        applications,
        data,
        getAssetUrl,
        id: "trust",
        imageKeys: ["presentation_bg", "brand_collateral", "business_card"],
        title: "Sinal de confiança",
        subtitle: firstText(data.positioning?.primaryDifferentiators?.[0], data.brandConcept.values?.[0], systemText),
        typeMatch: /guideline|business|aplicação|institucional|sinalização/i,
        uploadedAssets,
        uploadedTypes: ["logo", "reference"],
        used,
      }),
      buildCoverCard({
        applications,
        data,
        getAssetUrl,
        id: "material",
        imageKeys: ["materials_board", "brand_pattern", "brand_collateral"],
        title: "Materialidade",
        subtitle: materialText,
        typeMatch: /material|embalagem|papelaria|support|apoio/i,
        uploadedAssets,
        uploadedTypes: ["pattern", "element", "reference"],
        used,
      }),
    ],
  };
}

export function createAssetLookup(
  generatedAssets: Record<string, GeneratedAsset>,
  generatedImages: Record<string, string>
): AssetLookup {
  return (key: string): string | null => generatedAssets[key]?.url ?? generatedImages[key] ?? null;
}

export function resolveImmersiveAssets({
  generatedAssets,
  generatedImages,
  uploadedAssets,
}: {
  generatedAssets: Record<string, GeneratedAsset>;
  generatedImages: Record<string, string>;
  uploadedAssets: UploadedAsset[];
}) {
  const getAssetUrl = createAssetLookup(generatedAssets, generatedImages);
  const firstUploaded = (types: UploadedAsset["type"][]) =>
    uploadedAssets.find((asset) => types.includes(asset.type))?.dataUrl ?? null;

  const patternUrl =
    getAssetUrl("brand_pattern") ??
    getAssetUrl("pattern_0") ??
    firstUploaded(["pattern"]);

  const atmosphereUrl =
    getAssetUrl("presentation_bg") ??
    getAssetUrl("hero_visual") ??
    null;

  const watermarkUrl =
    getAssetUrl("brand_mascot") ??
    getAssetUrl("mascot_0") ??
    firstUploaded(["mascot", "element"]);

  return { patternUrl, atmosphereUrl, watermarkUrl };
}

export function pickMappedAssetUrl(
  id: string,
  assetMap: Record<string, string[]>,
  getAssetUrl: AssetLookup
): string | null {
  const keys = assetMap[id];
  if (!keys) return null;

  for (const key of keys) {
    const url = getAssetUrl(key);
    if (url) return url;
  }

  return null;
}

export function pickSectionHeroUrl(
  sectionId: string,
  assetMap: Record<string, string[]>,
  getAssetUrl: AssetLookup,
  usedUrls: Set<string>,
  dedup = true
): string | null {
  const keys = assetMap[sectionId];
  if (!keys) return null;

  for (const key of keys) {
    const url = getAssetUrl(key);
    if (url) {
      if (dedup && usedUrls.has(url)) continue;
      usedUrls.add(url);
      return url;
    }
  }

  for (const key of keys) {
    const url = getAssetUrl(key);
    if (url) return url;
  }

  return null;
}

export function buildAvailableAssets(
  assetCatalog: readonly AssetCatalogItem[],
  getAssetUrl: AssetLookup
): AvailableAsset[] {
  const result: AvailableAsset[] = [];

  for (const asset of assetCatalog) {
    const url = getAssetUrl(asset.key);
    if (url) result.push({ url, label: asset.label });
  }

  return result;
}

export function chunkAvailableAssets(
  assets: AvailableAsset[],
  n: number
): AvailableAsset[][] {
  if (assets.length < 2) return [];

  const chunks: AvailableAsset[][] = [];
  const size = Math.max(2, Math.ceil(assets.length / n));

  for (let i = 0; i < assets.length; i += size) {
    chunks.push(assets.slice(i, i + size));
  }

  return chunks;
}
