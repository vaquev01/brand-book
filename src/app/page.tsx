"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BrandbookViewer } from "@/components/BrandbookViewer";
import { ExampleCard } from "@/components/ExampleCard";
import { JsonBySectionPanel } from "@/components/JsonBySectionPanel";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { ApiKeyConfig, ApiKeyStatusBadge, loadApiKeys, EMPTY_KEYS, type ApiKeys } from "@/components/ApiKeyConfig";
import { BrandbookEditor } from "@/components/BrandbookEditor";
import { UploadedAssetsPanel } from "@/components/UploadedAssetsPanel";
import { GenerateBriefingForm, type GenerateBriefingData } from "@/components/GenerateBriefingForm";
import { GenerationProgress } from "@/components/GenerationProgress";
import { RefinePanel } from "@/components/RefinePanel";
import { ConsistencyPanel } from "@/components/ConsistencyPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { RegenerateSectionsPanel } from "@/components/RegenerateSectionsPanel";
import { BrandbookData, GeneratedAsset, UploadedAsset, ImageProvider, type AssetPackFile } from "@/lib/types";
import { saasExample, barExample, sushiExample, caracaBarExample } from "@/lib/examples";
import { generateProductionManifest } from "@/lib/productionExport";
import { BrandbookSchemaLoose, BrandbookSchemaV2, formatZodIssues } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import { decompressBrandbook } from "@/lib/shareUtils";
import { buildImagePrompt, type AssetKey } from "@/lib/imagePrompts";
import { downloadBlob, downloadJsonFile } from "@/lib/browserDownload";
import {
  clearBrandbookGeneratedAssetSession,
  loadBrandbookSessionAssets,
  migrateLegacyLocalStorageToIndexedDB,
  slugifyForStorage,
} from "@/lib/brandbookLocalSession";
import { readJsonResponse } from "@/lib/http";
import { fetchImageDataUrl } from "@/lib/imageTransport";
import {
  getActiveSlug, setActiveSlug,
  saveBrandbookData, loadBrandbookData,
  saveGeneratedImage,
  saveBrandAssets,
  saveAssetPack,
} from "@/lib/imageStorage";
import {
  Settings, Sparkles, Library, Eye, BookOpen, Pencil, LayoutDashboard,
  Image as ImageIcon, Wand2, ShieldCheck, Download,
  Trash2, UploadCloud, FileJson, Hexagon, Undo2, Redo2,
} from "lucide-react";

type Tab = "generate" | "examples" | "viewer";
type ViewerTab = "preview" | "edit" | "assets" | "refine" | "consistency" | "export";

