"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { BrandbookData, UploadedAsset, GeneratedAsset, ImageProvider } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";
import { EditableField } from "@/components/EditableField";
import { downloadImageUrl } from "@/lib/imageTransport";
import { downloadJsonFile } from "@/lib/browserDownload";
import { PerImageProviderSelect } from "@/components/PerImageProviderSelect";
import { AssetUploadButton, DuplicateAssetButton } from "@/components/AssetUploadButton";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  uploadedAssets?: UploadedAsset[];
  onGenerate?: (key: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string; providerOverride?: ImageProvider }) => void | Promise<void>;
  onUploadForKey?: (key: AssetKey, file: File) => void | Promise<void>;
  onDuplicateAsset?: (sourceKey: AssetKey, targetKey: AssetKey) => void;
  loadingKey?: string | null;
  onDownload?: (url: string, name: string) => void;
  onSaveToAssets?: (asset: GeneratedAsset, label: string, key?: AssetKey) => void;
  generatedAssets?: Record<string, GeneratedAsset>;
  onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void;
}

interface CardBriefing {
  instruction: string;
  referenceImages: string[];
  referenceLinks: string[];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function LogoCard({
  title,
  image,
  placeholderText,
  bgClass,
  assetKey,
  onGenerate,
  isLoading,
  generated,
  onDownload,
  onSaveToAssets,
  onPreview,
  brandName,
}: {
  title: string;
  image: string | null;
  placeholderText: string;
  bgClass: string;
  assetKey?: AssetKey;
  onGenerate?: (key: AssetKey, opts?: { providerOverride?: ImageProvider }) => void;
  isLoading?: boolean;
  generated?: GeneratedAsset | null;
  onDownload?: (url: string, name: string) => void;
  onSaveToAssets?: (asset: GeneratedAsset, label: string, key?: AssetKey) => void;
  onPreview?: (url: string, title: string) => void;
  brandName?: string;
}) {
  const [providerOverride, setProviderOverride] = useState<ImageProvider | null>(null);
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm group">
      <div className="px-5 py-4 bg-gray-50 border-b flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        {generated && onDownload && assetKey && (
          <div className="no-print flex gap-1">
            <button
              onClick={() => onDownload(generated.url, assetKey)}
              className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
            >
              ↓
            </button>
            {onSaveToAssets && (
              <button
                onClick={() => onSaveToAssets(generated, title, assetKey)}
                className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
              >
                Salvar
              </button>
            )}
            <button
              onClick={() => downloadJsonFile(generated, `${brandName ?? "brand"}-${assetKey}-spec.json`)}
              className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
              title="Exportar especificação de geração"
            >
              JSON
            </button>
          </div>
        )}
      </div>
      {image ? (
        <div className={`${bgClass} p-5 flex items-center justify-center h-44 relative`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="max-h-full object-contain rounded" />
          {generated && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && (onPreview || onDownload) && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {onPreview && (
                <button
                  type="button"
                  onClick={() => onPreview(image, title)}
                  className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition"
                >
                  Visualizar
                </button>
              )}
              {onDownload && assetKey && (
                <button
                  type="button"
                  onClick={() => onDownload(image, assetKey)}
                  className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition"
                >
                  Baixar
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 relative">
          {isLoading ? (
            <>
              <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-xs font-medium">Gerando...</span>
            </>
          ) : (
            <>
              <span className="text-4xl">✦</span>
              <span className="text-xs font-medium text-center px-4">{placeholderText}</span>
              {onGenerate && assetKey && (
                <div className="flex flex-col items-center gap-2 mt-1">
                  <PerImageProviderSelect value={providerOverride} onChange={setProviderOverride} />
                  <button
                    onClick={() => onGenerate(assetKey, providerOverride ? { providerOverride } : undefined)}
                    className="no-print text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg transition-all"
                  >
                    ✦ Gerar com IA
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {image && onGenerate && assetKey && !isLoading && (
        <div className="no-print px-5 py-2 border-t bg-gray-50 flex items-center justify-between gap-2">
          <PerImageProviderSelect value={providerOverride} onChange={setProviderOverride} />
          <button
            onClick={() => onGenerate(assetKey, providerOverride ? { providerOverride } : undefined)}
            className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 transition"
          >
            ↺ Regerar
          </button>
        </div>
      )}
    </div>
  );
}

function isUrl(s: string): boolean {
  return /^https?:\/\//.test(s) || s.startsWith("data:");
}

function textOrNull(s: string | undefined): string | null {
  if (!s) return null;
  if (isUrl(s)) return null;
  return s;
}

function downloadImageDirect(url: string, name: string) {
  downloadImageUrl(url, name).catch(() => {
    window.open(url, "_blank");
  });
}

export function SectionLogo({ data, num, generatedImages = {}, uploadedAssets = [], onGenerate, onUploadForKey, onDuplicateAsset, loadingKey, onDownload, onSaveToAssets, generatedAssets = {}, onUpdateData }: Props) {
  const uploadedLogos = useMemo(
    () => uploadedAssets.filter((a) => a.type === "logo"),
    [uploadedAssets]
  );
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [briefings, setBriefings] = useState<Record<string, CardBriefing>>({});
  const [expandedBriefing, setExpandedBriefing] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [sectionGenerating, setSectionGenerating] = useState(false);

  useEffect(() => {
    if (!previewImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImage]);

  const getBriefing = useCallback((key: string): CardBriefing => {
    return briefings[key] ?? { instruction: "", referenceImages: [], referenceLinks: [] };
  }, [briefings]);

  const updateBriefing = useCallback((key: string, patch: Partial<CardBriefing>) => {
    setBriefings((prev) => ({ ...prev, [key]: { ...getBriefing(key), ...patch } }));
  }, [getBriefing]);

  const handleAddRefImages = useCallback(async (key: string, files: FileList) => {
    const existing = getBriefing(key).referenceImages;
    const newImages: string[] = [];
    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      if (!file.type.startsWith("image/")) continue;
      try { newImages.push(await fileToDataUrl(file)); } catch { /* skip */ }
    }
    updateBriefing(key, { referenceImages: [...existing, ...newImages].slice(0, 10) });
  }, [getBriefing, updateBriefing]);

  const handleRemoveRefImage = useCallback((key: string, idx: number) => {
    const imgs = [...getBriefing(key).referenceImages];
    imgs.splice(idx, 1);
    updateBriefing(key, { referenceImages: imgs });
  }, [getBriefing, updateBriefing]);

  const handleAddLink = useCallback((key: string) => {
    const url = (linkInput[key] ?? "").trim();
    if (!url) return;
    updateBriefing(key, { referenceLinks: [...getBriefing(key).referenceLinks, url] });
    setLinkInput((prev) => ({ ...prev, [key]: "" }));
  }, [getBriefing, updateBriefing, linkInput]);

  const handleRemoveLink = useCallback((key: string, idx: number) => {
    const links = [...getBriefing(key).referenceLinks];
    links.splice(idx, 1);
    updateBriefing(key, { referenceLinks: links });
  }, [getBriefing, updateBriefing]);

  const handleGenerateWithDirection = useCallback(async (assetKey: AssetKey) => {
    if (!onGenerate) return;
    const b = getBriefing(assetKey);
    const parts: string[] = [];
    if (b.instruction.trim()) parts.push(b.instruction.trim());
    if (b.referenceLinks.length > 0) parts.push(`Reference links: ${b.referenceLinks.join(", ")}`);
    const customInstruction = parts.length > 0 ? parts.join(". ") : undefined;
    const refs = b.referenceImages.length > 0 ? b.referenceImages : undefined;
    await onGenerate(assetKey, { customInstruction, userReferenceImages: refs });
  }, [onGenerate, getBriefing]);

  const handleGenerateSection = useCallback(async () => {
    if (!onGenerate) return;
    if (sectionGenerating) return;
    setSectionGenerating(true);
    try {
      // Always generate both — regeneration replaces existing
      await handleGenerateWithDirection("logo_primary");
      await handleGenerateWithDirection("logo_dark_bg");
    } finally {
      setSectionGenerating(false);
    }
  }, [onGenerate, sectionGenerating, handleGenerateWithDirection]);

  // ═══ COLOR HARMONY ENGINE ═══
  // Calculates optimal logo color scheme for each brand background
  const colorHarmonyMap = useMemo(() => {
    const getLum = (hex: string) => {
      const h = hex.replace("#", "");
      const r = parseInt(h.slice(0, 2), 16) / 255;
      const g = parseInt(h.slice(2, 4), 16) / 255;
      const b = parseInt(h.slice(4, 6), 16) / 255;
      const toL = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return 0.2126 * toL(r) + 0.7152 * toL(g) + 0.0722 * toL(b);
    };
    const contrast = (a: string, b: string) => {
      const l1 = getLum(a), l2 = getLum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const isDark = (hex: string) => getLum(hex) < 0.35;

    const allBrandColors = [...data.colors.primary, ...data.colors.secondary];
    const backgrounds = [
      { name: "Branco", hex: "#ffffff" },
      { name: "Preto", hex: "#0a0a0a" },
      ...allBrandColors.slice(0, 6).map(c => ({ name: c.name, hex: c.hex })),
    ];

    // For each background, find the best 2 brand colors for symbol + wordmark
    return backgrounds.map(bg => {
      const bgDark = isDark(bg.hex);

      // Rank all brand colors by contrast against this background
      const ranked = allBrandColors
        .map(c => ({ ...c, contrast: contrast(bg.hex, c.hex) }))
        .sort((a, b) => b.contrast - a.contrast);

      // Best for symbol: highest contrast brand color
      const symbolColor = ranked[0] ?? { name: "Branco", hex: "#ffffff", rgb: "", cmyk: "", contrast: 21 };
      // Best for wordmark: second highest, or white/black if needed
      let wordmarkColor: { name: string; hex: string; contrast: number } = ranked[1] ?? symbolColor;

      // If contrast is too low, use white or black
      if (wordmarkColor.contrast < 3) {
        wordmarkColor = bgDark
          ? { name: "Branco", hex: "#ffffff", contrast: contrast(bg.hex, "#ffffff") }
          : { name: "Preto", hex: "#111111", contrast: contrast(bg.hex, "#111111") };
      }

      const overallContrast = Math.min(symbolColor.contrast, wordmarkColor.contrast);
      const quality = overallContrast >= 7 ? "AAA" : overallContrast >= 4.5 ? "AA" : overallContrast >= 3 ? "A" : "Baixo";

      return {
        bg,
        bgDark,
        symbolColor: { name: symbolColor.name, hex: symbolColor.hex },
        wordmarkColor: { name: wordmarkColor.name, hex: wordmarkColor.hex },
        quality,
        useInvertedLogo: bgDark,
        contrastRatio: overallContrast,
      };
    });
  }, [data.colors]);

  const logoPrimary = generatedImages["logo_primary"] || uploadedLogos[0]?.dataUrl || null;
  const logoDarkBg = generatedImages["logo_dark_bg"] || uploadedLogos[1]?.dataUrl || null;
  const hasGeneratedLogoAssets = !!generatedAssets["logo_primary"] || !!generatedAssets["logo_dark_bg"];

  const secondaryText = textOrNull(data.logo.secondary);
  const symbolText = textOrNull(data.logo.symbol);

  const variants = data.logoVariants;
  const variantEntries: { label: string; key: string; desc?: string }[] = [];
  if (variants?.horizontal && !isUrl(variants.horizontal)) variantEntries.push({ label: "Horizontal", key: "horizontal", desc: variants.horizontal });
  if (variants?.stacked && !isUrl(variants.stacked)) variantEntries.push({ label: "Stacked (Vertical)", key: "stacked", desc: variants.stacked });
  if (variants?.mono && !isUrl(variants.mono)) variantEntries.push({ label: "Monocromático", key: "mono", desc: variants.mono });
  if (variants?.negative && !isUrl(variants.negative)) variantEntries.push({ label: "Negativo", key: "negative", desc: variants.negative });
  if (variants?.markOnly && !isUrl(variants.markOnly)) variantEntries.push({ label: "Símbolo (Mark Only)", key: "markOnly", desc: variants.markOnly });
  if (variants?.wordmarkOnly && !isUrl(variants.wordmarkOnly)) variantEntries.push({ label: "Wordmark Only", key: "wordmarkOnly", desc: variants.wordmarkOnly });

  function renderBriefingPanel(assetKey: AssetKey) {
    if (!onGenerate) return null;
    const briefing = getBriefing(assetKey);
    const isExpanded = expandedBriefing === assetKey;
    return (
      <div className="no-print border-t px-5 py-2 bg-gray-50 space-y-2">
        <button
          type="button"
          onClick={() => setExpandedBriefing(isExpanded ? null : assetKey)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition"
        >
          <span>Direcionamento criativo</span>
          <span className="text-base leading-none">{isExpanded ? "−" : "+"}</span>
        </button>
        {isExpanded && (
          <div className="space-y-3 bg-white rounded-lg p-3 border">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Como você espera este logo?
              </label>
              <textarea
                value={briefing.instruction}
                onChange={(e) => updateBriefing(assetKey, { instruction: e.target.value })}
                placeholder="Ex: Quero um logo minimalista com traços finos, inspirado em lettering japonês..."
                rows={3}
                className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Fotos de referência
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {briefing.referenceImages.map((img, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border bg-white group/thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveRefImage(assetKey, idx)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition"
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[assetKey]?.click()}
                  className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-600 transition"
                >
                  <span className="text-lg leading-none">+</span>
                </button>
                <input
                  ref={(el) => { fileInputRefs.current[assetKey] = el; }}
                  type="file"
                  accept="image/*"
                  multiple
                  aria-label="Adicionar fotos de referência"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleAddRefImages(assetKey, e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Links de referência
              </label>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={linkInput[assetKey] ?? ""}
                  onChange={(e) => setLinkInput((prev) => ({ ...prev, [assetKey]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLink(assetKey); } }}
                  placeholder="https://..."
                  className="flex-1 bg-gray-50 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <button
                  type="button"
                  onClick={() => handleAddLink(assetKey)}
                  className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                >
                  +
                </button>
              </div>
              {briefing.referenceLinks.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {briefing.referenceLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-gray-50 border rounded px-2 py-1">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 truncate flex-1 hover:underline">{link}</a>
                      <button type="button" onClick={() => handleRemoveLink(assetKey, idx)} className="text-red-500 text-[10px] font-bold hover:text-red-700">x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleGenerateWithDirection(assetKey)}
                disabled={loadingKey !== null}
                className="flex-1 text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loadingKey === assetKey ? "Gerando..." : "✦ Gerar com direcionamento"}
              </button>
              {onUploadForKey && (
                <AssetUploadButton
                  assetKey={assetKey}
                  onUpload={onUploadForKey}
                  loading={loadingKey === assetKey}
                  isOfficial={generatedAssets[assetKey]?.provider === "upload"}
                  compact
                />
              )}
              {onDuplicateAsset && generatedAssets[assetKey] && (
                <DuplicateAssetButton sourceKey={assetKey} onDuplicate={onDuplicateAsset} compact />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="page-break mb-6">
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {String(num).padStart(2, "0")}. Logo &amp; Identidade Visual
        </h2>
        {onGenerate && (
          <button
            type="button"
            onClick={handleGenerateSection}
            disabled={loadingKey !== null || sectionGenerating}
            className="no-print flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {sectionGenerating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{hasGeneratedLogoAssets ? "↻" : "✦"}</span>
            )}
            {hasGeneratedLogoAssets ? "Regenerar seção" : "Gerar seção"}
          </button>
        )}
      </div>

      {/* Single generate button */}
      {onGenerate && !logoPrimary && (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 flex flex-col items-center gap-4">
          <div className="text-4xl">✦</div>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Gere a logo principal e a versão invertida com um clique.<br/>
            As cores serão automaticamente adaptadas para cada fundo da paleta.
          </p>
          <button
            type="button"
            onClick={handleGenerateSection}
            disabled={loadingKey !== null || sectionGenerating}
            className="inline-flex items-center gap-2 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #111827 0%, #3730a3 100%)" }}
          >
            {sectionGenerating ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gerando...</>
            ) : (
              <>✦ Gerar Logo (clara + invertida)</>
            )}
          </button>
        </div>
      )}

      {/* Main logo images — side by side */}
      {(logoPrimary || logoDarkBg) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6 items-start">
        {/* Logo Principal */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="font-bold text-sm">Logo Principal</h3>
            <div className="no-print flex gap-1">
              {onGenerate && (
                <button
                  type="button"
                  onClick={() => handleGenerateWithDirection("logo_primary")}
                  disabled={loadingKey !== null}
                  className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition disabled:opacity-40"
                >
                  {loadingKey === "logo_primary" ? "..." : "↺ Regerar"}
                </button>
              )}
              {logoPrimary && onDownload && (
                <button onClick={() => onDownload(logoPrimary, "logo_primary")} className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition">↓</button>
              )}
            </div>
          </div>
          <div className="bg-white p-6 flex items-center justify-center h-48 relative">
            {logoPrimary ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPrimary} alt="Logo Principal" className="max-h-full max-w-full object-contain" />
                {loadingKey === "logo_primary" && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-300 text-sm">Ainda não gerada</span>
            )}
          </div>
        </div>

        {/* Logo Invertida */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="font-bold text-sm">Logo Invertida</h3>
            <div className="no-print flex gap-1">
              {onGenerate && (
                <button
                  type="button"
                  onClick={() => handleGenerateWithDirection("logo_dark_bg")}
                  disabled={loadingKey !== null}
                  className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition disabled:opacity-40"
                >
                  {loadingKey === "logo_dark_bg" ? "..." : "↺ Regerar"}
                </button>
              )}
              {logoDarkBg && onDownload && (
                <button onClick={() => onDownload(logoDarkBg, "logo_dark_bg")} className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition">↓</button>
              )}
            </div>
          </div>
          <div className="bg-gray-900 p-6 flex items-center justify-center h-48 relative">
            {logoDarkBg ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoDarkBg} alt="Logo Invertida" className="max-h-full max-w-full object-contain" />
                {loadingKey === "logo_dark_bg" && (
                  <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </>
            ) : logoPrimary ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPrimary} alt="Logo (invertida via CSS)" className="max-h-full max-w-full object-contain" style={{ filter: "invert(1) brightness(1.1)" }} />
                <span className="absolute bottom-2 right-2 text-[8px] text-white/40 font-bold">CSS preview</span>
              </>
            ) : (
              <span className="text-white/30 text-sm">Ainda não gerada</span>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Multi-background logo preview — full palette harmony system */}
      {logoPrimary && (() => {
        const darkBgLogo = logoDarkBg;

        const getLuminance = (hex: string) => {
          const h = hex.replace("#", "");
          const r = parseInt(h.slice(0, 2), 16) / 255;
          const g = parseInt(h.slice(2, 4), 16) / 255;
          const b = parseInt(h.slice(4, 6), 16) / 255;
          const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
        };
        const isDark = (hex: string) => getLuminance(hex) < 0.35;
        const contrastRatio = (bg: string, fg: string) => {
          const l1 = getLuminance(bg);
          const l2 = getLuminance(fg);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        };
        const harmonyLabel = (ratio: number) => {
          if (ratio >= 7) return { text: "AAA", color: "text-emerald-600", bg: "bg-emerald-50" };
          if (ratio >= 4.5) return { text: "AA", color: "text-emerald-600", bg: "bg-emerald-50" };
          if (ratio >= 3) return { text: "A", color: "text-amber-600", bg: "bg-amber-50" };
          return { text: "Baixo", color: "text-red-500", bg: "bg-red-50" };
        };

        return (
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Especificação de Cores por Fundo</h3>
          <p className="text-[11px] text-gray-400 mb-4">
            A mesma logo, com as cores da marca redistribuídas para harmonia máxima em cada fundo.
          </p>

          {/* Visual preview grid — same logo, CSS-adapted per background */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
            {colorHarmonyMap.map((entry) => {
              const logoSrc = entry.bgDark ? (darkBgLogo || logoPrimary) : logoPrimary;
              const needsInvert = entry.bgDark && !darkBgLogo;
              const qualityStyle = entry.quality === "AAA" || entry.quality === "AA"
                ? "bg-emerald-50 text-emerald-700"
                : entry.quality === "A" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600";

              return (
              <div key={entry.bg.hex} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Preview */}
                <div className="flex items-center justify-center p-4 h-24" style={{ backgroundColor: entry.bg.hex }}>
                  {logoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={logoSrc}
                      alt={`Logo em ${entry.bg.name}`}
                      className="max-h-12 max-w-[75%] object-contain"
                      style={needsInvert ? { filter: "invert(1) brightness(1.1)", opacity: 0.85 } : undefined}
                    />
                  ) : (
                    <span className={`text-[10px] font-bold ${entry.bgDark ? "text-white/30" : "text-gray-300"}`}>Gere a logo primeiro</span>
                  )}
                </div>
                {/* Color spec */}
                <div className="px-3 py-2 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-700 truncate">{entry.bg.name}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${qualityStyle}`}>{entry.quality}</span>
                  </div>
                  {/* Recommended colors for this background */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400">Símbolo:</span>
                    <div className="w-3 h-3 rounded-sm border border-gray-200" style={{ backgroundColor: entry.symbolColor.hex }} />
                    <span className="text-[9px] font-mono text-gray-500">{entry.symbolColor.hex}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-400">Texto:</span>
                    <div className="w-3 h-3 rounded-sm border border-gray-200" style={{ backgroundColor: entry.wordmarkColor.hex }} />
                    <span className="text-[9px] font-mono text-gray-500">{entry.wordmarkColor.hex}</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Color specification table — for designers */}
          <details className="group/spec">
            <summary className="cursor-pointer select-none flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open/spec:rotate-90"><polyline points="9 18 15 12 9 6"/></svg>
              Tabela técnica de cores (para designers)
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 font-semibold text-gray-500">Fundo</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Hex</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Cor do Símbolo</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Cor do Texto</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Contraste</th>
                    <th className="text-left py-2 pl-3 font-semibold text-gray-500">WCAG</th>
                  </tr>
                </thead>
                <tbody>
                  {colorHarmonyMap.map((entry) => (
                    <tr key={entry.bg.hex} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: entry.bg.hex }} />
                          <span className="font-medium text-gray-800">{entry.bg.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-gray-400">{entry.bg.hex}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm border border-gray-200" style={{ backgroundColor: entry.symbolColor.hex }} />
                          <span className="font-mono">{entry.symbolColor.hex}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm border border-gray-200" style={{ backgroundColor: entry.wordmarkColor.hex }} />
                          <span className="font-mono">{entry.wordmarkColor.hex}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono">{entry.contrastRatio.toFixed(1)}:1</td>
                      <td className="py-2 pl-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          entry.quality === "AAA" || entry.quality === "AA" ? "bg-emerald-50 text-emerald-700" :
                          entry.quality === "A" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
                        }`}>{entry.quality}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
        );
      })()}

      {/* Protection zone diagram */}
      {data.logo.clearSpace && (
        <div className="mb-6 bg-gray-50 border rounded-[1.2rem] p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Zona de Proteção (Clear Space)</h3>
          <div className="flex items-center justify-center">
            <div className="relative inline-flex items-center justify-center">
              {/* outer dashed zone */}
              <div className="border-2 border-dashed border-indigo-300 rounded p-7 bg-white shadow-sm">
                {/* inner logo area */}
                <div className="border border-gray-200 bg-gray-100 rounded px-10 py-5 flex items-center justify-center min-w-[100px]">
                  {logoPrimary
                    ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoPrimary} alt="logo" className="max-h-10 object-contain opacity-70" />
                    : <span className="text-gray-400 font-bold text-xs">LOGO</span>
                  }
                </div>
                {/* arrows */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                  <span className="text-indigo-400 text-[9px] font-mono">↕</span>
                </div>
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                  <span className="text-indigo-400 text-[9px] font-mono">↔</span>
                </div>
              </div>
              {/* label */}
              <div className="absolute -bottom-5 left-0 right-0 text-center text-[10px] text-indigo-500 font-semibold">
                {data.logo.clearSpace}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logo description cards */}
      {(secondaryText || symbolText) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">
          {secondaryText && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <h4 className="font-bold text-gray-900">Logo Secundário</h4>
              </div>
              <EditableField
                value={secondaryText}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, secondary: val } }))}
                className="text-gray-600 text-sm leading-relaxed"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
          {symbolText && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">◆</span>
                <h4 className="font-bold text-gray-900">Símbolo / Ícone</h4>
              </div>
              <EditableField
                value={symbolText}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, symbol: val } }))}
                className="text-gray-600 text-sm leading-relaxed"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
        </div>
      )}

      {/* Symbol Concept */}
      {data.logo.symbolConcept && (
        <div className="mb-6 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-[1.2rem] p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className="w-7 h-7 bg-indigo-600 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">&#9830;</span>
            <h3 className="font-bold text-indigo-900">Conceito do Simbolo</h3>
          </div>
          <EditableField
            value={data.logo.symbolConcept}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, symbolConcept: val } }))}
            className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap"
            readOnly={!onUpdateData}
            multiline
          />
        </div>
      )}

      {/* Semiotic Analysis & Shape Psychology */}
      {(data.logo.semioticAnalysis || data.logo.shapePsychology || data.logo.negativeSpaceMetaphor || data.logo.evolutionaryStage) && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {data.logo.semioticAnalysis && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-violet-100 text-violet-600 rounded flex items-center justify-center text-[10px] font-bold">S</span>
                Analise Semiotica
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-700">Natureza: </span>
                  <EditableField
                    value={data.logo.semioticAnalysis.natureOfSymbol}
                    onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, semioticAnalysis: { ...prev.logo.semioticAnalysis!, natureOfSymbol: val as "Icon" | "Index" | "Symbol" } } }))}
                    className="inline"
                    readOnly={!onUpdateData}
                  />
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Denotacao: </span>
                  <EditableField
                    value={data.logo.semioticAnalysis.denotation}
                    onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, semioticAnalysis: { ...prev.logo.semioticAnalysis!, denotation: val } } }))}
                    className="inline"
                    readOnly={!onUpdateData}
                    multiline
                  />
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Conotacao: </span>
                  <EditableField
                    value={data.logo.semioticAnalysis.connotation}
                    onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, semioticAnalysis: { ...prev.logo.semioticAnalysis!, connotation: val } } }))}
                    className="inline"
                    readOnly={!onUpdateData}
                    multiline
                  />
                </div>
              </div>
            </div>
          )}
          {data.logo.shapePsychology && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded flex items-center justify-center text-[10px] font-bold">P</span>
                Psicologia das Formas
              </h4>
              <EditableField
                value={data.logo.shapePsychology}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, shapePsychology: val } }))}
                className="text-gray-600 text-sm leading-relaxed"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
          {data.logo.negativeSpaceMetaphor && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-[10px] font-bold">N</span>
                Metafora do Espaco Negativo
              </h4>
              <EditableField
                value={data.logo.negativeSpaceMetaphor}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, negativeSpaceMetaphor: val } }))}
                className="text-gray-600 text-sm leading-relaxed"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
          {data.logo.evolutionaryStage && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-[10px] font-bold">E</span>
                Estagio Evolutivo
              </h4>
              <EditableField
                value={data.logo.evolutionaryStage}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, evolutionaryStage: val as "Descriptive" | "Transitional" | "Iconic" } }))}
                className="text-gray-600 text-sm leading-relaxed"
                readOnly={!onUpdateData}
              />
            </div>
          )}
        </div>
      )}

      {/* Logo variants */}
      {variantEntries.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">Variações de Logo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-start">
            {variantEntries.map((v) => (
              <div key={v.key} className="bg-white border rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-sm text-gray-900 mb-2">{v.label}</h4>
                <EditableField
                  value={v.desc || ""}
                  onSave={(val) => onUpdateData?.(prev => ({
                    ...prev,
                    logoVariants: {
                      ...prev.logoVariants,
                      [v.key]: val,
                    }
                  }))}
                  className="text-gray-500 text-xs leading-relaxed"
                  readOnly={!onUpdateData}
                  multiline
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 items-start">
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-bold mb-1">Clear Space</h3>
          <EditableField
            value={data.logo.clearSpace}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, clearSpace: val } }))}
            className="text-gray-600 text-sm"
            readOnly={!onUpdateData}
            multiline
          />
        </div>
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-bold mb-1">Tamanho Mínimo</h3>
          <EditableField
            value={data.logo.minimumSize}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, minimumSize: val } }))}
            className="text-gray-600 text-sm"
            readOnly={!onUpdateData}
            multiline
          />
        </div>
        {data.logo.favicon && (
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-bold mb-1">Favicon / App Icon</h3>
            <EditableField
              value={data.logo.favicon}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, logo: { ...prev.logo, favicon: val } }))}
              className="text-gray-600 text-sm"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
        )}
      </div>

      {/* Incorrect usages — visual cards */}
      <div className="rounded-[1.2rem] border border-red-100 bg-red-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-red-800">Usos Incorretos</h3>
            <p className="text-[11px] text-red-400 mt-0.5">Estas aplicações comprometem a integridade da marca</p>
          </div>
          {onUpdateData && (
            <button
              onClick={() => onUpdateData(prev => ({ ...prev, logo: { ...prev.logo, incorrectUsages: [...prev.logo.incorrectUsages, "Novo uso incorreto"] } }))}
              className="no-print text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition"
            >
              + Adicionar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.logo.incorrectUsages.map((u, i) => (
            <div key={i} className="group/item bg-white border border-red-100 rounded-xl p-4 relative shadow-sm">
              {/* X badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow">✕</div>
              {/* Faded logo preview (if available) */}
              {logoPrimary && (
                <div className="mb-2 flex items-center justify-center h-12 opacity-25 grayscale">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPrimary} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <EditableField
                value={u}
                onSave={(val) => onUpdateData?.(prev => {
                  const next = [...prev.logo.incorrectUsages];
                  next[i] = val;
                  return { ...prev, logo: { ...prev.logo, incorrectUsages: next } };
                })}
                onDelete={onUpdateData ? () => onUpdateData?.(prev => ({
                  ...prev, logo: { ...prev.logo, incorrectUsages: prev.logo.incorrectUsages.filter((_, idx) => idx !== i) }
                })) : undefined}
                className="text-sm text-red-700 leading-snug"
                readOnly={!onUpdateData}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewImage(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 border-b">
              <div className="text-sm font-extrabold text-gray-900 truncate">Pré-visualização — {previewImage.title}</div>
              <button type="button" className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900" onClick={() => setPreviewImage(null)}>Fechar</button>
            </div>
            <div className="p-4 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage.url} alt={previewImage.title} className="max-w-full max-h-[70vh] object-contain rounded-lg border" />
              <div className="mt-4 flex items-center gap-2">
                <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition" onClick={() => setPreviewImage(null)}>Fechar</button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition"
                  onClick={() => {
                    if (onDownload) onDownload(previewImage.url, `${data.brandName}-${previewImage.title}`);
                    else downloadImageDirect(previewImage.url, `${data.brandName}-${previewImage.title}`);
                  }}
                >
                  Baixar imagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
