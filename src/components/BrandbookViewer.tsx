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
import { SectionComments } from "./SectionComments";
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
import { buildSectionDefs, CATEGORIES, CATEGORY_ICONS, CATEGORY_DESCRIPTIONS, DEFAULT_COLLAPSED_CATEGORIES } from "./brandbookViewerSections";

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
  "Estratégia": ["hero_visual", "hero_lifestyle"],
  "Linguagem & Tipografia": ["presentation_bg", "brand_pattern"],
  "Identidade Visual": ["brand_collateral", "logo_primary", "materials_board", "brand_pattern"],
  "Sistema Visual": ["hero_visual", "hero_lifestyle", "brand_pattern", "brand_mascot"],
  "Aplicações": ["app_mockup", "delivery_packaging", "business_card", "brand_collateral"],
  "Assets": ["outdoor_billboard", "presentation_bg"],
  "Para Devs & Designers": ["presentation_bg", "brand_pattern"],
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
  onUpdateAssetPack?: (updater: (prev: AssetPackState) => AssetPackState) => void;
  onUpdateColors?: (colors: Colors) => void;
  onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void;
  projectId?: string | null;
  shareToken?: string;
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
  onUpdateAssetPack,
  onUpdateColors,
  onUpdateData,
  projectId,
  shareToken,
}: Props) {
  const isAdvanced = !!data.uxPatterns;
  const hasGeneration = !!apiKeys && !!onAssetGenerated;

  const [immersive, setImmersive] = useState(false);
  const [immersiveGenerating, setImmersiveGenerating] = useState(false);
  const immersiveTriggered = useRef(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [genBarOpen, setGenBarOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(DEFAULT_COLLAPSED_CATEGORIES));
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const noop = () => {};
  const imgGen = useImageGeneration({
    data,
    generatedAssets,
    onAssetGenerated: onAssetGenerated ?? noop,
    onSaveToAssets,
    apiKeys: apiKeys ?? EMPTY_KEYS,
    uploadedAssets,
    promptProvider,
    projectId,
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
    onAssetGenerated,
    onGenerateAssetPack,
    onUpdateAssetPack,
    onUpdateApplicationImageKey,
    onUpdateColors,
    onUpdateData,
    uploadedAssets,
  });

  const sections = sectionDefs
    .filter((s) => s.when)
    .map((s, idx) => ({ ...s, num: idx + 1 }));

  // All sections by category (for Sumário — includes hidden for toggle UI)
  const allByCategory = CATEGORIES
    .map((cat) => ({
      cat,
      items: sections.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  // Visible sections by category (filtered by hiddenSections)
  const byCategory = allByCategory
    .map((g) => ({
      cat: g.cat,
      items: g.items.filter((s) => !hiddenSections.has(s.id)),
    }))
    .filter((g) => g.items.length > 0);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setHiddenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const toggleCategoryCollapse = useCallback((cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

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

    // Immediately reveal sections already in viewport (handles anchor-link navigation)
    els.forEach((el) => {
      if (el.classList.contains("revealed")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("revealed");
      }
    });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    // Only observe sections not yet revealed
    els.forEach((el) => { if (!el.classList.contains("revealed")) obs.observe(el); });
    return () => obs.disconnect();
  });

  // Track which section is currently in view for the mini-nav
  useEffect(() => {
    const sectionEls = sections.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (sectionEls.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSectionId(e.target.id);
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "-80px 0px -50% 0px" }
    );
    sectionEls.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

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
    background: `linear-gradient(180deg, #ffffff 0%, ${rgba(theme.primaryHex, 0.02)} 100%)`,
    borderColor: rgba(theme.primaryHex, 0.1),
    boxShadow: `0 20px 60px ${rgba(theme.primaryHex, 0.06)}, inset 3px 0 0 ${rgba(theme.primaryHex, 0.3)}`,
    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
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

      {/* Presentation Mode — Cinematic Overlay */}
      {presentationMode && (() => {
        const slide = sections[currentSlide];
        const progress = sections.length > 1 ? (currentSlide / (sections.length - 1)) * 100 : 100;
        return (
          <div className="bb-presentation-overlay" style={immersiveStyle}>
            {/* Progress bar at top */}
            <div
              className="bb-presentation-progress"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${theme.primaryHex}, ${theme.accentHex})` }}
            />

            {/* Slide content */}
            <div className="bb-presentation-slide" key={currentSlide}>
              {slide && slide.render(slide.num)}
            </div>

            {/* Controls */}
            <div className="bb-presentation-controls">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={exitPresentation}
                  className="text-[11px] font-bold text-white/30 hover:text-white/80 px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/20 bg-white/[0.03] transition-all"
                >
                  ESC
                </button>
                <div className="hidden sm:flex items-center gap-2.5">
                  <span className="text-[11px] font-black text-white/20 tabular-nums">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <div className="w-12 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: theme.accentHex }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white/10 tabular-nums">
                    {String(sections.length).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[11px] text-white/20 hidden md:block truncate max-w-[200px]">{slide?.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-white/10"
                  style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}>
                  {data.brandName}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((s) => Math.max(s - 1, 0))}
                    disabled={currentSlide === 0}
                    className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-xl disabled:opacity-15 transition-all bg-white/[0.02] hover:bg-white/[0.05]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((s) => Math.min(s + 1, sections.length - 1))}
                    disabled={currentSlide === sections.length - 1}
                    className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-xl disabled:opacity-15 transition-all bg-white/[0.02] hover:bg-white/[0.05]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Viewer Controls ─── */}
      <div className="no-print flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${theme.primaryHex}, ${theme.accentHex})` }} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: rgba(theme.primaryHex, 0.35) }}>
            {data.brandName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Ambientar Brandbook */}
          {immersive && hasGeneration && imgGen.currentProviderHasKey && imgGen.immersiveMissing > 0 && !immersiveGenerating && (
            <button
              type="button"
              onClick={async () => {
                setImmersiveGenerating(true);
                try { await imgGen.generateImmersiveAssets(); } finally { setImmersiveGenerating(false); }
              }}
              disabled={imgGen.loadingKey !== null}
              className="text-[11px] font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-all disabled:opacity-40"
            >
              Ambientar ({imgGen.immersiveMissing})
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
            className={`text-[11px] font-bold px-4 py-2.5 rounded-xl border transition-all duration-300 ${
              immersive
                ? "text-white shadow-lg"
                : "text-gray-600 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
            title="Aplica as cores e texturas da marca ao layout do brandbook"
            style={
              immersive
                ? {
                    background: `linear-gradient(135deg, ${theme.primaryHex} 0%, ${theme.accentHex} 100%)`,
                    borderColor: "transparent",
                    boxShadow: `0 8px 24px ${rgba(theme.primaryHex, 0.3)}`,
                  }
                : undefined
            }
          >
            {immersive ? "Imersivo Ativo" : "Modo Imersivo"}
          </button>
          <div className="no-print flex items-center rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                const allIds = sections.map(s => s.id);
                setCollapsedSections(new Set(allIds));
              }}
              className="text-[11px] font-bold px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-500 transition-all border-r border-gray-200"
              title="Recolher todas as seções"
            >
              Recolher tudo
            </button>
            <button
              type="button"
              onClick={() => setCollapsedSections(new Set())}
              className="text-[11px] font-bold px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-500 transition-all"
              title="Expandir todas as seções"
            >
              Expandir tudo
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setCurrentSlide(0); setPresentationMode(true); }}
            className="text-[11px] font-bold px-4 py-2.5 rounded-xl border transition-all duration-300 bg-gray-900 hover:bg-gray-800 text-white border-gray-900 hover:shadow-lg"
            title="Apresentação fullscreen do brandbook — navegue com setas"
          >
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841z" />
              </svg>
              Apresentar
            </span>
          </button>
        </div>
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

      {/* Floating mini-nav — desktop only */}
      <nav className="no-print hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40 max-h-[70vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-0.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm px-1.5 py-2">
          {byCategory.map((g) => {
            const isActive = g.items.some(s => s.id === activeSectionId);
            const catIcon = CATEGORY_ICONS[g.cat as keyof typeof CATEGORY_ICONS] ?? "";
            return (
              <a
                key={g.cat}
                href={`#${g.items[0].id}`}
                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "text-gray-900 bg-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
                }`}
                title={g.cat}
              >
                <span className="text-xs">{catIcon}</span>
                {g.cat}
              </a>
            );
          })}
        </div>
      </nav>

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
            {allByCategory.map((g) => {
              const isCollapsed = collapsedCategories.has(g.cat);
              const visibleCount = g.items.filter(s => !hiddenSections.has(s.id)).length;
              const catIcon = CATEGORY_ICONS[g.cat as keyof typeof CATEGORY_ICONS] ?? "";
              const catDesc = CATEGORY_DESCRIPTIONS[g.cat as keyof typeof CATEGORY_DESCRIPTIONS] ?? "";
              return (
              <div
                key={g.cat}
                className={`rounded-2xl p-4 shadow-sm ${
                  immersive ? "bb-sumario-card" : "border"
                }`}
                style={immersive ? undefined : defaultCardStyle}
              >
                {immersive && <div className="bb-sumario-mascot" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapse(g.cat)}
                  className="w-full text-left mb-2.5 flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm flex-shrink-0">{catIcon}</span>
                    <div className="min-w-0">
                      <h3
                        className={`text-[11px] font-extrabold uppercase tracking-[0.25em] ${
                          immersive ? "bb-sumario-cat" : ""
                        }`}
                        style={immersive ? undefined : { color: rgba(theme.primaryHex, 0.62), fontFamily: `'${theme.headingFont}', sans-serif` }}
                      >
                        {g.cat}
                      </h3>
                      {!immersive && (
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{catDesc}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!immersive && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
                        style={{ background: rgba(theme.primaryHex, 0.05), color: rgba(theme.primaryHex, 0.52) }}
                      >
                        {visibleCount}/{g.items.length}
                      </span>
                    )}
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>
                {!isCollapsed && (
                <div className="space-y-1">
                  {g.items.map((s) => {
                    const isHidden = hiddenSections.has(s.id);
                    const isActive = activeSectionId === s.id;
                    return (
                    <div
                      key={s.id}
                      className={`group/item flex items-center gap-1 rounded-xl transition ${
                        isHidden ? "opacity-40" : ""
                      }`}
                      style={isActive && !isHidden ? { background: rgba(theme.primaryHex, 0.06), boxShadow: `inset 0 0 0 1px ${rgba(theme.primaryHex, 0.15)}` } : undefined}
                    >
                      <a
                        href={isHidden ? undefined : `#${s.id}`}
                        className={`flex-1 flex items-start gap-3 rounded-xl px-3 py-2 transition min-w-0 ${
                          isHidden ? "cursor-default" : immersive ? "" : "hover:bg-gray-50"
                        }`}
                        onClick={isHidden ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                      >
                        <span
                          className={`text-xs font-bold mt-0.5 tabular-nums flex-shrink-0 ${
                            immersive ? "bb-num" : isActive ? "" : "text-gray-400"
                          }`}
                          style={isActive && !immersive ? { color: theme.primaryHex } : undefined}
                        >
                          {String(s.num).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-semibold leading-snug ${isHidden ? "line-through" : ""}`}
                          style={immersive ? undefined : { color: isActive ? theme.primaryHex : "#172033" }}
                        >
                          {s.title}
                        </span>
                      </a>
                      {/* Quick action: toggle visibility */}
                      <button
                        type="button"
                        onClick={() => toggleSectionVisibility(s.id)}
                        className="no-print opacity-0 group-hover/item:opacity-100 flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                        title={isHidden ? "Mostrar seção" : "Esconder seção"}
                      >
                        {isHidden ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        )}
                      </button>
                    </div>
                    );
                  })}
                </div>
                )}
                {!immersive && !isCollapsed && (
                  <div className="mt-3 h-px" style={{ background: `linear-gradient(90deg, ${rgba(theme.primaryHex, 0.12)} 0%, transparent 100%)` }} />
                )}
              </div>
              );
            })}
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
              {/* Breathing moment — editorial rhythm divider */}
              <div className="relative py-12 sm:py-16 my-8 sm:my-12 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px section-divider-gradient" style={{ "--divider-color": "rgba(0,0,0,0.08)" } as React.CSSProperties} />
                <div className="text-center">
                  <span className="section-watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {catIdx + 1}
                  </span>
                  <h2 className="relative text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                    {g.cat}
                  </h2>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px section-divider-gradient" style={{ "--divider-color": "rgba(0,0,0,0.08)" } as React.CSSProperties} />
              </div>

              <div className="page-break mb-5 mt-2">
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
                    className="rounded-[1.45rem] border px-5 py-5 md:px-6"
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
            <div className="page-break mb-6 mt-10">
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{ background: `linear-gradient(135deg, ${theme.primaryHex} 0%, ${theme.accentHex} 100%)` }}
              >
                {/* Subtle pattern overlay on category banner */}
                <div className="absolute inset-0 opacity-[0.06]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} aria-hidden="true" />
                <div className="px-6 py-5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{CATEGORY_ICONS[g.cat as keyof typeof CATEGORY_ICONS] ?? ""}</span>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: rgba("#fff", 0.55) }}>
                        {data.brandName}
                      </div>
                      <h2 className="text-base font-black uppercase tracking-[0.18em] text-white">{g.cat}</h2>
                      {CATEGORY_DESCRIPTIONS[g.cat] && (
                        <p className="text-xs mt-1 font-medium" style={{ color: rgba("#fff", 0.6) }}>
                          {CATEGORY_DESCRIPTIONS[g.cat]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: rgba("#fff", 0.15), color: rgba("#fff", 0.8) }}>
                      {g.items.length} {g.items.length === 1 ? "seção" : "seções"}
                    </span>
                    <a
                      href="#sumario"
                      className="no-print text-[11px] font-bold transition-opacity hover:opacity-100 px-3 py-1.5 rounded-lg border"
                      style={{ color: rgba("#fff", 0.6), borderColor: rgba("#fff", 0.2), background: rgba("#000", 0.12) }}
                    >
                      ↑ Sumário
                    </a>
                  </div>
                </div>
                {/* Color strip under category banner */}
                <div className="flex h-1.5">
                  {theme.allColors.slice(0, 8).map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c, opacity: 0.85 }} />
                  ))}
                  {theme.allColors.length <= 1 && (
                    <div style={{ flex: 1, background: rgba("#fff", 0.2) }} />
                  )}
                </div>
              </div>
            </div>
          )}
          {g.items.map((s, sIdx) => {
            const quote = immersive ? brandVoiceQuote(s.id, data) : null;
            const showPatternBand = immersive && sIdx > 0 && sIdx % 2 === 0;
            const accentUrl = immersive ? getSectionAccentUrl(s.id) : null;
            const showAccent = immersive && !showPatternBand && sIdx > 0 && accentUrl;
            const isSectionCollapsed = collapsedSections.has(s.id);
            const sectionCatIcon = CATEGORY_ICONS[g.cat as keyof typeof CATEGORY_ICONS] ?? "";
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
                  {/* Collapsible section header bar */}
                  <div className={`no-print flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition w-full cursor-pointer ${isSectionCollapsed ? "rounded-[1.6rem]" : "rounded-t-[1.6rem]"}`}
                    onClick={() => toggleSectionCollapse(s.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className="bb-section-num"
                        style={{ background: immersive ? undefined : `linear-gradient(135deg, ${theme.primaryHex}, ${theme.accentHex})` }}
                      >
                        {String(s.num).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-sm font-bold truncate block"
                          style={{ color: immersive ? "inherit" : "#111827" }}
                        >
                          {s.title}
                        </span>
                        {isSectionCollapsed && (
                          <span className="text-xs text-gray-400 truncate block mt-0.5">
                            Clique para expandir
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {shareToken && (
                        <SectionComments
                          shareToken={shareToken}
                          section={s.id}
                          sectionLabel={s.title}
                        />
                      )}
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`text-gray-400 transition-transform duration-300 ${isSectionCollapsed ? "-rotate-90" : "rotate-0"}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {!isSectionCollapsed && (
                    <>
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
                    </>
                  )}
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

      {/* Non-immersive footer */}
      {!immersive && (
        <div className="no-print mt-12 mb-6 text-center" data-reveal>
          <div className="inline-flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span>{data.brandName}</span>
            <span>·</span>
            <span>Manual de Identidade Visual</span>
            <span>·</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
