"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BrandbookViewer } from "@/components/BrandbookViewer";
import { ExampleCard } from "@/components/ExampleCard";
import { JsonBySectionPanel } from "@/components/JsonBySectionPanel";
import { ApiKeyConfig, ApiKeyStatusBadge, loadApiKeys, loadApiKeysFromServer, saveApiKeys, EMPTY_KEYS, type ApiKeys } from "@/components/ApiKeyConfig";
import { BrandbookEditor } from "@/components/BrandbookEditor";
import { UploadedAssetsPanel } from "@/components/UploadedAssetsPanel";
import { GenerateBriefingForm } from "@/components/GenerateBriefingForm";
import { GenerationProgress } from "@/components/GenerationProgress";
import { RefinePanel } from "@/components/RefinePanel";
import { AICopilot } from "@/components/AICopilot";
import { ConsistencyPanel } from "@/components/ConsistencyPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { RegenerateSectionsPanel } from "@/components/RegenerateSectionsPanel";
import { SystemHealthBadge } from "@/components/SystemHealthBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BrandbookData, GeneratedAsset } from "@/lib/types";
import { type AssetKey } from "@/lib/imagePrompts";
import { saasExample, barExample, sushiExample, caracaBarExample } from "@/lib/examples";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import { decompressBrandbook } from "@/lib/shareUtils";
import { downloadJsonFile } from "@/lib/browserDownload";
import {
  hasPromptOpsProviderKey,
} from "@/lib/imagePromptClient";
import {
  migrateLegacyLocalStorageToIndexedDB,
  slugifyForStorage,
} from "@/lib/brandbookLocalSession";
import {
  getActiveSlug,
  loadBrandbookData,
} from "@/lib/imageStorage";
import { computeBrandFingerprint, countStaleAssets } from "@/lib/brandFingerprint";
import {
  Settings, Sparkles, Library, Eye, BookOpen, Pencil, LayoutDashboard,
  Image as ImageIcon, Wand2, ShieldCheck, Download, CloudUpload, Check,
  Trash2, UploadCloud, FileJson, Hexagon, Undo2, Redo2,
} from "lucide-react";
import {
  selectHasHydrated,
  selectPromptOpsProvider,
  selectSetPromptOpsProvider,
  selectSetStrategyProvider,
  selectStrategyProvider,
  useAppPreferencesStore,
} from "@/store/appPreferences";
import { useEditorSession } from "@/hooks/useEditorSession";
import { useEditorGeneration } from "@/hooks/useEditorGeneration";
import { useEditorAssets } from "@/hooks/useEditorAssets";
import { resolveTextProviderPreference, getTextProviderModel } from "./editorHelpers";

