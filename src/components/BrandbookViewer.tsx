"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  BrandImmersiveTheme,
  brandVoiceQuote,
  getImmersiveTheme,
  rgba,
} from "./BrandImmersiveTheme";

import { BrandbookData, UploadedAsset, GeneratedAsset, Colors, type AiTextProvider, type AssetPackState } from "@/lib/types";
import { SectionCover } from "./sections/SectionCover";
import { FontLoader } from "./FontLoader";
import { useImageGeneration, PROVIDERS } from "@/hooks/useImageGeneration";
import { EMPTY_KEYS } from "@/components/ApiKeyConfig";
import { ASSET_CATALOG, type AssetKey } from "@/lib/imagePrompts";
import type { ApiKeys } from "@/components/ApiKeyConfig";
import {
  buildAvailableAssets,
  buildCoverVisualSummary,
  chunkAvailableAssets,
  createAssetLookup,
  pickMappedAssetUrl,
  pickSectionHeroUrl,
  resolveImmersiveAssets,
} from "./brandbookViewerAssetSelectors";
import { buildSectionDefs, CATEGORIES } from "./brandbookViewerSections";

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

interface Props {
  data: BrandbookData;
  generatedImages?: Record<string, string>;
  uploadedAssets?: UploadedAsset[];
  assetPack?: AssetPackState;
  assetPackGenerating?: boolean;
  onGenerateAssetPack?: () => void;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
  generatedAssets?: Record<string, GeneratedAsset>;
  apiKeys?: ApiKeys;
  promptProvider?: AiTextProvider;
  onAssetGenerated?: (key: string, asset: GeneratedAsset) => void;
  onSaveToAssets?: (asset: UploadedAsset) => void;
  onUpdateColors?: (colors: Colors) => void;
  onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void;
}

