"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { BrandbookData, UploadedAsset, GeneratedAsset } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";

interface Props {
  data: BrandbookData;
  num: number;
  uploadedAssets?: UploadedAsset[];
  generatedImages?: Record<string, string>;
  onGenerate?: (key: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => void;
  loadingKey?: string | null;
  generatedAssets?: Record<string, GeneratedAsset>;
  onDownload?: (url: string, name: string) => void;
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

function downloadImageDirect(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "-").toLowerCase()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function SectionMascots({ data, num, uploadedAssets = [], generatedImages = {}, onGenerate, loadingKey, generatedAssets = {}, onDownload }: Props) {
  const mascots = data.keyVisual.mascots ?? [];
  const symbols = data.keyVisual.symbols ?? [];
  const patterns = data.keyVisual.patterns ?? [];
  const structuredPatterns = data.keyVisual.structuredPatterns ?? [];

  const uploadedMascots = uploadedAssets.filter((a) => a.type === "mascot");
  const uploadedElements = uploadedAssets.filter((a) => a.type === "element");
  const uploadedPatterns = uploadedAssets.filter((a) => a.type === "pattern");

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [briefings, setBriefings] = useState<Record<string, CardBriefing>>({});
  const [expandedBriefing, setExpandedBriefing] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!previewImage) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewImage(null); };
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

  const handleGenerateWithDirection = useCallback((assetKey: AssetKey, storageKey?: string, extraContext?: string) => {
    if (!onGenerate) return;
    const briefingKey = storageKey ?? assetKey;
    const b = getBriefing(briefingKey);
    const parts: string[] = [];
    if (extraContext) parts.push(extraContext);
    if (b.instruction.trim()) parts.push(b.instruction.trim());
    if (b.referenceLinks.length > 0) parts.push(`Reference links: ${b.referenceLinks.join(", ")}`);
    const customInstruction = parts.length > 0 ? parts.join(". ") : extraContext;
    const refs = b.referenceImages.length > 0 ? b.referenceImages : undefined;
    onGenerate(assetKey, { customInstruction, userReferenceImages: refs, storageKey });
  }, [onGenerate, getBriefing]);

