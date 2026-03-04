"use client";
import { BrandbookData, UploadedAsset, GeneratedAsset } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";

interface Props {
  data: BrandbookData;
  num: number;
  uploadedAssets?: UploadedAsset[];
  generatedImages?: Record<string, string>;
  onGenerate?: (key: AssetKey) => void;
  loadingKey?: string | null;
  generatedAssets?: Record<string, GeneratedAsset>;
}

export function SectionMascots({ data, num, uploadedAssets = [], generatedImages = {}, onGenerate, loadingKey, generatedAssets = {} }: Props) {
  const mascots = data.keyVisual.mascots ?? [];
  const symbols = data.keyVisual.symbols ?? [];
  const patterns = data.keyVisual.patterns ?? [];
  const structuredPatterns = data.keyVisual.structuredPatterns ?? [];

  const uploadedMascots = uploadedAssets.filter((a) => a.type === "mascot");
  const uploadedElements = uploadedAssets.filter((a) => a.type === "element");
  const uploadedPatterns = uploadedAssets.filter((a) => a.type === "pattern");

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Mascotes, Símbolos &amp; Padrões
      </h2>

      {mascots.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Mascotes &amp; Personagens</h3>
            {onGenerate && (
              <button
                onClick={() => onGenerate("brand_mascot")}
                disabled={loadingKey !== null}
                className="no-print text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loadingKey === "brand_mascot" ? "Gerando..." : generatedAssets["brand_mascot"] ? "\u21ba Regerar Mascote" : "\u2726 Gerar Mascote"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mascots.map((mascot, i) => {
              const uploadedImg = uploadedMascots[i] ?? null;
              const genMascot = generatedImages["brand_mascot"];
              const mascotImage = uploadedImg?.dataUrl ?? (i === 0 ? genMascot : null) ?? null;
              return (
                <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  {mascotImage ? (
                    <div className="h-40 bg-gray-50 flex items-center justify-center p-4 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mascotImage}
                        alt={mascot.name}
                        className="max-h-full object-contain rounded"
                      />
                      {i === 0 && genMascot && !uploadedImg && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
                      )}
                      {loadingKey === "brand_mascot" && i === 0 && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 relative">
                      {loadingKey === "brand_mascot" && i === 0 ? (
                        <>
                          <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                          <span className="text-xs font-medium mt-2">Gerando...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-5xl mb-2">🐾</span>
                          <span className="text-xs font-medium">Suba uma imagem ou gere com IA</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-lg font-bold mb-1">{mascot.name}</h4>
                    <div className="mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição Visual</span>
                      <p className="text-gray-700 text-sm mt-1">{mascot.description}</p>
                    </div>
                    <div className="mb-3 bg-gray-50 p-3 rounded-lg border">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personalidade</span>
                      <p className="text-gray-700 text-sm mt-1">{mascot.personality}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diretrizes de Uso</span>
                      <ul className="mt-2 space-y-1">
                        {mascot.usageGuidelines.map((g, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-gray-400 shrink-0">→</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uploadedMascots.length > mascots.length && (
        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">Mascotes Enviados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedMascots.slice(mascots.length).map((asset) => (
              <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-36 object-contain p-3" />
                <div className="px-3 pb-3">
                  <p className="text-xs font-semibold text-gray-700 truncate">{asset.name}</p>
                  {asset.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{asset.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {symbols.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Símbolos Identitários</h3>
            <ul className="space-y-3">
              {symbols.map((sym, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-gray-900 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ◆
                  </span>
                  <span className="text-gray-700 text-sm">{sym}</span>
                </li>
              ))}
            </ul>
            {uploadedElements.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {uploadedElements.map((asset) => (
                  <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-20 object-contain p-2" />
                    <p className="text-[10px] font-medium text-gray-500 text-center pb-1 truncate px-1">{asset.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(patterns.length > 0 || (structuredPatterns && structuredPatterns.length > 0)) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Padrões Gráficos</h3>
              {onGenerate && (
                <button
                  onClick={() => onGenerate("brand_pattern")}
                  disabled={loadingKey !== null}
                  className="no-print text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {loadingKey === "brand_pattern" ? "Gerando..." : generatedAssets["brand_pattern"] ? "\u21ba Regerar Padr\u00e3o" : "\u2726 Gerar Padr\u00e3o"}
                </button>
              )}
            </div>
            {/* Generated pattern preview */}
            {generatedImages["brand_pattern"] && (
              <div className="mb-4 rounded-xl overflow-hidden border shadow-sm relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={generatedImages["brand_pattern"]} alt="Padr\u00e3o gerado" className="w-full h-32 object-cover" />
                <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">IA</span>
                {loadingKey === "brand_pattern" && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
            {structuredPatterns && structuredPatterns.length > 0 ? (
              <div className="space-y-4">
                {structuredPatterns.map((pat, i) => (
                  <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        ▦
                      </span>
                      <h4 className="font-bold text-gray-900">{pat.name}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{pat.description}</p>
                    <div className="space-y-2 text-xs">
                      <div><span className="font-semibold text-gray-700">Composição:</span> <span className="text-gray-600">{pat.composition}</span></div>
                      <div><span className="font-semibold text-gray-700">Uso:</span> <span className="text-gray-600">{pat.usage}</span></div>
                      {pat.density && <div><span className="font-semibold text-gray-700">Densidade:</span> <span className="text-gray-600">{pat.density}</span></div>}
                      {pat.background && <div><span className="font-semibold text-gray-700">Fundo:</span> <span className="text-gray-600">{pat.background}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {patterns.map((pat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ▦
                    </span>
                    <span className="text-gray-700 text-sm">{pat}</span>
                  </li>
                ))}
              </ul>
            )}
            {uploadedPatterns.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {uploadedPatterns.map((asset) => (
                  <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-20 object-cover rounded" />
                    <p className="text-[10px] font-medium text-gray-500 text-center pb-1 truncate px-1">{asset.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
