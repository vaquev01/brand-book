"use client";
import { BrandbookData, GeneratedAsset, Application, ImageProvider } from "@/lib/types";
import { PerImageProviderSelect } from "@/components/PerImageProviderSelect";
import { ASSET_CATALOG, detectSizeVariants, type AssetKey } from "@/lib/imagePrompts";
import { downloadImageUrl } from "@/lib/imageTransport";
import { downloadJsonFile } from "@/lib/browserDownload";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
  onGenerateApplication?: (index: number, aspectRatio: string, customInstruction?: string, referenceImages?: string[], providerOverride?: ImageProvider) => void;
  onGenerateAllApplications?: () => void;
  loadingKey?: string | null;
  generatedAssets?: Record<string, GeneratedAsset>;
  onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void;
}

interface AppBriefing {
  instruction: string;
  referenceImages: string[];
  referenceLinks: string[];
}

const KEYWORD_MAP: [string[], string][] = [
  [["card", "cartão", "visita", "business", "vista"], "business_card"],
  [["app", "mobile", "interface", "tela", "screen", "dashboard"], "app_mockup"],
  [["billboard", "outdoor", "placa", "fachada", "totem"], "outdoor_billboard"],
  [["social", "instagram", "post", "feed", "redes"], "social_post_square"],
  [["story", "stories", "vertical", "reels"], "app_mockup"],
  [["cover", "capa", "facebook", "linkedin", "perfil"], "social_cover"],
  [["email", "newsletter", "e-mail", "mailing"], "email_header"],
  [["menu", "cardápio", "folder", "brochure", "material", "coaster", "bolacha", "papelaria"], "brand_collateral"],
  [["lifestyle", "fotos", "photo", "editorial"], "hero_lifestyle"],
  [["hero", "banner", "header", "site", "web", "landing"], "hero_visual"],
  [["pattern", "padrão", "textura", "texture", "estampa"], "brand_pattern"],
  [["logo", "logotipo", "marca", "símbolo"], "logo_primary"],
];

function findImage(
  app: BrandbookData["applications"][number],
  index: number,
  generatedImages: Record<string, string>,
  generatedAssets: Record<string, GeneratedAsset>,
  activeVariant: string
): string | null {
  const appKey = `app_${index}_${activeVariant}`;
  if (generatedAssets[appKey]) return generatedAssets[appKey].url;
  const anyAppKey = Object.keys(generatedAssets).find((k) => k.startsWith(`app_${index}_`));
  if (anyAppKey && generatedAssets[anyAppKey]) return generatedAssets[anyAppKey].url;
  if (app.imageKey && generatedImages[app.imageKey]) return generatedImages[app.imageKey];
  const lc = app.type.toLowerCase();
  for (const [keywords, key] of KEYWORD_MAP) {
    if (keywords.some((kw) => lc.includes(kw)) && generatedImages[key]) {
      return generatedImages[key];
    }
  }
  return null;
}

function downloadImage(url: string, name: string) {
  downloadImageUrl(url, name).catch(() => {
    window.open(url, "_blank");
  });
}

