"use client";

import { useState, useEffect, useRef } from "react";
import { BrandbookData, ImageProvider, GeneratedAsset, UploadedAsset } from "@/lib/types";
import { ASSET_CATALOG, buildImagePrompt, buildApplicationPrompt, detectSizeVariants, AssetKey, AspectRatioOption } from "@/lib/imagePrompts";
import { ApiKeys } from "@/components/ApiKeyConfig";
import { rasterFileToOptimizedDataUrl } from "@/lib/imageDataUrl";

interface Props {
  data: BrandbookData;
  generatedAssets: Record<string, GeneratedAsset>;
  onAssetGenerated: (key: string, asset: GeneratedAsset) => void;
  onSaveToAssets?: (asset: UploadedAsset) => void;
  apiKeys: ApiKeys;
  uploadedAssets?: UploadedAsset[];
  textProvider: "openai" | "gemini";
}

const PROVIDERS: { id: ImageProvider; name: string; desc: string; envKey: string; color: string }[] = [
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

const CATEGORY_LABELS: Record<string, string> = {
  logo: "Logotipo",
  digital: "Digital / Web",
  social: "Redes Sociais",
  mockup: "Mockups",
  print: "Mídia Externa / Print",
};

function aspectClass(ratio: string): string {
  if (ratio === "9:16") return "aspect-[9/16]";
  if (ratio === "16:9") return "aspect-video";
  if (ratio === "4:3") return "aspect-[4/3]";
  if (ratio === "21:9") return "aspect-[21/9]";
  return "aspect-square";
}

const PROVIDER_KEY_MAP: Record<ImageProvider, keyof ApiKeys> = {
  dalle3: "openai",
  stability: "stability",
  ideogram: "ideogram",
  imagen: "google",
};

function defaultUploadedTypeFromAssetKey(assetKey?: AssetKey): UploadedAsset["type"] {
  if (!assetKey) return "reference";
  if (assetKey === "logo_primary" || assetKey === "logo_dark_bg") return "logo";
  if (assetKey === "brand_mascot") return "mascot";
  if (assetKey === "brand_pattern" || assetKey === "presentation_bg") return "pattern";
  return "reference";
}

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

export function ImageGenPanel({ data, generatedAssets, onAssetGenerated, onSaveToAssets, apiKeys, uploadedAssets = [], textProvider }: Props) {
  const [provider, setProvider] = useState<ImageProvider>(() => pickDefaultProvider(apiKeys));
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [refineBeforeGenerate, setRefineBeforeGenerate] = useState(true);
  const [useReferenceImages, setUseReferenceImages] = useState(true);
  const [customBrief, setCustomBrief] = useState("");
  const [customAspectRatio, setCustomAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3" | "21:9">("1:1");
  const [customCreativity, setCustomCreativity] = useState<"consistent" | "balanced" | "creative">("balanced");
  const [customResult, setCustomResult] = useState<GeneratedAsset | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [customPieceDataUrl, setCustomPieceDataUrl] = useState<string>("");
  const [customPieceName, setCustomPieceName] = useState<string>("");
  const [customPieceLoading, setCustomPieceLoading] = useState(false);
  const [customPieceMode, setCustomPieceMode] = useState<"strict" | "guided" | "loose" | "remix">("guided");
  const [activeAppVariant, setActiveAppVariant] = useState<Record<number, string>>({});
  const [expandedAppPrompt, setExpandedAppPrompt] = useState<number | null>(null);

  const PIECE_MODE_ORDER = ["strict", "guided", "loose", "remix"] as const;
  const pieceModeIndex = Math.max(0, PIECE_MODE_ORDER.indexOf(customPieceMode));
  const pieceModeLabel =
    customPieceMode === "strict" ? "Estrito (layout quase idêntico)" :
    customPieceMode === "guided" ? "Guiado (preserva hierarquia)" :
    customPieceMode === "loose" ? "Solto (inspiração, mais livre)" :
    "Remix (reimaginar, bem ousado)";

  function showError(message: string) {
    setError(message);
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  async function handleCustomPieceFile(file: File | null) {
    if (!file) {
      setCustomPieceDataUrl("");
      setCustomPieceName("");
      return;
    }
    setCustomPieceLoading(true);
    try {
      setCustomPieceName(file.name);
      const dataUrl = await rasterFileToOptimizedDataUrl(file, 1400, "image/jpeg", 0.86);
      setCustomPieceDataUrl(dataUrl);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Erro ao carregar peça");
      setCustomPieceDataUrl("");
      setCustomPieceName("");
    } finally {
      setCustomPieceLoading(false);
    }
  }

  useEffect(() => {
    if (!apiKeys[PROVIDER_KEY_MAP[provider]]) {
      const better = pickDefaultProvider(apiKeys);
      if (better !== provider) setProvider(better);
    }
  }, [apiKeys, provider]);

  function pickReferenceImages(max = 6, current?: AssetKey): string[] {
    const logoCandidates = uploadedAssets.filter((a) => a.type === "logo");
    const patternCandidates = uploadedAssets.filter((a) => a.type === "pattern");
    const elementCandidates = uploadedAssets.filter((a) => a.type === "element" || a.type === "mascot" || a.type === "reference");

    const generatedLogo = [generatedAssets.logo_primary, generatedAssets.logo_dark_bg]
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

    return [...generatedLogo, ...uploadedLogo, ...generatedPattern, ...uploadedPatterns, ...generatedMascot, ...uploadedElements]
      .filter(Boolean)
      .slice(0, max);
  }

  function pickLogoReferenceImages(max = 2, current?: AssetKey): string[] {
    const logoCandidates = uploadedAssets.filter((a) => a.type === "logo");
    const uploadedLogo = logoCandidates.map((a) => a.dataUrl);

    const generatedPrimary = generatedAssets.logo_primary && (!current || generatedAssets.logo_primary.key !== current)
      ? [generatedAssets.logo_primary.url]
      : [];

    return [...generatedPrimary, ...uploadedLogo].filter(Boolean).slice(0, max);
  }

  async function generateApplication(appIndex: number, aspectRatio: AspectRatioOption) {
    const app = data.applications[appIndex];
    const appKey = `app_${appIndex}_${aspectRatio}`;
    setLoadingKey(appKey);
    setError(null);
    try {
      const providerKey = apiKeys[PROVIDER_KEY_MAP[provider]];
      if (!providerKey) {
        const p = PROVIDERS.find((x) => x.id === provider);
        throw new Error(`Configure a chave ${p?.envKey ?? "da API"} em ⚙ APIs para usar ${p?.name ?? provider}.`);
      }
      const basePrompt = buildApplicationPrompt(app, data, provider, aspectRatio);
      let prompt = basePrompt;
      if (refineBeforeGenerate) {
        const hasTextKey = (textProvider === "openai" && !!apiKeys.openai) || (textProvider === "gemini" && !!apiKeys.google);
        if (hasTextKey) {
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
          const refineJson = await refineRes.json() as { prompt?: string; error?: string };
          if (refineRes.ok && refineJson.prompt) prompt = refineJson.prompt;
        }
      }
      const canUseRefImages = provider === "imagen" && !!apiKeys.google && useReferenceImages;
      const referenceImagesRaw = canUseRefImages ? pickReferenceImages(6) : undefined;
      const referenceImages = referenceImagesRaw?.length ? referenceImagesRaw : undefined;
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
      const result = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(result.error ?? "Erro ao gerar imagem");
      if (!result.url) throw new Error("API não retornou URL de imagem");
      setActiveAppVariant((prev) => ({ ...prev, [appIndex]: aspectRatio }));
      onAssetGenerated(appKey, {
        key: appKey,
        url: result.url,
        provider,
        prompt,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoadingKey(null);
    }
  }

  async function generate(assetKey: AssetKey) {
    const providerKey = apiKeys[PROVIDER_KEY_MAP[provider]];
    if (!providerKey) {
      const p = PROVIDERS.find((x) => x.id === provider);
      showError(`Configure a chave ${p?.envKey ?? "da API"} em ⚙ APIs para usar ${p?.name ?? provider}.`);
      return;
    }

    setLoadingKey(assetKey);
    setError(null);
    try {
      const basePrompt = buildImagePrompt(assetKey, data, provider);
      let prompt = basePrompt;

      if (refineBeforeGenerate) {
        const canRefine = !isStrictLogoAsset(assetKey) && ((provider !== "stability") || prompt.includes(" --neg "));
        const hasTextKey = (textProvider === "openai" && !!apiKeys.openai) || (textProvider === "gemini" && !!apiKeys.google);
        if (canRefine && hasTextKey) {
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
          const refineJson = await refineRes.json() as { prompt?: string; error?: string };
          if (refineRes.ok && refineJson.prompt) {
            prompt = refineJson.prompt;
          }
        }
      }

      const canUseRefImages =
        provider === "imagen" &&
        !!apiKeys.google &&
        useReferenceImages;

      const referenceImagesRaw = canUseRefImages
        ? (isStrictLogoAsset(assetKey) ? pickLogoReferenceImages(2, assetKey) : pickReferenceImages(6, assetKey))
        : undefined;
      const referenceImages = referenceImagesRaw && referenceImagesRaw.length > 0 ? referenceImagesRaw : undefined;

      if (isStrictLogoAsset(assetKey) && assetKey !== "logo_primary") {
        if (provider !== "imagen") {
          throw new Error("Para garantir consistência do logo, use o provider Google Image e gere primeiro o Logo — Fundo Claro (ou faça upload do logo em Assets).");
        }
        if (useReferenceImages && !referenceImages) {
          throw new Error("Para garantir consistência do logo, gere primeiro o Logo — Fundo Claro (ou faça upload do logo em Assets). Depois gere esta variação.");
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
      const result = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(result.error ?? "Erro ao gerar imagem");
      if (!result.url) throw new Error("API não retornou URL de imagem");
      onAssetGenerated(assetKey, {
        key: assetKey,
        url: result.url,
        provider,
        prompt,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoadingKey(null);
    }
  }

  function downloadImage(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.brandName.replace(/\s+/g, "-").toLowerCase()}-${name}.png`;
    a.target = "_blank";
    a.click();
  }

  async function saveGeneratedToAssets(asset: GeneratedAsset, label: string, assetKey?: AssetKey) {
    if (!onSaveToAssets) return;
    try {
      let dataUrl = asset.url;
      if (!dataUrl.startsWith("data:")) {
        const res = await fetch("/api/image-to-dataurl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: asset.url }),
        });
        const json = await res.json() as { dataUrl?: string; error?: string };
        if (!res.ok || !json.dataUrl) throw new Error(json.error ?? "Erro ao baixar imagem");
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
      showError(err instanceof Error ? err.message : "Erro ao salvar em Assets");
    }
  }

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  const currentProviderHasKey = !!apiKeys[PROVIDER_KEY_MAP[provider]];
  const categories = ["logo", "digital", "social", "mockup", "print"] as const;

  async function generateCustom() {
    const brief = customBrief.trim();
    const effectiveBrief = brief || (customPieceDataUrl ? "Rebrand da peça enviada para o perfil visual da marca." : "");
    if (!effectiveBrief) {
      showError("Escreva uma intenção breve ou envie uma peça para rebrand.");
      return;
    }

    const providerKey = apiKeys[PROVIDER_KEY_MAP[provider]];
    if (!providerKey) {
      const p = PROVIDERS.find((x) => x.id === provider);
      showError(`Configure a chave ${p?.envKey ?? "da API"} em ⚙ APIs para usar ${p?.name ?? provider}.`);
      return;
    }

    setLoadingKey("__custom__");
    setError(null);
    setCustomPrompt("");

    try {
      const composeRes = await fetch("/api/compose-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandbook: data,
          brief: effectiveBrief,
          imageProvider: provider,
          aspectRatio: customAspectRatio,
          creativity: customCreativity,
          referenceImageDataUrl: customPieceDataUrl || undefined,
          referenceImageMode: customPieceDataUrl ? customPieceMode : undefined,
          textProvider,
          openaiKey: apiKeys.openai || undefined,
          googleKey: apiKeys.google || undefined,
          openaiModel: apiKeys.openaiTextModel || undefined,
          googleModel: apiKeys.googleTextModel || undefined,
        }),
      });
      const composeJson = await composeRes.json() as { prompt?: string; error?: string };
      if (!composeRes.ok || !composeJson.prompt) {
        throw new Error(composeJson.error ?? "Erro ao compor prompt");
      }

      const prompt = composeJson.prompt;
      setCustomPrompt(prompt);

      const canUseRefImages =
        provider === "imagen" &&
        !!apiKeys.google &&
        useReferenceImages;

      const includeCustomPieceAsRef = !!customPieceDataUrl && (customPieceMode === "strict" || customPieceMode === "guided");
      const picked = canUseRefImages
        ? pickReferenceImages(includeCustomPieceAsRef ? 5 : 6)
        : undefined;
      const referenceImagesRaw = canUseRefImages
        ? [includeCustomPieceAsRef ? customPieceDataUrl : "", ...(picked ?? [])].filter(Boolean).slice(0, 6)
        : undefined;
      const referenceImages = referenceImagesRaw && referenceImagesRaw.length > 0 ? referenceImagesRaw : undefined;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          provider,
          aspectRatio: customAspectRatio,
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
      const result = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(result.error ?? "Erro ao gerar imagem");
      if (!result.url) throw new Error("API não retornou URL de imagem");

      const key = `custom_${Date.now()}`;
      const asset: GeneratedAsset = {
        key,
        url: result.url,
        provider,
        prompt,
        generatedAt: new Date().toISOString(),
      };
      setCustomResult(asset);
      onAssetGenerated(key, asset);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="space-y-8">

      <div className="bg-gray-50 border rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">Qualidade avançada</h3>
            <p className="text-xs text-gray-500 mt-1">
              Opcional: refinar prompts automaticamente e usar imagens de referência (quando suportado).
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-start gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={refineBeforeGenerate}
              onChange={(e) => setRefineBeforeGenerate(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold">Refinar prompt antes de gerar</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">
                Usa {textProvider === "openai" ? (apiKeys.openaiTextModel || "GPT") : (apiKeys.googleTextModel || "Gemini")} para reformatar o prompt no estilo ideal do provider.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={useReferenceImages}
              onChange={(e) => setUseReferenceImages(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold">Usar imagens de referência (Gemini imagem)</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">
                Envia até 6 assets (logo/padrão/elemento) como âncora de estilo. Quando há referências, o gerador Google usa automaticamente Gemini (que aceita imagens).
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Provider selector */}
      <div>
        <h3 className="text-lg font-bold mb-1">Provider de Geração de Imagem</h3>
        <p className="text-sm text-gray-500 mb-4">
          Configure suas chaves de API clicando em <strong>⚙ APIs</strong> no cabeçalho.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                provider === p.id
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <div className="font-bold text-sm mb-1">{p.name}</div>
              <div className={`text-xs leading-snug ${provider === p.id ? "text-gray-300" : "text-gray-500"}`}>
                {p.desc}
              </div>
              <div
                className={`mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded w-fit ${
                  provider === p.id ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-500"
                }`}
              >
                {p.envKey}
              </div>
            </button>
          ))}
        </div>
        {!currentProviderHasKey ? (
          <div className="mt-3 px-4 py-3 rounded-lg border text-xs bg-red-50 border-red-200 text-red-700">
            ⚠ <strong>{currentProvider.name}</strong> requer a chave{" "}
            <code className="font-mono">{currentProvider.envKey}</code> — configure em{" "}
            <strong>⚙ APIs</strong> no cabeçalho.
          </div>
        ) : (
          <div className={`mt-3 px-4 py-3 rounded-lg border text-xs ${currentProvider.color}`}>
            ✓ <strong>{currentProvider.name}</strong> configurado com{" "}
            <code className="font-mono">{currentProvider.envKey}</code>.
          </div>
        )}

      </div>

      {/* ── Applications Studio ─────────────────────────────────────────────── */}
      {data.applications.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold">Aplicações do Brandbook</h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              {data.applications.length} peças
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Gere mockups das aplicações definidas no brandbook — prompt personalizado por peça, tamanhos inteligentes por tipo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.applications.map((app, i) => {
              const variants = detectSizeVariants(app.type);
              const activeVariant = activeAppVariant[i] ?? variants[0]?.aspectRatio;
              const activeKey = `app_${i}_${activeVariant}`;
              const activeGenerated = generatedAssets[activeKey];
              const isAnyLoading = variants.some((v) => loadingKey === `app_${i}_${v.aspectRatio}`);
              const appPrompt = buildApplicationPrompt(app, data, provider, (activeVariant ?? "1:1") as AspectRatioOption);

              const aspectClass2 = (r: string) => {
                if (r === "9:16") return "aspect-[9/16]";
                if (r === "16:9") return "aspect-video";
                if (r === "4:3") return "aspect-[4/3]";
                if (r === "21:9") return "aspect-[21/9]";
                return "aspect-square";
              };

              return (
                <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Image preview */}
                  <div className={`relative bg-gray-100 ${aspectClass2(activeVariant ?? "1:1")}`}>
                    {activeGenerated ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activeGenerated.url} alt={app.type} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                        <span className="text-4xl font-black select-none opacity-20">{app.type.slice(0, 2).toUpperCase()}</span>
                        <span className="text-[10px] font-mono bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">{activeVariant ?? "1:1"}</span>
                      </div>
                    )}
                    {isAnyLoading && (
                      <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                        <span className="text-xs text-gray-600 font-medium">Gerando com {currentProvider.name}...</span>
                      </div>
                    )}
                    {activeGenerated && !isAnyLoading && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeGenerated.provider === "dalle3" ? "bg-green-100 text-green-800"
                          : activeGenerated.provider === "stability" ? "bg-purple-100 text-purple-800"
                          : activeGenerated.provider === "imagen" ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                        }`}>
                          IA · {activeVariant}
                        </span>
                      </div>
                    )}
                    {/* Variant pills at bottom of image */}
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
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h4 className="font-bold text-base mb-1 leading-tight">{app.type}</h4>
                    <p className="text-sm text-gray-600 mb-3 leading-snug">{app.description}</p>

                    {/* Specs grid */}
                    {(app.dimensions || app.materialSpecs || app.layoutGuidelines || app.typographyHierarchy || app.artDirection) && (
                      <div className="grid grid-cols-1 gap-1 mb-3 text-xs bg-gray-50 rounded-lg p-3 border">
                        {app.dimensions && (
                          <div className="flex gap-1.5"><span className="font-semibold text-gray-500 shrink-0">📐</span><span className="font-mono text-gray-700">{app.dimensions}</span></div>
                        )}
                        {app.materialSpecs && (
                          <div className="flex gap-1.5"><span className="font-semibold text-gray-500 shrink-0">📄</span><span className="text-gray-700">{app.materialSpecs}</span></div>
                        )}
                        {app.layoutGuidelines && (
                          <div className="flex gap-1.5"><span className="font-semibold text-gray-500 shrink-0">🎨</span><span className="text-gray-700">{app.layoutGuidelines}</span></div>
                        )}
                        {app.typographyHierarchy && (
                          <div className="flex gap-1.5"><span className="font-semibold text-gray-500 shrink-0">Aa</span><span className="text-gray-700">{app.typographyHierarchy}</span></div>
                        )}
                        {app.artDirection && (
                          <div className="flex gap-1.5"><span className="font-semibold text-gray-500 shrink-0">✦</span><span className="text-gray-700">{app.artDirection}</span></div>
                        )}
                        {app.substrates && app.substrates.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {app.substrates.map((s, j) => (
                              <span key={j} className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prompt toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedAppPrompt(expandedAppPrompt === i ? null : i)}
                      className="text-[10px] text-blue-500 hover:text-blue-700 mb-3 flex items-center gap-1"
                    >
                      {expandedAppPrompt === i ? "▲" : "▼"} Ver prompt de geração
                    </button>
                    {expandedAppPrompt === i && (
                      <div className="bg-gray-900 text-gray-200 rounded-lg p-3 text-[10px] mb-3 leading-relaxed font-mono max-h-32 overflow-y-auto">
                        {appPrompt}
                      </div>
                    )}

                    {/* Size variant generate buttons */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {variants.map((v) => {
                        const vKey = `app_${i}_${v.aspectRatio}`;
                        const hasGen = !!generatedAssets[vKey];
                        const isLoadingThis = loadingKey === vKey;
                        return (
                          <button
                            key={v.aspectRatio}
                            type="button"
                            onClick={() => generateApplication(i, v.aspectRatio)}
                            disabled={loadingKey !== null}
                            className={`flex flex-col items-start px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              hasGen
                                ? "border-green-500 bg-green-50 text-green-800 hover:bg-green-100"
                                : "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                          >
                            <span>{isLoadingThis ? "Gerando..." : hasGen ? "↺ " + v.label : "✦ " + v.label}</span>
                            {v.dims && <span className={`text-[10px] font-mono mt-0.5 ${hasGen ? "text-green-600" : "text-gray-300"}`}>{v.dims}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions for generated image */}
                    {activeGenerated && (
                      <div className="flex gap-2 pt-2 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = activeGenerated.url;
                            a.download = `${data.brandName.replace(/\s+/g, "-").toLowerCase()}-${app.type.replace(/\s+/g, "-").toLowerCase()}-${activeVariant}.png`;
                            a.target = "_blank";
                            a.click();
                          }}
                          className="bg-gray-100 text-gray-700 text-xs py-1.5 px-3 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                          ↓ Download
                        </button>
                        {!!onSaveToAssets && (
                          <button
                            type="button"
                            onClick={() => saveGeneratedToAssets(activeGenerated, `${app.type} ${activeVariant}`, undefined)}
                            className="bg-gray-100 text-gray-700 text-xs py-1.5 px-3 rounded-lg font-medium hover:bg-gray-200 transition"
                          >
                            Salvar em Assets
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom generator */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">Custom (com alma)</h3>
            <p className="text-xs text-gray-500 mt-1">
              Escreva uma intenção breve. A IA monta o prompt final usando o brandbook e gera a imagem.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <textarea
              rows={3}
              value={customBrief}
              onChange={(e) => setCustomBrief(e.target.value)}
              placeholder='Ex: "Kit de embalagens premium para delivery, com padrão sutil e selo adesivo"'
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition resize-none"
            />
            <div className="mt-2 text-[10px] text-gray-400">
              Dica: você pode citar &quot;embalagem&quot;, &quot;uniforme&quot;, &quot;menu&quot;, &quot;sacola&quot;, &quot;adesivo&quot;, &quot;tote bag&quot;, &quot;moodboard de materiais&quot; etc.
            </div>

            <div className="mt-3 border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rebrand de peça (opcional)</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Envie uma imagem e a IA interpreta a peça para gerar um prompt rebrandado no estilo do brandbook.
                  </div>
                </div>
                <label className="text-xs bg-white border px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                  {customPieceLoading ? "Carregando..." : "Enviar peça"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={customPieceLoading || loadingKey !== null}
                    onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                    onChange={(e) => handleCustomPieceFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {customPieceDataUrl && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative bg-white border rounded-lg overflow-hidden aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customPieceDataUrl} alt={customPieceName || "Peça"} className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700">Peça enviada</div>
                    <div className="text-[10px] text-gray-500 break-all">{customPieceName || "(sem nome)"}</div>

                    <div>
                      <label htmlFor="customPieceMode" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fidelidade à peça</label>
                      <div className="mt-1 bg-white border rounded-lg px-3 py-2">
                        <input
                          id="customPieceMode"
                          type="range"
                          min={0}
                          max={3}
                          step={1}
                          value={pieceModeIndex}
                          onChange={(e) => {
                            const idx = Number(e.target.value);
                            setCustomPieceMode(PIECE_MODE_ORDER[Math.min(3, Math.max(0, idx))]);
                          }}
                          className="w-full"
                          aria-label="Fidelidade à peça"
                        />
                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                          <span className="font-semibold">Preservar layout</span>
                          <span className="font-semibold">Reimaginar</span>
                        </div>
                        <div className="mt-2 text-xs font-semibold text-gray-700">{pieceModeLabel}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setCustomPieceDataUrl(""); setCustomPieceName(""); }}
                      disabled={customPieceLoading || loadingKey !== null}
                      className="text-xs bg-white border px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Remover peça
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="customAspectRatio" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aspect ratio</label>
            <select
              id="customAspectRatio"
              value={customAspectRatio}
              onChange={(e) => setCustomAspectRatio(e.target.value as typeof customAspectRatio)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition"
            >
              <option value="1:1">1:1 (Quadrado)</option>
              <option value="4:3">4:3 (Produto/Mockup)</option>
              <option value="16:9">16:9 (Paisagem)</option>
              <option value="9:16">9:16 (Vertical)</option>
              <option value="21:9">21:9 (Banner)</option>
            </select>

            <label htmlFor="customCreativity" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Criatividade do prompt</label>
            <select
              id="customCreativity"
              value={customCreativity}
              onChange={(e) => setCustomCreativity(e.target.value as typeof customCreativity)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition"
            >
              <option value="consistent">Consistente (mais fiel)</option>
              <option value="balanced">Equilibrado</option>
              <option value="creative">Criativo (mais ousado)</option>
            </select>

            <button
              type="button"
              onClick={generateCustom}
              disabled={loadingKey !== null}
              className="w-full bg-gray-900 text-white text-sm py-2.5 px-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loadingKey === "__custom__" ? "Gerando..." : "✦ Gerar custom"}
            </button>
          </div>
        </div>

        {customPrompt && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setExpandedPrompt(expandedPrompt === "__custom__" ? null : "__custom__")}
              className="text-[10px] text-blue-500 hover:text-blue-700 mb-2 flex items-center gap-1"
            >
              {expandedPrompt === "__custom__" ? "▲" : "▼"} Ver prompt gerado
            </button>
            {expandedPrompt === "__custom__" && (
              <div className="bg-gray-900 text-gray-200 rounded-lg p-3 text-[10px] mb-3 leading-relaxed font-mono max-h-40 overflow-y-auto">
                {customPrompt}
              </div>
            )}
          </div>
        )}

        {customResult && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`relative bg-gray-100 ${aspectClass(customAspectRatio)}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customResult.url}
                alt="Custom result"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-700">Resultado custom</div>
                <div className="text-[10px] text-gray-400">Salvo no cache local deste brandbook</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadImage(customResult.url, customResult.key)}
                  className="bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  ↓ Download
                </button>
                {!!onSaveToAssets && (
                  <button
                    type="button"
                    onClick={() => saveGeneratedToAssets(customResult, "Custom", undefined)}
                    className="bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg font-medium hover:bg-gray-200 transition"
                    title="Salvar em Assets"
                    aria-label="Salvar em Assets"
                  >
                    Salvar em Assets
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div ref={errorRef} className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-bold text-lg leading-none ml-4"
            aria-label="Fechar erro"
            title="Fechar"
          >
            &times;
          </button>
        </div>
      )}

      {/* Assets grouped by category */}
      <div>
        <h3 className="text-lg font-bold mb-1">
          Peças de Marca — <span className="text-gray-400 font-normal">{data.brandName}</span>
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {ASSET_CATALOG.length} peças · aspect ratio automático por peça e provider · prompts com engenharia profissional
        </p>

        {categories.map((category) => {
          const assets = ASSET_CATALOG.filter((a) => a.category === category);
          if (assets.length === 0) return null;
          return (
            <div key={category} className="mb-10">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">
                {CATEGORY_LABELS[category]}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => {
                  const generated = generatedAssets[asset.key];
                  const isLoading = loadingKey === asset.key;
                  const prompt = buildImagePrompt(asset.key, data, provider);
                  const canSaveToAssets = !!onSaveToAssets && !!generated;
                  return (
                    <div key={asset.key} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className={`relative bg-gray-100 ${aspectClass(asset.aspectRatio)}`}>
                        {generated ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={generated.url}
                            alt={asset.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <span className="text-3xl mb-2">✦</span>
                            <span className="text-[10px] font-mono bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                              {asset.aspectRatio}
                            </span>
                          </div>
                        )}
                        {isLoading && (
                          <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                            <span className="text-xs text-gray-600 font-medium">Gerando com {currentProvider.name}...</span>
                          </div>
                        )}
                        {generated && !isLoading && (
                          <div className="absolute top-2 right-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                generated.provider === "dalle3" ? "bg-green-100 text-green-800"
                                : generated.provider === "stability" ? "bg-purple-100 text-purple-800"
                                : generated.provider === "imagen" ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {generated.provider === "dalle3" ? "DALL-E 3"
                                : generated.provider === "stability" ? "SD XL"
                                : generated.provider === "imagen" ? "Imagen"
                                : "Ideogram"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <div className="font-semibold text-sm mb-0.5">{asset.label}</div>
                        <div className="text-xs text-gray-400 mb-3">{asset.description}</div>

                        <button
                          onClick={() => setExpandedPrompt(expandedPrompt === asset.key ? null : asset.key)}
                          className="text-[10px] text-blue-500 hover:text-blue-700 mb-2 flex items-center gap-1"
                        >
                          {expandedPrompt === asset.key ? "▲" : "▼"} Ver prompt profissional
                        </button>

                        {expandedPrompt === asset.key && (
                          <div className="bg-gray-900 text-gray-200 rounded-lg p-3 text-[10px] mb-3 leading-relaxed font-mono max-h-32 overflow-y-auto">
                            {prompt}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => generate(asset.key)}
                            disabled={loadingKey !== null}
                            className="flex-1 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            {isLoading ? "Gerando..." : generated ? "↺ Regerar" : "✦ Gerar"}
                          </button>
                          {generated && (
                            <button
                              type="button"
                              onClick={() => downloadImage(generated.url, asset.key)}
                              className="bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg font-medium hover:bg-gray-200 transition"
                              title="Download"
                              aria-label="Download"
                            >
                              ↓
                            </button>
                          )}
                          {canSaveToAssets && (
                            <button
                              type="button"
                              onClick={() => saveGeneratedToAssets(generated!, asset.label, asset.key)}
                              className="bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg font-medium hover:bg-gray-200 transition"
                              title="Salvar em Assets"
                              aria-label="Salvar em Assets"
                            >
                              Salvar em Assets
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary of generated assets */}
      {Object.keys(generatedAssets).length > 0 && (
        <div className="bg-gray-50 border rounded-xl p-5">
          <h4 className="font-bold mb-3 text-sm">
            {Object.keys(generatedAssets).length} imagens geradas
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(generatedAssets).map((asset) => (
              <div
                key={asset.key}
                className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 text-xs"
              >
                <span className="font-medium">
                  {asset.key.startsWith("custom_")
                    ? "Custom"
                    : (ASSET_CATALOG.find((a) => a.key === asset.key)?.label ?? asset.key)}
                </span>
                <span
                  className={`font-mono text-[10px] px-1 rounded ${
                    asset.provider === "dalle3" ? "bg-green-100 text-green-700"
                      : asset.provider === "stability" ? "bg-purple-100 text-purple-700"
                      : asset.provider === "imagen" ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {asset.provider === "dalle3" ? "D3"
                    : asset.provider === "stability" ? "SD"
                    : asset.provider === "imagen" ? "IMG"
                    : "IG"}
                </span>
                <button
                  type="button"
                  onClick={() => downloadImage(asset.url, asset.key)}
                  className="text-gray-400 hover:text-gray-700 transition font-bold"
                  title="Download"
                  aria-label="Download"
                >
                  ↓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
