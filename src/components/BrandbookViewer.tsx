"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  BrandImmersiveTheme,
  brandVoiceQuote,
  getImmersiveTheme,
  rgba,
} from "./BrandImmersiveTheme";
import type { ImmersiveTheme } from "./BrandImmersiveTheme";

import { BrandbookData, UploadedAsset, GeneratedAsset, Colors } from "@/lib/types";
import { SectionCover } from "./sections/SectionCover";
import { SectionDNA } from "./sections/SectionDNA";
import { SectionLogo } from "./sections/SectionLogo";
import { SectionColors } from "./sections/SectionColors";
import { SectionTypography } from "./sections/SectionTypography";
import { SectionTokensA11y } from "./sections/SectionTokensA11y";
import { SectionUxMicrocopyMotion } from "./sections/SectionUxMicrocopyMotion";
import { SectionKeyVisual } from "./sections/SectionKeyVisual";
import { SectionMascots } from "./sections/SectionMascots";
import { SectionApplications } from "./sections/SectionApplications";
import { SectionPositioning } from "./sections/SectionPositioning";
import { SectionAudiencePersonas } from "./sections/SectionAudiencePersonas";
import { SectionVerbalIdentity } from "./sections/SectionVerbalIdentity";
import { SectionTypographyScale } from "./sections/SectionTypographyScale";
import { SectionUiGuidelines } from "./sections/SectionUiGuidelines";
import { SectionProductionGuidelines } from "./sections/SectionProductionGuidelines";
import { SectionBrandStory } from "./sections/SectionBrandStory";
import { SectionSocialMedia } from "./sections/SectionSocialMedia";
import { SectionAssetPack } from "./sections/SectionAssetPack";
import { SectionBrandAssets } from "./sections/SectionBrandAssets";
import { SectionGovernance } from "./sections/SectionGovernance";
import { FontLoader } from "./FontLoader";
import { useImageGeneration, PROVIDERS, IMMERSIVE_ESSENTIALS } from "@/hooks/useImageGeneration";
import { EMPTY_KEYS } from "@/components/ApiKeyConfig";
import { ASSET_CATALOG, type AssetKey } from "@/lib/imagePrompts";
import type { AssetPackFile } from "@/lib/types";
import type { ApiKeys } from "@/components/ApiKeyConfig";

const SECTION_HERO_ASSETS: Record<string, string[]> = {
  "dna": ["hero_visual"],
  "brand-story": ["hero_lifestyle"],
  "positioning": ["presentation_bg"],
  "personas": ["hero_lifestyle", "hero_visual"],
  "verbal-identity": ["materials_board", "presentation_bg"],
  "logo": ["logo_primary", "brand_collateral"],
  "colors": ["materials_board", "brand_pattern"],
  "typography": ["presentation_bg", "hero_visual"],
  "key-visual": ["hero_visual", "hero_lifestyle"],
  "mascots": ["brand_mascot"],
  "applications": ["business_card", "brand_collateral", "delivery_packaging"],
  "social-media": ["social_post_square", "instagram_story", "social_cover"],
  "governance": ["presentation_bg", "brand_collateral"],
};

/** Assets used as small side/inline accent images per section */
const SECTION_ACCENT_ASSETS: Record<string, string[]> = {
  "dna": ["brand_pattern", "materials_board"],
  "brand-story": ["brand_mascot", "hero_visual"],
  "positioning": ["hero_lifestyle", "brand_mascot"],
  "personas": ["brand_mascot"],
  "verbal-identity": ["brand_pattern"],
  "logo": ["brand_pattern"],
  "colors": ["hero_visual"],
  "typography": ["brand_pattern", "materials_board"],
  "key-visual": ["brand_pattern", "brand_mascot"],
  "mascots": ["brand_pattern"],
  "applications": ["brand_pattern", "hero_visual"],
  "social-media": ["brand_pattern"],
  "governance": ["brand_mascot", "brand_pattern"],
};

