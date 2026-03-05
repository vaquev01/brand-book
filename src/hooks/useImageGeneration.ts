"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BrandbookData, ImageProvider, GeneratedAsset, UploadedAsset } from "@/lib/types";
import {
  ASSET_CATALOG,
  buildImagePrompt,
  buildApplicationPrompt,
  detectSizeVariants,
  AssetKey,
  AspectRatioOption,
} from "@/lib/imagePrompts";
import { ApiKeys } from "@/components/ApiKeyConfig";
import { rasterFileToOptimizedDataUrl } from "@/lib/imageDataUrl";

const PROVIDER_KEY_MAP: Record<ImageProvider, keyof ApiKeys> = {
  dalle3: "openai",
  stability: "stability",
  ideogram: "ideogram",
  imagen: "google",
};

export const PROVIDERS: {
  id: ImageProvider;
  name: string;
  desc: string;
  envKey: string;
  color: string;
}[] = [
  {
    id: "dalle3",
    name: "DALL-E 3",
    desc: "OpenAI · Altíssima qualidade, fotorrealista e artístico",
    envKey: "OPENAI_API_KEY",
    color: "bg-green-50 border-green-200 text-green-800",
  },
  {
    id: "stability",
    name: "Stable Diffusion XL",
    desc: "Stability AI · Padrões, texturas e fotografia",
    envKey: "STABILITY_API_KEY",
    color: "bg-purple-50 border-purple-200 text-purple-800",
  },
  {
    id: "ideogram",
    name: "Ideogram V2",
    desc: "Ideogram · Logos com texto legível e design gráfico",
    envKey: "IDEOGRAM_API_KEY",
    color: "bg-orange-50 border-orange-200 text-orange-800",
  },
  {
    id: "imagen",
    name: "Google Image (Nano Banana 2)",
    desc: "Google · Nano Banana 2 (gemini-3.1-flash-image-preview) · Alta qualidade e velocidade",
    envKey: "GOOGLE_API_KEY",
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
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
  const order: ImageProvider[] = ["dalle3", "imagen", "stability", "ideogram"];
  return order.find((p) => !!keys[PROVIDER_KEY_MAP[p]]) ?? "dalle3";
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

async function readJsonResponse<T>(
  res: Response,
  endpointLabel: string
): Promise<T> {
  const raw = await res.text();
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    const trimmed = raw.trim().toLowerCase();
    const looksMarkup = trimmed.startsWith("<") || trimmed.startsWith("<?xml");
    if (looksMarkup) {
      throw new Error(
        `${endpointLabel} retornou XML/HTML em vez de JSON. Verifique a chave da API e o provider selecionado.`
      );
    }
    throw new Error(`${endpointLabel} retornou uma resposta inválida.`);
  }
}

export interface UseImageGenerationProps {
  data: BrandbookData;
  generatedAssets: Record<string, GeneratedAsset>;
  onAssetGenerated: (key: string, asset: GeneratedAsset) => void;
  onSaveToAssets?: (asset: UploadedAsset) => void;
  apiKeys: ApiKeys;
  uploadedAssets: UploadedAsset[];
  textProvider: "openai" | "gemini";
  enabled?: boolean;
}

export function useImageGeneration({
  data,
  generatedAssets,
  onAssetGenerated,
  onSaveToAssets,
  apiKeys,
  uploadedAssets,
  textProvider,
}: UseImageGenerationProps) {
  const [provider, setProvider] = useState<ImageProvider>(() =>
    pickDefaultProvider(apiKeys)
  );
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  const currentProviderHasKey = !!apiKeys[PROVIDER_KEY_MAP[provider]];

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
    async (assetKey: AssetKey, options?: { customInstruction?: string; userReferenceImages?: string[]; storageKey?: string }) => {
      const providerKey = apiKeys[PROVIDER_KEY_MAP[provider]];
      if (!providerKey) {
        const p = PROVIDERS.find((x) => x.id === provider);
        setError(
          `Configure a chave ${p?.envKey ?? "da API"} em ⚙ APIs para usar ${p?.name ?? provider}.`
        );
        return;
      }

      const effectiveKey = options?.storageKey ?? assetKey;
      setLoadingKey(effectiveKey);
      setError(null);
      try {
        const basePromptRaw = buildImagePrompt(assetKey, data, provider);
        const basePrompt = options?.customInstruction
          ? `${basePromptRaw}\n\nADDITIONAL CREATIVE DIRECTION FROM THE USER:\n${options.customInstruction}`
          : basePromptRaw;
        let prompt = basePrompt;

        if (refineBeforeGenerate) {
          const canRefine =
            !isStrictLogoAsset(assetKey) &&
            (provider !== "stability" || prompt.includes(" --neg "));
          const hasTextKey =
            (textProvider === "openai" && !!apiKeys.openai) ||
            (textProvider === "gemini" && !!apiKeys.google);
          if (canRefine && hasTextKey) {
            try {
              const refineRes = await fetch("/api/refine-image-prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  basePrompt,
                  imageProvider: provider,
                  assetKey,
                  textProvider,
                  openaiKey: apiKeys.openai || undefined,
                  googleKey: apiKeys.google || undefined,
                  openaiModel: apiKeys.openaiTextModel || undefined,
                  googleModel: apiKeys.googleTextModel || undefined,
                }),
              });
              const refineJson = await readJsonResponse<{
                prompt?: string;
                error?: string;
              }>(refineRes, "/api/refine-image-prompt");
              if (refineRes.ok && refineJson.prompt) {
                prompt = refineJson.prompt;
              }
            } catch {
              // Prompt refinement is optional; fall back to base prompt.
            }
          }
        }

        const canUseRefImages =
          provider === "imagen" && !!apiKeys.google && useReferenceImages;

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
          if (provider !== "imagen") {
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
            provider,
            assetKey,
            referenceImages,
            openaiKey: apiKeys.openai || undefined,
            stabilityKey: apiKeys.stability || undefined,
            ideogramKey: apiKeys.ideogram || undefined,
            googleKey: apiKeys.google || undefined,
            openaiImageModel: apiKeys.openaiImageModel || undefined,
            stabilityModel: apiKeys.stabilityModel || undefined,
            ideogramModel: apiKeys.ideogramModel || undefined,
            googleImageModel: apiKeys.googleImageModel || undefined,
          }),
        });
        const result = await readJsonResponse<{ url?: string; error?: string }>(
          res,
          "/api/generate-image"
        );
        if (!res.ok) throw new Error(result.error ?? "Erro ao gerar imagem");
        if (!result.url) throw new Error("API não retornou URL de imagem");
        onAssetGenerated(effectiveKey, {
          key: effectiveKey,
          url: result.url,
          provider,
          prompt,
          generatedAt: new Date().toISOString(),
        });
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
      textProvider,
      refineBeforeGenerate,
      useReferenceImages,
      onAssetGenerated,
    ]
  );

  const generateApplication = useCallback(
    async (appIndex: number, aspectRatio: AspectRatioOption, customInstruction?: string, userReferenceImages?: string[]) => {
      const app = data.applications[appIndex];
      const appKey = `app_${appIndex}_${aspectRatio}`;
      setLoadingKey(appKey);
      setError(null);
      try {
        const providerKey = apiKeys[PROVIDER_KEY_MAP[provider]];
        if (!providerKey) {
          const p = PROVIDERS.find((x) => x.id === provider);
          throw new Error(
            `Configure a chave ${p?.envKey ?? "da API"} em ⚙ APIs para usar ${p?.name ?? provider}.`
          );
        }
        const basePrompt = buildApplicationPrompt(
          app,
          data,
          provider,
          aspectRatio,
          customInstruction
        );
        let prompt = basePrompt;
        if (refineBeforeGenerate) {
          const hasTextKey =
            (textProvider === "openai" && !!apiKeys.openai) ||
            (textProvider === "gemini" && !!apiKeys.google);
          if (hasTextKey) {
            try {
              const refineRes = await fetch("/api/refine-image-prompt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  basePrompt,
                  imageProvider: provider,
                  assetKey: "brand_collateral",
                  textProvider,
                  openaiKey: apiKeys.openai || undefined,
                  googleKey: apiKeys.google || undefined,
                  openaiModel: apiKeys.openaiTextModel || undefined,
                  googleModel: apiKeys.googleTextModel || undefined,
                }),
              });
              const refineJson = await readJsonResponse<{
                prompt?: string;
                error?: string;
              }>(refineRes, "/api/refine-image-prompt");
              if (refineRes.ok && refineJson.prompt) prompt = refineJson.prompt;
            } catch {
              // Prompt refinement is optional; fall back to base prompt.
            }
          }
        }
        const canUseRefImages =
          provider === "imagen" && !!apiKeys.google && useReferenceImages;
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
            provider,
            aspectRatio,
            referenceImages,
            openaiKey: apiKeys.openai || undefined,
            stabilityKey: apiKeys.stability || undefined,
            ideogramKey: apiKeys.ideogram || undefined,
            googleKey: apiKeys.google || undefined,
            openaiImageModel: apiKeys.openaiImageModel || undefined,
            stabilityModel: apiKeys.stabilityModel || undefined,
            ideogramModel: apiKeys.ideogramModel || undefined,
            googleImageModel: apiKeys.googleImageModel || undefined,
          }),
        });
        const result = await readJsonResponse<{ url?: string; error?: string }>(
          res,
          "/api/generate-image"
        );
        if (!res.ok) throw new Error(result.error ?? "Erro ao gerar imagem");
        if (!result.url) throw new Error("API não retornou URL de imagem");
        onAssetGenerated(appKey, {
          key: appKey,
          url: result.url,
          provider,
          prompt,
          generatedAt: new Date().toISOString(),
        });
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
      textProvider,
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
        const res = await fetch("/api/image-to-dataurl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: asset.url }),
        });
        const json = await readJsonResponse<{
          dataUrl?: string;
          error?: string;
        }>(res, "/api/image-to-dataurl");
        if (!res.ok || !json.dataUrl)
          throw new Error(json.error ?? "Erro ao baixar imagem");
        dataUrl = json.dataUrl;
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

  async function downloadImage(url: string, name: string) {
    const fileName = `${data.brandName.replace(/\s+/g, "-").toLowerCase()}-${name}.png`;
    try {
      let blobUrl: string;
      if (url.startsWith("data:")) {
        blobUrl = url;
      } else {
        const res = await fetch("/api/image-to-dataurl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const json = await readJsonResponse<{ dataUrl?: string; error?: string }>(
          res,
          "/api/image-to-dataurl"
        );
        if (!res.ok || !json.dataUrl) throw new Error(json.error ?? "Erro ao baixar imagem");
        blobUrl = json.dataUrl;
      }
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
    refineBeforeGenerate,
    setRefineBeforeGenerate,
    useReferenceImages,
    setUseReferenceImages,
    currentProvider,
    currentProviderHasKey,
    generate,
    generateApplication,
    generateAllAssets,
    generateCategory,
    generateAllApplications,
    cancelBatch,
    saveGeneratedToAssets,
    downloadImage,
    PROVIDER_KEY_MAP,
  };
}
