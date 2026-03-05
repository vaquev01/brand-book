"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { BrandbookData, UploadedAsset, GeneratedAsset, Mascot, BrandPattern } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";

interface Props {
  data: BrandbookData;
  num: number;
  uploadedAssets?: UploadedAsset[];
  generatedImages?: Record<string, string>;
  onGenerate?: (key: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => void | Promise<void>;
  loadingKey?: string | null;
  generatedAssets?: Record<string, GeneratedAsset>;
  onDownload?: (url: string, name: string) => void;
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

function downloadImageDirect(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "-").toLowerCase()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function SectionMascots({ data, num, uploadedAssets = [], generatedImages = {}, onGenerate, loadingKey, generatedAssets = {}, onDownload, onUpdateData }: Props) {
  const mascots = useMemo(() => data.keyVisual.mascots ?? [], [data.keyVisual.mascots]);
  const symbols = useMemo(() => data.keyVisual.symbols ?? [], [data.keyVisual.symbols]);
  const patterns = useMemo(() => data.keyVisual.patterns ?? [], [data.keyVisual.patterns]);
  const structuredPatterns = useMemo(
    () => data.keyVisual.structuredPatterns ?? [],
    [data.keyVisual.structuredPatterns]
  );

  const uploadedMascots = useMemo(
    () => uploadedAssets.filter((a) => a.type === "mascot"),
    [uploadedAssets]
  );
  const uploadedElements = useMemo(
    () => uploadedAssets.filter((a) => a.type === "element"),
    [uploadedAssets]
  );
  const uploadedPatterns = useMemo(
    () => uploadedAssets.filter((a) => a.type === "pattern"),
    [uploadedAssets]
  );

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [briefings, setBriefings] = useState<Record<string, CardBriefing>>({});
  const [expandedBriefing, setExpandedBriefing] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [sectionGenerating, setSectionGenerating] = useState(false);

  const [editingMascot, setEditingMascot] = useState<number | null>(null);
  const [mascotDraft, setMascotDraft] = useState<Partial<Mascot>>({});
  const [confirmDeleteMascot, setConfirmDeleteMascot] = useState<number | null>(null);

  const [editingSymbol, setEditingSymbol] = useState<number | null>(null);
  const [symbolDraft, setSymbolDraft] = useState("");
  const [confirmDeleteSymbol, setConfirmDeleteSymbol] = useState<number | null>(null);

  const [editingPattern, setEditingPattern] = useState<number | null>(null);
  const [patternDraft, setPatternDraft] = useState<Partial<BrandPattern> & { simpleText?: string }>({});
  const [confirmDeletePattern, setConfirmDeletePattern] = useState<number | null>(null);

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

  const handleGenerateWithDirection = useCallback(async (assetKey: AssetKey, storageKey?: string, extraContext?: string) => {
    if (!onGenerate) return;
    const briefingKey = storageKey ?? assetKey;
    const b = getBriefing(briefingKey);
    const parts: string[] = [];
    if (extraContext) parts.push(extraContext);
    if (b.instruction.trim()) parts.push(b.instruction.trim());
    if (b.referenceLinks.length > 0) parts.push(`Reference links: ${b.referenceLinks.join(", ")}`);
    const customInstruction = parts.length > 0 ? parts.join(". ") : extraContext;
    const refs = b.referenceImages.length > 0 ? b.referenceImages : undefined;
    return onGenerate(assetKey, { customInstruction, userReferenceImages: refs, storageKey });
  }, [onGenerate, getBriefing]);

  const handleGenerateSection = useCallback(async () => {
    if (!onGenerate) return;
    if (sectionGenerating) return;
    setSectionGenerating(true);
    try {
      const tasks: Array<() => void | Promise<void>> = [];

      for (let i = 0; i < mascots.length; i++) {
        const storageKey = `mascot_${i}`;
        if (generatedAssets[storageKey]) continue;
        if (uploadedMascots[i]) continue;
        const mascot = mascots[i];
        const mascotContext = `Generate mascot "${mascot.name}". Visual description: ${mascot.description}. Personality: ${mascot.personality}. Usage: ${mascot.usageGuidelines.join("; ")}`;
        tasks.push(() => handleGenerateWithDirection("brand_mascot", storageKey, mascotContext));
      }

      for (let i = 0; i < symbols.length; i++) {
        const symKey = `symbol_${i}`;
        if (generatedAssets[symKey]) continue;
        const sym = symbols[i];
        const symContext = `Generate a visual symbol/icon for: "${sym}". This is a brand identity symbol — render as a standalone graphic element.`;
        tasks.push(() => handleGenerateWithDirection("brand_pattern", symKey, symContext));
      }

      const patternsToUse = structuredPatterns && structuredPatterns.length > 0 ? structuredPatterns : patterns;
      for (let i = 0; i < patternsToUse.length; i++) {
        const patKey = `pattern_${i}`;
        if (generatedAssets[patKey]) continue;

        const pat = patternsToUse[i] as (typeof structuredPatterns)[number] | (typeof patterns)[number];
        const patContext = typeof pat === "string"
          ? `Generate a seamless brand pattern based on: "${pat}"`
          : `Generate pattern "${pat.name}". Description: ${pat.description}. Composition: ${pat.composition}. Usage: ${pat.usage}.${pat.density ? ` Density: ${pat.density}.` : ""}${pat.background ? ` Background: ${pat.background}.` : ""}`;

        tasks.push(() => handleGenerateWithDirection("brand_pattern", patKey, patContext));
      }

      for (const t of tasks) {
        await t();
      }
    } finally {
      setSectionGenerating(false);
    }
  }, [onGenerate, sectionGenerating, mascots, symbols, patterns, structuredPatterns, generatedAssets, uploadedMascots, handleGenerateWithDirection]);

  // --- Mascot CRUD ---
  const startEditingMascot = useCallback((i: number) => {
    setEditingMascot(i);
    setMascotDraft({ ...mascots[i] });
  }, [mascots]);

  const saveMascot = useCallback(() => {
    if (editingMascot === null || !onUpdateData) return;
    const idx = editingMascot;
    onUpdateData((prev) => {
      const next = [...(prev.keyVisual.mascots ?? [])];
      next[idx] = { ...next[idx], ...mascotDraft } as Mascot;
      return { ...prev, keyVisual: { ...prev.keyVisual, mascots: next } };
    });
    setEditingMascot(null);
    setMascotDraft({});
  }, [editingMascot, mascotDraft, onUpdateData]);

  const deleteMascot = useCallback((i: number) => {
    if (!onUpdateData) return;
    onUpdateData((prev) => ({
      ...prev,
      keyVisual: { ...prev.keyVisual, mascots: (prev.keyVisual.mascots ?? []).filter((_, j) => j !== i) },
    }));
    setConfirmDeleteMascot(null);
  }, [onUpdateData]);

  const addMascot = useCallback(() => {
    if (!onUpdateData) return;
    const newMascot: Mascot = { name: "Novo Mascote", description: "", personality: "", usageGuidelines: [] };
    onUpdateData((prev) => ({
      ...prev,
      keyVisual: { ...prev.keyVisual, mascots: [...(prev.keyVisual.mascots ?? []), newMascot] },
    }));
    setTimeout(() => { setEditingMascot(mascots.length); setMascotDraft(newMascot); }, 50);
  }, [onUpdateData, mascots.length]);

  // --- Symbol CRUD ---
  const startEditingSymbol = useCallback((i: number) => {
    setEditingSymbol(i);
    setSymbolDraft(symbols[i]);
  }, [symbols]);

  const saveSymbol = useCallback(() => {
    if (editingSymbol === null || !onUpdateData) return;
    const idx = editingSymbol;
    onUpdateData((prev) => {
      const next = [...(prev.keyVisual.symbols ?? [])];
      next[idx] = symbolDraft;
      return { ...prev, keyVisual: { ...prev.keyVisual, symbols: next } };
    });
    setEditingSymbol(null);
    setSymbolDraft("");
  }, [editingSymbol, symbolDraft, onUpdateData]);

  const deleteSymbol = useCallback((i: number) => {
    if (!onUpdateData) return;
    onUpdateData((prev) => ({
      ...prev,
      keyVisual: { ...prev.keyVisual, symbols: (prev.keyVisual.symbols ?? []).filter((_, j) => j !== i) },
    }));
    setConfirmDeleteSymbol(null);
  }, [onUpdateData]);

  const addSymbol = useCallback(() => {
    if (!onUpdateData) return;
    const newSym = "Novo Símbolo";
    onUpdateData((prev) => ({
      ...prev,
      keyVisual: { ...prev.keyVisual, symbols: [...(prev.keyVisual.symbols ?? []), newSym] },
    }));
    setTimeout(() => { setEditingSymbol(symbols.length); setSymbolDraft(newSym); }, 50);
  }, [onUpdateData, symbols.length]);

  // --- Pattern CRUD ---
  const startEditingPattern = useCallback((i: number) => {
    const isStructured = structuredPatterns.length > 0;
    setEditingPattern(i);
    if (isStructured) {
      setPatternDraft({ ...structuredPatterns[i] });
    } else {
      setPatternDraft({ simpleText: patterns[i] });
    }
  }, [structuredPatterns, patterns]);

  const savePattern = useCallback(() => {
    if (editingPattern === null || !onUpdateData) return;
    const idx = editingPattern;
    const isStructured = structuredPatterns.length > 0;
    onUpdateData((prev) => {
      if (isStructured) {
        const next = [...(prev.keyVisual.structuredPatterns ?? [])];
        const { simpleText: _st, ...rest } = patternDraft;
        next[idx] = { ...next[idx], ...rest } as BrandPattern;
        return { ...prev, keyVisual: { ...prev.keyVisual, structuredPatterns: next } };
      } else {
        const next = [...(prev.keyVisual.patterns ?? [])];
        next[idx] = patternDraft.simpleText ?? next[idx];
        return { ...prev, keyVisual: { ...prev.keyVisual, patterns: next } };
      }
    });
    setEditingPattern(null);
    setPatternDraft({});
  }, [editingPattern, patternDraft, onUpdateData, structuredPatterns.length]);

  const deletePattern = useCallback((i: number) => {
    if (!onUpdateData) return;
    const isStructured = structuredPatterns.length > 0;
    onUpdateData((prev) => {
      if (isStructured) {
        return { ...prev, keyVisual: { ...prev.keyVisual, structuredPatterns: (prev.keyVisual.structuredPatterns ?? []).filter((_, j) => j !== i) } };
      } else {
        return { ...prev, keyVisual: { ...prev.keyVisual, patterns: (prev.keyVisual.patterns ?? []).filter((_, j) => j !== i) } };
      }
    });
    setConfirmDeletePattern(null);
  }, [onUpdateData, structuredPatterns.length]);

  const addPattern = useCallback(() => {
    if (!onUpdateData) return;
    const isStructured = structuredPatterns.length > 0;
    if (isStructured) {
      const newPat: BrandPattern = { name: "Novo Padrão", description: "", composition: "", usage: "" };
      onUpdateData((prev) => ({
        ...prev,
        keyVisual: { ...prev.keyVisual, structuredPatterns: [...(prev.keyVisual.structuredPatterns ?? []), newPat] },
      }));
      setTimeout(() => { setEditingPattern(structuredPatterns.length); setPatternDraft(newPat); }, 50);
    } else {
      const newPat = "Novo Padrão";
      onUpdateData((prev) => ({
        ...prev,
        keyVisual: { ...prev.keyVisual, patterns: [...(prev.keyVisual.patterns ?? []), newPat] },
      }));
      setTimeout(() => { setEditingPattern(patterns.length); setPatternDraft({ simpleText: newPat }); }, 50);
    }
  }, [onUpdateData, structuredPatterns.length, patterns.length]);

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
    <section className="page-break mb-6">
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {String(num).padStart(2, "0")}. Mascotes, Símbolos &amp; Padrões
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
              <span>✦</span>
            )}
            Gerar seção
          </button>
        )}
      </div>

      {mascots.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Mascotes &amp; Personagens</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
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
                    <div className="h-28 bg-gray-50 flex items-center justify-center p-3 relative">
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
                    <div className="h-28 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 relative">
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
                    {editingMascot === i ? (
                      <div className="no-print space-y-2">
                        <input type="text" value={mascotDraft.name ?? ""} onChange={(e) => setMascotDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nome do mascote" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                        <textarea value={mascotDraft.description ?? ""} onChange={(e) => setMascotDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Descrição visual" rows={2} className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y" />
                        <textarea value={mascotDraft.personality ?? ""} onChange={(e) => setMascotDraft((d) => ({ ...d, personality: e.target.value }))} placeholder="Personalidade" rows={2} className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y" />
                        <textarea value={(mascotDraft.usageGuidelines ?? []).join("\n")} onChange={(e) => setMascotDraft((d) => ({ ...d, usageGuidelines: e.target.value.split("\n").filter(Boolean) }))} placeholder="Diretrizes de uso (uma por linha)" rows={3} className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y" />
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={saveMascot} className="flex-1 text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">Salvar</button>
                          <button type="button" onClick={() => { setEditingMascot(null); setMascotDraft({}); }} className="flex-1 text-xs font-bold text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-lg font-bold">{mascot.name}</h4>
                          <div className="no-print flex items-center gap-1">
                            {onGenerate && mascotImage && !isLoadingThis && (
                              <button type="button" onClick={() => handleGenerateWithDirection("brand_mascot", storageKey, mascotContext)} disabled={loadingKey !== null} className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 transition disabled:opacity-40">
                                ↺ Regerar
                              </button>
                            )}
                            {onUpdateData && (
                              <>
                                <button type="button" onClick={() => startEditingMascot(i)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100" title="Editar">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                {confirmDeleteMascot === i ? (
                                  <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => deleteMascot(i)} className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100 transition">Sim</button>
                                    <button type="button" onClick={() => setConfirmDeleteMascot(null)} className="text-[10px] font-bold text-gray-500 px-1 py-0.5 rounded hover:bg-gray-100 transition">Não</button>
                                  </div>
                                ) : (
                                  <button type="button" onClick={() => setConfirmDeleteMascot(i)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100" title="Excluir">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
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
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {onUpdateData && (
              <button type="button" onClick={addMascot} className="no-print w-full border-2 border-dashed border-gray-300 rounded-xl py-6 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50 transition flex flex-col items-center gap-1">
                <span className="text-xl leading-none">+</span>
                <span>Novo Mascote</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!mascots.length && onUpdateData && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Mascotes &amp; Personagens</h3>
          </div>
          <button type="button" onClick={addMascot} className="no-print w-full border-2 border-dashed border-gray-300 rounded-xl py-8 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50 transition flex flex-col items-center gap-2">
            <span className="text-2xl leading-none">+</span>
            <span>Adicionar Mascote</span>
          </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                        {editingSymbol === i ? (
                          <div className="no-print space-y-2">
                            <input type="text" value={symbolDraft} onChange={(e) => setSymbolDraft(e.target.value)} placeholder="Descrição do símbolo" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                            <div className="flex gap-2">
                              <button type="button" onClick={saveSymbol} className="flex-1 text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">Salvar</button>
                              <button type="button" onClick={() => { setEditingSymbol(null); setSymbolDraft(""); }} className="flex-1 text-xs font-bold text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-gray-700 text-sm">{sym}</span>
                            {onUpdateData && (
                              <div className="no-print flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => startEditingSymbol(i)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition" title="Editar">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                {confirmDeleteSymbol === i ? (
                                  <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => deleteSymbol(i)} className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100 transition">Sim</button>
                                    <button type="button" onClick={() => setConfirmDeleteSymbol(null)} className="text-[10px] font-bold text-gray-500 px-1 py-0.5 rounded hover:bg-gray-100 transition">Não</button>
                                  </div>
                                ) : (
                                  <button type="button" onClick={() => setConfirmDeleteSymbol(i)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Excluir">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {onGenerate && editingSymbol !== i && (
                          <div className="no-print mt-2 flex gap-2">
                            <button type="button" onClick={() => handleGenerateWithDirection("brand_pattern", symKey, symContext)} disabled={loadingKey !== null} className="text-[10px] font-bold bg-gray-900 text-white px-2.5 py-1 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                              {isLoadingSym ? "..." : symImg ? "↺ Regerar" : "✦ Gerar"}
                            </button>
                          </div>
                        )}
                        {editingSymbol !== i && renderBriefingPanel(symKey, sym, "brand_pattern", symContext)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {onUpdateData && (
              <button type="button" onClick={addSymbol} className="no-print mt-3 w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <span className="text-lg leading-none">+</span>
                <span>Novo Símbolo</span>
              </button>
            )}
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
                        <div className="h-24 bg-gray-50 relative group/patcard">
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
                        {editingPattern === i ? (
                          <div className="no-print space-y-2">
                            <input type="text" value={patternDraft.name ?? ""} onChange={(e) => setPatternDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nome do padrão" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                            <textarea value={patternDraft.description ?? ""} onChange={(e) => setPatternDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Descrição" rows={2} className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y" />
                            <input type="text" value={patternDraft.composition ?? ""} onChange={(e) => setPatternDraft((d) => ({ ...d, composition: e.target.value }))} placeholder="Composição" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                            <input type="text" value={patternDraft.usage ?? ""} onChange={(e) => setPatternDraft((d) => ({ ...d, usage: e.target.value }))} placeholder="Uso" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                            <input type="text" value={patternDraft.density ?? ""} onChange={(e) => setPatternDraft((d) => ({ ...d, density: e.target.value }))} placeholder="Densidade (opcional)" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                            <input type="text" value={patternDraft.background ?? ""} onChange={(e) => setPatternDraft((d) => ({ ...d, background: e.target.value }))} placeholder="Fundo (opcional)" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                            <div className="flex gap-2 pt-1">
                              <button type="button" onClick={savePattern} className="flex-1 text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">Salvar</button>
                              <button type="button" onClick={() => { setEditingPattern(null); setPatternDraft({}); }} className="flex-1 text-xs font-bold text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-3 mb-3">
                              <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">▦</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-gray-900">{pat.name}</h4>
                                  <div className="no-print flex items-center gap-1">
                                    {onGenerate && patImg && !isLoadingPat && (
                                      <button type="button" onClick={() => handleGenerateWithDirection("brand_pattern", patKey, patContext)} disabled={loadingKey !== null} className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 transition disabled:opacity-40">
                                        ↺ Regerar
                                      </button>
                                    )}
                                    {onUpdateData && (
                                      <>
                                        <button type="button" onClick={() => startEditingPattern(i)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition" title="Editar">
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>
                                        {confirmDeletePattern === i ? (
                                          <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => deletePattern(i)} className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100 transition">Sim</button>
                                            <button type="button" onClick={() => setConfirmDeletePattern(null)} className="text-[10px] font-bold text-gray-500 px-1 py-0.5 rounded hover:bg-gray-100 transition">Não</button>
                                          </div>
                                        ) : (
                                          <button type="button" onClick={() => setConfirmDeletePattern(i)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Excluir">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
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
                          </>
                        )}
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
                          {editingPattern === i ? (
                            <div className="no-print space-y-2">
                              <input type="text" value={patternDraft.simpleText ?? ""} onChange={(e) => setPatternDraft((d) => ({ ...d, simpleText: e.target.value }))} placeholder="Descrição do padrão" className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                              <div className="flex gap-2">
                                <button type="button" onClick={savePattern} className="flex-1 text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">Salvar</button>
                                <button type="button" onClick={() => { setEditingPattern(null); setPatternDraft({}); }} className="flex-1 text-xs font-bold text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-gray-700 text-sm">{pat}</span>
                              {onUpdateData && (
                                <div className="no-print flex items-center gap-1 shrink-0">
                                  <button type="button" onClick={() => startEditingPattern(i)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition" title="Editar">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                  {confirmDeletePattern === i ? (
                                    <div className="flex items-center gap-1">
                                      <button type="button" onClick={() => deletePattern(i)} className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100 transition">Sim</button>
                                      <button type="button" onClick={() => setConfirmDeletePattern(null)} className="text-[10px] font-bold text-gray-500 px-1 py-0.5 rounded hover:bg-gray-100 transition">Não</button>
                                    </div>
                                  ) : (
                                    <button type="button" onClick={() => setConfirmDeletePattern(i)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Excluir">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {onGenerate && editingPattern !== i && (
                            <div className="no-print mt-2 flex gap-2">
                              <button type="button" onClick={() => handleGenerateWithDirection("brand_pattern", patKey, patContext)} disabled={loadingKey !== null} className="text-[10px] font-bold bg-gray-900 text-white px-2.5 py-1 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                                {isLoadingPat ? "..." : patImg ? "↺ Regerar" : "✦ Gerar"}
                              </button>
                            </div>
                          )}
                          {editingPattern !== i && renderBriefingPanel(patKey, pat, "brand_pattern", patContext)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {onUpdateData && (
              <button type="button" onClick={addPattern} className="no-print mt-3 w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <span className="text-lg leading-none">+</span>
                <span>Novo Padrão</span>
              </button>
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