const CATEGORY_ATMO_ASSETS: Record<string, string[]> = {
  "Essência da Marca": ["hero_visual"],
  "Público-Alvo": ["hero_lifestyle", "hero_visual"],
  "Identidade Verbal": ["presentation_bg"],
  "Identidade Visual": ["brand_collateral", "logo_primary"],
  "Paleta de Cores": ["materials_board", "brand_pattern"],
  "Tipografia": ["presentation_bg", "materials_board"],
  "Sistema Visual": ["hero_visual", "hero_lifestyle"],
  "Padrões Gráficos": ["brand_pattern", "brand_mascot"],
  "Design System": ["app_mockup", "presentation_bg"],
  "Aplicações da Marca": ["delivery_packaging", "business_card", "brand_collateral"],
  "Diretrizes de Uso": ["outdoor_billboard", "presentation_bg"],
};

type Category =
  | "Essência da Marca"
  | "Público-Alvo"
  | "Identidade Verbal"
  | "Identidade Visual"
  | "Paleta de Cores"
  | "Tipografia"
  | "Sistema Visual"
  | "Padrões Gráficos"
  | "Design System"
  | "Aplicações da Marca"
  | "Diretrizes de Uso";

type SectionDef = {
  id: string;
  title: string;
  category: Category;
  when: boolean;
  render: (num: number) => JSX.Element;
};

interface Props {
  data: BrandbookData;
  generatedImages?: Record<string, string>;
  uploadedAssets?: UploadedAsset[];
  assetPackFiles?: AssetPackFile[];
  assetPackGenerating?: boolean;
  onGenerateAssetPack?: () => void;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
  generatedAssets?: Record<string, GeneratedAsset>;
  apiKeys?: ApiKeys;
  textProvider?: "openai" | "gemini";
  onAssetGenerated?: (key: string, asset: GeneratedAsset) => void;
  onSaveToAssets?: (asset: UploadedAsset) => void;
  onUpdateColors?: (colors: Colors) => void;
  onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void;
}

