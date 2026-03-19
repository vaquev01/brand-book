"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { BrandbookData, GeneratedAsset, UploadedAsset, type AssetPackState, type GenerateScope, type CreativityLevel } from "@/lib/types";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import { decompressBrandbook } from "@/lib/shareUtils";
import {
  loadBrandbookSessionAssets,
  migrateLegacyLocalStorageToIndexedDB,
  slugifyForStorage,
} from "@/lib/brandbookLocalSession";
import {
  getActiveSlug,
  saveBrandbookData,
  loadBrandbookData,
  saveGeneratedImage,
  saveBrandAssets,
  saveAssetPack,
  setActiveSlug,
} from "@/lib/imageStorage";

type Tab = "generate" | "examples" | "viewer";
type ViewerTab = "preview" | "edit" | "assets" | "refine" | "consistency" | "export";

interface SavedProject {
  id: string;
  slug: string;
  name: string;
  industry: string;
  status: string;
  updatedAt: string;
  brandbookVersions: Array<{ brandbookJson?: unknown }>;
}

export function useEditorSession() {
  const [tab, setTab] = useState<Tab>("generate");
  const [viewerTab, setViewerTab] = useState<ViewerTab>("preview");
  const [loadingShared, setLoadingShared] = useState(false);
  const [error, setError] = useState("");
  const [prefillBrandName, setPrefillBrandName] = useState("");
  const [prefillIndustry, setPrefillIndustry] = useState("");
  const [prefillBriefing, setPrefillBriefing] = useState("");
  const [templateScope, setTemplateScope] = useState<GenerateScope | undefined>();
  const [templateCreativity, setTemplateCreativity] = useState<CreativityLevel | undefined>();
  const [templateGuidedBriefing, setTemplateGuidedBriefing] = useState<Record<string, string> | undefined>();
  const [templateName, setTemplateName] = useState<string | undefined>();
  const [brandbookData, setBrandbookData] = useState<BrandbookData | null>(null);
  const brandbookRef = useRef<BrandbookData | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [generatedAssets, setGeneratedAssets] = useState<Record<string, GeneratedAsset>>({});
  const [uploadedBrandAssets, setUploadedBrandAssets] = useState<UploadedAsset[]>([]);
  const [assetPack, setAssetPack] = useState<AssetPackState>({ files: [] });
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loadingSavedProjects, setLoadingSavedProjects] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
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

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Fetch saved projects
  useEffect(() => {
    setLoadingSavedProjects(true);
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json: { data?: SavedProject[] }) => {
        if (json.data) setSavedProjects(json.data);
      })
      .catch(() => {})
      .finally(() => setLoadingSavedProjects(false));
  }, []);

  // Auto-save to localStorage
  const saveStatusRef = useRef<"idle" | "saving" | "error">("idle");
  const [saveError, setSaveError] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastServerSaveRef = useRef<string>("");

  const persistAll = useCallback(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    setSaveError(false);
    saveStatusRef.current = "saving";

    try {
      saveBrandbookData(slug, brandbookData);
      setActiveSlug(slug);
    } catch {
      setSaveError(true);
      saveStatusRef.current = "error";
      toast.error("Erro ao salvar — localStorage cheio. Exporte seu brandbook para nao perder dados.");
      return;
    }

    const promises: Promise<void>[] = [];
    for (const [key, asset] of Object.entries(generatedAssets)) {
      promises.push(saveGeneratedImage(slug, key, asset));
    }
    promises.push(saveBrandAssets(slug, uploadedBrandAssets));
    promises.push(saveAssetPack(slug, assetPack));

    Promise.all(promises)
      .then(() => { saveStatusRef.current = "idle"; })
      .catch(() => {
        setSaveError(true);
        saveStatusRef.current = "error";
        toast.error("Erro ao salvar assets no IndexedDB. Exporte para nao perder dados.");
      });
  }, [brandbookData, generatedAssets, uploadedBrandAssets, assetPack]);

  const persistToServer = useCallback(() => {
    if (!brandbookData) return;
    const slug = slugifyForStorage(brandbookData.brandName);
    const dataHash = JSON.stringify(brandbookData).length.toString() + ":" + brandbookData.brandName;
    if (dataHash === lastServerSaveRef.current) return;
    lastServerSaveRef.current = dataHash;

    fetch(`/api/projects/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandbookData }),
    }).catch(() => {});
  }, [brandbookData]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (!brandbookData) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(persistAll, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [brandbookData, generatedAssets, uploadedBrandAssets, assetPack, persistAll]);

  // Debounced auto-save to server
  useEffect(() => {
    if (!brandbookData) return;
    if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current);
    serverSaveTimerRef.current = setTimeout(persistToServer, 3000);
    return () => { if (serverSaveTimerRef.current) clearTimeout(serverSaveTimerRef.current); };
  }, [brandbookData, persistToServer]);

  // Resolve project ID
  const projectIdResolveRef = useRef(false);
  useEffect(() => {
    if (!brandbookData || currentProjectId || projectIdResolveRef.current) return;
    projectIdResolveRef.current = true;
    const slug = slugifyForStorage(brandbookData.brandName);
    fetch(`/api/projects/${encodeURIComponent(slug)}`)
      .then((res) => res.ok ? res.json() as Promise<{ data?: { id?: string } }> : null)
      .then((json) => {
        if (json?.data?.id) {
          setCurrentProjectId(json.data.id);
        } else {
          return fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: brandbookData.brandName,
              industry: brandbookData.industry,
              brandbookData,
            }),
          })
            .then((r) => r.ok ? r.json() as Promise<{ data?: { id?: string } }> : null)
            .then((r) => {
              if (r?.data?.id) setCurrentProjectId(r.data.id);
            });
        }
      })
      .catch(() => {})
      .finally(() => { projectIdResolveRef.current = false; });
  }, [brandbookData, currentProjectId]);

  return {
    // State
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
    // Functions
    resetHistory,
    updateBrandbook,
    handleUndo,
    handleRedo,
    restoreBrandbookSession,
    startNewBrandbook,
    persistAll,
    persistToServer,
  };
}
