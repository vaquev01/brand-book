"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { BrandbookData, GeneratedAsset, UploadedAsset, type AssetPackState, type AiTextProvider } from "@/lib/types";
import { type ApiKeys } from "@/components/ApiKeyConfig";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import { readJsonResponse } from "@/lib/http";
import { fetchImageDataUrl } from "@/lib/imageTransport";
import {
  hasPromptOpsProviderKey,
} from "@/lib/imagePromptClient";
import {
  clearBrandbookGeneratedAssetSession,
  slugifyForStorage,
} from "@/lib/brandbookLocalSession";
import { saveGeneratedImage } from "@/lib/imageStorage";
import { pullServerAssets } from "@/lib/imageSync";
import { computeBrandFingerprint } from "@/lib/brandFingerprint";
import { downloadBlob, downloadJsonFile } from "@/lib/browserDownload";
import { generateProductionManifest } from "@/lib/productionExport";
import { fetchBrandbookLintReport } from "@/lib/brandbookLintClient";
import { getProtectedExportGuard } from "@/lib/brandbookQualityGate";

interface UseEditorAssetsArgs {
  brandbookData: BrandbookData | null;
  brandbookRef: React.MutableRefObject<BrandbookData | null>;
  currentProjectId: string | null;
  generatedAssets: Record<string, GeneratedAsset>;
  setGeneratedAssets: React.Dispatch<React.SetStateAction<Record<string, GeneratedAsset>>>;
  uploadedBrandAssets: UploadedAsset[];
  setUploadedBrandAssets: React.Dispatch<React.SetStateAction<UploadedAsset[]>>;
  assetPack: AssetPackState;
  setAssetPack: React.Dispatch<React.SetStateAction<AssetPackState>>;
  apiKeys: ApiKeys;
  promptOpsProvider: AiTextProvider;
  persistAll: () => void;
  setError: (e: string) => void;
  setCurrentProjectId: (id: string | null) => void;
  setConfirmDialog: (d: { title: string; description?: string; variant?: "danger" | "default"; onConfirm: () => void; } | null) => void;
}

