"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { BrandbookData, UploadedAsset, GeneratedAsset } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";
import { EditableField } from "@/components/EditableField";
import { downloadImageUrl } from "@/lib/imageTransport";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  uploadedAssets?: UploadedAsset[];
  onGenerate?: (key: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => void | Promise<void>;
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
}: {
  title: string;
  image: string | null;
  placeholderText: string;
  bgClass: string;
  assetKey?: AssetKey;
  onGenerate?: (key: AssetKey) => void;
  isLoading?: boolean;
  generated?: GeneratedAsset | null;
  onDownload?: (url: string, name: string) => void;
  onSaveToAssets?: (asset: GeneratedAsset, label: string, key?: AssetKey) => void;
  onPreview?: (url: string, title: string) => void;
}) {
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
                <button
                  onClick={() => onGenerate(assetKey)}
                  className="no-print mt-1 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg transition-all"
                >
                  ✦ Gerar com IA
                </button>
              )}
            </>
          )}
        </div>
      )}
      {image && onGenerate && assetKey && !isLoading && (
        <div className="no-print px-5 py-2 border-t bg-gray-50 flex justify-end">
          <button
            onClick={() => onGenerate(assetKey)}
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

export function SectionLogo({ data, num, generatedImages = {}, uploadedAssets = [], onGenerate, loadingKey, onDownload, onSaveToAssets, generatedAssets = {}, onUpdateData }: Props) {
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
    return onGenerate(assetKey, { customInstruction, userReferenceImages: refs });
  }, [onGenerate, getBriefing]);

  const handleGenerateSection = useCallback(async () => {
    if (!onGenerate) return;
    if (sectionGenerating) return;
    setSectionGenerating(true);
    try {
      const hasUploadedPrimary = !!uploadedLogos[0];
      const hasUploadedDark = !!uploadedLogos[1];

      if (!hasUploadedPrimary) {
        await handleGenerateWithDirection("logo_primary");
      }

      if (!hasUploadedDark) {
        await handleGenerateWithDirection("logo_dark_bg");
      }
    } finally {
      setSectionGenerating(false);
    }
  }, [onGenerate, sectionGenerating, uploadedLogos, handleGenerateWithDirection]);

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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
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
            <button
              type="button"
              onClick={() => handleGenerateWithDirection(assetKey)}
              disabled={loadingKey !== null}
              className="w-full text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loadingKey === assetKey ? "Gerando..." : "✦ Gerar com direcionamento"}
            </button>
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

      {/* Main logo images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6 items-start">
        <div>
          <LogoCard
            title="Logo Principal — Fundo Claro"
            image={logoPrimary}
            placeholderText="Gere o logo principal para visualizar aqui"
            bgClass="bg-white border-t"
            assetKey="logo_primary"
            onGenerate={onGenerate ? (key: AssetKey) => handleGenerateWithDirection(key) : undefined}
            isLoading={loadingKey === "logo_primary"}
            generated={generatedAssets["logo_primary"] ?? null}
            onDownload={onDownload}
            onSaveToAssets={onSaveToAssets}
            onPreview={(url, t) => setPreviewImage({ url, title: t })}
          />
          {renderBriefingPanel("logo_primary")}
        </div>
        <div>
          <LogoCard
            title="Logo — Versão Invertida"
            image={logoDarkBg}
            placeholderText="Gere a versão invertida (fundo escuro)"
            bgClass="bg-gray-900"
            assetKey="logo_dark_bg"
            onGenerate={onGenerate ? (key: AssetKey) => handleGenerateWithDirection(key) : undefined}
            isLoading={loadingKey === "logo_dark_bg"}
            generated={generatedAssets["logo_dark_bg"] ?? null}
            onDownload={onDownload}
            onSaveToAssets={onSaveToAssets}
            onPreview={(url, t) => setPreviewImage({ url, title: t })}
          />
          {renderBriefingPanel("logo_dark_bg")}
        </div>
      </div>

      {/* Logo description cards */}
      {(secondaryText || symbolText) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">
          {secondaryText && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <h4 className="font-bold text-gray-900">Logo Secundário</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{secondaryText}</p>
            </div>
          )}
          {symbolText && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">◆</span>
                <h4 className="font-bold text-gray-900">Símbolo / Ícone</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{symbolText}</p>
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
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
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

      {/* Incorrect usages */}
      <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-red-800">Usos Incorretos</h3>
          {onUpdateData && (
            <button
              onClick={() => onUpdateData(prev => ({ ...prev, logo: { ...prev.logo, incorrectUsages: [...prev.logo.incorrectUsages, "Novo uso incorreto"] } }))}
              className="no-print text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition"
            >
              + Adicionar
            </button>
          )}
        </div>
        <ul className="list-disc pl-5 text-red-700 space-y-2">
          {data.logo.incorrectUsages.map((u, i) => (
            <li key={i} className="group/item">
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
                className="text-sm"
                readOnly={!onUpdateData}
              />
            </li>
          ))}
        </ul>
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