function MockupFrame({ appType }: { appType: string }) {
  const lc = appType.toLowerCase();
  if (/app|mobile|interface|tela|screen|story|stories|reels|vertical/.test(lc)) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="absolute inset-[6px] rounded-[22px] border-[5px] border-gray-900"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 1px rgba(0,0,0,0.5)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-gray-900 rounded-b-xl" />
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-900 rounded-full opacity-80" />
        </div>
      </div>
    );
  }
  if (/site|web|landing|hero|banner|dashboard|browser|email|newsletter/.test(lc)) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-[6px] rounded-lg border-2 border-gray-800 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[22px] bg-gray-900 flex items-center gap-1 px-2">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
            <span className="w-2 h-2 rounded-full bg-green-500/80" />
            <span className="ml-2 flex-1 h-2.5 bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  if (/outdoor|billboard|placa|fachada|totem/.test(lc)) {
    const corners = ["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"];
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {corners.map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-6 h-6`}
            style={{
              borderTop: i < 2 ? "3px solid rgba(255,255,255,0.65)" : "none",
              borderBottom: i >= 2 ? "3px solid rgba(255,255,255,0.65)" : "none",
              borderLeft: i % 2 === 0 ? "3px solid rgba(255,255,255,0.65)" : "none",
              borderRight: i % 2 !== 0 ? "3px solid rgba(255,255,255,0.65)" : "none",
            }}
          />
        ))}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-gray-500/60" />
      </div>
    );
  }
  if (/card|cartão|visita|business/.test(lc)) {
    return (
      <div
        className="absolute inset-4 pointer-events-none z-10 rounded border-2 border-white/20"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }}
      />
    );
  }
  return null;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function SectionApplications({ data, num, generatedImages = {}, onUpdateApplicationImageKey, onGenerateApplication, onGenerateAllApplications, loadingKey, generatedAssets = {}, onUpdateData }: Props) {
  const totalGenerated = Object.keys(generatedImages).length;
  const [activeAppVariant, setActiveAppVariant] = useState<Record<number, string>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [briefings, setBriefings] = useState<Record<number, AppBriefing>>({});
  const [expandedBriefing, setExpandedBriefing] = useState<number | null>(null);
  const [linkInput, setLinkInput] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Application>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [providerOverrides, setProviderOverrides] = useState<Record<number, ImageProvider | null>>({});
  const setAppProvider = useCallback((i: number, val: ImageProvider | null) => {
    setProviderOverrides((prev) => ({ ...prev, [i]: val }));
  }, []);

  useEffect(() => {
    if (!previewImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewImage]);

  const getBriefing = useCallback((i: number): AppBriefing => {
    return briefings[i] ?? { instruction: "", referenceImages: [], referenceLinks: [] };
  }, [briefings]);

  const updateBriefing = useCallback((i: number, patch: Partial<AppBriefing>) => {
    setBriefings((prev) => ({
      ...prev,
      [i]: { ...getBriefing(i), ...patch },
    }));
  }, [getBriefing]);

  const handleAddReferenceImages = useCallback(async (i: number, files: FileList) => {
    const existing = getBriefing(i).referenceImages;
    const newImages: string[] = [];
    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      if (!file.type.startsWith("image/")) continue;
      try {
        const dataUrl = await fileToDataUrl(file);
        newImages.push(dataUrl);
      } catch { /* skip */ }
    }
    updateBriefing(i, { referenceImages: [...existing, ...newImages].slice(0, 10) });
  }, [getBriefing, updateBriefing]);

  const handleRemoveRefImage = useCallback((i: number, idx: number) => {
    const imgs = [...getBriefing(i).referenceImages];
    imgs.splice(idx, 1);
    updateBriefing(i, { referenceImages: imgs });
  }, [getBriefing, updateBriefing]);

  const handleAddLink = useCallback((i: number) => {
    const url = (linkInput[i] ?? "").trim();
    if (!url) return;
    const links = [...getBriefing(i).referenceLinks, url];
    updateBriefing(i, { referenceLinks: links });
    setLinkInput((prev) => ({ ...prev, [i]: "" }));
  }, [getBriefing, updateBriefing, linkInput]);

  const handleRemoveLink = useCallback((i: number, idx: number) => {
    const links = [...getBriefing(i).referenceLinks];
    links.splice(idx, 1);
    updateBriefing(i, { referenceLinks: links });
  }, [getBriefing, updateBriefing]);

  const handleGenerate = useCallback((i: number, aspectRatio: string) => {
    if (!onGenerateApplication) return;
    const b = getBriefing(i);
    const parts: string[] = [];
    if (b.instruction.trim()) parts.push(b.instruction.trim());
    if (b.referenceLinks.length > 0) parts.push(`Reference links: ${b.referenceLinks.join(", ")}`);
    const customInstruction = parts.length > 0 ? parts.join(". ") : undefined;
    const refs = b.referenceImages.length > 0 ? b.referenceImages : undefined;
    const providerOverride = providerOverrides[i] ?? undefined;
    onGenerateApplication(i, aspectRatio, customInstruction, refs, providerOverride);
  }, [onGenerateApplication, getBriefing, providerOverrides]);

  const startEditing = useCallback((i: number) => {
    setEditingIndex(i);
    setEditDraft({ ...data.applications[i] });
  }, [data.applications]);

  const cancelEditing = useCallback(() => {
    setEditingIndex(null);
    setEditDraft({});
  }, []);

  const saveEditing = useCallback(() => {
    if (editingIndex === null || !onUpdateData) return;
    const idx = editingIndex;
    onUpdateData((prev) => {
      const next = [...prev.applications];
      next[idx] = { ...next[idx], ...editDraft } as Application;
      return { ...prev, applications: next };
    });
    setEditingIndex(null);
    setEditDraft({});
  }, [editingIndex, editDraft, onUpdateData]);

  const deleteApplication = useCallback((i: number) => {
    if (!onUpdateData) return;
    onUpdateData((prev) => ({
      ...prev,
      applications: prev.applications.filter((_, j) => j !== i),
    }));
    setConfirmDelete(null);
  }, [onUpdateData]);

  const addApplication = useCallback(() => {
    if (!onUpdateData) return;
    const newApp: Application = {
      type: "Nova Aplicação",
      description: "Descreva esta aplicação da marca",
      imagePlaceholder: "https://placehold.co/800x600/cccccc/666666?text=Nova+Aplicação",
    };
    onUpdateData((prev) => ({
      ...prev,
      applications: [...prev.applications, newApp],
    }));
    setTimeout(() => startEditing(data.applications.length), 50);
  }, [onUpdateData, data.applications.length, startEditing]);

  return (
    <section className="page-break mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {String(num).padStart(2, "0")}. Aplicações
        </h2>
        {onGenerateAllApplications && (
          <button
            onClick={onGenerateAllApplications}
            disabled={loadingKey !== null}
            className="no-print flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loadingKey && loadingKey.startsWith("app_") ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>✦</span>
            )}
            Gerar Todas as Aplicações
          </button>
        )}
      </div>

      {totalGenerated > 0 && (
        <div className="no-print mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <span className="text-green-600 font-bold">✓</span>
          <span>{totalGenerated} {totalGenerated === 1 ? "imagem gerada" : "imagens geradas"} com IA — substituindo os mockups abaixo automaticamente.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {data.applications.map((app, i) => {
          const variants = detectSizeVariants(app.type);
          const activeVariant = activeAppVariant[i] ?? variants[0]?.aspectRatio ?? "1:1";
          const aiImage = findImage(app, i, generatedImages, generatedAssets, activeVariant);
          const selectId = `application-image-key-${i}`;
          const activeKey = `app_${i}_${activeVariant}`;
          const isAnyLoading = variants.some((v) => loadingKey === `app_${i}_${v.aspectRatio}`);
          const briefing = getBriefing(i);
          const isBriefingExpanded = expandedBriefing === i;

          return (
            <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="aspect-video bg-gray-900 overflow-hidden relative">
                {aiImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={aiImage} alt={app.type} className="w-full h-full object-cover" />
                    <MockupFrame appType={app.type} />
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-20">
                      IA
                    </span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ url: aiImage, title: app.type })}
                        className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition"
                      >
                        Visualizar
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadImage(aiImage, `${data.brandName}-${app.type}`)}
                        className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition"
                      >
                        Baixar
                      </button>
                      {generatedAssets[activeKey] && (
                        <button
                          type="button"
                          onClick={() => downloadJsonFile(generatedAssets[activeKey]!, `${data.brandName}-${app.type}-spec.json`)}
                          className="no-print bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow hover:bg-gray-100 transition"
                          title="Exportar especificação de geração"
                        >
                          JSON
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-4">
                    <span className="text-white/20 text-5xl font-black tracking-tighter select-none">{app.type.slice(0, 2).toUpperCase()}</span>
                    <span className="text-white/40 text-xs text-center font-medium">{app.type}</span>
                    {onGenerateApplication && (
                      <button
                        onClick={() => handleGenerate(i, activeVariant)}
                        disabled={loadingKey !== null}
                        className="no-print mt-1 text-[11px] bg-white/10 hover:bg-white/20 text-white/70 px-3 py-1.5 rounded-full transition disabled:opacity-40"
                      >
                        + Gerar imagem
                      </button>
                    )}
                  </div>
                )}
                {isAnyLoading && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                    <span className="text-xs text-gray-600 font-medium">Gerando...</span>
                  </div>
                )}
                {variants.length > 1 && (
                  <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                    {variants.map((v) => {
                      const vKey = `app_${i}_${v.aspectRatio}`;
                      const hasGen = !!generatedAssets[vKey];
                      return (
                        <button
                          key={v.aspectRatio}
                          type="button"
                          onClick={() => setActiveAppVariant((prev) => ({ ...prev, [i]: v.aspectRatio }))}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                            activeVariant === v.aspectRatio
                              ? "bg-gray-900 text-white border-gray-900"
                              : hasGen
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-white/90 text-gray-700 border-gray-300 hover:bg-white"
                          }`}
                        >
                          {hasGen && activeVariant !== v.aspectRatio ? "✓ " : ""}{v.aspectRatio}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-4">
                {editingIndex === i ? (
                  <div className="no-print space-y-2">
                    <input
                      type="text"
                      value={editDraft.type ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, type: e.target.value }))}
                      placeholder="Tipo (ex: Cartão de Visita)"
                      className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <textarea
                      value={editDraft.description ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                      placeholder="Descrição da aplicação"
                      rows={2}
                      className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
                    />
                    <input
                      type="text"
                      value={editDraft.dimensions ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, dimensions: e.target.value }))}
                      placeholder="Dimensões (ex: 90×50mm)"
                      className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <input
                      type="text"
                      value={editDraft.materialSpecs ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, materialSpecs: e.target.value }))}
                      placeholder="Material (ex: Papel Kraft 250g)"
                      className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <textarea
                      value={editDraft.layoutGuidelines ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, layoutGuidelines: e.target.value }))}
                      placeholder="Diretrizes de Layout"
                      rows={2}
                      className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
                    />
                    <input
                      type="text"
                      value={editDraft.typographyHierarchy ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, typographyHierarchy: e.target.value }))}
                      placeholder="Hierarquia Tipográfica"
                      className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <input
                      type="text"
                      value={editDraft.artDirection ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, artDirection: e.target.value }))}
                      placeholder="Direção de Arte"
                      className="w-full bg-gray-50 border rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={saveEditing} className="flex-1 text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">Salvar</button>
                      <button type="button" onClick={cancelEditing} className="flex-1 text-xs font-bold text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold mb-1">{app.type}</h3>
                      {onUpdateData && (
                        <div className="no-print flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                          <button type="button" onClick={() => startEditing(i)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition" title="Editar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          {confirmDelete === i ? (
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => deleteApplication(i)} className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100 transition">Sim</button>
                              <button type="button" onClick={() => setConfirmDelete(null)} className="text-[10px] font-bold text-gray-500 px-1 py-0.5 rounded hover:bg-gray-100 transition">Não</button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setConfirmDelete(i)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Excluir">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{app.description}</p>
                    {(app.dimensions || app.materialSpecs || app.layoutGuidelines || app.typographyHierarchy || app.artDirection || app.substrates) && (
                      <div className="space-y-1 mb-2 border-t pt-2">
                        {app.dimensions && (
                          <div className="text-xs"><span className="font-semibold text-gray-700">Dimensões:</span> <span className="text-gray-600 font-mono">{app.dimensions}</span></div>
                        )}
                        {app.materialSpecs && (
                          <div className="text-xs"><span className="font-semibold text-gray-700">Material:</span> <span className="text-gray-600">{app.materialSpecs}</span></div>
                        )}
                        {app.layoutGuidelines && (
                          <div className="text-xs"><span className="font-semibold text-gray-700">Layout:</span> <span className="text-gray-600">{app.layoutGuidelines}</span></div>
                        )}
                        {app.typographyHierarchy && (
                          <div className="text-xs"><span className="font-semibold text-gray-700">Tipografia:</span> <span className="text-gray-600">{app.typographyHierarchy}</span></div>
                        )}
                        {app.artDirection && (
                          <div className="text-xs"><span className="font-semibold text-gray-700">Direção de Arte:</span> <span className="text-gray-600">{app.artDirection}</span></div>
                        )}
                        {app.substrates && app.substrates.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {app.substrates.map((s, j) => (
                              <span key={j} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {onGenerateApplication && (
                  <div className="no-print border-t pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => setExpandedBriefing(isBriefingExpanded ? null : i)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition"
                    >
                      <span>Direcionamento criativo</span>
                      <span className="text-base leading-none">{isBriefingExpanded ? "−" : "+"}</span>
                    </button>

                    {isBriefingExpanded && (
                      <div className="space-y-3 bg-gray-50 rounded-lg p-3 border">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Como você espera esta imagem?
                          </label>
                          <textarea
                            value={briefing.instruction}
                            onChange={(e) => updateBriefing(i, { instruction: e.target.value })}
                            placeholder="Ex: Quero que o cardápio tenha um estilo rústico, com fundo de madeira escura e tipografia elegante..."
                            rows={3}
                            className="w-full bg-white border rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-y"
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
                                  onClick={() => handleRemoveRefImage(i, idx)}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition"
                                >
                                  x
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[i]?.click()}
                              className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-600 transition"
                            >
                              <span className="text-lg leading-none">+</span>
                            </button>
                            <input
                              ref={(el) => { fileInputRefs.current[i] = el; }}
                              type="file"
                              accept="image/*"
                              multiple
                              aria-label="Adicionar fotos de referência"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) handleAddReferenceImages(i, e.target.files);
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
                              value={linkInput[i] ?? ""}
                              onChange={(e) => setLinkInput((prev) => ({ ...prev, [i]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLink(i); } }}
                              placeholder="https://..."
                              className="flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddLink(i)}
                              className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                            >
                              +
                            </button>
                          </div>
                          {briefing.referenceLinks.length > 0 && (
                            <div className="mt-1.5 space-y-1">
                              {briefing.referenceLinks.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-white border rounded px-2 py-1">
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 truncate flex-1 hover:underline">{link}</a>
                                  <button type="button" onClick={() => handleRemoveLink(i, idx)} className="text-red-500 text-[10px] font-bold hover:text-red-700">x</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <PerImageProviderSelect
                        value={providerOverrides[i] ?? null}
                        onChange={(val) => setAppProvider(i, val)}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {variants.map((v) => {
                          const vKey = `app_${i}_${v.aspectRatio}`;
                          const hasGen = !!generatedAssets[vKey];
                          const isLoadingV = loadingKey === vKey;
                          return (
                            <button
                              key={v.aspectRatio}
                              type="button"
                              onClick={() => {
                                setActiveAppVariant((prev) => ({ ...prev, [i]: v.aspectRatio }));
                                handleGenerate(i, v.aspectRatio);
                              }}
                              disabled={loadingKey !== null}
                              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                hasGen
                                  ? "border-green-500 bg-green-50 text-green-800 hover:bg-green-100"
                                  : "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
                              }`}
                            >
                              {isLoadingV ? "..." : hasGen ? "↺ " + v.label : "✦ " + v.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {onUpdateApplicationImageKey && totalGenerated > 0 && (
                  <div className="no-print mt-2 border-t pt-2">
                    <label
                      htmlFor={selectId}
                      className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      {aiImage ? "Imagem vinculada" : "Vincular imagem gerada"}
                    </label>
                    <select
                      id={selectId}
                      aria-label="Escolher qual imagem gerada usar nesta aplicação"
                      name={selectId}
                      title="Escolher qual imagem gerada usar nesta aplicação"
                      value={app.imageKey ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateApplicationImageKey(i, (val ? (val as AssetKey) : undefined));
                      }}
                      className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    >
                      <option value="">Automático</option>
                      {ASSET_CATALOG.filter((a) => !!generatedImages[a.key]).map((a) => (
                        <option key={a.key} value={a.key}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {onUpdateData && (
          <button
            type="button"
            onClick={addApplication}
            className="no-print w-full border-2 border-dashed border-gray-300 rounded-xl py-8 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 hover:bg-gray-50 transition flex flex-col items-center gap-2"
          >
            <span className="text-2xl leading-none">+</span>
            <span>Nova Aplicação</span>
          </button>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreviewImage(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 border-b">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-gray-900 truncate">Pré-visualização — {previewImage.title}</div>
              </div>
              <button
                type="button"
                className="px-2 py-1 text-sm font-bold text-gray-600 hover:text-gray-900"
                onClick={() => setPreviewImage(null)}
              >
                Fechar
              </button>
            </div>
            <div className="p-4 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg border"
              />
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition"
                  onClick={() => setPreviewImage(null)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition"
                  onClick={() => {
                    downloadImage(previewImage.url, `${data.brandName}-${previewImage.title}`);
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