export function BrandbookViewer({
  data,
  generatedImages = {},
  uploadedAssets = [],
  assetPack = { files: [] },
  assetPackGenerating = false,
  onGenerateAssetPack,
  onUpdateApplicationImageKey,
  generatedAssets = {},
  apiKeys,
  promptProvider = "openai",
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
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [genBarOpen, setGenBarOpen] = useState(false);

  const noop = () => {};
  const imgGen = useImageGeneration({
    data,
    generatedAssets,
    onAssetGenerated: onAssetGenerated ?? noop,
    onSaveToAssets,
    apiKeys: apiKeys ?? EMPTY_KEYS,
    uploadedAssets,
    promptProvider,
  });

  const sectionDefs = buildSectionDefs({
    assetPack,
    assetPackGenerating,
    data,
    generatedAssets,
    generatedImages,
    hasGeneration,
    imgGen,
    isAdvanced,
    onGenerateAssetPack,
    onUpdateApplicationImageKey,
    onUpdateColors,
    onUpdateData,
    uploadedAssets,
  });

  const sections = sectionDefs
    .filter((s) => s.when)
    .map((s, idx) => ({ ...s, num: idx + 1 }));

  const byCategory = CATEGORIES
    .map((cat) => ({
      cat,
      items: sections.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const theme = useMemo(() => getImmersiveTheme(data), [data]);

  const getAssetUrl = useMemo(
    () => createAssetLookup(generatedAssets, generatedImages),
    [generatedAssets, generatedImages]
  );

  const immersiveAssets = useMemo(
    () =>
      resolveImmersiveAssets({
        generatedAssets,
        generatedImages,
        uploadedAssets,
      }),
    [generatedAssets, generatedImages, uploadedAssets]
  );

  const coverVisualSummary = useMemo(
    () =>
      buildCoverVisualSummary({
        data,
        generatedAssets,
        generatedImages,
        uploadedAssets,
      }),
    [data, generatedAssets, generatedImages, uploadedAssets]
  );

  // Track used hero URLs to avoid showing the same image in consecutive sections
  const usedHeroUrlsRef = useRef(new Set<string>());

  const getSectionHeroUrl = (sectionId: string, dedup = true): string | null => {
    return pickSectionHeroUrl(
      sectionId,
      SECTION_HERO_ASSETS,
      getAssetUrl,
      usedHeroUrlsRef.current,
      dedup
    );
  };

  const getSectionAccentUrl = (sectionId: string): string | null => {
    return pickMappedAssetUrl(sectionId, SECTION_ACCENT_ASSETS, getAssetUrl);
  };

  const getCategoryAtmoUrl = (cat: string): string | null => {
    return pickMappedAssetUrl(cat, CATEGORY_ATMO_ASSETS, getAssetUrl) ?? immersiveAssets.atmosphereUrl;
  };

  const getAvailableAssets = (): { url: string; label: string }[] => {
    return buildAvailableAssets(ASSET_CATALOG, getAssetUrl);
  };

  /** Split available assets into N roughly-equal chunks for distributed display */
  const getAssetChunks = (n: number): { url: string; label: string }[][] => {
    return chunkAvailableAssets(getAvailableAssets(), n);
  };

  // Core brand CSS vars — always injected so sections can use them even without immersive mode
  const brandColorVars = {
    ["--bb-primary" as unknown as keyof CSSProperties]: theme.primaryHex,
    ["--bb-accent" as unknown as keyof CSSProperties]: theme.accentHex,
    ["--bb-tertiary" as unknown as keyof CSSProperties]: theme.tertiaryHex,
  } as unknown as CSSProperties;

  const immersiveStyle: CSSProperties = immersive
    ? ({
        ...brandColorVars,
        ["--bb-bg" as unknown as keyof CSSProperties]: theme.bg,
        ["--bb-border" as unknown as keyof CSSProperties]: theme.border,
        ["--bb-muted" as unknown as keyof CSSProperties]: theme.muted,
        ["--bb-heading-font" as unknown as keyof CSSProperties]:
          `'${theme.headingFont}', ui-sans-serif, system-ui`,
        ["--bb-body-font" as unknown as keyof CSSProperties]:
          `'${theme.bodyFont}', ui-sans-serif, system-ui`,
      } as unknown as CSSProperties)
    : brandColorVars;

  // Scroll reveal: add `revealed` class when sections enter viewport
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });

  // Auto-open gen bar when generation starts
  useEffect(() => {
    if (imgGen.loadingKey !== null) setGenBarOpen(true);
  }, [imgGen.loadingKey]);

  // Keyboard shortcuts
  const exitPresentation = useCallback(() => setPresentationMode(false), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.startsWith("Mac");
      const metaOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (e.key === "Escape") {
        if (presentationMode) { e.preventDefault(); exitPresentation(); }
        return;
      }
      if (presentationMode) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          setCurrentSlide((s) => Math.min(s + 1, sections.length - 1));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          setCurrentSlide((s) => Math.max(s - 1, 0));
        }
        return;
      }
      if (metaOrCtrl && e.key === "p") {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presentationMode, exitPresentation, sections.length]);

  const ColorStrip = () =>
    immersive && theme.allColors.length > 1 ? (
      <div className="bb-color-strip" aria-hidden="true">
        {theme.allColors.map((c, i) => (
          <span key={i} style={{ background: c }} />
        ))}
      </div>
    ) : null;

  const defaultShellStyle: CSSProperties = {
    background: `linear-gradient(180deg, rgba(255,255,255,0.98) 0%, ${rgba(theme.primaryHex, 0.025)} 100%)`,
    borderColor: rgba(theme.primaryHex, 0.08),
    boxShadow: `0 24px 70px ${rgba(theme.primaryHex, 0.08)}, inset 3px 0 0 ${rgba(theme.primaryHex, 0.28)}`,
  };

  const defaultCardStyle: CSSProperties = {
    background: `linear-gradient(180deg, rgba(255,255,255,0.98) 0%, ${rgba(theme.accentHex, 0.05)} 100%)`,
    borderColor: rgba(theme.primaryHex, 0.08),
    boxShadow: `0 18px 52px ${rgba(theme.primaryHex, 0.06)}`,
  };

  return (
    <div
      className={`w-full px-2 sm:px-3 lg:px-4 xl:px-5 ${immersive ? "bb-immersive" : ""}`}
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
      <SectionCover data={data} visualSummary={coverVisualSummary} />

      {/* Presentation Mode overlay */}
      {presentationMode && (() => {
        const slide = sections[currentSlide];
        const progress = sections.length > 1 ? (currentSlide / (sections.length - 1)) * 100 : 100;
        return (
          <div className="bb-presentation-overlay" style={immersiveStyle}>
            <div className="bb-presentation-slide">
              {slide && slide.render(slide.num)}
            </div>
            <div className="bb-presentation-controls">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={exitPresentation}
                  className="text-xs font-bold text-white/50 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition"
                >
                  Esc — Sair
                </button>
                <span className="text-xs text-white/30">
                  {String(currentSlide + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
                </span>
                <span className="text-xs text-white/40 hidden sm:block">{slide?.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentSlide((s) => Math.max(s - 1, 0))}
                  disabled={currentSlide === 0}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white border border-white/10 rounded-lg disabled:opacity-25 transition"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((s) => Math.min(s + 1, sections.length - 1))}
                  disabled={currentSlide === sections.length - 1}
                  className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white border border-white/10 rounded-lg disabled:opacity-25 transition"
                >
                  ›
                </button>
              </div>
            </div>
            <div
              className="bb-presentation-progress"
              style={{ width: `${progress}%`, background: theme.accentHex }}
            />
          </div>
        );
      })()}

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
        <button
          type="button"
          onClick={() => { setCurrentSlide(0); setPresentationMode(true); }}
          className="text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shadow-sm text-gray-700 bg-white hover:bg-gray-50 border-gray-200"
          title="Apresentar o brandbook em tela cheia, seção por seção (←→ para navegar, Esc para sair)"
        >
          ▶ Apresentar
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

      {/* Generation Control Bar — collapsible */}
      {hasGeneration && (
        <div className="no-print sticky top-12 z-30 mb-5">
          {genBarOpen ? (
            <div
              className="bg-white/97 backdrop-blur-xl border rounded-2xl px-4 py-3.5 shadow-lg"
              style={{ borderColor: rgba(theme.primaryHex, 0.14), boxShadow: `0 16px 40px ${rgba(theme.primaryHex, 0.1)}, 0 4px 12px rgba(0,0,0,0.06)` }}
            >
              {/* Bar header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 rounded-full" style={{ background: `linear-gradient(180deg, ${theme.primaryHex}, ${theme.accentHex})` }} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: rgba(theme.primaryHex, 0.55) }}>
                    Geração de Imagens IA
                  </span>
                </div>
                {!imgGen.loadingKey && (
                  <button
                    type="button"
                    onClick={() => setGenBarOpen(false)}
                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition text-base leading-none"
                    title="Recolher"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rgba(theme.primaryHex, 0.4) }}>Provider:</span>
                  <select
                    value={imgGen.provider}
                    onChange={(e) => imgGen.setProvider(e.target.value as "dalle3" | "stability" | "ideogram" | "imagen")}
                    className="text-sm font-semibold border rounded-lg px-2 py-1.5 bg-gray-50 focus:ring-2 outline-none transition"
                    style={{ borderColor: rgba(theme.primaryHex, 0.15), outlineColor: rgba(theme.primaryHex, 0.3) }}
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

                <div className="flex items-center gap-3 border-l pl-3" style={{ borderColor: rgba(theme.primaryHex, 0.1) }}>
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
                    className="text-xs font-black px-4 py-2 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-px"
                    style={{ background: `linear-gradient(135deg, ${theme.primaryHex} 0%, ${theme.accentHex} 100%)`, boxShadow: `0 8px 24px ${rgba(theme.primaryHex, 0.35)}` }}
                  >
                    {imgGen.loadingKey ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                        </svg>
                        Gerando...
                      </span>
                    ) : "✦ Gerar Todos os Assets"}
                  </button>
                  {imgGen.loadingKey && (
                    <button
                      type="button"
                      onClick={() => imgGen.cancelBatch()}
                      className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-2 rounded-xl hover:bg-red-200 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {imgGen.error && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-xl text-xs flex items-center justify-between">
                  <span>{imgGen.error}</span>
                  <button onClick={() => imgGen.setError(null)} className="font-bold text-lg leading-none ml-3">&times;</button>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed pill */
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setGenBarOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all hover:-translate-y-px hover:shadow-md"
                style={{
                  borderColor: rgba(theme.primaryHex, 0.22),
                  color: theme.primaryHex,
                  background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${rgba(theme.primaryHex, 0.05)} 100%)`,
                  boxShadow: `0 4px 16px ${rgba(theme.primaryHex, 0.1)}`,
                }}
                title="Abrir painel de geração de imagens IA"
              >
                <span>✦</span>
                <span>IA</span>
                {imgGen.loadingKey && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.accentHex }} />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <section className="page-break mb-8 md:mb-9" id="sumario">
        <div
          className={immersive ? "bb-section-shell" : "rounded-[1.7rem] border px-3.5 py-4 md:px-5 md:py-5"}
          style={immersive ? undefined : defaultShellStyle}
        >
          {/* Sumário header */}
          {immersive ? (
            <div className="mb-5">
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
            <div className="mb-5 border-b pb-3" style={{ borderColor: rgba(theme.primaryHex, 0.08) }}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div
                    className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em]"
                    style={{ color: rgba(theme.primaryHex, 0.48), fontFamily: `'${theme.headingFont}', sans-serif` }}
                  >
                    Navegação editorial
                  </div>
                  <h2
                    className="text-[1.9rem] md:text-[2.3rem] font-black tracking-tight"
                    style={{ color: theme.primaryHex, fontFamily: `'${theme.headingFont}', sans-serif` }}
                  >
                    Sumário
                  </h2>
                  <p className="mt-1 text-sm md:text-[15px]" style={{ color: rgba(theme.primaryHex, 0.58) }}>
                    Navegue por categorias e vá direto à seção desejada.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-end">
                  {theme.allColors.slice(0, 5).map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: c,
                        border: `1px solid ${rgba(theme.primaryHex, 0.12)}`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 items-start">
            {byCategory.map((g) => (
              <div
                key={g.cat}
                className={`rounded-2xl p-4 shadow-sm ${
                  immersive ? "bb-sumario-card" : "border"
                }`}
                style={immersive ? undefined : defaultCardStyle}
              >
                {immersive && <div className="bb-sumario-mascot" aria-hidden="true" />}
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <h3
                    className={`text-[11px] font-extrabold uppercase tracking-[0.25em] ${
                      immersive ? "bb-sumario-cat" : ""
                    }`}
                    style={immersive ? undefined : { color: rgba(theme.primaryHex, 0.62), fontFamily: `'${theme.headingFont}', sans-serif` }}
                  >
                    {g.cat}
                  </h3>
                  {!immersive && (
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ background: rgba(theme.primaryHex, 0.05), color: rgba(theme.primaryHex, 0.52) }}
                    >
                      {String(g.items.length).padStart(2, "0")} seções
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {g.items.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block rounded-xl px-3 py-2 transition"
                      style={immersive ? undefined : { background: "transparent" }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`text-xs font-bold mt-0.5 tabular-nums ${
                            immersive ? "bb-num" : "text-gray-400"
                          }`}
                        >
                          {String(s.num).padStart(2, "0")}
                        </span>
                        <span className="font-semibold leading-snug" style={immersive ? undefined : { color: "#172033" }}>
                          {s.title}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
                {!immersive && (
                  <div className="mt-3 h-px" style={{ background: `linear-gradient(90deg, ${rgba(theme.primaryHex, 0.12)} 0%, transparent 100%)` }} />
                )}
              </div>
            ))}
          </div>

          {/* Brand identity watermark in sumário */}
          {immersive && (
            <div className="mt-5 flex items-center justify-between" style={{ opacity: 0.4 }}>
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
              <div className="page-break mb-5 mt-7">
                {immersive ? (
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
                ) : (
                  <div
                    className="rounded-[1.45rem] border px-4 py-4 md:px-5"
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, ${rgba(theme.accentHex, 0.08)} 100%)`,
                      borderColor: rgba(theme.primaryHex, 0.08),
                      boxShadow: `0 18px 52px ${rgba(theme.primaryHex, 0.07)}`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div
                          className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em]"
                          style={{ color: rgba(theme.primaryHex, 0.5), fontFamily: `'${theme.headingFont}', sans-serif` }}
                        >
                          {data.brandName}
                        </div>
                        <h2
                          className="text-[11px] font-extrabold uppercase tracking-[0.25em]"
                          style={{ color: theme.primaryHex }}
                        >
                          {g.cat}
                        </h2>
                      </div>
                      <a href="#sumario" className="no-print text-sm font-semibold" style={{ color: rgba(theme.primaryHex, 0.62) }}>
                        Voltar ao sumário
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="page-break mb-6 mt-8">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${theme.primaryHex} 0%, ${theme.accentHex} 100%)` }}
              >
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: rgba("#fff", 0.5) }}>
                      {data.brandName}
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white">{g.cat}</h2>
                  </div>
                  <a
                    href="#sumario"
                    className="no-print text-[11px] font-bold transition-opacity hover:opacity-100 px-3 py-1.5 rounded-lg border"
                    style={{ color: rgba("#fff", 0.6), borderColor: rgba("#fff", 0.2), background: rgba("#000", 0.12) }}
                  >
                    ↑ Sumário
                  </a>
                </div>
                {theme.allColors.length > 1 && (
                  <div className="flex h-1">
                    {theme.allColors.slice(0, 8).map((c, i) => (
                      <div key={i} style={{ flex: 1, background: c, opacity: 0.7 }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {g.items.map((s, sIdx) => {
            const quote = immersive ? brandVoiceQuote(s.id, data) : null;
            const showPatternBand = immersive && sIdx > 0 && sIdx % 2 === 0;
            const accentUrl = immersive ? getSectionAccentUrl(s.id) : null;
            const showAccent = immersive && !showPatternBand && sIdx > 0 && accentUrl;
            return (
              <div key={s.id} id={s.id} className="scroll-mt-24" data-reveal>
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

                <div
                  className={immersive ? "bb-section-shell" : "rounded-[1.6rem] border px-3.5 py-4 md:px-5 md:py-5"}
                  style={immersive ? undefined : defaultShellStyle}
                >
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
                    <div className="bb-voice mb-4 px-4 py-3 rounded-xl border">
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
