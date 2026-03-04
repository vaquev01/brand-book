"use client";
import { BrandbookData, GeneratedAsset } from "@/lib/types";
import type { AssetKey } from "@/lib/imagePrompts";

interface Props {
  data: BrandbookData;
  num: number;
  generatedImages?: Record<string, string>;
  onGenerate?: (key: AssetKey) => void;
  loadingKey?: string | null;
  generatedAssets?: Record<string, GeneratedAsset>;
}

export function SectionKeyVisual({ data, num, generatedImages = {}, onGenerate, loadingKey, generatedAssets = {} }: Props) {
  const isAdvanced = !!data.keyVisual.iconography;
  const hasFlora = data.keyVisual.flora && data.keyVisual.flora.length > 0;
  const hasFauna = data.keyVisual.fauna && data.keyVisual.fauna.length > 0;
  const hasObjects = data.keyVisual.objects && data.keyVisual.objects.length > 0;
  const hasAssetCategories = hasFlora || hasFauna || hasObjects;

  return (
    <section className="page-break mb-10">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {String(num).padStart(2, "0")}. Key Visual &amp; Linguagem Gráfica
        </h2>
        {onGenerate && (
          <div className="no-print flex gap-2">
            <button
              onClick={() => onGenerate("hero_visual")}
              disabled={loadingKey !== null}
              className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loadingKey === "hero_visual" ? "Gerando..." : generatedAssets["hero_visual"] ? "\u21ba Hero" : "\u2726 Gerar Hero"}
            </button>
            <button
              onClick={() => onGenerate("hero_lifestyle")}
              disabled={loadingKey !== null}
              className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loadingKey === "hero_lifestyle" ? "Gerando..." : generatedAssets["hero_lifestyle"] ? "\u21ba Lifestyle" : "\u2726 Lifestyle"}
            </button>
          </div>
        )}
      </div>

      {/* Generated hero images */}
      {(generatedImages["hero_visual"] || generatedImages["hero_lifestyle"]) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {generatedImages["hero_visual"] && (
            <div className="rounded-xl overflow-hidden border shadow-sm relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedImages["hero_visual"]} alt="Hero Visual" className="w-full aspect-video object-cover" />
              <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Hero · IA</span>
              {loadingKey === "hero_visual" && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
          {generatedImages["hero_lifestyle"] && (
            <div className="rounded-xl overflow-hidden border shadow-sm relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedImages["hero_lifestyle"]} alt="Lifestyle" className="w-full aspect-video object-cover" />
              <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Lifestyle · IA</span>
              {loadingKey === "hero_lifestyle" && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-900/20 border-t-gray-900 rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {data.keyVisual.compositionPhilosophy && (
        <div className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-4 mb-6">
          <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-gray-500">Filosofia de Composição</h3>
          <p className="text-gray-700">{data.keyVisual.compositionPhilosophy}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-base font-bold mb-3">Elementos Gráficos</h3>
          <ul className="space-y-3">
            {data.keyVisual.elements.map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-gray-700">{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-bold mb-2">Estilo Fotográfico</h3>
            <p className="text-gray-600 text-sm">{data.keyVisual.photographyStyle}</p>
          </div>

          {isAdvanced && data.keyVisual.iconography && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">Iconografia</h3>
              <p className="text-gray-600 text-sm">{data.keyVisual.iconography}</p>
            </div>
          )}

          {isAdvanced && data.keyVisual.illustrations && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">Ilustrações</h3>
              <p className="text-gray-600 text-sm">{data.keyVisual.illustrations}</p>
            </div>
          )}

          {isAdvanced && data.keyVisual.marketingArchitecture && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">Arquitetura de Marketing</h3>
              <p className="text-gray-600 text-sm">{data.keyVisual.marketingArchitecture}</p>
            </div>
          )}
        </div>
      </div>

      {hasAssetCategories && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasFlora && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🌿</span> Flora
              </h3>
              <ul className="space-y-2">
                {data.keyVisual.flora!.map((item, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-400 shrink-0 mt-0.5">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasFauna && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🦜</span> Fauna
              </h3>
              <ul className="space-y-2">
                {data.keyVisual.fauna!.map((item, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-400 shrink-0 mt-0.5">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasObjects && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🎸</span> Objetos
              </h3>
              <ul className="space-y-2">
                {data.keyVisual.objects!.map((item, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-400 shrink-0 mt-0.5">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
