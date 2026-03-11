"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BrandbookViewer } from "@/components/BrandbookViewer";
import { ExampleCard } from "@/components/ExampleCard";
import { JsonBySectionPanel } from "@/components/JsonBySectionPanel";
import { ApiKeyConfig, ApiKeyStatusBadge, loadApiKeys, loadApiKeysFromServer, saveApiKeys, EMPTY_KEYS, type ApiKeys } from "@/components/ApiKeyConfig";
import { BrandbookEditor } from "@/components/BrandbookEditor";
import { UploadedAssetsPanel } from "@/components/UploadedAssetsPanel";
import { GenerateBriefingForm, type GenerateBriefingData } from "@/components/GenerateBriefingForm";
import { GenerationProgress } from "@/components/GenerationProgress";
import { RefinePanel } from "@/components/RefinePanel";
import { ConsistencyPanel } from "@/components/ConsistencyPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { RegenerateSectionsPanel } from "@/components/RegenerateSectionsPanel";
import { SystemHealthBadge } from "@/components/SystemHealthBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BrandbookData, GeneratedAsset, UploadedAsset, ImageProvider, type AiTextProvider, type AssetPackState } from "@/lib/types";
import { saasExample, barExample, sushiExample, caracaBarExample } from "@/lib/examples";
import { generateProductionManifest } from "@/lib/productionExport";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import { decompressBrandbook } from "@/lib/shareUtils";
import { buildImagePrompt, type AssetKey } from "@/lib/imagePrompts";
import { downloadBlob, downloadJsonFile } from "@/lib/browserDownload";
import {
  hasPromptOpsProviderKey,
  refineImagePromptClient,
} from "@/lib/imagePromptClient";
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
import { computeBrandFingerprint, countStaleAssets } from "@/lib/brandFingerprint";
import {
  Settings, Sparkles, Library, Eye, BookOpen, Pencil, LayoutDashboard,
  Image as ImageIcon, Wand2, ShieldCheck, Download,
  Trash2, UploadCloud, FileJson, Hexagon, Undo2, Redo2,
} from "lucide-react";
import { fetchBrandbookLintReport } from "@/lib/brandbookLintClient";
import { getProtectedExportGuard } from "@/lib/brandbookQualityGate";
import {
  selectHasHydrated,
  selectPromptOpsProvider,
  selectSetPromptOpsProvider,
  selectSetStrategyProvider,
  selectStrategyProvider,
  useAppPreferencesStore,
} from "@/store/appPreferences";

type Tab = "generate" | "examples" | "viewer";
type ViewerTab = "preview" | "edit" | "assets" | "refine" | "consistency" | "export";

function isAiTextProvider(value: string | null | undefined): value is AiTextProvider {
  return value === "openai" || value === "gemini";
}

function pickDefaultTextProvider(keys: ApiKeys): AiTextProvider {
  if (keys.openai) return "openai";
  if (keys.google) return "gemini";
  return "openai";
}

function resolveTextProviderPreference(rawValue: string | null | undefined, keys: ApiKeys): AiTextProvider {
  const fallback = pickDefaultTextProvider(keys);
  if (!isAiTextProvider(rawValue)) return fallback;
  if (hasPromptOpsProviderKey(rawValue, keys) || (!keys.openai && !keys.google)) return rawValue;
  return fallback;
}

function getTextProviderModel(provider: AiTextProvider, keys: ApiKeys): string {
  return provider === "openai"
    ? keys.openaiTextModel || "GPT-4o"
    : keys.googleTextModel || "Gemini 1.5";
}

