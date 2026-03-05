"use client";
import { BrandbookData, GeneratedAsset } from "@/lib/types";
import { ASSET_CATALOG, detectSizeVariants, type AssetKey } from "@/lib/imagePrompts";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  onUpdateApplicationImageKey?: (index: number, imageKey: AssetKey | undefined) => void;
  onGenerateApplication?: (index: number, aspectRatio: string, customInstruction?: string, referenceImages?: string[]) => void;
  onGenerateAllApplications?: () => void;
  loadingKey?: string | null;
  generatedAssets?: Record<string, GeneratedAsset>;
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
  const fileName = `${name.replace(/\s+/g, "-").toLowerCase()}.png`;
  if (url.startsWith("data:")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    fetch("/api/image-to-dataurl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((json: { dataUrl?: string }) => {
        if (json.dataUrl) {
          const a = document.createElement("a");
          a.href = json.dataUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(url, "_blank");
        }
      })
      .catch(() => {
        window.open(url, "_blank");
      });
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function SectionApplications({ data, num, generatedImages = {}, onUpdateApplicationImageKey, onGenerateApplication, onGenerateAllApplications, loadingKey, generatedAssets = {} }: Props) {
  const totalGenerated = Object.keys(generatedImages).length;
  const [activeAppVariant, setActiveAppVariant] = useState<Record<number, string>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [briefings, setBriefings] = useState<Record<number, AppBriefing>>({});
  const [expandedBriefing, setExpandedBriefing] = useState<number | null>(null);
  const [linkInput, setLinkInput] = useState<Record<number, string>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

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
    onGenerateApplication(i, aspectRatio, customInstruction, refs);
  }, [onGenerateApplication, getBriefing]);

  return (
    <section className="page-break mb-10">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
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
                <h3 className="font-bold mb-1">{app.type}</h3>
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
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
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
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
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
