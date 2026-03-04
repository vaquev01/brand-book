"use client";
import { BrandbookData, UploadedAsset } from "@/lib/types";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  uploadedAssets?: UploadedAsset[];
  onGoToImages?: () => void;
}

function LogoCard({
  title,
  image,
  placeholderText,
  bgClass,
  onGoToImages,
}: {
  title: string;
  image: string | null;
  placeholderText: string;
  bgClass: string;
  onGoToImages?: () => void;
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-gray-50 border-b">
        <h3 className="font-bold">{title}</h3>
      </div>
      {image ? (
        <div className={`${bgClass} p-8 flex items-center justify-center h-64`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="max-h-full object-contain rounded" />
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 gap-3">
          <span className="text-4xl">✦</span>
          <span className="text-xs font-medium text-center px-4">{placeholderText}</span>
          {onGoToImages && (
            <button
              onClick={onGoToImages}
              className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-all"
            >
              Gerar na aba Gerar Imagens
            </button>
          )}
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

export function SectionLogo({ data, num, generatedImages = {}, uploadedAssets = [], onGoToImages }: Props) {
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
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">
        {String(num).padStart(2, "0")}. Logo &amp; Identidade Visual
      </h2>

      {/* Main logo images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <LogoCard
          title="Logo Principal — Fundo Claro"
          image={logoPrimary}
          placeholderText="Gere o logo principal para visualizar aqui"
          bgClass="bg-white border-t"
          onGoToImages={onGoToImages}
        />
        <LogoCard
          title="Logo — Versão Invertida"
          image={logoDarkBg}
          placeholderText="Gere a versão invertida (fundo escuro)"
          bgClass="bg-gray-900"
          onGoToImages={onGoToImages}
        />
      </div>

      {/* Logo description cards */}
      {(secondaryText || symbolText) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-4">Variações de Logo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded border">
          <h3 className="font-bold mb-2">Clear Space</h3>
          <p className="text-gray-600 text-sm">{data.logo.clearSpace}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded border">
          <h3 className="font-bold mb-2">Tamanho Mínimo</h3>
          <p className="text-gray-600 text-sm">{data.logo.minimumSize}</p>
        </div>
        {data.logo.favicon && (
          <div className="bg-gray-50 p-6 rounded border">
            <h3 className="font-bold mb-2">Favicon / App Icon</h3>
            <p className="text-gray-600 text-sm">{data.logo.favicon}</p>
          </div>
        )}
      </div>

      {/* Incorrect usages */}
      <div className="bg-red-50 border border-red-100 p-6 rounded-lg">
        <h3 className="font-bold text-red-800 mb-4">Usos Incorretos</h3>
        <ul className="list-disc pl-5 text-red-700 space-y-1">
          {data.logo.incorrectUsages.map((u, i) => <li key={i}>{u}</li>)}
        </ul>
      </div>
    </section>
  );
}
