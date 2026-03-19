"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { BrandbookData, GeneratedAsset, ImageProvider, type AiTextProvider } from "@/lib/types";
import { type ApiKeys, loadApiKeys } from "@/components/ApiKeyConfig";
import { validateLooseBrandbook } from "@/lib/brandbookValidation";
import { buildImagePrompt, type AssetKey } from "@/lib/imagePrompts";
import { readJsonResponse } from "@/lib/http";
import {
  hasPromptOpsProviderKey,
  refineImagePromptClient,
} from "@/lib/imagePromptClient";
import {
  loadBrandbookSessionAssets,
  slugifyForStorage,
} from "@/lib/brandbookLocalSession";
import type { AssetPackState } from "@/lib/types";
import type { GenerateBriefingData } from "@/components/GenerateBriefingForm";

type Tab = "generate" | "examples" | "viewer";
type ViewerTab = "preview" | "edit" | "assets" | "refine" | "consistency" | "export";

interface UseEditorGenerationArgs {
  strategyProvider: AiTextProvider;
  promptOpsProvider: AiTextProvider;
  apiKeys: ApiKeys;
  restoreBrandbookSession: (
    bb: BrandbookData,
    opts?: { nextTab?: Tab; nextViewerTab?: ViewerTab }
  ) => Promise<void>;
  setBrandbookData: (d: BrandbookData | null) => void;
  setGeneratedAssets: React.Dispatch<React.SetStateAction<Record<string, GeneratedAsset>>>;
  setUploadedBrandAssets: (a: never[]) => void;
  setAssetPack: (a: { files: never[] }) => void;
  setCurrentProjectId: (id: string | null) => void;
  resetHistory: () => void;
  setError: (e: string) => void;
}

export function useEditorGeneration({
  strategyProvider,
  promptOpsProvider,
  apiKeys,
  restoreBrandbookSession,
  setBrandbookData,
  setGeneratedAssets,
  setUploadedBrandAssets,
  setAssetPack,
  setCurrentProjectId,
  resetHistory,
  setError,
}: UseEditorGenerationArgs) {
  const [loading, setLoading] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [generationPct, setGenerationPct] = useState(0);

  const autoGenerateLogos = useCallback(async (
    bbData: BrandbookData,
    keys: ApiKeys,
    promptProvider: AiTextProvider,
    projectId?: string | null
  ) => {
    const providerKeyMap: Record<ImageProvider, keyof ApiKeys> = {
      dalle3: "openai", stability: "stability", ideogram: "ideogram", imagen: "google", recraft: "recraft", flux: "flux",
    };
    const order: ImageProvider[] = ["imagen", "dalle3", "stability", "ideogram", "recraft", "flux"];
    const provider = order.find((p) => !!keys[providerKeyMap[p]]);
    if (!provider) return;

    const logoKeys: AssetKey[] = ["logo_primary", "logo_dark_bg"];
    const slug = slugifyForStorage(bbData.brandName);
    const session = await loadBrandbookSessionAssets(slug).catch((): {
      assetPack: AssetPackState;
      generatedAssets: Record<string, GeneratedAsset>;
      uploadedBrandAssets: never[];
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
      const label = assetKey === "logo_primary" ? "Logo (Fundo Claro)" : "Logo (Versao Invertida)";
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
      } catch { /* skip silently */ }
    }

    setGenerationPct(100);
    setGenerationPhase("");
  }, [setGeneratedAssets]);

  async function handleGenerate(formData: GenerateBriefingData) {
    setLoading(true);
    setError("");
    setBrandbookData(null);
    setGeneratedAssets({});
    setUploadedBrandAssets([]);
    setAssetPack({ files: [] });
    setCurrentProjectId(null);
    resetHistory();
    setGenerationPhase("Preparando geracao...");
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

      if (!res.body) throw new Error("Streaming nao suportado pelo servidor.");

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
      toast.error("Falha na geracao", { description: message.slice(0, 120) });
    } finally {
      setLoading(false);
      setGenerationPhase("");
      setGenerationPct(0);
    }
  }

  return {
    loading,
    generationPhase,
    generationPct,
    handleGenerate,
    autoGenerateLogos,
  };
}