  function renderBriefingPanel(briefingKey: string, label: string, baseAssetKey?: AssetKey, extraContext?: string) {
    if (!onGenerate) return null;
    const ak = baseAssetKey ?? (briefingKey as AssetKey);
    const briefing = getBriefing(briefingKey);
    const isExpanded = expandedBriefing === briefingKey;
    const isLoadingThis = loadingKey === briefingKey || loadingKey === ak;
    return (
      <div className="no-print mt-3 space-y-2">
        <button
          type="button"
          onClick={() => setExpandedBriefing(isExpanded ? null : briefingKey)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition"
        >
          <span>Direcionamento criativo</span>
          <span className="text-base leading-none">{isExpanded ? "\u2212" : "+"}</span>
        </button>
        {isExpanded && (
          <div className="space-y-3 bg-gray-50 rounded-lg p-3 border">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Como voc&ecirc; espera esta imagem?
              </label>
              <textarea
                value={briefing.instruction}
                onChange={(e) => updateBriefing(briefingKey, { instruction: e.target.value })}
                placeholder={`Ex: Quero o ${label} com estilo cartoon tropical, cores vibrantes...`}
                rows={3}
                className="w-full bg-white border rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fotos de refer&ecirc;ncia</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {briefing.referenceImages.map((img, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border bg-white group/thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveRefImage(briefingKey, idx)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition">x</button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRefs.current[briefingKey]?.click()} className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-600 transition">
                  <span className="text-lg leading-none">+</span>
                </button>
                <input ref={(el) => { fileInputRefs.current[briefingKey] = el; }} type="file" accept="image/*" multiple aria-label="Adicionar fotos de refer\u00eancia" className="hidden" onChange={(e) => { if (e.target.files) handleAddRefImages(briefingKey, e.target.files); e.target.value = ""; }} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Links de refer&ecirc;ncia</label>
              <div className="flex gap-1.5">
                <input type="url" value={linkInput[briefingKey] ?? ""} onChange={(e) => setLinkInput((prev) => ({ ...prev, [briefingKey]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLink(briefingKey); } }} placeholder="https://..." className="flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                <button type="button" onClick={() => handleAddLink(briefingKey)} className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">+</button>
              </div>
              {briefing.referenceLinks.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {briefing.referenceLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white border rounded px-2 py-1">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 truncate flex-1 hover:underline">{link}</a>
                      <button type="button" onClick={() => handleRemoveLink(briefingKey, idx)} className="text-red-500 text-[10px] font-bold hover:text-red-700">x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => handleGenerateWithDirection(ak, briefingKey !== ak ? briefingKey : undefined, extraContext)} disabled={loadingKey !== null} className="w-full text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {isLoadingThis ? "Gerando..." : `\u2726 Gerar ${label} com direcionamento`}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Mascotes, Símbolos &amp; Padrões
      </h2>

      {mascots.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Mascotes &amp; Personagens</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mascots.map((mascot, i) => {
              const storageKey = `mascot_${i}`;
              const uploadedImg = uploadedMascots[i] ?? null;
              const genImg = generatedAssets[storageKey]?.url ?? (i === 0 ? generatedImages["brand_mascot"] : null);
              const mascotImage = uploadedImg?.dataUrl ?? genImg ?? null;
              const isGenerated = !!genImg && !uploadedImg;
              const isLoadingThis = loadingKey === storageKey;
              const mascotContext = `Generate mascot "${mascot.name}". Visual description: ${mascot.description}. Personality: ${mascot.personality}. Usage: ${mascot.usageGuidelines.join("; ")}`;
              return (
                <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm group">
                  {mascotImage ? (
                    <div className="h-40 bg-gray-50 flex items-center justify-center p-4 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mascotImage} alt={mascot.name} className="max-h-full object-contain rounded" />
                      {isGenerated && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
                      )}
                      {isLoadingThis && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                      )}
                      {!isLoadingThis && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button type="button" onClick={() => setPreviewImage({ url: mascotImage, title: mascot.name })} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Visualizar</button>
                          <button type="button" onClick={() => { if (onDownload) onDownload(mascotImage, `${data.brandName}-${mascot.name}`); else downloadImageDirect(mascotImage, `${data.brandName}-${mascot.name}`); }} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Baixar</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 relative">
                      {isLoadingThis ? (
                        <>
                          <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                          <span className="text-xs font-medium mt-2">Gerando...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-5xl mb-2">🐾</span>
                          <span className="text-xs font-medium">Suba uma imagem ou gere com IA</span>
                          {onGenerate && (
                            <button type="button" onClick={() => handleGenerateWithDirection("brand_mascot", storageKey, mascotContext)} disabled={loadingKey !== null} className="no-print mt-2 text-[11px] font-bold text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                              ✦ Gerar {mascot.name}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-bold">{mascot.name}</h4>
                      {onGenerate && mascotImage && !isLoadingThis && (
                        <button type="button" onClick={() => handleGenerateWithDirection("brand_mascot", storageKey, mascotContext)} disabled={loadingKey !== null} className="no-print text-[10px] font-semibold text-gray-500 hover:text-gray-900 transition disabled:opacity-40">
                          ↺ Regerar
                        </button>
                      )}
                    </div>
                    <div className="mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição Visual</span>
                      <p className="text-gray-700 text-sm mt-1">{mascot.description}</p>
                    </div>
                    <div className="mb-3 bg-gray-50 p-3 rounded-lg border">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personalidade</span>
                      <p className="text-gray-700 text-sm mt-1">{mascot.personality}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diretrizes de Uso</span>
                      <ul className="mt-2 space-y-1">
                        {mascot.usageGuidelines.map((g, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-gray-400 shrink-0">→</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {renderBriefingPanel(storageKey, mascot.name, "brand_mascot", mascotContext)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uploadedMascots.length > mascots.length && (
        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">Mascotes Enviados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedMascots.slice(mascots.length).map((asset) => (
              <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-36 object-contain p-3" />
                <div className="px-3 pb-3">
                  <p className="text-xs font-semibold text-gray-700 truncate">{asset.name}</p>
                  {asset.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{asset.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {symbols.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Símbolos Identitários</h3>
            <div className="space-y-4">
              {symbols.map((sym, i) => {
                const symKey = `symbol_${i}`;
                const symImg = generatedAssets[symKey]?.url ?? null;
                const isLoadingSym = loadingKey === symKey;
                const symContext = `Generate a visual symbol/icon for: "${sym}". This is a brand identity symbol — render as a standalone graphic element.`;
                return (
                  <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
                    {symImg && (
                      <div className="mb-3 rounded-lg overflow-hidden border relative group/sym h-28 bg-gray-50 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={symImg} alt={sym} className="max-h-full object-contain" />
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
                        {!isLoadingSym && (
                          <div className="absolute inset-0 bg-black/0 group-hover/sym:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover/sym:opacity-100">
                            <button type="button" onClick={() => setPreviewImage({ url: symImg, title: sym })} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Visualizar</button>
                            <button type="button" onClick={() => { if (onDownload) onDownload(symImg, `${data.brandName}-simbolo-${i}`); else downloadImageDirect(symImg, `${data.brandName}-simbolo-${i}`); }} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Baixar</button>
                          </div>
                        )}
                      </div>
                    )}
                    {isLoadingSym && !symImg && (
                      <div className="mb-3 rounded-lg border h-28 bg-gray-50 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-gray-900 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">◆</span>
                      <div className="flex-1">
                        <span className="text-gray-700 text-sm">{sym}</span>
                        {onGenerate && (
                          <div className="no-print mt-2 flex gap-2">
                            <button type="button" onClick={() => handleGenerateWithDirection("brand_pattern", symKey, symContext)} disabled={loadingKey !== null} className="text-[10px] font-bold bg-gray-900 text-white px-2.5 py-1 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                              {isLoadingSym ? "..." : symImg ? "↺ Regerar" : "✦ Gerar"}
                            </button>
                          </div>
                        )}
                        {renderBriefingPanel(symKey, sym, "brand_pattern", symContext)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {uploadedElements.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {uploadedElements.map((asset) => (
                  <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-20 object-contain p-2" />
                    <p className="text-[10px] font-medium text-gray-500 text-center pb-1 truncate px-1">{asset.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(patterns.length > 0 || (structuredPatterns && structuredPatterns.length > 0)) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Padrões Gráficos</h3>
            </div>
            {structuredPatterns && structuredPatterns.length > 0 ? (
              <div className="space-y-5">
                {structuredPatterns.map((pat, i) => {
                  const patKey = `pattern_${i}`;
                  const patImg = generatedAssets[patKey]?.url ?? (i === 0 ? generatedImages["brand_pattern"] : null);
                  const isLoadingPat = loadingKey === patKey;
                  const patContext = `Generate pattern "${pat.name}". Description: ${pat.description}. Composition: ${pat.composition}. Usage: ${pat.usage}.${pat.density ? ` Density: ${pat.density}.` : ""}${pat.background ? ` Background: ${pat.background}.` : ""}`;
                  return (
                    <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                      {patImg ? (
                        <div className="h-36 bg-gray-50 relative group/patcard">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={patImg} alt={pat.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
                          {isLoadingPat && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                              <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                            </div>
                          )}
                          {!isLoadingPat && (
                            <div className="absolute inset-0 bg-black/0 group-hover/patcard:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover/patcard:opacity-100">
                              <button type="button" onClick={() => setPreviewImage({ url: patImg, title: pat.name })} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Visualizar</button>
                              <button type="button" onClick={() => { if (onDownload) onDownload(patImg, `${data.brandName}-${pat.name}`); else downloadImageDirect(patImg, `${data.brandName}-${pat.name}`); }} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Baixar</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-28 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                          {isLoadingPat ? (
                            <>
                              <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                              <span className="text-xs font-medium mt-2">Gerando...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-3xl mb-1">▦</span>
                              <span className="text-xs font-medium">{pat.name}</span>
                              {onGenerate && (
                                <button type="button" onClick={() => handleGenerateWithDirection("brand_pattern", patKey, patContext)} disabled={loadingKey !== null} className="no-print mt-2 text-[11px] font-bold text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                                  ✦ Gerar {pat.name}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">▦</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900">{pat.name}</h4>
                              {onGenerate && patImg && !isLoadingPat && (
                                <button type="button" onClick={() => handleGenerateWithDirection("brand_pattern", patKey, patContext)} disabled={loadingKey !== null} className="no-print text-[10px] font-semibold text-gray-500 hover:text-gray-900 transition disabled:opacity-40">
                                  ↺ Regerar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{pat.description}</p>
                        <div className="space-y-2 text-xs">
                          <div><span className="font-semibold text-gray-700">Composição:</span> <span className="text-gray-600">{pat.composition}</span></div>
                          <div><span className="font-semibold text-gray-700">Uso:</span> <span className="text-gray-600">{pat.usage}</span></div>
                          {pat.density && <div><span className="font-semibold text-gray-700">Densidade:</span> <span className="text-gray-600">{pat.density}</span></div>}
                          {pat.background && <div><span className="font-semibold text-gray-700">Fundo:</span> <span className="text-gray-600">{pat.background}</span></div>}
                        </div>
                        {renderBriefingPanel(patKey, pat.name, "brand_pattern", patContext)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {patterns.map((pat, i) => {
                  const patKey = `pattern_${i}`;
                  const patImg = generatedAssets[patKey]?.url ?? null;
                  const isLoadingPat = loadingKey === patKey;
                  const patContext = `Generate a seamless brand pattern based on: "${pat}"`;
                  return (
                    <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
                      {patImg && (
                        <div className="mb-3 rounded-lg overflow-hidden border relative group/patitem h-28 bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={patImg} alt={pat} className="w-full h-full object-cover" />
                          <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
                          {!isLoadingPat && (
                            <div className="absolute inset-0 bg-black/0 group-hover/patitem:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover/patitem:opacity-100">
                              <button type="button" onClick={() => setPreviewImage({ url: patImg, title: pat })} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Visualizar</button>
                              <button type="button" onClick={() => { if (onDownload) onDownload(patImg, `${data.brandName}-padrao-${i}`); else downloadImageDirect(patImg, `${data.brandName}-padrao-${i}`); }} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Baixar</button>
                            </div>
                          )}
                        </div>
                      )}
                      {isLoadingPat && !patImg && (
                        <div className="mb-3 rounded-lg border h-28 bg-gray-50 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">▦</span>
                        <div className="flex-1">
                          <span className="text-gray-700 text-sm">{pat}</span>
                          {onGenerate && (
                            <div className="no-print mt-2 flex gap-2">
                              <button type="button" onClick={() => handleGenerateWithDirection("brand_pattern", patKey, patContext)} disabled={loadingKey !== null} className="text-[10px] font-bold bg-gray-900 text-white px-2.5 py-1 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                                {isLoadingPat ? "..." : patImg ? "↺ Regerar" : "✦ Gerar"}
                              </button>
                            </div>
                          )}
                          {renderBriefingPanel(patKey, pat, "brand_pattern", patContext)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {uploadedPatterns.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {uploadedPatterns.map((asset) => (
                  <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-20 object-cover rounded" />
                    <p className="text-[10px] font-medium text-gray-500 text-center pb-1 truncate px-1">{asset.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
