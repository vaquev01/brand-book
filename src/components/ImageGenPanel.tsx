"use client";

import { useState } from "react";
import { BrandbookData, ImageProvider, GeneratedAsset } from "@/lib/types";
import { ASSET_CATALOG, buildImagePrompt, AssetKey } from "@/lib/imagePrompts";
import { ApiKeys } from "@/components/ApiKeyConfig";

interface Props {
  data: BrandbookData;
  generatedAssets: Record<string, GeneratedAsset>;
  onAssetGenerated: (key: string, asset: GeneratedAsset) => void;
  apiKeys: ApiKeys;
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
    name: "Imagen 3",
    desc: "Google · Alta fidelidade, fotorrealista e artístico",
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

export function ImageGenPanel({ data, generatedAssets, onAssetGenerated, apiKeys }: Props) {
  const [provider, setProvider] = useState<ImageProvider>("dalle3");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  async function generate(assetKey: AssetKey) {
    setLoadingKey(assetKey);
    setError(null);
    const prompt = buildImagePrompt(assetKey, data, provider);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          provider,
          assetKey,
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
      setError(err instanceof Error ? err.message : "Erro desconhecido");
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

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  const categories = ["logo", "digital", "social", "mockup", "print"] as const;

  return (
    <div className="space-y-8">

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
        <div className={`mt-3 px-4 py-3 rounded-lg border text-xs ${currentProvider.color}`}>
          <strong>Configuração:</strong> Clique em <strong>⚙ APIs</strong> no cabeçalho e insira sua{" "}
          <code className="font-mono">{currentProvider.envKey}</code> para usar este provider.
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-lg leading-none ml-4">
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
                                generated.provider === "dalle3"
                                  ? "bg-green-100 text-green-800"
                                  : generated.provider === "stability"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {generated.provider === "dalle3" ? "DALL-E 3" : generated.provider === "stability" ? "SD XL" : "Ideogram"}
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
                              onClick={() => downloadImage(generated.url, asset.key)}
                              className="bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg font-medium hover:bg-gray-200 transition"
                              title="Download"
                            >
                              ↓
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
            {Object.keys(generatedAssets).length} de {ASSET_CATALOG.length} peças geradas
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(generatedAssets).map((asset) => (
              <div
                key={asset.key}
                className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 text-xs"
              >
                <span className="font-medium">
                  {ASSET_CATALOG.find((a) => a.key === asset.key)?.label ?? asset.key}
                </span>
                <span
                  className={`font-mono text-[10px] px-1 rounded ${
                    asset.provider === "dalle3"
                      ? "bg-green-100 text-green-700"
                      : asset.provider === "stability"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {asset.provider === "dalle3" ? "D3" : asset.provider === "stability" ? "SD" : "IG"}
                </span>
                <button
                  onClick={() => downloadImage(asset.url, asset.key)}
                  className="text-gray-400 hover:text-gray-700 transition font-bold"
                  title="Download"
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