export default function Home() {
  const searchParams = useSearchParams();

  // ─── Session State (from useEditorSession hook) ───────────────────
  const session = useEditorSession();
  const {
    tab, setTab,
    viewerTab, setViewerTab,
    loadingShared, setLoadingShared,
    error, setError,
    prefillBrandName, setPrefillBrandName,
    prefillIndustry, setPrefillIndustry,
    prefillBriefing, setPrefillBriefing,
    templateScope, setTemplateScope,
    templateCreativity, setTemplateCreativity,
    templateGuidedBriefing, setTemplateGuidedBriefing,
    templateName, setTemplateName,
    brandbookData, setBrandbookData,
    brandbookRef,
    jsonText, setJsonText,
    generatedAssets, setGeneratedAssets,
    uploadedBrandAssets, setUploadedBrandAssets,
    assetPack, setAssetPack,
    savedProjects, setSavedProjects,
    loadingSavedProjects,
    currentProjectId, setCurrentProjectId,
    undoStack, redoStack,
    saveError,
    resetHistory,
    updateBrandbook,
    handleUndo,
    handleRedo,
    restoreBrandbookSession,
    startNewBrandbook,
    persistAll,
  } = session;

  // ─── Local UI State ───────────────────────────────────────────────
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ ...EMPTY_KEYS });
  const strategyProvider = useAppPreferencesStore(selectStrategyProvider);
  const promptOpsProvider = useAppPreferencesStore(selectPromptOpsProvider);
  const hasHydratedPreferences = useAppPreferencesStore(selectHasHydrated);
  const setStrategyProvider = useAppPreferencesStore(selectSetStrategyProvider);
  const setPromptOpsProvider = useAppPreferencesStore(selectSetPromptOpsProvider);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; description?: string; variant?: "danger" | "default"; onConfirm: () => void;
  } | null>(null);

  // ─── Generation State (from useEditorGeneration hook) ─────────────
  const {
    loading,
    generationPhase,
    generationPct,
    handleGenerate,
    autoGenerateLogos,
  } = useEditorGeneration({
    strategyProvider,
    promptOpsProvider,
    apiKeys,
    restoreBrandbookSession,
    setBrandbookData,
    setGeneratedAssets,
    setUploadedBrandAssets: setUploadedBrandAssets as (a: never[]) => void,
    setAssetPack: setAssetPack as (a: { files: never[] }) => void,
    setCurrentProjectId,
    resetHistory,
    setError,
  });

  // ─── Asset State (from useEditorAssets hook) ──────────────────────
  const {
    assetPackGenerating,
    exportingPack,
    cloudSaving,
    cloudSaved,
    handleAssetGenerated,
    handleGenerateAssetPack,
    handleForceSaveToCloud,
    handleClearImageCache,
    handleExportPack,
    handleExportBrandbook,
    handleExportProduction,
  } = useEditorAssets({
    brandbookData,
    brandbookRef,
    currentProjectId,
    generatedAssets,
    setGeneratedAssets,
    uploadedBrandAssets,
    setUploadedBrandAssets,
    assetPack,
    setAssetPack,
    apiKeys,
    promptOpsProvider,
    persistAll,
    setError,
    setCurrentProjectId,
    setConfirmDialog,
  });

  const assetPackFiles = assetPack.files;

  // ─── Init: load API keys, handle URL params, restore session ──────
  useEffect(() => {
    const keys = loadApiKeys();
    setApiKeys(keys);

    // Merge with server-stored keys (server wins)
    loadApiKeysFromServer().then((serverKeys) => {
      if (serverKeys) {
        setApiKeys((prev) => {
          const merged = { ...prev };
          let changed = false;
          for (const k of Object.keys(merged) as (keyof typeof merged)[]) {
            if (serverKeys[k] && serverKeys[k] !== prev[k]) {
              merged[k] = serverKeys[k];
              changed = true;
            }
          }
          if (changed) saveApiKeys(merged);
          return changed ? merged : prev;
        });
      }
    });

    // ── CHECK sessionStorage flag from Sidebar "Novo Brandbook" button ──
    // This MUST be checked FIRST, before any URL params or auto-restore.
    const forceNew = sessionStorage.getItem("bb_force_new");
    if (forceNew) {
      sessionStorage.removeItem("bb_force_new");
      setBrandbookData(null);
      setGeneratedAssets({});
      setUploadedBrandAssets([]);
      setAssetPack({ files: [] });
      setCurrentProjectId(null);
      resetHistory();
      setError("");
      setTab("generate");

      // ── CHECK for template data (from /dashboard/new-brandbook?template=X) ──
      try {
        const templateRaw = sessionStorage.getItem("bb_template");
        if (templateRaw) {
          sessionStorage.removeItem("bb_template");
          const tmpl = JSON.parse(templateRaw);
          if (tmpl.industry) setPrefillIndustry(tmpl.industry);
          if (tmpl.creativityLevel) setTemplateCreativity(tmpl.creativityLevel);
          if (tmpl.suggestedScope) setTemplateScope(tmpl.suggestedScope);
          if (tmpl.guidedBriefing) setTemplateGuidedBriefing(tmpl.guidedBriefing);
          if (tmpl.name) setTemplateName(tmpl.name);
        }
      } catch {}

      migrateLegacyLocalStorageToIndexedDB().catch(() => {});
      return; // HARD STOP. Clean slate, no auto-restore.
    }

    // ── CRITICAL: Read ALL URL params SYNCHRONOUSLY before any async work ──
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const nameParam = params.get("name");
    const industryParam = params.get("industry");
    const briefingParam = params.get("briefing");
    const bbParam = params.get("bb");
    const slugParam = params.get("slug");

    // Clean URL immediately so no other code can race with it
    if (params.toString()) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Handle ?tab= (from "Novo Brandbook" or onboarding)
    if (tabParam === "generate" || tabParam === "examples") {
      setTab(tabParam);
    }

    // Handle prefill from onboarding
    if (nameParam) setPrefillBrandName(nameParam);
    if (industryParam) setPrefillIndustry(industryParam);
    if (briefingParam) setPrefillBriefing(briefingParam);

    // If user wants to create a new brandbook, clean everything and STOP.
    if (tabParam === "generate" && !bbParam && !slugParam) {
      setBrandbookData(null);
      setGeneratedAssets({});
      setUploadedBrandAssets([]);
      setAssetPack({ files: [] });
      setCurrentProjectId(null);
      resetHistory();
      setError("");
      migrateLegacyLocalStorageToIndexedDB().catch(() => {});
      return; // HARD STOP. Don't touch anything else.
    }

    // For all other cases, run the async init logic
    void (async () => {
      await migrateLegacyLocalStorageToIndexedDB().catch(() => {});

      // Load shared brandbook from URL
      if (bbParam) {
        setLoadingShared(true);
        setTab("viewer");
        setViewerTab("preview");
        decompressBrandbook(bbParam)
          .then(async (raw) => {
            if (!raw) throw new Error("Link invalido");
            const validated = validateLooseBrandbook(raw, {
              action: "abrir link compartilhado",
              subject: "Brandbook do link",
            });
            await restoreBrandbookSession(validated, {
              nextTab: "viewer",
              nextViewerTab: "preview",
            });
          })
          .catch(() => {
            setError("Link compartilhado invalido ou expirado.");
            setTab("examples");
          })
          .finally(() => {
            setLoadingShared(false);
          });
        return;
      }

      // Load project from database via ?slug= parameter
      if (slugParam) {
        setLoadingShared(true);
        try {
          const res = await fetch(`/api/projects/${encodeURIComponent(slugParam)}`);
          if (res.ok) {
            const json = await res.json() as { data?: {
              id?: string;
              brandbookVersions?: Array<{ brandbookJson?: unknown }>;
              assets?: Array<{ key: string; publicUrl?: string | null; sourceUrl?: string | null }>;
            } };
            if (json.data?.id) setCurrentProjectId(json.data.id);
            const latestVersion = json.data?.brandbookVersions?.[0];
            if (latestVersion?.brandbookJson) {
              const validated = validateLooseBrandbook(latestVersion.brandbookJson, {
                action: "carregar projeto",
                subject: "Brandbook do projeto",
              });
              await restoreBrandbookSession(validated, {
                nextTab: "viewer",
                nextViewerTab: "preview",
              });
              // Load server-side images into generatedAssets so they display immediately
              if (json.data?.assets?.length) {
                const serverAssets: Record<string, GeneratedAsset> = {};
                for (const a of json.data.assets) {
                  const hasRealPublicUrl = a.publicUrl && !a.publicUrl.includes("_placeholder");
                  const url = hasRealPublicUrl ? a.publicUrl : (a.sourceUrl ?? a.publicUrl);
                  if (a.key && url) {
                    serverAssets[a.key] = {
                      key: a.key,
                      url,
                      provider: "dalle3",
                      prompt: "",
                      generatedAt: new Date().toISOString(),
                    };
                  }
                }
                if (Object.keys(serverAssets).length > 0) {
                  setGeneratedAssets((prev) => ({ ...serverAssets, ...prev }));
                }
              }
              setLoadingShared(false);
              return;
            }
          }
        } catch {
          // Fall through to localStorage
        }
        // Fallback: try loading from localStorage with the slug
        const savedData = loadBrandbookData(slugParam);
        if (savedData) {
          try {
            const validated = validateLooseBrandbook(savedData, {
              action: "carregar projeto",
              subject: "Brandbook salvo",
            });
            await restoreBrandbookSession(validated, { nextTab: "viewer" });
            setLoadingShared(false);
            return;
          } catch {
            // Corrupt — ignore
          }
        }
        // Both API and localStorage failed — show error
        setError(`Nao foi possivel carregar o projeto "${slugParam}". Tente novamente.`);
        setTab("examples");
        setLoadingShared(false);
        return;
      }

      // No special params — restore last active session
      if (tabParam === "examples") {
        return;
      }

      const activeSlug = getActiveSlug();
      if (activeSlug) {
        const savedData = loadBrandbookData(activeSlug);
        if (savedData) {
          try {
            const validated = validateLooseBrandbook(savedData, {
              action: "restaurar a sessao salva",
              subject: "Brandbook salvo",
            });
            void restoreBrandbookSession(validated, { nextTab: "viewer" });
          } catch {
            // Corrupt saved data — ignore and show default screen
          }
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreBrandbookSession]);

  // Resolve text provider preferences when API keys or preferences change
  useEffect(() => {
    if (!hasHydratedPreferences) return;

    const nextStrategyProvider = resolveTextProviderPreference(strategyProvider, apiKeys);
    const nextPromptOpsProvider = resolveTextProviderPreference(promptOpsProvider, apiKeys);

    if (nextStrategyProvider !== strategyProvider) {
      setStrategyProvider(nextStrategyProvider);
    }

    if (nextPromptOpsProvider !== promptOpsProvider) {
      setPromptOpsProvider(nextPromptOpsProvider);
    }
  }, [
    apiKeys,
    hasHydratedPreferences,
    promptOpsProvider,
    setPromptOpsProvider,
    setStrategyProvider,
    strategyProvider,
  ]);

  async function handleImportJson() {
    try {
      const parsed = JSON.parse(jsonText);
      const validated = validateLooseBrandbook(parsed, {
        action: "importar JSON",
        subject: "JSON do brandbook",
      });
      await restoreBrandbookSession(validated, {
        nextTab: "viewer",
        nextViewerTab: "preview",
      });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "JSON invalido. Verifique a formatacao.");
    }
  }

  // React to client-side navigations to ?tab=generate (e.g. clicking "Novo Brandbook"
  // while already on the editor page). useSearchParams changes trigger this effect.
  const initDoneRef = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => { initDoneRef.current = true; }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initDoneRef.current) return;
    const tabParam = searchParams.get("tab");
    if (!tabParam) return;
    if (tabParam === "generate") {
      startNewBrandbook();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (tabParam === "examples") {
      setTab("examples");
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleLoadExample(example: BrandbookData) {
    try {
      setCurrentProjectId(null); // Examples are not saved projects
      const validated = validateLooseBrandbook(example, {
        action: "carregar exemplo",
        subject: "Brandbook de exemplo",
      });
      void restoreBrandbookSession(validated, {
        nextTab: "viewer",
        nextViewerTab: "preview",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar exemplo");
      return;
    }
  }

  const strategyProviderHasKey = hasPromptOpsProviderKey(strategyProvider, apiKeys);
  const promptOpsProviderHasKey = hasPromptOpsProviderKey(promptOpsProvider, apiKeys);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        {tab === "viewer" && brandbookData ? (
          /* ── Viewer mode: single consolidated row ── */
          <div className="app-shell mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 min-w-0">
            {/* Logo — click to start new brandbook */}
            <button
              onClick={startNewBrandbook}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-indigo-700"
              title="Novo brandbook"
            >
              <Hexagon className="text-white w-3.5 h-3.5" fill="currentColor" />
            </button>

            {/* Brand name */}
            <span className="text-sm font-extrabold text-gray-900 truncate flex-shrink-0 max-w-[120px] sm:max-w-[180px] hidden xs:block">
              {brandbookData.brandName}
            </span>

            {/* Divider */}
            <div className="hidden h-5 w-px flex-shrink-0 bg-slate-200 sm:block" />

            {/* Sub-tabs — flex-1 with overflow scroll */}
            <nav className="app-segmented flex-1 min-w-0 overflow-x-auto scrollbar-hide">
              <button onClick={() => setViewerTab("preview")} className={`app-tab-button whitespace-nowrap flex-shrink-0 px-2.5 py-1.5 text-xs font-bold ${viewerTab === "preview" ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Brandbook</span>
              </button>
              <button onClick={() => setViewerTab("edit")} className={`app-tab-button whitespace-nowrap flex-shrink-0 px-2.5 py-1.5 text-xs font-bold ${viewerTab === "edit" ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
              <button onClick={() => setViewerTab("assets")} className={`app-tab-button whitespace-nowrap flex-shrink-0 px-2.5 py-1.5 text-xs font-bold ${viewerTab === "assets" ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Assets</span>
                {uploadedBrandAssets.length > 0 && <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-800">{uploadedBrandAssets.length}</span>}
              </button>
              <button onClick={() => setViewerTab("refine")} className={`app-tab-button whitespace-nowrap flex-shrink-0 px-2.5 py-1.5 text-xs font-bold ${viewerTab === "refine" ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refinar</span>
              </button>
              <button onClick={() => setViewerTab("consistency")} className={`app-tab-button whitespace-nowrap flex-shrink-0 px-2.5 py-1.5 text-xs font-bold ${viewerTab === "consistency" ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Checar</span>
              </button>
              <button onClick={() => setViewerTab("export")} className={`app-tab-button whitespace-nowrap flex-shrink-0 px-2.5 py-1.5 text-xs font-bold ${viewerTab === "export" ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </nav>

            {saveError && (
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                Erro ao salvar — exporte seu brandbook
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleUndo} disabled={undoStack.length === 0} className="rounded-xl p-2 text-gray-500 transition hover:bg-white/80 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30" title="Desfazer">
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleRedo} disabled={redoStack.length === 0} className="rounded-xl p-2 text-gray-500 transition hover:bg-white/80 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30" title="Refazer">
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleClearImageCache} disabled={Object.keys(generatedAssets).length === 0} className="rounded-xl p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30" title="Limpar imagens geradas">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setShowApiConfig(true)} className="rounded-xl p-2 text-gray-500 transition hover:bg-white/80 hover:text-gray-900" title="APIs">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleForceSaveToCloud}
                disabled={cloudSaving}
                className={`ml-1 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  cloudSaved
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-60`}
                title="Salvar tudo na nuvem (brandbook + imagens)"
              >
                {cloudSaving ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : cloudSaved ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <CloudUpload className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{cloudSaving ? "Salvando..." : cloudSaved ? "Salvo!" : "Salvar"}</span>
              </button>
              <button onClick={() => setViewerTab("export")} className="app-primary-button px-3 py-2 text-xs font-bold">
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Default mode ── */
          <div className="app-shell mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <Hexagon className="text-white w-4 h-4" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-gray-900 leading-tight sm:text-lg">Brandbook Builder</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">Gerador de Manual com IA</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <SystemHealthBadge />
              {!hasHydratedPreferences && (
                <span className="app-chip hidden lg:inline-flex">
                  Sincronizando preferências
                </span>
              )}
              <ApiKeyStatusBadge keys={apiKeys} />
              <button onClick={() => setShowApiConfig(true)} className="app-secondary-button px-3 py-2 text-sm" title="Configurar chaves de API">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">APIs</span>
              </button>
              <nav className="app-segmented">
                <button onClick={() => setTab("generate")} className={`app-tab-button ${tab === "generate" ? "bg-white text-gray-900 shadow-sm ring-1 ring-white/80" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Gerar com IA</span>
                </button>
                <button onClick={() => setTab("examples")} className={`app-tab-button ${tab === "examples" ? "bg-white text-gray-900 shadow-sm ring-1 ring-white/80" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
                  <Library className="w-4 h-4" />
                  <span className="hidden sm:inline">Exemplos</span>
                </button>
                {brandbookData && (
                  <button onClick={() => setTab("viewer")} className={`app-tab-button ${tab === "viewer" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-white/80" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}>
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

      <main className={tab === "viewer" ? "w-full px-3 pb-8 pt-4 sm:px-4 sm:pb-10" : "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8"}>
        {/* Error Banner */}
        {error && (
          <div className="app-surface-soft mb-6 flex items-center justify-between gap-3 border-red-200 bg-red-50 px-4 py-3 text-red-800">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800 font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        {tab === "viewer" && !brandbookData && loadingShared && (
          <div className="app-shell mx-auto max-w-xl p-8">
            <div className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-sm font-semibold text-gray-700">Carregando brandbook compartilhado...</span>
            </div>
          </div>
        )}

        {/* Tab: Generate */}
        {tab === "generate" && (
          <div className="max-w-2xl mx-auto">
            <div className="app-shell p-6 sm:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="app-chip mb-3">Fluxo guiado + geração premium</span>
                  <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 sm:text-[2rem]">Gerar Brandbook com IA</h2>
                  <p className="mt-1 max-w-xl text-sm text-gray-500">Defina o briefing, escopo e nível de criatividade. A IA faz o resto com estrutura pronta para edição, auditoria e export.</p>
                </div>
              </div>

              <div className="mt-6 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="app-surface-soft p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-extrabold tracking-tight text-gray-900">Curador de Estratégia</h3>
                    <p className="text-xs text-gray-500 mt-1">Usado para gerar o brandbook, refinar conteúdo, regenerar seções e auditar consistência.</p>
                  </div>
                  <div className="app-segmented inline-flex w-full p-1.5">
                    <button
                      type="button"
                      onClick={() => setStrategyProvider("openai")}
                      className={`flex-1 flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                        strategyProvider === "openai"
                          ? "bg-white shadow-sm text-gray-900 ring-1 ring-gray-200"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                      }`}
                    >
                      <span className="font-bold text-sm">{getTextProviderModel("openai", apiKeys)}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${apiKeys.openai ? "text-green-600" : "text-red-500"}`}>
                        {apiKeys.openai ? "OpenAI" : "Sem Chave"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStrategyProvider("gemini")}
                      className={`flex-1 flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                        strategyProvider === "gemini"
                          ? "bg-white shadow-sm text-blue-700 ring-1 ring-blue-200"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                      }`}
                    >
                      <span className="font-bold text-sm">{getTextProviderModel("gemini", apiKeys)}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${apiKeys.google ? "text-blue-600" : "text-red-500"}`}>
                        {apiKeys.google ? "Google" : "Sem Chave"}
                      </span>
                    </button>
                  </div>
                  {!strategyProviderHasKey && (
                    <p className="mt-3 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Configure a chave do provider estratégico nas configurações.
                    </p>
                  )}
                </div>

                <div className="app-surface-soft p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-extrabold tracking-tight text-gray-900">Prompts & Arquivos</h3>
                    <p className="text-xs text-gray-500 mt-1">Usado para refinar prompts de imagem, gerar logos automáticos e montar arquivos do asset pack.</p>
                  </div>
                  <div className="app-segmented inline-flex w-full p-1.5">
                    <button
                      type="button"
                      onClick={() => setPromptOpsProvider("openai")}
                      className={`flex-1 flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                        promptOpsProvider === "openai"
                          ? "bg-white shadow-sm text-gray-900 ring-1 ring-gray-200"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                      }`}
                    >
                      <span className="font-bold text-sm">{getTextProviderModel("openai", apiKeys)}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${apiKeys.openai ? "text-green-600" : "text-red-500"}`}>
                        {apiKeys.openai ? "OpenAI" : "Sem Chave"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptOpsProvider("gemini")}
                      className={`flex-1 flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                        promptOpsProvider === "gemini"
                          ? "bg-white shadow-sm text-blue-700 ring-1 ring-blue-200"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                      }`}
                    >
                      <span className="font-bold text-sm">{getTextProviderModel("gemini", apiKeys)}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${apiKeys.google ? "text-blue-600" : "text-red-500"}`}>
                        {apiKeys.google ? "Google" : "Sem Chave"}
                      </span>
                    </button>
                  </div>
                  {!promptOpsProviderHasKey && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Sem este provider, o app não conseguirá refinar prompts nem gerar arquivos assistidos por IA.
                    </p>
                  )}
                </div>
              </div>

              <div className="app-surface-soft mb-6 px-4 py-3 text-xs text-gray-500">
                Imagens & assets continuam com provider próprio dentro do viewer, no painel de geração visual.
              </div>

              {loading && generationPhase ? (
                <GenerationProgress phase={generationPhase} pct={generationPct} />
              ) : (
                <GenerateBriefingForm
                  onSubmit={handleGenerate}
                  loading={loading}
                  error={error}
                  initialBrandName={prefillBrandName}
                  initialIndustry={prefillIndustry}
                  initialBriefing={prefillBriefing}
                  initialScope={templateScope}
                  initialCreativity={templateCreativity}
                  initialGuidedBriefing={templateGuidedBriefing}
                  templateName={templateName}
                />
              )}

              <div className="mt-8 border-t border-slate-200/80 pt-8">
                <div className="flex items-center gap-2 mb-4 text-gray-500">
                  <FileJson className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Ou importe um JSON existente</h3>
                </div>
                <textarea
                  rows={4}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Cole aqui o conteúdo do brandbook.json..."
                  className="app-textarea font-mono text-xs shadow-inner"
                  aria-label="JSON do brandbook para importar"
                />
                <button
                  onClick={handleImportJson}
                  disabled={!jsonText.trim()}
                  className="app-primary-button mt-3 px-5 py-2.5 text-sm"
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
          <div className="space-y-8">
            <div className="app-shell px-6 py-7 sm:px-8 sm:py-8">
              <span className="app-chip mb-4">Galeria curada</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-[2.4rem]">Brandbooks</h2>
              <p className="mt-2 max-w-3xl text-base text-gray-500 sm:text-lg">Seus projetos salvos e exemplos gerados pela IA para explorar o potencial da plataforma.</p>
            </div>

            {/* Seus Projetos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Seus Projetos</h3>
              {loadingSavedProjects ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Carregando projetos...
                </div>
              ) : savedProjects.length === 0 ? (
                <div className="app-shell px-6 py-10 text-center">
                  <p className="text-gray-400 text-sm mb-4">Nenhum projeto salvo ainda. Gere seu primeiro brandbook!</p>
                  <button
                    onClick={() => setTab("generate")}
                    className="app-primary-button px-5 py-2.5 text-sm inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gerar com IA
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {savedProjects.map((project) => {
                    const hue = project.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
                    const initial = project.name[0]?.toUpperCase() ?? "B";
                    const hasBrandbook = project.brandbookVersions.length > 0;
                    return (
                      <button
                        key={project.id}
                        onClick={async () => {
                          if (!hasBrandbook) {
                            setTab("generate");
                            return;
                          }
                          setLoadingShared(true);
                          try {
                            const res = await fetch(`/api/projects/${encodeURIComponent(project.slug)}`);
                            if (res.ok) {
                              const json = await res.json() as { data?: { id?: string; brandbookVersions?: Array<{ brandbookJson?: unknown }> } };
                              if (json.data?.id) setCurrentProjectId(json.data.id);
                              const latestVersion = json.data?.brandbookVersions?.[0];
                              if (latestVersion?.brandbookJson) {
                                const validated = validateLooseBrandbook(latestVersion.brandbookJson, {
                                  action: "carregar projeto",
                                  subject: "Brandbook do projeto",
                                });
                                await restoreBrandbookSession(validated, {
                                  nextTab: "viewer",
                                  nextViewerTab: "preview",
                                });
                              }
                            }
                          } catch {
                            toast.error("Erro ao carregar o projeto.");
                          } finally {
                            setLoadingShared(false);
                          }
                        }}
                        className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-violet-200/60 transition-all hover:-translate-y-0.5 text-left"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, hsl(${hue}, 65%, 52%) 0%, hsl(${(hue + 30) % 360}, 55%, 42%) 100%)`,
                            }}
                          >
                            {initial}
                          </div>
                          {hasBrandbook && (
                            <span className="text-[10px] text-violet-500 font-semibold bg-violet-50 px-2 py-0.5 rounded-full">
                              Brandbook
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 truncate group-hover:text-violet-700 transition-colors text-[15px]">
                          {project.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 truncate">{project.industry}</p>
                        <p className="text-[11px] text-gray-300 font-medium mt-3 pt-3 border-t border-gray-50">
                          {new Date(project.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Exemplos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Exemplos</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
          </div>
        )}

        {/* Tab: Viewer */}
        {tab === "viewer" && brandbookData && (
          <div>
            {/* Stale assets banner */}
            {(() => {
              const assetCount = Object.keys(generatedAssets).length;
              if (assetCount === 0) return null;
              const fp = computeBrandFingerprint(brandbookData);
              const stale = countStaleAssets(generatedAssets, fp);
              if (stale === 0) return null;
              return (
                <div className="no-print mx-auto max-w-6xl mb-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-amber-600 text-xl shrink-0">!</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        A identidade visual mudou
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {stale} {stale === 1 ? "imagem foi gerada" : "imagens foram geradas"} com cores/dados antigos.
                        As imagens marcadas como <strong>&quot;Desatualizado&quot;</strong> precisam ser regeneradas para refletir a nova identidade.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        // Update all stale assets fingerprint to current (mark as acknowledged)
                        const currentFp = computeBrandFingerprint(brandbookData);
                        setGeneratedAssets((prev) => {
                          const next = { ...prev };
                          for (const [k, v] of Object.entries(next)) {
                            if (v.brandFingerprint && v.brandFingerprint !== currentFp) {
                              next[k] = { ...v, brandFingerprint: currentFp };
                            }
                          }
                          return next;
                        });
                      }}
                      className="text-xs font-medium text-amber-700 px-3 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 transition"
                    >
                      Ignorar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewerTab !== "preview") setViewerTab("preview");
                      }}
                      className="text-xs font-bold bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                    >
                      Regenerar no Preview
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Brandbook Preview — always rendered (hidden when not active) so PDF export can access the DOM */}
            <div style={viewerTab !== "preview" ? { position: "absolute", left: "-9999px", top: 0, width: "800px", pointerEvents: "none", overflow: "hidden" } : undefined}>
              <BrandbookViewer
                data={brandbookData}
                generatedImages={Object.fromEntries(
                  Object.entries(generatedAssets).map(([k, v]) => [k, v.url])
                )}
                uploadedAssets={uploadedBrandAssets}
                assetPack={assetPack}
                assetPackGenerating={assetPackGenerating}
                onGenerateAssetPack={handleGenerateAssetPack}
                onUpdateAssetPack={(updater) => setAssetPack(updater)}
                generatedAssets={generatedAssets}
                apiKeys={apiKeys}
                promptProvider={promptOpsProvider}
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
                projectId={currentProjectId}
              />
            </div>

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
              <div className="mx-auto max-w-6xl space-y-6">
                <div className="app-panel-intro border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-blue-900">
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
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="app-panel-intro border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 text-amber-900">
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
                <div className="app-shell p-6 sm:p-8">
                  <RefinePanel
                    brandbook={brandbookData}
                    apiKeys={apiKeys}
                    strategyProvider={strategyProvider}
                    onRefined={(updated) => {
                      updateBrandbook(() => updated);
                      setViewerTab("preview");
                    }}
                  />
                </div>
                <div className="app-shell p-6 sm:p-8">
                  <RegenerateSectionsPanel
                    brandbook={brandbookData}
                    apiKeys={apiKeys}
                    strategyProvider={strategyProvider}
                    onUpdated={(updated) => updateBrandbook(() => updated)}
                    onSwitchToPreview={() => setViewerTab("preview")}
                  />
                </div>
              </div>
            )}

            {/* Sub-tab: Consistência */}
            {viewerTab === "consistency" && (
              <div className="app-shell mx-auto max-w-3xl p-6 sm:p-8">
                <ConsistencyPanel
                  brandbook={brandbookData}
                  apiKeys={apiKeys}
                  strategyProvider={strategyProvider}
                />
              </div>
            )}

            {/* Sub-tab: Exportar */}
            {viewerTab === "export" && (
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="app-shell p-6 sm:p-8">
                  <ExportPanel
                    brandbook={brandbookData}
                    viewerElementId="brandbook-content"
                    projectId={currentProjectId}
                    onForceSyncImages={async () => {
                      // Force save brandbook + sync all images before sharing
                      await handleForceSaveToCloud();
                      return true;
                    }}
                  />
                </div>
                <div className="app-shell p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <FileJson className="w-5 h-5 text-gray-700" />
                    <h3 className="font-bold text-lg text-gray-900">Arquivos JSON</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Downloads do brandbook em formato JSON para integração ou backup</p>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportBrandbook}
                      className="app-card-button group flex items-center gap-4 p-4"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors group-hover:border-indigo-100 group-hover:bg-indigo-50">
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
                      className="app-card-button group flex items-center gap-4 p-4"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors group-hover:border-indigo-100 group-hover:bg-indigo-50">
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
                      className="app-card-button group flex items-center gap-4 p-4 disabled:opacity-50 disabled:hover:transform-none disabled:hover:border-slate-200 disabled:hover:shadow-none"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors group-hover:border-indigo-100 group-hover:bg-indigo-50">
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

                <div className="app-shell p-6 sm:p-8">
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

      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title ?? ""}
        description={confirmDialog?.description}
        variant={confirmDialog?.variant}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          confirmDialog?.onConfirm();
          setConfirmDialog(null);
        }}
        onCancel={() => setConfirmDialog(null)}
      />

      {/* AI Co-pilot Chat */}
      {brandbookData && (
        <AICopilot
          brandbook={brandbookData}
          apiKeys={apiKeys}
          strategyProvider={strategyProvider}
          onApplyChanges={(changes) => {
            setBrandbookData((prev) => {
              if (!prev) return prev;
              return { ...prev, ...changes } as BrandbookData;
            });
          }}
        />
      )}
    </div>
  );
}
