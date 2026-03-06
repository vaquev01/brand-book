"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { BrandbookData, GeneratedAsset } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";
import { EditableField } from "@/components/EditableField";

interface Props {
  data: BrandbookData;
  num: number;
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

export function SectionKeyVisual({ data, num, generatedImages = {}, onGenerate, loadingKey, generatedAssets = {}, onDownload, onUpdateData }: Props) {
  const isAdvanced = !!data.keyVisual.iconography;
  const hasFlora = data.keyVisual.flora && data.keyVisual.flora.length > 0;
  const hasFauna = data.keyVisual.fauna && data.keyVisual.fauna.length > 0;
  const hasObjects = data.keyVisual.objects && data.keyVisual.objects.length > 0;
  const hasAssetCategories = hasFlora || hasFauna || hasObjects;

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [briefings, setBriefings] = useState<Record<string, CardBriefing>>({});
  const [expandedBriefing, setExpandedBriefing] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [sectionGenerating, setSectionGenerating] = useState(false);

  const [editingElement, setEditingElement] = useState<number | null>(null);
  const [elementDraft, setElementDraft] = useState("");
  const [editingFloraItem, setEditingFloraItem] = useState<{ list: "flora" | "fauna" | "objects"; idx: number } | null>(null);
  const [floraItemDraft, setFloraItemDraft] = useState("");

  const updateListItem = useCallback((list: "flora" | "fauna" | "objects", idx: number, value: string) => {
    if (!onUpdateData) return;
    onUpdateData((prev) => {
      const arr = [...(prev.keyVisual[list] ?? [])];
      arr[idx] = value;
      return { ...prev, keyVisual: { ...prev.keyVisual, [list]: arr } };
    });
  }, [onUpdateData]);

  const deleteListItem = useCallback((list: "flora" | "fauna" | "objects" | "elements", idx: number) => {
    if (!onUpdateData) return;
    onUpdateData((prev) => {
      if (list === "elements") {
        return { ...prev, keyVisual: { ...prev.keyVisual, elements: prev.keyVisual.elements.filter((_, j) => j !== idx) } };
      }
      return { ...prev, keyVisual: { ...prev.keyVisual, [list]: (prev.keyVisual[list] ?? []).filter((_, j: number) => j !== idx) } };
    });
  }, [onUpdateData]);

  const addListItem = useCallback((list: "flora" | "fauna" | "objects" | "elements") => {
    if (!onUpdateData) return;
    onUpdateData((prev) => {
      if (list === "elements") {
        return { ...prev, keyVisual: { ...prev.keyVisual, elements: [...prev.keyVisual.elements, "Novo elemento gráfico"] } };
      }
      return { ...prev, keyVisual: { ...prev.keyVisual, [list]: [...(prev.keyVisual[list] ?? []), `Novo item`] } };
    });
  }, [onUpdateData]);

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
      const tasks: AssetKey[] = ["hero_visual", "hero_lifestyle"];
      for (const k of tasks) {
        if (generatedAssets[k]) continue;
        await handleGenerateWithDirection(k);
      }
    } finally {
      setSectionGenerating(false);
    }
  }, [onGenerate, sectionGenerating, generatedAssets, handleGenerateWithDirection]);

  function renderBriefingPanel(assetKey: AssetKey, label: string) {
    if (!onGenerate) return null;
    const briefing = getBriefing(assetKey);
    const isExpanded = expandedBriefing === assetKey;
    return (
      <div className="no-print mt-2 space-y-2">
        <button
          type="button"
          onClick={() => setExpandedBriefing(isExpanded ? null : assetKey)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition"
        >
          <span>Direcionamento criativo</span>
          <span className="text-base leading-none">{isExpanded ? "\u2212" : "+"}</span>
        </button>
        {isExpanded && (
          <div className="space-y-3 bg-gray-50 rounded-lg p-3 border">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Como você espera esta imagem?
              </label>
              <textarea
                value={briefing.instruction}
                onChange={(e) => updateBriefing(assetKey, { instruction: e.target.value })}
                placeholder={`Ex: Quero o ${label} com estilo editorial, iluminação golden hour...`}
                rows={3}
                className="w-full bg-white border rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fotos de referência</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {briefing.referenceImages.map((img, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border bg-white group/thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveRefImage(assetKey, idx)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition">x</button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRefs.current[assetKey]?.click()} className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-600 transition">
                  <span className="text-lg leading-none">+</span>
                </button>
                <input ref={(el) => { fileInputRefs.current[assetKey] = el; }} type="file" accept="image/*" multiple aria-label="Adicionar fotos de referência" className="hidden" onChange={(e) => { if (e.target.files) handleAddRefImages(assetKey, e.target.files); e.target.value = ""; }} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Links de referência</label>
              <div className="flex gap-1.5">
                <input type="url" value={linkInput[assetKey] ?? ""} onChange={(e) => setLinkInput((prev) => ({ ...prev, [assetKey]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLink(assetKey); } }} placeholder="https://..." className="flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                <button type="button" onClick={() => handleAddLink(assetKey)} className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">+</button>
              </div>
              {briefing.referenceLinks.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {briefing.referenceLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white border rounded px-2 py-1">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 truncate flex-1 hover:underline">{link}</a>
                      <button type="button" onClick={() => handleRemoveLink(assetKey, idx)} className="text-red-500 text-[10px] font-bold hover:text-red-700">x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => handleGenerateWithDirection(assetKey)} disabled={loadingKey !== null} className="w-full text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {loadingKey === assetKey ? "Gerando..." : `\u2726 Gerar ${label} com direcionamento`}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="page-break mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {String(num).padStart(2, "0")}. Key Visual &amp; Linguagem Gráfica
        </h2>
        {onGenerate && (
          <div className="no-print flex gap-2">
            <button
              type="button"
              onClick={handleGenerateSection}
              disabled={loadingKey !== null || sectionGenerating}
              className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {sectionGenerating ? "Gerando..." : "✦ Gerar seção"}
            </button>
            <button
              onClick={() => handleGenerateWithDirection("hero_visual")}
              disabled={loadingKey !== null}
              className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loadingKey === "hero_visual" ? "Gerando..." : generatedAssets["hero_visual"] ? "\u21ba Hero" : "\u2726 Gerar Hero"}
            </button>
            <button
              onClick={() => handleGenerateWithDirection("hero_lifestyle")}
              disabled={loadingKey !== null}
              className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loadingKey === "hero_lifestyle" ? "Gerando..." : generatedAssets["hero_lifestyle"] ? "\u21ba Lifestyle" : "\u2726 Lifestyle"}
            </button>
          </div>
        )}
      </div>

      {/* Generated hero images */}
      {(generatedImages["hero_visual"] || generatedImages["hero_lifestyle"]) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">
          {generatedImages["hero_visual"] && (
            <div className="rounded-xl overflow-hidden border shadow-sm relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedImages["hero_visual"]} alt="Hero Visual" className="w-full aspect-video object-cover" />
              <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Hero · IA</span>
              {loadingKey === "hero_visual" && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                </div>
              )}
              {loadingKey !== "hero_visual" && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={() => setPreviewImage({ url: generatedImages["hero_visual"], title: "Hero Visual" })} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Visualizar</button>
                  <button type="button" onClick={() => { if (onDownload) onDownload(generatedImages["hero_visual"], `${data.brandName}-hero-visual`); else downloadImageDirect(generatedImages["hero_visual"], `${data.brandName}-hero-visual`); }} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Baixar</button>
                </div>
              )}
            </div>
          )}
          {generatedImages["hero_lifestyle"] && (
            <div className="rounded-xl overflow-hidden border shadow-sm relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedImages["hero_lifestyle"]} alt="Lifestyle" className="w-full aspect-video object-cover" />
              <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Lifestyle · IA</span>
              {loadingKey === "hero_lifestyle" && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                </div>
              )}
              {loadingKey !== "hero_lifestyle" && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={() => setPreviewImage({ url: generatedImages["hero_lifestyle"], title: "Lifestyle" })} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Visualizar</button>
                  <button type="button" onClick={() => { if (onDownload) onDownload(generatedImages["hero_lifestyle"], `${data.brandName}-lifestyle`); else downloadImageDirect(generatedImages["hero_lifestyle"], `${data.brandName}-lifestyle`); }} className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition">Baixar</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Briefing panels for hero images */}
      {onGenerate && (
        <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">
          <div className="bg-white border rounded-xl p-3">
            <span className="text-xs font-bold text-gray-700">Hero Visual</span>
            {renderBriefingPanel("hero_visual", "Hero")}
          </div>
          <div className="bg-white border rounded-xl p-3">
            <span className="text-xs font-bold text-gray-700">Lifestyle</span>
            {renderBriefingPanel("hero_lifestyle", "Lifestyle")}
          </div>
        </div>
      )}

      {data.keyVisual.compositionPhilosophy && (
        <div className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-4 mb-6">
          <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-gray-500">Filosofia de Composição</h3>
          <EditableField
            value={data.keyVisual.compositionPhilosophy}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, keyVisual: { ...prev.keyVisual, compositionPhilosophy: val } }))}
            className="text-gray-700"
            readOnly={!onUpdateData}
            multiline
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 items-start">
        <div>
          <h3 className="text-base font-bold mb-3">Elementos Gráficos</h3>
          <ul className="space-y-3">
            {data.keyVisual.elements.map((e, i) => (
              <li key={i} className="flex items-start gap-3 group/el">
                <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                {editingElement === i ? (
                  <div className="no-print flex-1 flex gap-2">
                    <input type="text" value={elementDraft} onChange={(ev) => setElementDraft(ev.target.value)} placeholder="Elemento gráfico" className="flex-1 bg-gray-50 border rounded-lg px-3 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                    <button type="button" onClick={() => { if (onUpdateData) { onUpdateData((prev) => { const next = [...prev.keyVisual.elements]; next[i] = elementDraft; return { ...prev, keyVisual: { ...prev.keyVisual, elements: next } }; }); } setEditingElement(null); }} className="text-xs font-bold bg-gray-900 text-white px-2.5 py-1 rounded-lg hover:bg-gray-800 transition">OK</button>
                    <button type="button" onClick={() => setEditingElement(null)} className="text-xs font-bold text-gray-600 border px-2.5 py-1 rounded-lg hover:bg-gray-100 transition">x</button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-start justify-between gap-2">
                    <span className="text-gray-700">{e}</span>
                    {onUpdateData && (
                      <div className="no-print flex items-center gap-1 shrink-0 opacity-0 group-hover/el:opacity-100 transition">
                        <button type="button" onClick={() => { setEditingElement(i); setElementDraft(e); }} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition" title="Editar">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button type="button" onClick={() => deleteListItem("elements", i)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Excluir">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {onUpdateData && (
            <button type="button" onClick={() => addListItem("elements")} className="no-print mt-3 w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-xs font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50 transition">
              + Novo Elemento
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold mb-2">Estilo Fotográfico</h3>
            <EditableField
              value={data.keyVisual.photographyStyle}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, keyVisual: { ...prev.keyVisual, photographyStyle: val } }))}
              className="text-gray-600 text-sm"
              readOnly={!onUpdateData}
              multiline
            />
          </div>

          {isAdvanced && data.keyVisual.iconography && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">Iconografia</h3>
              <EditableField
                value={data.keyVisual.iconography}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, keyVisual: { ...prev.keyVisual, iconography: val } }))}
                className="text-gray-600 text-sm"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}

          {isAdvanced && data.keyVisual.illustrations && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">Ilustrações</h3>
              <EditableField
                value={data.keyVisual.illustrations}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, keyVisual: { ...prev.keyVisual, illustrations: val } }))}
                className="text-gray-600 text-sm"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}

          {isAdvanced && data.keyVisual.marketingArchitecture && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">Arquitetura de Marketing</h3>
              <EditableField
                value={data.keyVisual.marketingArchitecture}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, keyVisual: { ...prev.keyVisual, marketingArchitecture: val } }))}
                className="text-gray-600 text-sm"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
        </div>
      </div>

      {(hasAssetCategories || onUpdateData) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {(hasFlora || onUpdateData) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🌿</span> Flora
              </h3>
              <ul className="space-y-2">
                {(data.keyVisual.flora ?? []).map((item, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2 group/fi">
                    <span className="text-green-400 shrink-0 mt-0.5">●</span>
                    {editingFloraItem?.list === "flora" && editingFloraItem.idx === i ? (
                      <div className="no-print flex-1 flex gap-1">
                        <input type="text" value={floraItemDraft} onChange={(ev) => setFloraItemDraft(ev.target.value)} placeholder="Flora" className="flex-1 bg-white border rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-400" />
                        <button type="button" onClick={() => { updateListItem("flora", i, floraItemDraft); setEditingFloraItem(null); }} className="text-[10px] font-bold bg-green-700 text-white px-2 py-0.5 rounded hover:bg-green-800 transition">OK</button>
                        <button type="button" onClick={() => setEditingFloraItem(null)} className="text-[10px] font-bold text-green-700 px-1 py-0.5 rounded hover:bg-green-100 transition">x</button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {onUpdateData && (
                          <div className="no-print flex gap-0.5 shrink-0 opacity-0 group-hover/fi:opacity-100 transition">
                            <button type="button" onClick={() => { setEditingFloraItem({ list: "flora", idx: i }); setFloraItemDraft(item); }} className="w-4 h-4 flex items-center justify-center rounded text-green-600 hover:bg-green-200 transition" title="Editar"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button type="button" onClick={() => deleteListItem("flora", i)} className="w-4 h-4 flex items-center justify-center rounded text-green-600 hover:text-red-600 hover:bg-red-50 transition" title="Excluir"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {onUpdateData && (
                <button type="button" onClick={() => addListItem("flora")} className="no-print mt-2 w-full border border-dashed border-green-300 rounded-lg py-1.5 text-[10px] font-medium text-green-600 hover:border-green-500 hover:bg-green-100 transition">+ Adicionar</button>
              )}
            </div>
          )}
          {(hasFauna || onUpdateData) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🦜</span> Fauna
              </h3>
              <ul className="space-y-2">
                {(data.keyVisual.fauna ?? []).map((item, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2 group/fi">
                    <span className="text-amber-400 shrink-0 mt-0.5">●</span>
                    {editingFloraItem?.list === "fauna" && editingFloraItem.idx === i ? (
                      <div className="no-print flex-1 flex gap-1">
                        <input type="text" value={floraItemDraft} onChange={(ev) => setFloraItemDraft(ev.target.value)} placeholder="Fauna" className="flex-1 bg-white border rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
                        <button type="button" onClick={() => { updateListItem("fauna", i, floraItemDraft); setEditingFloraItem(null); }} className="text-[10px] font-bold bg-amber-700 text-white px-2 py-0.5 rounded hover:bg-amber-800 transition">OK</button>
                        <button type="button" onClick={() => setEditingFloraItem(null)} className="text-[10px] font-bold text-amber-700 px-1 py-0.5 rounded hover:bg-amber-100 transition">x</button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {onUpdateData && (
                          <div className="no-print flex gap-0.5 shrink-0 opacity-0 group-hover/fi:opacity-100 transition">
                            <button type="button" onClick={() => { setEditingFloraItem({ list: "fauna", idx: i }); setFloraItemDraft(item); }} className="w-4 h-4 flex items-center justify-center rounded text-amber-600 hover:bg-amber-200 transition" title="Editar"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button type="button" onClick={() => deleteListItem("fauna", i)} className="w-4 h-4 flex items-center justify-center rounded text-amber-600 hover:text-red-600 hover:bg-red-50 transition" title="Excluir"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {onUpdateData && (
                <button type="button" onClick={() => addListItem("fauna")} className="no-print mt-2 w-full border border-dashed border-amber-300 rounded-lg py-1.5 text-[10px] font-medium text-amber-600 hover:border-amber-500 hover:bg-amber-100 transition">+ Adicionar</button>
              )}
            </div>
          )}
          {(hasObjects || onUpdateData) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🎸</span> Objetos
              </h3>
              <ul className="space-y-2">
                {(data.keyVisual.objects ?? []).map((item, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2 group/fi">
                    <span className="text-blue-400 shrink-0 mt-0.5">●</span>
                    {editingFloraItem?.list === "objects" && editingFloraItem.idx === i ? (
                      <div className="no-print flex-1 flex gap-1">
                        <input type="text" value={floraItemDraft} onChange={(ev) => setFloraItemDraft(ev.target.value)} placeholder="Objeto" className="flex-1 bg-white border rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        <button type="button" onClick={() => { updateListItem("objects", i, floraItemDraft); setEditingFloraItem(null); }} className="text-[10px] font-bold bg-blue-700 text-white px-2 py-0.5 rounded hover:bg-blue-800 transition">OK</button>
                        <button type="button" onClick={() => setEditingFloraItem(null)} className="text-[10px] font-bold text-blue-700 px-1 py-0.5 rounded hover:bg-blue-100 transition">x</button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-start justify-between gap-1">
                        <span>{item}</span>
                        {onUpdateData && (
                          <div className="no-print flex gap-0.5 shrink-0 opacity-0 group-hover/fi:opacity-100 transition">
                            <button type="button" onClick={() => { setEditingFloraItem({ list: "objects", idx: i }); setFloraItemDraft(item); }} className="w-4 h-4 flex items-center justify-center rounded text-blue-600 hover:bg-blue-200 transition" title="Editar"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button type="button" onClick={() => deleteListItem("objects", i)} className="w-4 h-4 flex items-center justify-center rounded text-blue-600 hover:text-red-600 hover:bg-red-50 transition" title="Excluir"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {onUpdateData && (
                <button type="button" onClick={() => addListItem("objects")} className="no-print mt-2 w-full border border-dashed border-blue-300 rounded-lg py-1.5 text-[10px] font-medium text-blue-600 hover:border-blue-500 hover:bg-blue-100 transition">+ Adicionar</button>
              )}
            </div>
          )}
        </div>
      )}

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