export function useEditorAssets({
  brandbookData,
  brandbookRef,
  currentProjectId,
  generatedAssets,
  setGeneratedAssets,
  uploadedBrandAssets,
  assetPack,
  setAssetPack,
  apiKeys,
  promptOpsProvider,
  persistAll,
  setError,
  setCurrentProjectId,
  setConfirmDialog,
}: UseEditorAssetsArgs) {
  const [assetPackGenerating, setAssetPackGenerating] = useState(false);
  const [exportingPack, setExportingPack] = useState(false);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudSaved, setCloudSaved] = useState(false);

  const assetPackFiles = assetPack.files;

  // Sync images to server
  const syncedKeysRef = useRef<Set<string>>(new Set());
  const imageSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncImagesToServer = useCallback(() => {
    if (!currentProjectId || Object.keys(generatedAssets).length === 0) return;

    const assetsToSync = Object.entries(generatedAssets)
      .filter(([key, a]) => a.url && !syncedKeysRef.current.has(key + ":" + a.generatedAt))
      .map(([key, a]) => ({
        key,
        url: a.url,
        provider: a.provider,
        prompt: a.prompt,
      }))
      .slice(0, 10);

    if (assetsToSync.length === 0) return;

    fetch("/api/assets/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: currentProjectId, assets: assetsToSync }),
    })
      .then((res) => {
        if (res.ok) {
          for (const a of assetsToSync) {
            const asset = generatedAssets[a.key];
            if (asset) syncedKeysRef.current.add(a.key + ":" + asset.generatedAt);
          }
          const remaining = Object.entries(generatedAssets)
            .filter(([key, a]) => a.url && !syncedKeysRef.current.has(key + ":" + a.generatedAt));
          if (remaining.length > 0) {
            setTimeout(syncImagesToServer, 1000);
          }
        }
      })
      .catch(() => {});
  }, [currentProjectId, generatedAssets]);

  useEffect(() => {
    if (!currentProjectId || Object.keys(generatedAssets).length === 0) return;
    const assetsToSync = Object.entries(generatedAssets)
      .filter(([key, a]) => a.url && !syncedKeysRef.current.has(key + ":" + a.generatedAt));
    if (assetsToSync.length === 0) return;
    if (imageSyncTimerRef.current) clearTimeout(imageSyncTimerRef.current);
    imageSyncTimerRef.current = setTimeout(syncImagesToServer, 2000);
    return () => { if (imageSyncTimerRef.current) clearTimeout(imageSyncTimerRef.current); };
  }, [currentProjectId, generatedAssets, syncImagesToServer]);

  // Pull server assets on load
  const serverPullDoneRef = useRef(false);
  useEffect(() => {
    if (!currentProjectId || !brandbookData || serverPullDoneRef.current) return;
    serverPullDoneRef.current = true;
    const slug = slugifyForStorage(brandbookData.brandName);
    pullServerAssets(currentProjectId, slug)
      .then((downloaded) => {
        if (Object.keys(downloaded).length > 0) {
          setGeneratedAssets((prev) => ({ ...prev, ...downloaded }));
        }
      })
      .catch(() => {});
  }, [currentProjectId, brandbookData, setGeneratedAssets]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistAll();
      if (brandbookData) {
        const slug = slugifyForStorage(brandbookData.brandName);
        navigator.sendBeacon?.(
          `/api/projects/${encodeURIComponent(slug)}`,
          new Blob([JSON.stringify({ brandbookData })], { type: "application/json" })
        );
      }
      if (currentProjectId && Object.keys(generatedAssets).length > 0) {
        const unsyncedAssets = Object.entries(generatedAssets)
          .filter(([key, a]) => a.url && !syncedKeysRef.current.has(key + ":" + a.generatedAt))
          .map(([key, a]) => ({ key, url: a.url, provider: a.provider, prompt: a.prompt }))
          .slice(0, 10);
        if (unsyncedAssets.length > 0) {
          navigator.sendBeacon?.(
            "/api/assets/sync",
            new Blob([JSON.stringify({ projectId: currentProjectId, assets: unsyncedAssets })], { type: "application/json" })
          );
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [persistAll, brandbookData, currentProjectId, generatedAssets]);

  async function handleAssetGenerated(key: string, asset: GeneratedAsset) {
    const fp = brandbookRef.current ? computeBrandFingerprint(brandbookRef.current) : undefined;
    let storedAsset: GeneratedAsset = { ...asset, brandFingerprint: fp };
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
        .catch(() => {});
      return;
    }
    setGeneratedAssets((prev) => ({ ...prev, [key]: storedAsset }));
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
      if (!("files" in j) || !Array.isArray(j.files)) throw new Error("Resposta invalida ao gerar Asset Pack");
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

  async function handleForceSaveToCloud() {
    if (!brandbookData || cloudSaving) return;
    setCloudSaving(true);
    setCloudSaved(false);
    const slug = slugifyForStorage(brandbookData.brandName);

    try {
      const saveRes = await fetch(`/api/projects/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandbookData }),
      });

      let resolvedProjectId = currentProjectId;
      if (!saveRes.ok && saveRes.status === 401) {
        toast.error("Faca login para salvar na nuvem.");
        return;
      }
      if (!resolvedProjectId) {
        const createRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: brandbookData.brandName,
            industry: brandbookData.industry,
            brandbookData,
          }),
        });
        if (createRes.ok) {
          const json = await createRes.json() as { data?: { id?: string } };
          if (json.data?.id) {
            resolvedProjectId = json.data.id;
            setCurrentProjectId(resolvedProjectId);
          }
        }
      }

      if (resolvedProjectId && Object.keys(generatedAssets).length > 0) {
        const assetsToSync = Object.entries(generatedAssets)
          .filter(([, a]) => a.url)
          .map(([key, a]) => ({ key, url: a.url, provider: a.provider, prompt: a.prompt }));

        if (assetsToSync.length > 0) {
          for (let i = 0; i < assetsToSync.length; i += 10) {
            const batch = assetsToSync.slice(i, i + 10);
            const res = await fetch("/api/assets/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: resolvedProjectId, assets: batch }),
            });
            if (res.ok) {
              for (const a of batch) {
                const asset = generatedAssets[a.key];
                if (asset) syncedKeysRef.current.add(a.key + ":" + asset.generatedAt);
              }
            }
          }
        }
      }

      persistAll();

      setCloudSaved(true);
      toast.success("Salvo na nuvem", {
        description: "Brandbook + imagens sincronizados.",
      });
      setTimeout(() => setCloudSaved(false), 4000);
    } catch (err) {
      toast.error("Erro ao salvar na nuvem", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setCloudSaving(false);
    }
  }

  function handleClearImageCache() {
    if (!brandbookData) return;
    setConfirmDialog({
      title: "Limpar cache de imagens",
      description: "Todas as imagens geradas salvas para este brandbook serao removidas. Essa acao nao pode ser desfeita.",
      variant: "danger",
      onConfirm: () => {
        const slug = slugifyForStorage(brandbookData.brandName);
        void clearBrandbookGeneratedAssetSession(slug);
        setGeneratedAssets({});
        toast.success("Cache de imagens limpo");
      },
    });
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
        action: "exportar o manifesto de producao",
        subject: "Brandbook atual",
      });
      const lintReport = await fetchBrandbookLintReport(validatedBrandbook);
      const guard = getProtectedExportGuard("production_manifest", lintReport);
      if (!guard.allowed) throw new Error(guard.reason ?? "Manifesto de producao bloqueado pelo quality gate.");

      const manifest = generateProductionManifest(validatedBrandbook);
      const slug = slugifyForStorage(validatedBrandbook.brandName);
      downloadJsonFile(manifest, `${slug}-production-manifest.json`);
      toast.success("Manifesto de producao exportado");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao exportar manifesto de producao";
      setError(msg);
      toast.error("Falha na exportacao", { description: msg.slice(0, 120) });
    }
  }

  return {
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
    syncedKeysRef,
  };
}
