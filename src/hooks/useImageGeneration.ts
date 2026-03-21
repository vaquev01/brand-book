"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiKeys } from "@/components/ApiKeyConfig";
import { BrandbookData, ImageProvider, GeneratedAsset, UploadedAsset, type AiTextProvider } from "@/lib/types";
import {
  ASSET_CATALOG,
  buildImagePrompt,
  buildApplicationPrompt,
  detectSizeVariants,
  AssetKey,
  AspectRatioOption,
} from "@/lib/imagePrompts";
import { buildBrandNameFidelityBlock } from "@/lib/brandNameFidelity";
import { rasterFileToOptimizedDataUrl } from "@/lib/imageDataUrl";
import { downloadImageUrl, fetchImageDataUrl } from "@/lib/imageTransport";
import {
  hasPromptOpsProviderKey,
  refineImagePromptClient,
} from "@/lib/imagePromptClient";
import { readJsonResponse } from "@/lib/http";
import { syncSingleAsset } from "@/lib/imageSync";

const PROVIDER_KEY_MAP: Record<ImageProvider, keyof ApiKeys> = {
  dalle3: "openai",
  stability: "stability",
  ideogram: "ideogram",
  imagen: "google",
  recraft: "recraft",
  flux: "flux",
};

export const PROVIDERS: {
  id: ImageProvider;
  name: string;
  desc: string;
  envKey: string;
  color: string;
}[] = [
  {
    id: "imagen",
    name: "Google Imagen",
    desc: "Google · Imagen 3 + Gemini · Padrão recomendado — alta qualidade, velocidade e custo-benefício",
    envKey: "GOOGLE_API_KEY",
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
  {
    id: "dalle3",
    name: "DALL-E 3",
    desc: "OpenAI · Altíssima qualidade, fotorrealista e artístico",
    envKey: "OPENAI_API_KEY",
    color: "bg-green-50 border-green-200 text-green-800",
  },
  {
    id: "ideogram",
    name: "Ideogram V2",
    desc: "Ideogram · Logos com texto legível e design gráfico",
    envKey: "IDEOGRAM_API_KEY",
    color: "bg-orange-50 border-orange-200 text-orange-800",
  },
  {
    id: "stability",
    name: "Stable Diffusion XL",
    desc: "Stability AI · Padrões, texturas e fotografia",
    envKey: "STABILITY_API_KEY",
    color: "bg-purple-50 border-purple-200 text-purple-800",
  },
  {
    id: "recraft",
    name: "Recraft V4",
    desc: "Recraft · SVG nativo, ícones vetoriais e ilustrações — único que gera vetores reais",
    envKey: "RECRAFT_API_KEY",
    color: "bg-rose-50 border-rose-200 text-rose-800",
  },
  {
    id: "flux",
    name: "Flux Pro",
    desc: "Black Forest Labs · Alta qualidade fotorrealista a baixo custo",
    envKey: "FLUX_API_KEY",
    color: "bg-cyan-50 border-cyan-200 text-cyan-800",
  },
];

export const IMMERSIVE_ESSENTIALS: AssetKey[] = [
  "hero_visual",
  "brand_pattern",
  "brand_mascot",
  "hero_lifestyle",
  "presentation_bg",
  "materials_board",
];

const STRICT_LOGO_ASSETS: AssetKey[] = [
  "logo_primary",
  "logo_dark_bg",
  "business_card",
  "brand_collateral",
  "delivery_packaging",
  "takeaway_bag",
  "food_container",
  "uniform_tshirt",
  "uniform_apron",
  "outdoor_billboard",
];

function isStrictLogoAsset(key: AssetKey): boolean {
  return STRICT_LOGO_ASSETS.includes(key);
}

function pickDefaultProvider(keys: ApiKeys): ImageProvider {
  // Google (Imagen/Gemini) is the default — best balance of quality, speed and cost
  const order: ImageProvider[] = ["imagen", "dalle3", "ideogram", "recraft", "stability", "flux"];
  return order.find((p) => !!keys[PROVIDER_KEY_MAP[p]]) ?? "imagen";
}

function defaultUploadedTypeFromAssetKey(
  assetKey?: AssetKey
): UploadedAsset["type"] {
  if (!assetKey) return "reference";
  if (assetKey === "logo_primary" || assetKey === "logo_dark_bg") return "logo";
  if (assetKey === "brand_mascot") return "mascot";
  if (assetKey === "brand_pattern" || assetKey === "presentation_bg")
    return "pattern";
  return "reference";
}

export interface UseImageGenerationProps {
  data: BrandbookData;
  generatedAssets: Record<string, GeneratedAsset>;
  onAssetGenerated: (key: string, asset: GeneratedAsset) => void;
  onSaveToAssets?: (asset: UploadedAsset) => void;
  apiKeys: ApiKeys;
  uploadedAssets: UploadedAsset[];
  promptProvider: AiTextProvider;
  projectId?: string | null;
  enabled?: boolean;
}

export function useImageGeneration({
  data,
  generatedAssets,
  onAssetGenerated,
  onSaveToAssets,
  apiKeys,
  uploadedAssets,
  promptProvider,
  projectId,
}: UseImageGenerationProps) {
  const [provider, setProvider] = useState<ImageProvider>(() =>
    pickDefaultProvider(apiKeys)
  );
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refineBeforeGenerate, setRefineBeforeGenerate] = useState(true);
  const [useReferenceImages, setUseReferenceImages] = useState(true);
  const batchAbortRef = useRef(false);

  useEffect(() => {
    if (!apiKeys[PROVIDER_KEY_MAP[provider]]) {
      const better = pickDefaultProvider(apiKeys);
      if (better !== provider) setProvider(better);
    }
  }, [apiKeys, provider]);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  // Server has env var fallbacks — generation works without client keys
  const currentProviderHasKey = true;

  function pickReferenceImages(max = 6, current?: AssetKey): string[] {
    const logoCandidates = uploadedAssets.filter((a) => a.type === "logo");
    const patternCandidates = uploadedAssets.filter(
      (a) => a.type === "pattern"
    );
    const elementCandidates = uploadedAssets.filter(
      (a) =>
        a.type === "element" || a.type === "mascot" || a.type === "reference"
    );

    const generatedLogo = [
      generatedAssets.logo_primary,
      generatedAssets.logo_dark_bg,
    ]
      .filter((a) => !!a && (!current || a.key !== current))
      .map((a) => a!.url)
      .filter((u) => typeof u === "string" && u.length > 0);

    const generatedPattern = [generatedAssets.brand_pattern]
      .filter((a) => !!a && (!current || a.key !== current))
      .map((a) => a!.url)
      .filter((u) => typeof u === "string" && u.length > 0);

    const generatedMascot = [generatedAssets.brand_mascot]
      .filter((a) => !!a && (!current || a.key !== current))
      .map((a) => a!.url)
      .filter((u) => typeof u === "string" && u.length > 0);

    const uploadedLogo = logoCandidates.map((a) => a.dataUrl);
    const uploadedPatterns = patternCandidates.map((a) => a.dataUrl);
    const uploadedElements = elementCandidates.map((a) => a.dataUrl);

    return [
      ...generatedLogo,
      ...uploadedLogo,
      ...generatedPattern,
      ...uploadedPatterns,
      ...generatedMascot,
      ...uploadedElements,
    ]
      .filter(Boolean)
      .slice(0, max);
  }

  function pickLogoReferenceImages(max = 2, current?: AssetKey): string[] {
    const logoCandidates = uploadedAssets.filter((a) => a.type === "logo");
    const uploadedLogo = logoCandidates.map((a) => a.dataUrl);

    const generatedPrimary =
      generatedAssets.logo_primary &&
      (!current || generatedAssets.logo_primary.key !== current)
        ? [generatedAssets.logo_primary.url]
        : [];

    return [...generatedPrimary, ...uploadedLogo].filter(Boolean).slice(0, max);
  }

  const generate = useCallback(
    async (assetKey: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string; providerOverride?: ImageProvider }) => {
      const activeProvider = options?.providerOverride ?? provider;
      const providerKey = apiKeys[PROVIDER_KEY_MAP[activeProvider]];
      // Allow generation even without client-side key — server has env var fallbacks
      // Only warn if NO keys are configured at all (user hasn't set up anything)

      const effectiveKey = options?.storageKey ?? assetKey;
      setLoadingKey(effectiveKey);
      setError(null);
      try {
        const basePromptRaw = buildImagePrompt(assetKey, data, activeProvider);
        const userDirectionBlock = options?.customInstruction
          ? [
              "MANDATORY USER DIRECTION:",
              buildBrandNameFidelityBlock(
                data.brandName,
                data.logo.incorrectUsages ?? [],
                isStrictLogoAsset(assetKey) || assetKey === "logo_primary" ? "logo" : "brand_visible"
              ),
              "Treat the user's explicit rules as binding constraints. If they conflict with model defaults, follow the user's rules.",
              options.customInstruction,
            ].join("\n")
          : "";
        const basePrompt = options?.customInstruction
          ? `${basePromptRaw}\n\n${userDirectionBlock}`
          : basePromptRaw;
        let prompt = basePrompt;

        if (refineBeforeGenerate) {
          const canRefine =
            (activeProvider !== "stability" || prompt.includes(" --neg "));
          const hasTextKey = hasPromptOpsProviderKey(promptProvider, apiKeys);
          if (canRefine && hasTextKey) {
            try {
              const refinedPrompt = await refineImagePromptClient({
                basePrompt,
                imageProvider: activeProvider,
                assetKey,
                promptProvider,
                apiKeys,
              });
              if (refinedPrompt) prompt = refinedPrompt;
            } catch {
              // Prompt refinement is optional; fall back to base prompt.
            }
          }
        }

        const canUseRefImages =
          activeProvider === "imagen" && !!apiKeys.google && useReferenceImages;

        const autoRefs = canUseRefImages
          ? isStrictLogoAsset(assetKey)
            ? pickLogoReferenceImages(2, assetKey)
            : pickReferenceImages(6, assetKey)
          : [];
        const allRefs = [
          ...(options?.userReferenceImages ?? []),
          ...autoRefs,
        ].slice(0, 8);
        const referenceImages = allRefs.length > 0 ? allRefs : undefined;

        if (isStrictLogoAsset(assetKey) && assetKey !== "logo_primary") {
          if (activeProvider !== "imagen") {
            throw new Error(
              "Para garantir consistência do logo, use o provider Google Image e gere primeiro o Logo — Fundo Claro (ou faça upload do logo em Assets)."
            );
          }
          if (useReferenceImages && !referenceImages) {
            throw new Error(
              "Para garantir consistência do logo, gere primeiro o Logo — Fundo Claro (ou faça upload do logo em Assets). Depois gere esta variação."
            );
          }
        }

        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            provider: activeProvider,
            assetKey,
            referenceImages,
            projectId: projectId || undefined,
            openaiKey: apiKeys.openai || undefined,
            stabilityKey: apiKeys.stability || undefined,
            ideogramKey: apiKeys.ideogram || undefined,
            googleKey: apiKeys.google || undefined,
            openaiImageModel: apiKeys.openaiImageModel || undefined,
            stabilityModel: apiKeys.stabilityModel || undefined,
            ideogramModel: apiKeys.ideogramModel || undefined,
            googleImageModel: apiKeys.googleImageModel || undefined,
            recraftKey: apiKeys.recraft || undefined,
            fluxKey: apiKeys.flux || undefined,
            recraftModel: apiKeys.recraftModel || undefined,
          }),
        });
        const result = await readJsonResponse<{ url?: string; publicUrl?: string; error?: string }>(
          res,
          "/api/generate-image"
        );
        if (!res.ok) throw new Error(result.error ?? "Erro ao gerar imagem");
        if (!result.url) throw new Error("API não retornou URL de imagem");
        const generatedAsset: GeneratedAsset = {
          key: effectiveKey,
          url: result.url,
          provider: activeProvider,
          prompt,
          generatedAt: new Date().toISOString(),
        };
        onAssetGenerated(effectiveKey, generatedAsset);

        // Fire-and-forget: sync to server if projectId is available
        if (projectId) {
          setIsSyncing(true);
          syncSingleAsset(projectId, generatedAsset).finally(() => setIsSyncing(false));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoadingKey(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data,
      provider,
      apiKeys,
      promptProvider,
      projectId,
      refineBeforeGenerate,
      useReferenceImages,
      onAssetGenerated,
    ]
  );

  const generateApplication = useCallback(
    async (appIndex: number, aspectRatio: AspectRatioOption, customInstruction?: string, userReferenceImages?: string[], providerOverride?: ImageProvider) => {
      const activeProvider = providerOverride ?? provider;
      const app = data.applications[appIndex];
      const appKey = `app_${appIndex}_${aspectRatio}`;
      setLoadingKey(appKey);
      setError(null);
      try {
        const providerKey = apiKeys[PROVIDER_KEY_MAP[activeProvider]];
        if (!providerKey) {
          const p = PROVIDERS.find((x) => x.id === activeProvider);
          throw new Error(
            `Configure a chave ${p?.envKey ?? "da API"} em ⚙ APIs para usar ${p?.name ?? activeProvider}.`
          );
        }

        // ── REFERENCE IMAGE ANALYSIS ──────────────────────────────
        // Analyze the FIRST user reference image with vision to extract
        // a structured description. This description is injected into
        // the prompt so ALL providers (not just Imagen) understand what
        // the user wants to generate.
        let referenceAnalysis: string | undefined;
        if (userReferenceImages && userReferenceImages.length > 0) {
          const visionProvider = apiKeys.google ? "google" : apiKeys.openai ? "openai" : null;
          if (visionProvider) {
            try {
              const analyzeRes = await fetch("/api/analyze-reference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  imageDataUrl: userReferenceImages[0],
                  appType: app.type,
                  appDescription: app.description,
                  provider: visionProvider,
                  googleKey: apiKeys.google || undefined,
                  openaiKey: apiKeys.openai || undefined,
                }),
              });
              if (analyzeRes.ok) {
                const analyzeData = await analyzeRes.json();
                if (analyzeData.analysis) {
                  referenceAnalysis = analyzeData.analysis;
                }
              }
            } catch {
              // Vision analysis is optional; continue without it
            }
          }
        }

        // Combine user instruction + reference analysis into enriched instruction
        const enrichedInstruction = [
          customInstruction,
          referenceAnalysis
            ? `REFERENCE IMAGE ANALYSIS (replicate this subject and style): ${referenceAnalysis}`
            : null,
        ].filter(Boolean).join(". ") || undefined;

        const basePrompt = buildApplicationPrompt(
          app,
          data,
          activeProvider,
          aspectRatio,
          enrichedInstruction
        );
        let prompt = basePrompt;
        if (refineBeforeGenerate) {
          const hasTextKey = hasPromptOpsProviderKey(promptProvider, apiKeys);
          if (hasTextKey) {
            try {
              const refinedPrompt = await refineImagePromptClient({
                basePrompt,
                imageProvider: activeProvider,
                assetKey: "brand_collateral",
                promptProvider,
                apiKeys,
              });
              if (refinedPrompt) prompt = refinedPrompt;
            } catch {
              // Prompt refinement is optional; fall back to base prompt.
            }
          }
        }
        const canUseRefImages =
          activeProvider === "imagen" && !!apiKeys.google && useReferenceImages;
        const autoRefs = canUseRefImages
          ? pickReferenceImages(6)
          : [];
        const allRefs = [
          ...(userReferenceImages ?? []),
          ...autoRefs,
        ].slice(0, 8);
        const referenceImages = allRefs.length > 0 ? allRefs : undefined;
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            provider: activeProvider,
            assetKey: appKey,
            aspectRatio,
            referenceImages,
            projectId: projectId || undefined,
            openaiKey: apiKeys.openai || undefined,
            stabilityKey: apiKeys.stability || undefined,
            ideogramKey: apiKeys.ideogram || undefined,
            googleKey: apiKeys.google || undefined,
            openaiImageModel: apiKeys.openaiImageModel || undefined,
            stabilityModel: apiKeys.stabilityModel || undefined,
            ideogramModel: apiKeys.ideogramModel || undefined,
            googleImageModel: apiKeys.googleImageModel || undefined,
            recraftKey: apiKeys.recraft || undefined,
            fluxKey: apiKeys.flux || undefined,
            recraftModel: apiKeys.recraftModel || undefined,
          }),
        });
        const result = await readJsonResponse<{ url?: string; publicUrl?: string; error?: string }>(
          res,
          "/api/generate-image"
        );
        if (!res.ok) throw new Error(result.error ?? "Erro ao gerar imagem");
        if (!result.url) throw new Error("API não retornou URL de imagem");
        const generatedAsset: GeneratedAsset = {
          key: appKey,
          url: result.url,
          provider: activeProvider,
          prompt,
          generatedAt: new Date().toISOString(),
        };
        onAssetGenerated(appKey, generatedAsset);

        // Fire-and-forget: sync to server if projectId is available
        if (projectId) {
          setIsSyncing(true);
          syncSingleAsset(projectId, generatedAsset).finally(() => setIsSyncing(false));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoadingKey(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data,
      provider,
      apiKeys,
      promptProvider,
      projectId,
      refineBeforeGenerate,
      useReferenceImages,
      onAssetGenerated,
    ]
  );

  const generateAllAssets = useCallback(async () => {
    batchAbortRef.current = false;
    for (const asset of ASSET_CATALOG) {
      if (batchAbortRef.current) break;
      if (generatedAssets[asset.key]) continue;
      await generate(asset.key);
    }
  }, [generate, generatedAssets]);

  const generateImmersiveAssets = useCallback(async (): Promise<number> => {
    const providerKey = apiKeys[PROVIDER_KEY_MAP[provider]];
    if (!providerKey) return 0;
    const missing = IMMERSIVE_ESSENTIALS.filter((k) => !generatedAssets[k]);
    if (missing.length === 0) return 0;
    batchAbortRef.current = false;
    let generated = 0;
    for (const key of missing) {
      if (batchAbortRef.current) break;
      await generate(key);
      generated++;
    }
    return generated;
  }, [generate, generatedAssets, apiKeys, provider]);

  const immersiveMissing = IMMERSIVE_ESSENTIALS.filter((k) => !generatedAssets[k]).length;

  const generateCategory = useCallback(
    async (category: string) => {
      batchAbortRef.current = false;
      const assets = ASSET_CATALOG.filter((a) => a.category === category);
      for (const asset of assets) {
        if (batchAbortRef.current) break;
        if (generatedAssets[asset.key]) continue;
        await generate(asset.key);
      }
    },
    [generate, generatedAssets]
  );

  const generateAllApplications = useCallback(async () => {
    batchAbortRef.current = false;
    for (let i = 0; i < data.applications.length; i++) {
      if (batchAbortRef.current) break;
      const variants = detectSizeVariants(data.applications[i].type);
      const firstVariant = variants[0]?.aspectRatio ?? "1:1";
      const appKey = `app_${i}_${firstVariant}`;
      if (generatedAssets[appKey]) continue;
      await generateApplication(
        i,
        firstVariant as AspectRatioOption
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.applications, generateApplication, generatedAssets]);

  function cancelBatch() {
    batchAbortRef.current = true;
  }

  async function saveGeneratedToAssets(
    asset: GeneratedAsset,
    label: string,
    assetKey?: AssetKey
  ) {
    if (!onSaveToAssets) return;
    try {
      let dataUrl = asset.url;
      if (!dataUrl.startsWith("data:")) {
        dataUrl = await fetchImageDataUrl(asset.url);
      }
      onSaveToAssets({
        id: `asset_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: label,
        type: defaultUploadedTypeFromAssetKey(assetKey),
        dataUrl,
        description: asset.prompt,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar em Assets"
      );
    }
  }

  /**
   * Upload a user file as the official asset for a specific AssetKey.
   * Replaces any previously generated image for that key.
   */
  async function uploadForKey(key: AssetKey, file: File) {
    try {
      setLoadingKey(key);
      const dataUrl = await rasterFileToOptimizedDataUrl(file, 2048, "image/webp", 0.9);
      const asset: GeneratedAsset = {
        key,
        url: dataUrl,
        provider: "upload",
        prompt: `Upload oficial: ${file.name}`,
        generatedAt: new Date().toISOString(),
      };
      onAssetGenerated(key, asset);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao processar upload");
    } finally {
      setLoadingKey(null);
    }
  }

  /**
   * Duplicate an existing asset to another AssetKey slot.
   * Copies the image URL so the same image appears in multiple places.
   */
  function duplicateAsset(sourceKey: AssetKey, targetKey: AssetKey) {
    const source = generatedAssets[sourceKey];
    if (!source) return;
    const duplicate: GeneratedAsset = {
      ...source,
      key: targetKey,
      prompt: `Duplicado de ${sourceKey}: ${source.prompt}`,
      generatedAt: new Date().toISOString(),
    };
    onAssetGenerated(targetKey, duplicate);
  }

  async function downloadImage(url: string, name: string) {
    try {
      await downloadImageUrl(url, data.brandName, name);
    } catch {
      window.open(url, "_blank");
    }
  }

  return {
    provider,
    setProvider,
    loadingKey,
    error,
    setError,
    isSyncing,
    refineBeforeGenerate,
    setRefineBeforeGenerate,
    useReferenceImages,
    setUseReferenceImages,
    currentProvider,
    currentProviderHasKey,
    generate,
    generateApplication,
    generateAllAssets,
    generateImmersiveAssets,
    immersiveMissing,
    generateCategory,
    generateAllApplications,
    cancelBatch,
    saveGeneratedToAssets,
    uploadForKey,
    duplicateAsset,
    downloadImage,
    PROVIDER_KEY_MAP,
  };
}