export default function Home() {
  const [tab, setTab] = useState<Tab>("examples");
  const [loading, setLoading] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [generationPct, setGenerationPct] = useState(0);
  const [error, setError] = useState("");
  const [brandbookData, setBrandbookData] = useState<BrandbookData | null>(null);
  const brandbookRef = useRef<BrandbookData | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [viewerTab, setViewerTab] = useState<ViewerTab>("preview");
  const [generatedAssets, setGeneratedAssets] = useState<Record<string, GeneratedAsset>>({});
  const [uploadedBrandAssets, setUploadedBrandAssets] = useState<UploadedAsset[]>([]);
  const [assetPackFiles, setAssetPackFiles] = useState<AssetPackFile[]>([]);
  const [assetPackGenerating, setAssetPackGenerating] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ ...EMPTY_KEYS });
  const [textProvider, setTextProvider] = useState<"openai" | "gemini">("openai");
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [exportingPack, setExportingPack] = useState(false);
  const [undoStack, setUndoStack] = useState<BrandbookData[]>([]);
  const [redoStack, setRedoStack] = useState<BrandbookData[]>([]);

  useEffect(() => {
    brandbookRef.current = brandbookData;
  }, [brandbookData]);

  function resetHistory() {
    setUndoStack([]);
    setRedoStack([]);
  }

  function updateBrandbook(updater: (prev: BrandbookData) => BrandbookData) {
    setBrandbookData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      setUndoStack((s) => [...s.slice(-19), prev]);
      setRedoStack([]);
      return next;
    });
  }

  function handleUndo() {
    setUndoStack((s) => {
      if (s.length === 0) return s;
      const current = brandbookRef.current;
      const prev = s[s.length - 1];
      if (current) setRedoStack((r) => [...r.slice(-19), current]);
      setBrandbookData(prev);
      return s.slice(0, -1);
    });
  }

  function handleRedo() {
    setRedoStack((s) => {
      if (s.length === 0) return s;
      const current = brandbookRef.current;
      const next = s[s.length - 1];
      if (current) setUndoStack((u) => [...u.slice(-19), current]);
      setBrandbookData(next);
      return s.slice(0, -1);
    });
  }

  const restoreBrandbookSession = useCallback(async (
    nextBrandbook: BrandbookData,
    options: { nextTab?: Tab; nextViewerTab?: ViewerTab } = {}
  ) => {
    resetHistory();
    setBrandbookData(nextBrandbook);
    const slug = slugifyForStorage(nextBrandbook.brandName);
    const session = await loadBrandbookSessionAssets(slug);
    setGeneratedAssets(session.generatedAssets);
    setUploadedBrandAssets(session.uploadedBrandAssets);
    setAssetPackFiles(session.assetPackFiles);
    if (options.nextViewerTab) setViewerTab(options.nextViewerTab);
    if (options.nextTab) setTab(options.nextTab);
    setError("");
  }, []);

  async function autoGenerateLogos(bbData: BrandbookData, keys: ApiKeys, tp: "openai" | "gemini") {
    const providerKeyMap: Record<ImageProvider, keyof ApiKeys> = {
      dalle3: "openai", stability: "stability", ideogram: "ideogram", imagen: "google",
    };
    const order: ImageProvider[] = ["imagen", "dalle3", "stability", "ideogram"];
    const provider = order.find((p) => !!keys[providerKeyMap[p]]);
    if (!provider) return;

    const logoKeys: AssetKey[] = ["logo_primary", "logo_dark_bg"];
    const slug = slugifyForStorage(bbData.brandName);
    const session = await loadBrandbookSessionAssets(slug).catch((): {
      assetPackFiles: AssetPackFile[];
      generatedAssets: Record<string, GeneratedAsset>;
      uploadedBrandAssets: UploadedAsset[];
    } => ({
      assetPackFiles: [],
      generatedAssets: {},
      uploadedBrandAssets: [],
    }));
    const merged = session.generatedAssets;
    const toGenerate = logoKeys.filter((k) => !merged[k]);
    if (toGenerate.length === 0) return;

    setGenerationPhase("Gerando logos automaticamente...");
    setGenerationPct(85);

    for (let i = 0; i < toGenerate.length; i++) {
      const assetKey = toGenerate[i];
      const label = assetKey === "logo_primary" ? "Logo (Fundo Claro)" : "Logo (Versão Invertida)";
      setGenerationPhase(`Gerando ${label}...`);
      setGenerationPct(85 + Math.round(((i) / toGenerate.length) * 12));

      try {
        const basePrompt = buildImagePrompt(assetKey, bbData, provider);
        let prompt = basePrompt;

        const hasTextKey = (tp === "openai" && !!keys.openai) || (tp === "gemini" && !!keys.google);
        if (hasTextKey) {
          try {
            const refineRes = await fetch("/api/refine-image-prompt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                basePrompt,
                imageProvider: provider,
                assetKey,
                textProvider: tp,
                openaiKey: keys.openai || undefined,
                googleKey: keys.google || undefined,
                openaiModel: keys.openaiTextModel || undefined,
                googleModel: keys.googleTextModel || undefined,
              }),
            });
            const refineJson = await readJsonResponse<{ prompt?: string }>(
              refineRes,
              "/api/refine-image-prompt"
            );
            if (refineRes.ok && refineJson.prompt) prompt = refineJson.prompt;
          } catch { /* use base prompt */ }
        }

        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            provider,
            aspectRatio: "1:1",
            openaiKey: keys.openai || undefined,
            stabilityKey: keys.stability || undefined,
            ideogramKey: keys.ideogram || undefined,
            googleKey: keys.google || undefined,
            openaiImageModel: keys.openaiImageModel || undefined,
            stabilityModel: keys.stabilityModel || undefined,
            ideogramModel: keys.ideogramModel || undefined,
            googleImageModel: keys.googleImageModel || undefined,
          }),
        });
        const result = await readJsonResponse<{ url?: string; error?: string }>(
          res,
          "/api/generate-image"
        );
        if (res.ok && result.url) {
          const asset: GeneratedAsset = {
            key: assetKey,
            url: result.url,
            provider,
            prompt,
            generatedAt: new Date().toISOString(),
          };
          setGeneratedAssets((prev) => ({ ...prev, [assetKey]: asset }));
        }
      } catch { /* skip silently, user can generate manually */ }
    }

    setGenerationPct(100);
    setGenerationPhase("");
  }

  useEffect(() => {
    const keys = loadApiKeys();
    setApiKeys(keys);
    if (!keys.openai && keys.google) setTextProvider("gemini");
    else if (keys.openai) setTextProvider("openai");

    void (async () => {
      await migrateLegacyLocalStorageToIndexedDB().catch(() => {});

      // Load shared brandbook from URL
      const params = new URLSearchParams(window.location.search);
      const bbParam = params.get("bb");
      if (bbParam) {
        setLoadingShared(true);
        setTab("viewer");
        setViewerTab("preview");
        decompressBrandbook(bbParam)
          .then(async (raw) => {
            if (!raw) throw new Error("Link inválido");
            const migrated = migrateBrandbook(raw);
            const validated = BrandbookSchemaLoose.safeParse(migrated);
            if (!validated.success) throw new Error("Link inválido");
            await restoreBrandbookSession(migrated as BrandbookData, {
              nextTab: "viewer",
              nextViewerTab: "preview",
            });
            window.history.replaceState({}, "", window.location.pathname);
          })
          .catch(() => {
            setError("Link compartilhado inválido ou expirado.");
            setTab("examples");
          })
          .finally(() => {
            setLoadingShared(false);
          });
        return;
      }

      // Restore last active brandbook session from storage
      const activeSlug = getActiveSlug();
      if (activeSlug) {
        const savedData = loadBrandbookData(activeSlug);
        if (savedData) {
          try {
            const migrated = migrateBrandbook(savedData);
            void restoreBrandbookSession(migrated as BrandbookData, { nextTab: "viewer" });
          } catch {
            // Corrupt saved data — ignore and show default screen
          }
        }
      }
    })();
  }, [restoreBrandbookSession]);


  async function handleGenerate(formData: GenerateBriefingData) {
    setLoading(true);
    setError("");
    setBrandbookData(null);
    resetHistory();
    setGenerationPhase("Preparando geração...");
    setGenerationPct(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: formData.brandName,
          industry: formData.industry,
          briefing: formData.briefing,
          externalUrls: formData.externalUrls,
          provider: textProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: apiKeys.openaiTextModel || undefined,
          googleModel: apiKeys.googleTextModel || undefined,
          referenceImages: formData.referenceImages.length > 0
            ? formData.referenceImages.map((img) => img.dataUrl)
            : undefined,
          logoImage: formData.logoImage?.dataUrl ?? undefined,
          scope: formData.scope,
          creativityLevel: formData.creativityLevel,
          intentionality: formData.intentionality,
        }),
      });

      if (!res.body) throw new Error("Streaming não suportado pelo servidor.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(trimmed.slice(6)) as {
              type: string;
              phase?: string;
              pct?: number;
              data?: BrandbookData;
              error?: string;
            };

            if (event.type === "progress") {
              setGenerationPhase(event.phase ?? "");
              setGenerationPct(event.pct ?? 0);
            } else if (event.type === "complete" && event.data) {
              const migrated = migrateBrandbook(event.data);
              const strict = BrandbookSchemaV2.safeParse(migrated);
              const nextBrandbook = (strict.success ? strict.data : migrated) as unknown as BrandbookData;
              await restoreBrandbookSession(nextBrandbook, { nextTab: "viewer" });

              // Auto-generate logo images
              const currentKeys = loadApiKeys();
              const tp = (!currentKeys.openai && currentKeys.google) ? "gemini" : "openai";
              autoGenerateLogos(nextBrandbook, currentKeys, tp).catch(() => {});
            } else if (event.type === "error") {
              throw new Error(event.error ?? "Erro desconhecido");
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
    } finally {
      setLoading(false);
      setGenerationPhase("");
      setGenerationPct(0);
    }
  }

  function handleLoadExample(example: BrandbookData) {
    try {
      const migrated = migrateBrandbook(example);
      void restoreBrandbookSession(migrated, {
        nextTab: "viewer",
        nextViewerTab: "preview",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar exemplo");
      return;
    }
  }

  async function handleExportPack() {
    if (!brandbookData) return;
    setExportingPack(true);
    setError("");
    try {
      const res = await fetch("/api/export-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbookData,
          generatedAssets: Object.values(generatedAssets),
          uploadedAssets: uploadedBrandAssets,
          assetPackFiles,
        }),
      });
      if (!res.ok) {
        const j = await readJsonResponse<{ error?: string }>(res, "/api/export-pack").catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Erro ao exportar pack");
      }
      const blob = await res.blob();
      const slug = slugifyForStorage(brandbookData.brandName);
      downloadBlob(blob, `${slug}-brandbook-pack.zip`, { rel: "noopener" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao exportar pack");
    } finally {
      setExportingPack(false);
    }
  }

  function handleExportBrandbook() {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    downloadJsonFile(brandbookData, `${slug}-brandbook.json`);
  }

  function handleExportProduction() {
    if (!brandbookData) return;
    const manifest = generateProductionManifest(brandbookData);
    const slug = slugifyForStorage(brandbookData.brandName);
    downloadJsonFile(manifest, `${slug}-production-manifest.json`);
  }

  async function handleImportJson() {
    try {
      const parsed = JSON.parse(jsonText);
      const migrated = migrateBrandbook(parsed);
      const base = BrandbookSchemaLoose.safeParse(migrated);
      if (!base.success) {
        setError("JSON inválido:\n" + formatZodIssues(base.error.issues));
        return;
      }
      await restoreBrandbookSession(migrated, {
        nextTab: "viewer",
        nextViewerTab: "preview",
      });
    } catch {
      setError("JSON inválido. Verifique a formatação.");
    }
  }

  async function handleGenerateAssetPack() {
    if (!brandbookData) return;

    const hasKey = (textProvider === "openai" && !!apiKeys.openai) || (textProvider === "gemini" && !!apiKeys.google);
    if (!hasKey) {
      setError("Configure uma chave de IA (OpenAI ou Google) para gerar o Asset Pack.");
      return;
    }

    setAssetPackGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate-asset-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbookData,
          textProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: apiKeys.openaiTextModel || undefined,
          googleModel: apiKeys.googleTextModel || undefined,
        }),
      });
      const j = await readJsonResponse<{ files?: AssetPackFile[]; error?: string }>(
        res,
        "/api/generate-asset-pack"
      ).catch((): { files?: AssetPackFile[]; error?: string } => ({}));
      if (!res.ok) throw new Error(j.error ?? "Erro ao gerar Asset Pack");
      if (!j.files || !Array.isArray(j.files)) throw new Error("Resposta inválida ao gerar Asset Pack");
      setAssetPackFiles(j.files);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao gerar Asset Pack");
    } finally {
      setAssetPackGenerating(false);
    }
  }

  // Persist brandbook JSON to localStorage whenever it changes
  useEffect(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    saveBrandbookData(slug, brandbookData);
    setActiveSlug(slug);
  }, [brandbookData]);

  useEffect(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    // Save each image to IndexedDB (primary — handles multi-MB base64 blobs)
    for (const [key, asset] of Object.entries(generatedAssets)) {
      saveGeneratedImage(slug, key, asset).catch(() => {});
    }
  }, [generatedAssets, brandbookData]);

  useEffect(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    // Save to IndexedDB (handles large dataUrls)
    saveBrandAssets(slug, uploadedBrandAssets).catch(() => {});
  }, [uploadedBrandAssets, brandbookData]);

  useEffect(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    saveAssetPack(slug, assetPackFiles).catch(() => {});
  }, [assetPackFiles, brandbookData]);

  function handleClearImageCache() {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    const ok = window.confirm("Remover imagens geradas salvas (cache) para este brandbook?");
    if (!ok) return;
    void clearBrandbookGeneratedAssetSession(slug);
    setGeneratedAssets({});
  }

  async function handleAssetGenerated(key: string, asset: GeneratedAsset) {
    let storedAsset = asset;
    // For DALL-E 3 / Ideogram: external URLs expire — display immediately,
    // then convert to permanent data URL in the background
    if (asset.url.startsWith("https://")) {
      storedAsset = { ...asset, originalUrl: asset.url };
      setGeneratedAssets((prev) => ({ ...prev, [key]: storedAsset }));
      fetchImageDataUrl(asset.url)
        .then((dataUrl) => {
          const permanent = { ...storedAsset, url: dataUrl };
          setGeneratedAssets((prev) => ({ ...prev, [key]: permanent }));
          const current = brandbookRef.current;
          if (current) {
            const slug = slugifyForStorage(current.brandName);
            saveGeneratedImage(slug, key, permanent).catch(() => {});
          }
        })
        .catch(() => {}); // Keep external URL if conversion fails
      return;
    }
    setGeneratedAssets((prev) => ({ ...prev, [key]: storedAsset }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        {tab === "viewer" && brandbookData ? (
          /* ── Viewer mode: single consolidated row ── */
          <div className="px-3 sm:px-4 py-1.5 flex items-center gap-2 min-w-0">
            {/* Logo — click to go back */}
            <button
              onClick={() => setTab("generate")}
              className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center shadow-inner flex-shrink-0 hover:bg-gray-700 transition"
              title="Voltar ao gerador"
            >
              <Hexagon className="text-white w-3.5 h-3.5" fill="currentColor" />
            </button>

            {/* Brand name */}
            <span className="text-sm font-extrabold text-gray-900 truncate flex-shrink-0 max-w-[120px] sm:max-w-[180px] hidden xs:block">
              {brandbookData.brandName}
            </span>

            {/* Divider */}
            <div className="w-px h-4 bg-gray-200 flex-shrink-0 hidden sm:block" />

            {/* Sub-tabs — flex-1 with overflow scroll */}
            <nav className="flex gap-0.5 bg-gray-100 rounded-xl p-1 flex-1 min-w-0 overflow-x-auto">
              <button onClick={() => setViewerTab("preview")} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${viewerTab === "preview" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`}>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Brandbook</span>
              </button>
              <button onClick={() => setViewerTab("edit")} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${viewerTab === "edit" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`}>
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button onClick={() => setViewerTab("assets")} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${viewerTab === "assets" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`}>
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ref. Assets</span>
                {uploadedBrandAssets.length > 0 && <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{uploadedBrandAssets.length}</span>}
              </button>
              <button onClick={() => setViewerTab("refine")} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${viewerTab === "refine" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`}>
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refinar</span>
              </button>
              <button onClick={() => setViewerTab("consistency")} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${viewerTab === "consistency" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Consistência</span>
              </button>
              <button onClick={() => setViewerTab("export")} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${viewerTab === "export" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`}>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </nav>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleUndo} disabled={undoStack.length === 0} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition" title="Desfazer">
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleRedo} disabled={redoStack.length === 0} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition" title="Refazer">
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleClearImageCache} disabled={Object.keys(generatedAssets).length === 0} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition" title="Limpar imagens geradas">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setShowApiConfig(true)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition" title="APIs">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewerTab("export")} className="flex items-center gap-1 bg-indigo-600 text-white py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-indigo-700 transition ml-1">
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Default mode ── */
          <div className="max-w-full px-4 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                <Hexagon className="text-white w-4 h-4" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-gray-900 leading-tight">Brandbook Builder</h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gerador de Manual com IA</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ApiKeyStatusBadge keys={apiKeys} />
              <button onClick={() => setShowApiConfig(true)} className="flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-gray-200 transition" title="Configurar chaves de API">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">APIs</span>
              </button>
              <nav className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setTab("generate")} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "generate" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Gerar com IA</span>
                </button>
                <button onClick={() => setTab("examples")} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "examples" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>
                  <Library className="w-4 h-4" />
                  <span className="hidden sm:inline">Exemplos</span>
                </button>
                {brandbookData && (
                  <button onClick={() => setTab("viewer")} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "viewer" ? "bg-white shadow-sm text-indigo-700" : "text-gray-500 hover:text-gray-900"}`}>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      <ApiKeyConfig
        isOpen={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        onSave={(keys) => {
          setApiKeys(keys);
          setShowApiConfig(false);
        }}
      />

      <main className={tab === "viewer" ? "w-full pt-2 pb-8" : "max-w-7xl mx-auto px-6 py-8"}>
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        {tab === "viewer" && !brandbookData && loadingShared && (
          <div className="max-w-xl mx-auto bg-white border rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-sm font-semibold text-gray-700">Carregando brandbook compartilhado...</span>
            </div>
          </div>
        )}

        {/* Tab: Generate */}
        {tab === "generate" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border rounded-xl p-8 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Gerar Brandbook com IA</h2>
                  <p className="text-gray-500 text-sm mt-1">Defina o briefing, escopo e nível de criatividade. A IA faz o resto.</p>
                </div>
              </div>

              {/* API Provider selector */}
              <div className="mt-6 mb-8 p-1.5 bg-gray-100 rounded-xl inline-flex w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setTextProvider("openai")}
                  className={`flex-1 sm:flex-none flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-all ${
                    textProvider === "openai"
                      ? "bg-white shadow-sm text-gray-900 ring-1 ring-gray-200"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                  }`}
                >
                  <span className="font-bold text-sm">{apiKeys.openaiTextModel || "GPT-4o"}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${apiKeys.openai ? "text-green-600" : "text-red-500"}`}>
                    {apiKeys.openai ? "OpenAI" : "Sem Chave"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTextProvider("gemini")}
                  className={`flex-1 sm:flex-none flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-all ${
                    textProvider === "gemini"
                      ? "bg-white shadow-sm text-blue-700 ring-1 ring-blue-200"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                  }`}
                >
                  <span className="font-bold text-sm">{apiKeys.googleTextModel || "Gemini 1.5"}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${apiKeys.google ? "text-blue-600" : "text-red-500"}`}>
                    {apiKeys.google ? "Google" : "Sem Chave"}
                  </span>
                </button>
              </div>
              {((textProvider === "openai" && !apiKeys.openai) || (textProvider === "gemini" && !apiKeys.google)) && (
                <p className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Configure a chave de API nas configurações antes de gerar.
                </p>
              )}

              {loading && generationPhase ? (
                <GenerationProgress phase={generationPhase} pct={generationPct} />
              ) : (
                <GenerateBriefingForm
                  onSubmit={handleGenerate}
                  loading={loading}
                  error={error}
                />
              )}

              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center gap-2 mb-4 text-gray-500">
                  <FileJson className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Ou importe um JSON existente</h3>
                </div>
                <textarea
                  rows={4}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Cole aqui o conteúdo do brandbook.json..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none shadow-inner"
                  aria-label="JSON do brandbook para importar"
                />
                <button
                  onClick={handleImportJson}
                  disabled={!jsonText.trim()}
                  className="mt-3 flex items-center gap-2 bg-gray-900 text-white py-2.5 px-5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  Importar JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Examples */}
        {tab === "examples" && (
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Exemplos de Brandbooks</h2>
            <p className="text-gray-500 mb-8 text-lg">Explore manuais gerados pela IA para entender o potencial estrutural.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ExampleCard
                title="CloudFlow"
                subtitle="SaaS / B2B Software"
                description="Brandbook avançado com Design Tokens, A11y, Microcopy, Motion e UX Patterns."
                badge="Avançado"
                color="blue"
                onClick={() => handleLoadExample(saasExample)}
              />
              <ExampleCard
                title="Neon Tokyo Bar"
                subtitle="Nightlife & Bar"
                description="Identidade visual cyberpunk com neon, tipografia bold e fotografia noturna."
                color="pink"
                onClick={() => handleLoadExample(barExample)}
              />
              <ExampleCard
                title="Kansai Sushi"
                subtitle="Restaurante Japonês"
                description="Manual tradicional japonês com Sumi-e, Washi e tipografia Noto Serif JP."
                color="red"
                onClick={() => handleLoadExample(sushiExample)}
              />
              <ExampleCard
                title="Caraca! Bar"
                subtitle="Bar & Gastronomia — Boteco Tropical Premium"
                description="Identidade botânica tropical com 4 sistemas de pattern, paleta Kraft + Verde Noturno e gravura brasileira."
                badge="Projeto Real"
                color="amber"
                onClick={() => handleLoadExample(caracaBarExample)}
              />
            </div>
          </div>
        )}

        {/* Tab: Viewer */}
        {tab === "viewer" && brandbookData && (
          <div>

            {/* Sub-tab: Brandbook Preview */}
            {viewerTab === "preview" && (
              <BrandbookViewer
                data={brandbookData}
                generatedImages={Object.fromEntries(
                  Object.entries(generatedAssets).map(([k, v]) => [k, v.url])
                )}
                uploadedAssets={uploadedBrandAssets}
                assetPackFiles={assetPackFiles}
                assetPackGenerating={assetPackGenerating}
                onGenerateAssetPack={handleGenerateAssetPack}
                generatedAssets={generatedAssets}
                apiKeys={apiKeys}
                textProvider={textProvider}
                onAssetGenerated={handleAssetGenerated}
                onSaveToAssets={(asset) =>
                  setUploadedBrandAssets((prev) => [...prev, asset])
                }
                onUpdateColors={(colors) => {
                  updateBrandbook((prev) => ({ ...prev, colors }));
                }}
                onUpdateApplicationImageKey={(index: number, imageKey: AssetKey | undefined) => {
                  updateBrandbook((prev) => {
                    const nextApplications = prev.applications.map((a, i) =>
                      i === index ? { ...a, imageKey } : a
                    );
                    return { ...prev, applications: nextApplications };
                  });
                }}
                onUpdateData={(updater) => updateBrandbook(updater)}
              />
            )}

            {/* Sub-tab: Edit Brandbook */}
            {viewerTab === "edit" && (
              <BrandbookEditor
                data={brandbookData}
                onUpdate={(updated) => {
                  updateBrandbook(() => updated);
                }}
                onCancel={() => setViewerTab("preview")}
              />
            )}

            {/* Sub-tab: Referência Assets */}
            {viewerTab === "assets" && (
              <div>
                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-6 py-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-5 h-5 text-blue-700" />
                    <h3 className="font-bold text-blue-900 text-lg">Referência Assets</h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    Faça upload de logos, mascotes, elementos gráficos e padrões de referência.
                    Eles contribuem para a construção da marca como um todo e aparecem automaticamente
                    nas seções correspondentes do brandbook.
                  </p>
                </div>
                <UploadedAssetsPanel
                  assets={uploadedBrandAssets}
                  onChange={setUploadedBrandAssets}
                />
              </div>
            )}

            {/* Sub-tab: Refinar */}
            {viewerTab === "refine" && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-5 h-5 text-amber-700" />
                    <h3 className="font-bold text-amber-900 text-lg">Refinar com IA</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>Refinar brandbook</strong> — aplica um ajuste em todo o brandbook de uma vez (ex: &quot;torne mais luxuoso&quot;, &quot;mude o tom para mais jovem&quot;).
                    <br />
                    <strong>Regenerar seção</strong> — reescreve apenas uma seção específica, com instrução opcional.
                  </p>
                </div>
                <div className="bg-white border rounded-xl p-8 shadow-sm">
                  <RefinePanel
                    brandbook={brandbookData}
                    apiKeys={apiKeys}
                    textProvider={textProvider}
                    onRefined={(updated) => {
                      updateBrandbook(() => updated);
                      setViewerTab("preview");
                    }}
                  />
                </div>
                <div className="bg-white border rounded-xl p-8 shadow-sm">
                  <RegenerateSectionsPanel
                    brandbook={brandbookData}
                    apiKeys={apiKeys}
                    textProvider={textProvider}
                    onUpdated={(updated) => updateBrandbook(() => updated)}
                  />
                </div>
              </div>
            )}

            {/* Sub-tab: Consistência */}
            {viewerTab === "consistency" && (
              <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8 shadow-sm">
                <ConsistencyPanel
                  brandbook={brandbookData}
                  apiKeys={apiKeys}
                  textProvider={textProvider}
                />
              </div>
            )}

            {/* Sub-tab: Exportar */}
            {viewerTab === "export" && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white border rounded-xl p-8 shadow-sm">
                  <ExportPanel
                    brandbook={brandbookData}
                    viewerElementId="brandbook-content"
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <FileJson className="w-5 h-5 text-gray-700" />
                    <h3 className="font-bold text-lg text-gray-900">Arquivos JSON</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Downloads do brandbook em formato JSON para integração ou backup</p>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportBrandbook}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left bg-white border-gray-200 hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 hover:shadow-sm transition-all group"
                    >
                      <div className="w-12 h-12 bg-gray-50 group-hover:bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                        <BookOpen className="w-6 h-6 text-gray-500 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-900 group-hover:text-indigo-900 transition-colors">Brandbook JSON</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">Exporta todos os dados do brandbook — útil para backup ou reimportar depois</div>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 mr-2 transition-colors" />
                    </button>
                    <button
                      onClick={handleExportProduction}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left bg-white border-gray-200 hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 hover:shadow-sm transition-all group"
                    >
                      <div className="w-12 h-12 bg-gray-50 group-hover:bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                        <Settings className="w-6 h-6 text-gray-500 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-900 group-hover:text-indigo-900 transition-colors">Manifesto de Produção JSON</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">JSON técnico com especificações de impressão, digital, social, CSS vars e tokens</div>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 mr-2 transition-colors" />
                    </button>
                    <button
                      onClick={handleExportPack}
                      disabled={exportingPack}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left bg-white border-gray-200 hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 hover:shadow-sm transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:ring-0 group"
                    >
                      <div className="w-12 h-12 bg-gray-50 group-hover:bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                        <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-900 group-hover:text-indigo-900 transition-colors">Pack Completo (.zip)</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">Tudo em um ZIP: brandbook JSON, manifesto de produção e imagens geradas</div>
                      </div>
                      {exportingPack ? (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md animate-pulse">Preparando...</span>
                      ) : (
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 mr-2 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <JsonBySectionPanel
                    data={brandbookData}
                    onDownload={downloadJsonFile}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
