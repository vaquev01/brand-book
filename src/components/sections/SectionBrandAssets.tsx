"use client";
import { UploadedAsset } from "@/lib/types";

interface Props {
  num: number;
  uploadedAssets: UploadedAsset[];
}

const TYPE_META: Record<
  UploadedAsset["type"],
  { label: string; icon: string; description: string }
> = {
  logo:      { label: "Logo",        icon: "🖼️", description: "Versões do logo da marca" },
  mascot:    { label: "Mascote",     icon: "🐾", description: "Personagens e mascotes" },
  element:   { label: "Elemento",    icon: "✦",  description: "Ícones, símbolos e grafismos" },
  pattern:   { label: "Padrão",      icon: "▦",  description: "Texturas e padrões repetíveis" },
  reference: { label: "Referência",  icon: "📌", description: "Moodboards e referências" },
  other:     { label: "Outro",       icon: "📁", description: "Outros arquivos de marca" },
};

const TYPE_ORDER: UploadedAsset["type"][] = [
  "logo", "mascot", "element", "pattern", "reference", "other",
];

export function SectionBrandAssets({ num, uploadedAssets }: Props) {
  const groups = TYPE_ORDER
    .map((type) => ({
      type,
      meta: TYPE_META[type],
      assets: uploadedAssets.filter((a) => a.type === type),
    }))
    .filter((g) => g.assets.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-2 border-b pb-4">
        {String(num).padStart(2, "0")}. Ativos de Marca
      </h2>
      <p className="text-sm text-gray-500 mb-10">
        Arquivos de identidade enviados — logos, mascotes, elementos, padrões e referências.
      </p>

      <div className="space-y-12">
        {groups.map(({ type, meta, assets }) => (
          <div key={type}>
            <div className="flex items-center gap-3 mb-5 border-b pb-3">
              <span className="text-xl">{meta.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{meta.label}</h3>
                <p className="text-xs text-gray-400">{meta.description}</p>
              </div>
              <span className="ml-auto text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {assets.length} {assets.length === 1 ? "arquivo" : "arquivos"}
              </span>
            </div>

            <div
              className={`grid gap-4 ${
                type === "logo"
                  ? "grid-cols-2 md:grid-cols-3"
                  : type === "pattern"
                  ? "grid-cols-2 md:grid-cols-4"
                  : type === "reference"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`bg-white border rounded-xl overflow-hidden shadow-sm ${
                    type === "reference" ? "flex gap-4 p-4 items-start" : ""
                  }`}
                >
                  {type === "reference" ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.dataUrl}
                        alt={asset.name}
                        className="w-28 h-28 object-cover rounded-lg shrink-0 border"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm mb-1 truncate">{asset.name}</p>
                        {asset.description && (
                          <p className="text-xs text-gray-500 leading-relaxed">{asset.description}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`flex items-center justify-center bg-gray-50 border-b ${
                          type === "logo" ? "h-44 p-6"
                          : type === "pattern" ? "h-32 p-2"
                          : "h-36 p-4"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.dataUrl}
                          alt={asset.name}
                          className={`max-h-full max-w-full object-contain ${
                            type === "pattern" ? "object-cover w-full h-full rounded" : ""
                          }`}
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 text-xs truncate">{asset.name}</p>
                        {asset.description && (
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{asset.description}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
