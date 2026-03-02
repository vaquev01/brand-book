"use client";
import { BrandbookData, UploadedAsset } from "@/lib/types";

interface Props {
  data: BrandbookData;
  num: number;
  uploadedAssets?: UploadedAsset[];
}

export function SectionMascots({ data, num, uploadedAssets = [] }: Props) {
  const mascots = data.keyVisual.mascots ?? [];
  const symbols = data.keyVisual.symbols ?? [];
  const patterns = data.keyVisual.patterns ?? [];

  const uploadedMascots = uploadedAssets.filter((a) => a.type === "mascot");
  const uploadedElements = uploadedAssets.filter((a) => a.type === "element");
  const uploadedPatterns = uploadedAssets.filter((a) => a.type === "pattern");

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">
        {String(num).padStart(2, "0")}. Mascotes, Símbolos &amp; Padrões
      </h2>

      {mascots.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-6">Mascotes &amp; Personagens</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mascots.map((mascot, i) => {
              const uploadedImg = uploadedMascots[i] ?? null;
              return (
                <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                  {uploadedImg ? (
                    <div className="h-52 bg-gray-50 flex items-center justify-center p-4">
                      <img
                        src={uploadedImg.dataUrl}
                        alt={mascot.name}
                        className="max-h-full object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                      <span className="text-5xl mb-2">🐾</span>
                      <span className="text-xs font-medium">Suba uma imagem do mascote na aba Assets</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h4 className="text-xl font-bold mb-1">{mascot.name}</h4>
                    <div className="mb-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição Visual</span>
                      <p className="text-gray-700 text-sm mt-1">{mascot.description}</p>
                    </div>
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg border">
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
        <div className="mb-12">
          <h3 className="text-lg font-bold mb-4">Mascotes Enviados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedMascots.slice(mascots.length).map((asset) => (
              <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
                    <img src={asset.dataUrl} alt={asset.name} className="w-full h-20 object-contain p-2" />
                    <p className="text-[10px] font-medium text-gray-500 text-center pb-1 truncate px-1">{asset.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {patterns.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4">Padrões Gráficos</h3>
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
            {uploadedPatterns.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {uploadedPatterns.map((asset) => (
                  <div key={asset.id} className="bg-gray-50 border rounded-lg overflow-hidden">
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
