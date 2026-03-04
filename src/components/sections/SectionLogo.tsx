"use client";
import { BrandbookData, UploadedAsset, GeneratedAsset } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  uploadedAssets?: UploadedAsset[];
  onGenerate?: (key: AssetKey) => void;
  loadingKey?: string | null;
  onDownload?: (url: string, name: string) => void;
  onSaveToAssets?: (asset: GeneratedAsset, label: string, key?: AssetKey) => void;
  generatedAssets?: Record<string, GeneratedAsset>;
}

function LogoCard({
  title,
  image,
  placeholderText,
  bgClass,
  assetKey,
  onGenerate,
  isLoading,
  generated,
  onDownload,
  onSaveToAssets,
}: {
  title: string;
  image: string | null;
  placeholderText: string;
  bgClass: string;
  assetKey?: AssetKey;
  onGenerate?: (key: AssetKey) => void;
  isLoading?: boolean;
  generated?: GeneratedAsset | null;
  onDownload?: (url: string, name: string) => void;
  onSaveToAssets?: (asset: GeneratedAsset, label: string, key?: AssetKey) => void;
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-gray-50 border-b flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        {generated && onDownload && assetKey && (
          <div className="no-print flex gap-1">
            <button
              onClick={() => onDownload(generated.url, assetKey)}
              className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
            >
              ↓
            </button>
            {onSaveToAssets && (
              <button
                onClick={() => onSaveToAssets(generated, title, assetKey)}
                className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
              >
                Salvar
              </button>
            )}
          </div>
        )}
      </div>
      {image ? (
        <div className={`${bgClass} p-5 flex items-center justify-center h-44 relative`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="max-h-full object-contain rounded" />
          {generated && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 relative">
          {isLoading ? (
            <>
              <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-xs font-medium">Gerando...</span>
            </>
          ) : (
            <>
              <span className="text-4xl">✦</span>
              <span className="text-xs font-medium text-center px-4">{placeholderText}</span>
              {onGenerate && assetKey && (
                <button
                  onClick={() => onGenerate(assetKey)}
                  className="no-print mt-1 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg transition-all"
                >
                  ✦ Gerar com IA
                </button>
              )}
            </>
          )}
        </div>
      )}
      {image && onGenerate && assetKey && !isLoading && (
        <div className="no-print px-5 py-2 border-t bg-gray-50 flex justify-end">
          <button
            onClick={() => onGenerate(assetKey)}
            className="text-[10px] font-semibold text-gray-500 hover:text-gray-900 transition"
          >
            ↺ Regerar
          </button>
        </div>
      )}
    </div>
  );
}

function isUrl(s: string): boolean {
  return /^https?:\/\//.test(s) || s.startsWith("data:");
}

function textOrNull(s: string | undefined): string | null {
  if (!s) return null;
  if (isUrl(s)) return null;
  return s;
}

export function SectionLogo({ data, num, generatedImages = {}, uploadedAssets = [], onGenerate, loadingKey, onDownload, onSaveToAssets, generatedAssets = {} }: Props) {
  const uploadedLogos = uploadedAssets.filter((a) => a.type === "logo");

  const logoPrimary = generatedImages["logo_primary"] || uploadedLogos[0]?.dataUrl || null;
  const logoDarkBg = generatedImages["logo_dark_bg"] || uploadedLogos[1]?.dataUrl || null;

  const secondaryText = textOrNull(data.logo.secondary);
  const symbolText = textOrNull(data.logo.symbol);

  const variants = data.logoVariants;
  const variantEntries: { label: string; key: string; desc?: string }[] = [];
  if (variants?.horizontal && !isUrl(variants.horizontal)) variantEntries.push({ label: "Horizontal", key: "horizontal", desc: variants.horizontal });
  if (variants?.stacked && !isUrl(variants.stacked)) variantEntries.push({ label: "Stacked (Vertical)", key: "stacked", desc: variants.stacked });
  if (variants?.mono && !isUrl(variants.mono)) variantEntries.push({ label: "Monocromático", key: "mono", desc: variants.mono });
  if (variants?.negative && !isUrl(variants.negative)) variantEntries.push({ label: "Negativo", key: "negative", desc: variants.negative });
  if (variants?.markOnly && !isUrl(variants.markOnly)) variantEntries.push({ label: "Símbolo (Mark Only)", key: "markOnly", desc: variants.markOnly });
  if (variants?.wordmarkOnly && !isUrl(variants.wordmarkOnly)) variantEntries.push({ label: "Wordmark Only", key: "wordmarkOnly", desc: variants.wordmarkOnly });

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Logo &amp; Identidade Visual
      </h2>

      {/* Main logo images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <LogoCard
          title="Logo Principal — Fundo Claro"
          image={logoPrimary}
          placeholderText="Gere o logo principal para visualizar aqui"
          bgClass="bg-white border-t"
          assetKey="logo_primary"
          onGenerate={onGenerate}
          isLoading={loadingKey === "logo_primary"}
          generated={generatedAssets["logo_primary"] ?? null}
          onDownload={onDownload}
          onSaveToAssets={onSaveToAssets}
        />
        <LogoCard
          title="Logo — Versão Invertida"
          image={logoDarkBg}
          placeholderText="Gere a versão invertida (fundo escuro)"
          bgClass="bg-gray-900"
          assetKey="logo_dark_bg"
          onGenerate={onGenerate}
          isLoading={loadingKey === "logo_dark_bg"}
          generated={generatedAssets["logo_dark_bg"] ?? null}
          onDownload={onDownload}
          onSaveToAssets={onSaveToAssets}
        />
      </div>

      {/* Logo description cards */}
      {(secondaryText || symbolText) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {secondaryText && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <h4 className="font-bold text-gray-900">Logo Secundário</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{secondaryText}</p>
            </div>
          )}
          {symbolText && (
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">◆</span>
                <h4 className="font-bold text-gray-900">Símbolo / Ícone</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{symbolText}</p>
            </div>
          )}
        </div>
      )}

      {/* Logo variants */}
      {variantEntries.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">Variações de Logo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {variantEntries.map((v) => (
              <div key={v.key} className="bg-white border rounded-xl p-4 shadow-sm">
                <h4 className="font-bold text-sm text-gray-900 mb-2">{v.label}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-bold mb-1">Clear Space</h3>
          <p className="text-gray-600 text-sm">{data.logo.clearSpace}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="font-bold mb-1">Tamanho Mínimo</h3>
          <p className="text-gray-600 text-sm">{data.logo.minimumSize}</p>
        </div>
        {data.logo.favicon && (
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-bold mb-1">Favicon / App Icon</h3>
            <p className="text-gray-600 text-sm">{data.logo.favicon}</p>
          </div>
        )}
      </div>

      {/* Incorrect usages */}
      <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
        <h3 className="font-bold text-red-800 mb-4">Usos Incorretos</h3>
        <ul className="list-disc pl-5 text-red-700 space-y-1">
          {data.logo.incorrectUsages.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </div>
    </section>
  );
}