export default function Home() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("generate");
  const [loading, setLoading] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [generationPct, setGenerationPct] = useState(0);
  const [error, setError] = useState("");
  const [prefillBrandName, setPrefillBrandName] = useState("");
  const [prefillIndustry, setPrefillIndustry] = useState("");
  const [prefillBriefing, setPrefillBriefing] = useState("");
  const [brandbookData, setBrandbookData] = useState<BrandbookData | null>(null);
  const brandbookRef = useRef<BrandbookData | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [viewerTab, setViewerTab] = useState<ViewerTab>("preview");
  const [generatedAssets, setGeneratedAssets] = useState<Record<string, GeneratedAsset>>({});
  const [uploadedBrandAssets, setUploadedBrandAssets] = useState<UploadedAsset[]>([]);
  const [assetPack, setAssetPack] = useState<AssetPackState>({ files: [] });
  const [assetPackGenerating, setAssetPackGenerating] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Array<{
    id: string; slug: string; name: string; industry: string; status: string;
    updatedAt: string; brandbookVersions: Array<{ brandbookJson?: unknown }>;
  }>>([]);
  const [loadingSavedProjects, setLoadingSavedProjects] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ ...EMPTY_KEYS });
  const strategyProvider = useAppPreferencesStore(selectStrategyProvider);
  const promptOpsProvider = useAppPreferencesStore(selectPromptOpsProvider);
  const hasHydratedPreferences = useAppPreferencesStore(selectHasHydrated);
  const setStrategyProvider = useAppPreferencesStore(selectSetStrategyProvider);
  const setPromptOpsProvider = useAppPreferencesStore(selectSetPromptOpsProvider);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [exportingPack, setExportingPack] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; description?: string; variant?: "danger" | "default"; onConfirm: () => void;
  } | null>(null);
  const [undoStack, setUndoStack] = useState<BrandbookData[]>([]);
  const [redoStack, setRedoStack] = useState<BrandbookData[]>([]);
  const assetPackFiles = assetPack.files;

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
    setAssetPack(session.assetPack);
    if (options.nextViewerTab) setViewerTab(options.nextViewerTab);
    if (options.nextTab) setTab(options.nextTab);
    setError("");
  }, []);

  async function autoGenerateLogos(bbData: BrandbookData, keys: ApiKeys, promptProvider: AiTextProvider, projectId?: string | null) {
    const providerKeyMap: Record<ImageProvider, keyof ApiKeys> = {
      dalle3: "openai", stability: "stability", ideogram: "ideogram", imagen: "google",
    };
    const order: ImageProvider[] = ["imagen", "dalle3", "stability", "ideogram"];
    const provider = order.find((p) => !!keys[providerKeyMap[p]]);
    if (!provider) return;

    const logoKeys: AssetKey[] = ["logo_primary", "logo_dark_bg"];
    const slug = slugifyForStorage(bbData.brandName);
    const session = await loadBrandbookSessionAssets(slug).catch((): {
      assetPack: AssetPackState;
      generatedAssets: Record<string, GeneratedAsset>;
      uploadedBrandAssets: UploadedAsset[];
    } => ({
      assetPack: { files: [] },
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

        const hasTextKey = hasPromptOpsProviderKey(promptProvider, keys);
        if (hasTextKey) {
          try {
            const refinedPrompt = await refineImagePromptClient({
              basePrompt,
              imageProvider: provider,
              assetKey,
              promptProvider,
              apiKeys: keys,
            });
            if (refinedPrompt) prompt = refinedPrompt;
          } catch { /* use base prompt */ }
        }

        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            provider,
            assetKey,
            aspectRatio: "1:1",
            projectId: projectId || undefined,
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
      migrateLegacyLocalStorageToIndexedDB().catch(() => {});
      return; // ← HARD STOP. Clean slate, no auto-restore.
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
    // No auto-restore, no loading, nothing.
    if (tabParam === "generate" && !bbParam && !slugParam) {
      setBrandbookData(null);
      setGeneratedAssets({});
      setUploadedBrandAssets([]);
      setAssetPack({ files: [] });
      setCurrentProjectId(null);
      resetHistory();
      setError("");
      // Still run migration in background (non-blocking)
      migrateLegacyLocalStorageToIndexedDB().catch(() => {});
      return; // ← HARD STOP. Don't touch anything else.
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
            if (!raw) throw new Error("Link inválido");
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
            setError("Link compartilhado inválido ou expirado.");
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
          } catch {
            // Corrupt — ignore
          }
        }
        setLoadingShared(false);
        return;
      }

      // No special params — restore last active session
      if (tabParam === "examples") {
        // User wants to see examples, don't auto-restore
        return;
      }

      const activeSlug = getActiveSlug();
      if (activeSlug) {
        const savedData = loadBrandbookData(activeSlug);
        if (savedData) {
          try {
            const validated = validateLooseBrandbook(savedData, {
              action: "restaurar a sessão salva",
              subject: "Brandbook salvo",
            });
            void restoreBrandbookSession(validated, { nextTab: "viewer" });
          } catch {
            // Corrupt saved data — ignore and show default screen
          }
        }
      }
    })();
  }, [restoreBrandbookSession]);

  // Fetch saved projects for the examples gallery
  useEffect(() => {
    setLoadingSavedProjects(true);
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json: { data?: typeof savedProjects }) => {
        if (json.data) setSavedProjects(json.data);
      })
      .catch(() => {
        // Not logged in or API error — silently skip
      })
      .finally(() => setLoadingSavedProjects(false));
  }, []);

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

  async function handleGenerate(formData: GenerateBriefingData) {
    setLoading(true);
    setError("");
    setBrandbookData(null);
    setGeneratedAssets({});
    setUploadedBrandAssets([]);
    setAssetPack({ files: [] });
    setCurrentProjectId(null);
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
          projectMode: formData.projectMode,
          provider: strategyProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: strategyProvider === "openai" ? apiKeys.openaiTextModel || undefined : undefined,
          googleModel: strategyProvider === "gemini" ? apiKeys.googleTextModel || undefined : undefined,
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
        if (!done) {
          buffer += decoder.decode(value, { stream: true });
        }

        const lines = buffer.split("\n");
        buffer = done ? "" : (lines.pop() ?? "");

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
              const validated = validateLooseBrandbook(event.data, {
                action: "gerar brandbook",
                subject: "Brandbook gerado",
              });
              await restoreBrandbookSession(validated, { nextTab: "viewer" });
              toast.success("Brandbook gerado com sucesso", {
                description: `${validated.brandName} — ${validated.industry}`,
              });

              // Auto-save to database and capture projectId, then generate logos
              let savedProjectId: string | undefined;
              try {
                const saveRes = await fetch("/api/projects", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: validated.brandName,
                    industry: validated.industry,
                    briefing: formData.briefing,
                    projectMode: formData.projectMode,
                    brandbookData: validated,
                  }),
                });
                if (saveRes.ok) {
                  const json = await saveRes.json() as { data?: { id?: string } };
                  if (json.data?.id) {
                    savedProjectId = json.data.id;
                    setCurrentProjectId(savedProjectId);
                  }
                }
              } catch { /* non-fatal */ }

              // Auto-generate logo images (with projectId for R2 persistence)
              const currentKeys = loadApiKeys();
              autoGenerateLogos(validated, currentKeys, promptOpsProvider, savedProjectId).catch(() => {});
            } else if (event.type === "error") {
              throw new Error(event.error ?? "Erro desconhecido");
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
        if (done) break;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      toast.error("Falha na geração", { description: message.slice(0, 120) });
    } finally {
      setLoading(false);
      setGenerationPhase("");
      setGenerationPct(0);
    }
  }

  /** Reset all state and navigate to the generate form for a fresh brandbook */
  function startNewBrandbook() {
    setBrandbookData(null);
    setGeneratedAssets({});
    setUploadedBrandAssets([]);
    setAssetPack({ files: [] });
    setCurrentProjectId(null);
    resetHistory();
    setError("");
    setPrefillBrandName("");
    setPrefillIndustry("");
    setPrefillBriefing("");
    setJsonText("");
    setTab("generate");
  }

  // React to client-side navigations to ?tab=generate (e.g. clicking "Novo Brandbook"
  // while already on the editor page). useSearchParams changes trigger this effect.
  // We track whether init has completed to avoid double-processing on mount.
  const initDoneRef = useRef(false);
  useEffect(() => {
    // Mark init as done after a tick (init effect runs first, same commit)
    const timer = setTimeout(() => { initDoneRef.current = true; }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Skip until init effect has had time to process
    if (!initDoneRef.current) return;
    // Only react if there's actually a tab param in the live URL
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

  async function handleExportPack() {
    if (!brandbookData) return;
    setExportingPack(true);
    setError("");
    try {
      const validatedBrandbook = validateLooseBrandbook(brandbookData, {
        action: "exportar o pack completo",
        subject: "Brandbook atual",
      });
      const lintReport = await fetchBrandbookLintReport(validatedBrandbook);
      const guard = getProtectedExportGuard("pack", lintReport);
      if (!guard.allowed) throw new Error(guard.reason ?? "Pack bloqueado pelo quality gate.");

      const res = await fetch("/api/export-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbookData: validatedBrandbook,
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
      const slug = slugifyForStorage(validatedBrandbook.brandName);
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
    toast.success("JSON exportado", { description: `${slug}-brandbook.json` });
  }

  async function handleExportProduction() {
    if (!brandbookData) return;
    setError("");
    try {
      const validatedBrandbook = validateLooseBrandbook(brandbookData, {
        action: "exportar o manifesto de produção",
        subject: "Brandbook atual",
      });
      const lintReport = await fetchBrandbookLintReport(validatedBrandbook);
      const guard = getProtectedExportGuard("production_manifest", lintReport);
      if (!guard.allowed) throw new Error(guard.reason ?? "Manifesto de produção bloqueado pelo quality gate.");

      const manifest = generateProductionManifest(validatedBrandbook);
      const slug = slugifyForStorage(validatedBrandbook.brandName);
      downloadJsonFile(manifest, `${slug}-production-manifest.json`);
      toast.success("Manifesto de produção exportado");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao exportar manifesto de produção";
      setError(msg);
      toast.error("Falha na exportação", { description: msg.slice(0, 120) });
    }
  }

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
      setError(error instanceof Error ? error.message : "JSON inválido. Verifique a formatação.");
    }
  }

  async function handleGenerateAssetPack() {
    if (!brandbookData) return;

    const hasKey = hasPromptOpsProviderKey(promptOpsProvider, apiKeys);
    if (!hasKey) {
      setError("Configure uma chave de IA (OpenAI ou Google) para gerar o Asset Pack.");
      return;
    }

    setAssetPackGenerating(true);
    setError("");
    try {
      const validatedBrandbook = validateLooseBrandbook(brandbookData, {
        action: "gerar o Asset Pack",
        subject: "Brandbook atual",
      });
      const res = await fetch("/api/generate-asset-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbookData: validatedBrandbook,
          textProvider: promptOpsProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: promptOpsProvider === "openai" ? apiKeys.openaiTextModel || undefined : undefined,
          googleModel: promptOpsProvider === "gemini" ? apiKeys.googleTextModel || undefined : undefined,
        }),
      });
      const j = await readJsonResponse<(AssetPackState & { error?: string }) | { error?: string }>(
        res,
        "/api/generate-asset-pack"
      ).catch((): { error?: string } => ({}));
      if (!res.ok) throw new Error(j.error ?? "Erro ao gerar Asset Pack");
      if (!("files" in j) || !Array.isArray(j.files)) throw new Error("Resposta inválida ao gerar Asset Pack");
      setAssetPack({
        files: j.files,
        coverage: j.coverage ?? null,
        quality: j.quality ?? null,
        plan: j.plan ?? null,
      });
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
    saveAssetPack(slug, assetPack).catch(() => {});
  }, [assetPack, brandbookData]);

  function handleClearImageCache() {
    if (!brandbookData) return;
    setConfirmDialog({
      title: "Limpar cache de imagens",
      description: "Todas as imagens geradas salvas para este brandbook serão removidas. Essa ação não pode ser desfeita.",
      variant: "danger",
      onConfirm: () => {
        const slug = slugifyForStorage(brandbookData.brandName);
        void clearBrandbookGeneratedAssetSession(slug);
        setGeneratedAssets({});
        toast.success("Cache de imagens limpo");
      },
    });
  }

  async function handleAssetGenerated(key: string, asset: GeneratedAsset) {
    // Stamp with current brand fingerprint so we can detect staleness later
    const fp = brandbookRef.current ? computeBrandFingerprint(brandbookRef.current) : undefined;
    let storedAsset: GeneratedAsset = { ...asset, brandFingerprint: fp };
    // For DALL-E 3 / Ideogram: external URLs expire — display immediately,
    // then convert to permanent data URL in the background
    if (asset.url.startsWith("https://")) {
      storedAsset = { ...storedAsset, originalUrl: asset.url };
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
              <button onClick={() => setViewerTab("export")} className="app-primary-button ml-1 px-3 py-2 text-xs font-bold">
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

            {/* Sub-tab: Brandbook Preview */}
            {viewerTab === "preview" && (
              <BrandbookViewer
                data={brandbookData}
                generatedImages={Object.fromEntries(
                  Object.entries(generatedAssets).map(([k, v]) => [k, v.url])
                )}
                uploadedAssets={uploadedBrandAssets}
                assetPack={assetPack}
                assetPackGenerating={assetPackGenerating}
                onGenerateAssetPack={handleGenerateAssetPack}
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
    </div>
  );
}