export function BrandbookViewer({
  data,
  generatedImages = {},
  uploadedAssets = [],
  assetPackFiles = [],
  assetPackGenerating = false,
  onGenerateAssetPack,
  onUpdateApplicationImageKey,
  generatedAssets = {},
  apiKeys,
  textProvider = "openai",
  onAssetGenerated,
  onSaveToAssets,
  onUpdateColors,
  onUpdateData,
}: Props) {
  const isAdvanced = !!data.uxPatterns;
  const hasGeneration = !!apiKeys && !!onAssetGenerated;

  const [immersive, setImmersive] = useState(false);
  const [immersiveGenerating, setImmersiveGenerating] = useState(false);
  const immersiveTriggered = useRef(false);

  const noop = () => {};
  const imgGen = useImageGeneration({
    data,
    generatedAssets,
    onAssetGenerated: onAssetGenerated ?? noop,
    onSaveToAssets,
    apiKeys: apiKeys ?? EMPTY_KEYS,
    uploadedAssets,
    textProvider,
  });

  const sectionDefs: SectionDef[] = [
    {
      id: "dna",
      title: "DNA & Estratégia",
      category: "Essência da Marca",
      when: true,
      render: (num) => <SectionDNA data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "brand-story",
      title: "Brand Story & Manifesto",
      category: "Essência da Marca",
      when: !!data.brandStory,
      render: (num) => <SectionBrandStory data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "positioning",
      title: "Posicionamento",
      category: "Essência da Marca",
      when: !!data.positioning,
      render: (num) => <SectionPositioning data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "personas",
      title: "Personas",
      category: "Público-Alvo",
      when: !!data.audiencePersonas && data.audiencePersonas.length > 0,
      render: (num) => <SectionAudiencePersonas data={data} num={num} onUpdateData={onUpdateData} />,
    },
    {
      id: "verbal-identity",
      title: "Identidade Verbal",
      category: "Identidade Verbal",
      when: !!data.verbalIdentity,
      render: (num) => <SectionVerbalIdentity data={data} num={num} />,
    },
    {
      id: "logo",
      title: "Logo & Identidade Visual",
      category: "Identidade Visual",
      when: true,
      render: (num) => (
        <SectionLogo
          data={data}
          num={num}
          generatedImages={generatedImages}
          uploadedAssets={uploadedAssets}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          loadingKey={imgGen.loadingKey}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onSaveToAssets={hasGeneration ? (asset: GeneratedAsset, label: string, key?: AssetKey) => imgGen.saveGeneratedToAssets(asset, label, key) : undefined}
          generatedAssets={generatedAssets}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "colors",
      title: "Cores",
      category: "Paleta de Cores",
      when: true,
      render: (num) => (
        <SectionColors
          data={data}
          num={num}
          onUpdateColors={onUpdateColors}
        />
      ),
    },
    {
      id: "typography",
      title: "Tipografia",
      category: "Tipografia",
      when: true,
      render: (num) => <SectionTypography data={data} num={num} />,
    },
    {
      id: "typography-scale",
      title: "Escala Tipográfica",
      category: "Tipografia",
      when: !!data.typographyScale && data.typographyScale.length > 0,
      render: (num) => <SectionTypographyScale data={data} num={num} />,
    },
    {
      id: "key-visual",
      title: "Key Visual",
      category: "Sistema Visual",
      when: true,
      render: (num) => (
        <SectionKeyVisual
          data={data}
          num={num}
          generatedImages={generatedImages}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "mascots",
      title: "Mascotes & Símbolos",
      category: "Padrões Gráficos",
      when: !!(
        (data.keyVisual.mascots && data.keyVisual.mascots.length > 0) ||
        (data.keyVisual.symbols && data.keyVisual.symbols.length > 0) ||
        (data.keyVisual.patterns && data.keyVisual.patterns.length > 0) ||
        (data.keyVisual.structuredPatterns && data.keyVisual.structuredPatterns.length > 0) ||
        uploadedAssets.some((a) => a.type === "mascot" || a.type === "element" || a.type === "pattern")
      ),
      render: (num) => (
        <SectionMascots
          data={data}
          num={num}
          uploadedAssets={uploadedAssets}
          generatedImages={generatedImages}
          onGenerate={hasGeneration ? (key: AssetKey, opts?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => imgGen.generate(key, opts) : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onDownload={hasGeneration ? (url: string, name: string) => imgGen.downloadImage(url, name) : undefined}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "ui-guidelines",
      title: "Guidelines de UI",
      category: "Design System",
      when: !!data.uiGuidelines,
      render: (num) => <SectionUiGuidelines data={data} num={num} />,
    },
    {
      id: "tokens-a11y",
      title: "Design Tokens & Acessibilidade",
      category: "Design System",
      when: isAdvanced && !!data.designTokens && !!data.accessibility,
      render: (num) => <SectionTokensA11y data={data} num={num} />,
    },
    {
      id: "ux-microcopy-motion",
      title: "UX Patterns, Microcopy & Motion",
      category: "Design System",
      when: isAdvanced && !!data.uxPatterns && !!data.microcopy && !!data.motion,
      render: (num) => <SectionUxMicrocopyMotion data={data} num={num} />,
    },
    {
      id: "applications",
      title: "Aplicações",
      category: "Aplicações da Marca",
      when: true,
      render: (num) => (
        <SectionApplications
          data={data}
          num={num}
          generatedImages={generatedImages}
          onUpdateApplicationImageKey={onUpdateApplicationImageKey}
          onGenerateApplication={hasGeneration ? (i: number, ar: string, ci?: string, refs?: string[]) => imgGen.generateApplication(i, ar as "1:1" | "16:9" | "9:16" | "4:3" | "21:9", ci, refs) : undefined}
          onGenerateAllApplications={hasGeneration ? () => imgGen.generateAllApplications() : undefined}
          loadingKey={imgGen.loadingKey}
          generatedAssets={generatedAssets}
          onUpdateData={onUpdateData}
        />
      ),
    },
    {
      id: "production-guidelines",
      title: "Produção & Handoff",
      category: "Diretrizes de Uso",
      when: !!data.productionGuidelines,
      render: (num) => <SectionProductionGuidelines data={data} num={num} />,
    },
    {
      id: "social-media",
      title: "Guia de Redes Sociais",
      category: "Aplicações da Marca",
      when: !!data.socialMediaGuidelines && data.socialMediaGuidelines.platforms.length > 0,
      render: (num) => <SectionSocialMedia data={data} num={num} />,
    },
    {
      id: "governance",
      title: "Governança do Design System",
      category: "Diretrizes de Uso",
      when: !!data.governance,
      render: (num) => <SectionGovernance data={data} num={num} />,
    },
    {
      id: "asset-pack",
      title: "Entrega — Asset Pack",
      category: "Diretrizes de Uso",
      when: true,
      render: (num) => (
        <SectionAssetPack
          data={data}
          num={num}
          uploadedAssets={uploadedAssets}
          generatedImages={generatedImages}
          assetPackFiles={assetPackFiles}
          generating={assetPackGenerating}
          onGenerate={onGenerateAssetPack}
        />
      ),
    },
    {
      id: "brand-assets",
      title: "Ativos de Marca",
      category: "Diretrizes de Uso",
      when: uploadedAssets.length > 0,
      render: (num) => (
        <SectionBrandAssets
          num={num}
          uploadedAssets={uploadedAssets}
        />
      ),
    },
  ];

  const sections = sectionDefs
    .filter((s) => s.when)
    .map((s, idx) => ({ ...s, num: idx + 1 }));

  const categories: Category[] = [
    "Essência da Marca",
    "Público-Alvo",
    "Identidade Verbal",
    "Identidade Visual",
    "Paleta de Cores",
    "Tipografia",
    "Sistema Visual",
    "Padrões Gráficos",
    "Design System",
    "Aplicações da Marca",
    "Diretrizes de Uso",
  ];

  const byCategory = categories
    .map((cat) => ({
      cat,
      items: sections.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const theme = useMemo(() => getImmersiveTheme(data), [data]);

  const getAssetUrl = useMemo(() => {
    return (key: string): string | null =>
      generatedAssets?.[key]?.url ?? generatedImages?.[key] ?? null;
  }, [generatedAssets, generatedImages]);

  const immersiveAssets = useMemo(() => {
    const genUrl = (k: string) => generatedAssets?.[k]?.url ?? null;
    const legacyUrl = (k: string) => generatedImages?.[k] ?? null;
    const firstUploaded = (types: UploadedAsset["type"][]) =>
      uploadedAssets.find((a) => types.includes(a.type))?.dataUrl ?? null;

    const patternUrl =
      genUrl("brand_pattern") ??
      legacyUrl("brand_pattern") ??
      genUrl("pattern_0") ??
      firstUploaded(["pattern"]);
    const atmosphereUrl =
      genUrl("presentation_bg") ??
      legacyUrl("presentation_bg") ??
      genUrl("hero_visual") ??
      legacyUrl("hero_visual") ??
      null;
    const watermarkUrl =
      genUrl("brand_mascot") ??
      legacyUrl("brand_mascot") ??
      genUrl("mascot_0") ??
      firstUploaded(["mascot", "element"]);

    return { patternUrl, atmosphereUrl, watermarkUrl };
  }, [generatedAssets, generatedImages, uploadedAssets]);

  // Track used hero URLs to avoid showing the same image in consecutive sections
  const usedHeroUrlsRef = useRef(new Set<string>());

  const getSectionHeroUrl = (sectionId: string, dedup = true): string | null => {
    const keys = SECTION_HERO_ASSETS[sectionId];
    if (!keys) return null;
    for (const k of keys) {
      const url = getAssetUrl(k);
      if (url) {
        if (dedup && usedHeroUrlsRef.current.has(url)) continue;
        usedHeroUrlsRef.current.add(url);
        return url;
      }
    }
    // Fallback: allow reuse if no unique found
    for (const k of keys) {
      const url = getAssetUrl(k);
      if (url) return url;
    }
    return null;
  };

  const getSectionAccentUrl = (sectionId: string): string | null => {
    const keys = SECTION_ACCENT_ASSETS[sectionId];
    if (!keys) return null;
    for (const k of keys) {
      const url = getAssetUrl(k);
      if (url) return url;
    }
    return null;
  };

  const getCategoryAtmoUrl = (cat: string): string | null => {
    const keys = CATEGORY_ATMO_ASSETS[cat];
    if (!keys) return null;
    for (const k of keys) {
      const url = getAssetUrl(k);
      if (url) return url;
    }
    return immersiveAssets.atmosphereUrl;
  };

  const getAvailableAssets = (): { url: string; label: string }[] => {
    const result: { url: string; label: string }[] = [];
    for (const asset of ASSET_CATALOG) {
      const url = getAssetUrl(asset.key);
      if (url) result.push({ url, label: asset.label });
    }
    return result;
  };

  /** Split available assets into N roughly-equal chunks for distributed display */
  const getAssetChunks = (n: number): { url: string; label: string }[][] => {
    const all = getAvailableAssets();
    if (all.length < 2) return [];
    const chunks: { url: string; label: string }[][] = [];
    const size = Math.max(2, Math.ceil(all.length / n));
    for (let i = 0; i < all.length; i += size) {
      chunks.push(all.slice(i, i + size));
    }
    return chunks;
  };

  const immersiveStyle: CSSProperties | undefined = immersive
    ? ({
        ["--bb-primary" as unknown as keyof CSSProperties]: theme.primaryHex,
        ["--bb-accent" as unknown as keyof CSSProperties]: theme.accentHex,
        ["--bb-tertiary" as unknown as keyof CSSProperties]: theme.tertiaryHex,
        ["--bb-bg" as unknown as keyof CSSProperties]: theme.bg,
        ["--bb-border" as unknown as keyof CSSProperties]: theme.border,
        ["--bb-muted" as unknown as keyof CSSProperties]: theme.muted,
        ["--bb-heading-font" as unknown as keyof CSSProperties]:
          `'${theme.headingFont}', ui-sans-serif, system-ui`,
        ["--bb-body-font" as unknown as keyof CSSProperties]:
          `'${theme.bodyFont}', ui-sans-serif, system-ui`,
      } as unknown as CSSProperties)
    : undefined;

  const ColorStrip = () =>
    immersive && theme.allColors.length > 1 ? (
      <div className="bb-color-strip" aria-hidden="true">
        {theme.allColors.map((c, i) => (
          <span key={i} style={{ background: c }} />
        ))}
      </div>
    ) : null;

  return (
    <div
      className={`w-full px-4 sm:px-6 ${immersive ? "bb-immersive" : ""}`}
      id="brandbook-content"
      style={immersiveStyle}
    >
      <BrandImmersiveTheme
        immersive={immersive}
        theme={theme}
        brandName={data.brandName}
        patternUrl={immersiveAssets.patternUrl}
        atmosphereUrl={immersiveAssets.atmosphereUrl}
        watermarkUrl={immersiveAssets.watermarkUrl}
      />
      <FontLoader data={data} />
      <SectionCover data={data} />

      {/* Immersive Mode Toggle — always visible */}
      <div className="no-print flex items-center justify-end gap-2 mb-4 flex-wrap">
        {/* Ambientar Brandbook — generate decorative assets */}
        {immersive && hasGeneration && imgGen.currentProviderHasKey && imgGen.immersiveMissing > 0 && !immersiveGenerating && (
          <button
            type="button"
            onClick={async () => {
              setImmersiveGenerating(true);
              try { await imgGen.generateImmersiveAssets(); } finally { setImmersiveGenerating(false); }
            }}
            disabled={imgGen.loadingKey !== null}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shadow-sm bg-white hover:bg-gray-50 border-gray-200 text-gray-700 disabled:opacity-40"
          >
            Ambientar Brandbook ({imgGen.immersiveMissing} assets)
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setImmersive((v) => {
              const next = !v;
              if (next && hasGeneration && imgGen.currentProviderHasKey && imgGen.immersiveMissing > 0 && !immersiveTriggered.current) {
                immersiveTriggered.current = true;
                setImmersiveGenerating(true);
                imgGen.generateImmersiveAssets().finally(() => setImmersiveGenerating(false));
              }
              return next;
            });
          }}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shadow-sm ${
            immersive
              ? "text-white shadow-md"
              : "text-gray-700 bg-white hover:bg-gray-50 border-gray-200"
          }`}
          style={
            immersive
              ? {
                  background: theme.primaryHex,
                  borderColor: theme.primaryHex,
                }
              : undefined
          }
          title="Ativa uma apresentação imersiva: o brandbook se veste da marca com cores, tipografia e linguagem em primeira pessoa"
        >
          🎨 Modo Imersivo{immersive ? " ✓" : ""}
        </button>
      </div>

      {/* Immersive generation progress banner */}
      {immersive && immersiveGenerating && (
        <div
          className="no-print mb-4 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium animate-pulse"
          style={{
            background: rgba(theme.primaryHex, 0.08),
            border: `1px solid ${rgba(theme.primaryHex, 0.15)}`,
            color: theme.primaryHex,
          }}
        >
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
          </svg>
          <span>Gerando texturas e imagens da marca para ambientar o brandbook...</span>
          <button
            type="button"
            onClick={() => { imgGen.cancelBatch(); setImmersiveGenerating(false); }}
            className="ml-auto text-xs font-semibold opacity-60 hover:opacity-100"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Generation Control Bar */}
      {hasGeneration && (
        <div className="no-print sticky top-12 z-30 bg-white/95 backdrop-blur border rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Provider:</span>
              <select
                value={imgGen.provider}
                onChange={(e) => imgGen.setProvider(e.target.value as "dalle3" | "stability" | "ideogram" | "imagen")}
                className="text-sm font-semibold border rounded-lg px-2 py-1.5 bg-gray-50 focus:ring-2 focus:ring-gray-900 outline-none"
                aria-label="Provider de imagem"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {!imgGen.currentProviderHasKey && (
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Sem chave</span>
              )}
            </div>

            <div className="flex items-center gap-3 border-l pl-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={imgGen.refineBeforeGenerate} onChange={(e) => imgGen.setRefineBeforeGenerate(e.target.checked)} className="rounded" />
                <span className="font-medium">Refinar prompt</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={imgGen.useReferenceImages} onChange={(e) => imgGen.setUseReferenceImages(e.target.checked)} className="rounded" />
                <span className="font-medium">Referências</span>
              </label>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => imgGen.generateAllAssets()}
                disabled={imgGen.loadingKey !== null}
                className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {imgGen.loadingKey ? "Gerando..." : "✦ Gerar Todos os Assets"}
              </button>
              {imgGen.loadingKey && (
                <button
                  type="button"
                  onClick={() => imgGen.cancelBatch()}
                  className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {imgGen.error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-xs flex items-center justify-between">
              <span>{imgGen.error}</span>
              <button onClick={() => imgGen.setError(null)} className="font-bold text-lg leading-none ml-3">&times;</button>
            </div>
          )}
        </div>
      )}

      <section className="page-break mb-10" id="sumario">
        <div className={immersive ? "bb-section-shell" : ""}>
          {/* Sumário header */}
          {immersive ? (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div
                  style={{
                    width: 8,
                    height: 40,
                    borderRadius: 4,
                    background: `linear-gradient(180deg, ${theme.primaryHex}, ${theme.accentHex})`,
                  }}
                />
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-black tracking-tight"
                    style={{ color: theme.primaryHex, fontFamily: `'${theme.headingFont}', sans-serif` }}
                  >
                    Sumário
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: rgba(theme.primaryHex, 0.5) }}>
                    Navegue por categorias e vá direto à seção desejada.
                  </p>
                </div>
              </div>
              <ColorStrip />
            </div>
          ) : (
            <div className="mb-4 border-b border-gray-100 pb-2">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Sumário</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Navegue por categorias e vá direto à seção desejada.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            {byCategory.map((g) => (
              <div
                key={g.cat}
                className={`rounded-2xl p-5 shadow-sm ${
                  immersive ? "bb-sumario-card" : "bg-white border border-gray-100"
                }`}
              >
                {immersive && <div className="bb-sumario-mascot" aria-hidden="true" />}
                <h3
                  className={`text-[11px] font-extrabold uppercase tracking-[0.25em] mb-3 ${
                    immersive ? "bb-sumario-cat" : "text-gray-500"
                  }`}
                >
                  {g.cat}
                </h3>
                <div className="space-y-2">
                  {g.items.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block rounded-xl px-3 py-2 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`text-xs font-bold mt-0.5 tabular-nums ${
                            immersive ? "bb-num" : "text-gray-400"
                          }`}
                        >
                          {String(s.num).padStart(2, "0")}
                        </span>
                        <span className="font-semibold text-gray-900 leading-snug">{s.title}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Brand identity watermark in sumário */}
          {immersive && (
            <div className="mt-6 flex items-center justify-between" style={{ opacity: 0.4 }}>
              <div className="flex gap-1.5">
                {theme.allColors.slice(0, 6).map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: c,
                      border: `1px solid ${rgba(theme.primaryHex, 0.2)}`,
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: rgba(theme.primaryHex, 0.4), fontFamily: `'${theme.headingFont}', sans-serif` }}
              >
                {data.brandName} — Brand System
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Reset hero dedup tracker on each render */}
      {(() => { usedHeroUrlsRef.current = new Set<string>(); return null; })()}

      {byCategory.map((g, catIdx) => {
        const assetChunks = immersive ? getAssetChunks(Math.max(3, byCategory.length)) : [];
        return (
        <div key={g.cat}>
          {/* Category divider */}
          {immersive ? (
            <>
              {/* Mini asset strip between categories — distributed chunks */}
              {catIdx > 0 && catIdx % 2 === 0 && (() => {
                const chunkIdx = Math.floor(catIdx / 2) - 1;
                const chunk = assetChunks[chunkIdx % assetChunks.length];
                if (!chunk || chunk.length < 2) return null;
                return (
                  <div className="bb-asset-strip bb-mini-strip">
                    {chunk.map((a, i) => (
                      <div key={i} className="bb-strip-item">
                        <img src={a.url} alt={a.label} />
                        <div className="bb-strip-label">{a.label}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Atmosphere divider between categories — uses category-specific or fallback image */}
              {catIdx > 0 && (() => {
                const dividerUrl = getCategoryAtmoUrl(g.cat);
                if (!dividerUrl) return null;
                return (
                  <div className="bb-atmo-divider no-print">
                    <img src={dividerUrl} alt="" />
                    <div className="bb-divider-gradient" />
                    <div className="bb-divider-pattern" />
                    <div className="bb-divider-content">
                      <h3>{data.brandName}</h3>
                      <p>{g.cat}</p>
                    </div>
                  </div>
                );
              })()}
              <div className="page-break mb-6 mt-8">
                <div className="bb-cat-banner">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="bb-cat-brand">{data.brandName}</div>
                      <h2>{g.cat}</h2>
                    </div>
                    <a
                      href="#sumario"
                      className="no-print text-xs font-semibold bb-cat-back transition"
                    >
                      Voltar ao sumário
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="page-break mb-4 mt-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-gray-500">{g.cat}</h2>
                <a href="#sumario" className="no-print text-sm font-semibold text-gray-600 hover:text-gray-900">
                  Voltar ao sumário
                </a>
              </div>
            </div>
          )}
          {g.items.map((s, sIdx) => {
            const quote = immersive ? brandVoiceQuote(s.id, data) : null;
            const showPatternBand = immersive && sIdx > 0 && sIdx % 2 === 0;
            const accentUrl = immersive ? getSectionAccentUrl(s.id) : null;
            const showAccent = immersive && !showPatternBand && sIdx > 0 && accentUrl;
            return (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                {/* Color strip between sections */}
                {immersive && sIdx > 0 && !showPatternBand && <ColorStrip />}

                {/* Pattern band between every 2nd section within category */}
                {showPatternBand && (
                  <div className="bb-pattern-band" aria-hidden="true">
                    <div className="bb-band-pattern" />
                    <div className="bb-band-mascot" />
                    <div className="bb-band-name">{data.brandName}</div>
                  </div>
                )}

                <div className={immersive ? "bb-section-shell" : ""}>
                  {immersive && <div className="bb-section-mascot" aria-hidden="true" />}

                  {/* Section hero image — shows relevant generated asset (deduped) */}
                  {immersive && (() => {
                    const heroUrl = getSectionHeroUrl(s.id);
                    if (!heroUrl) return null;
                    return (
                      <div className="bb-section-hero">
                        <img src={heroUrl} alt={`${data.brandName} — ${s.title}`} />
                        <div className="bb-hero-overlay" />
                        <div className="bb-hero-label">{data.brandName} — {s.title}</div>
                      </div>
                    );
                  })()}

                  {/* Side accent image — small floating decoration for sections without hero repetition */}
                  {showAccent && (
                    <div className={`bb-side-accent ${sIdx % 2 === 1 ? "bb-accent-left" : "bb-accent-right"}`} aria-hidden="true">
                      <img src={accentUrl} alt="" />
                    </div>
                  )}

                  {quote && (
                    <div className="bb-voice mb-5 px-5 py-4 rounded-xl border">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: theme.primaryHex,
                          }}
                        />
                        <div
                          className="text-[10px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: theme.primaryHex }}
                        >
                          Voz da Marca — {data.brandName}
                        </div>
                      </div>
                      <div
                        className="bb-voice-text text-sm italic leading-relaxed"
                        style={{ color: rgba(theme.primaryHex, 0.75), fontFamily: `'${theme.headingFont}', sans-serif` }}
                      >
                        &ldquo;{quote}&rdquo;
                      </div>
                    </div>
                  )}
                  {s.render(s.num)}
                </div>
              </div>
            );
          })}

          {/* Odd categories: mini asset strip after last section */}
          {immersive && catIdx % 2 === 1 && (() => {
            const chunkIdx = Math.floor(catIdx / 2);
            const chunk = assetChunks[chunkIdx % assetChunks.length];
            if (!chunk || chunk.length < 2) return null;
            return (
              <div className="bb-asset-strip bb-mini-strip">
                {chunk.map((a, i) => (
                  <div key={i} className="bb-strip-item">
                    <img src={a.url} alt={a.label} />
                    <div className="bb-strip-label">{a.label}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        );
      })}

      {/* Pattern band before footer */}
      {immersive && immersiveAssets.patternUrl && (
        <div className="bb-pattern-band" aria-hidden="true">
          <div className="bb-band-pattern" />
          <div className="bb-band-mascot" />
          <div className="bb-band-name">{data.brandName}</div>
        </div>
      )}

      {/* Final asset gallery strip — all generated brand assets */}
      {immersive && (() => {
        const assets = getAvailableAssets();
        if (assets.length < 3) return null;
        return (
          <div className="bb-asset-strip">
            {assets.map((a, i) => (
              <div key={i} className="bb-strip-item">
                <img src={a.url} alt={a.label} />
                <div className="bb-strip-label">{a.label}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Brand footer in immersive mode */}
      {immersive && (
        <div className="bb-brand-footer">
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-xl font-black"
                style={{
                  color: theme.isDark ? "#fff" : "#111",
                  fontFamily: `'${theme.headingFont}', sans-serif`,
                }}
              >
                {data.brandName}
              </div>
              {data.verbalIdentity?.tagline && (
                <div
                  className="text-sm italic mt-1"
                  style={{ color: theme.isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}
                >
                  &ldquo;{data.verbalIdentity.tagline}&rdquo;
                </div>
              )}
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em] mt-3"
                style={{ color: theme.isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)" }}
              >
                Manual de Identidade Visual — {new Date().getFullYear()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-1.5">
                {theme.allColors.slice(0, 8).map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: c,
                      border: `2px solid ${theme.isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                      boxShadow: `0 2px 6px ${rgba(c, 0.3)}`,
                    }}
                  />
                ))}
              </div>
              <div
                className="text-[9px] font-bold uppercase tracking-[0.15em]"
                style={{ color: theme.isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)" }}
              >
                {data.industry}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
