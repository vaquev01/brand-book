"use client";
import { BrandbookData } from "@/lib/types";

export function SectionKeyVisual({ data, num }: { data: BrandbookData; num: number }) {
  const isAdvanced = !!data.keyVisual.iconography;
  const hasFlora = data.keyVisual.flora && data.keyVisual.flora.length > 0;
  const hasFauna = data.keyVisual.fauna && data.keyVisual.fauna.length > 0;
  const hasObjects = data.keyVisual.objects && data.keyVisual.objects.length > 0;
  const hasAssetCategories = hasFlora || hasFauna || hasObjects;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Key Visual &amp; Linguagem Gráfica</h2>

      {data.keyVisual.compositionPhilosophy && (
        <div className="bg-gradient-to-r from-gray-50 to-white border rounded-xl p-6 mb-10">
          <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-gray-500">Filosofia de Composição</h3>
          <p className="text-gray-700">{data.keyVisual.compositionPhilosophy}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-lg font-bold mb-4">Elementos Gráficos</h3>
          <ul className="space-y-3">
            {data.keyVisual.elements.map((e, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-gray-700">{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="font-bold mb-2">Estilo Fotográfico</h3>
            <p className="text-gray-600 text-sm">{data.keyVisual.photographyStyle}</p>
          </div>

          {isAdvanced && data.keyVisual.iconography && (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="font-bold mb-2">Iconografia</h3>
              <p className="text-gray-600 text-sm">{data.keyVisual.iconography}</p>
            </div>
          )}

          {isAdvanced && data.keyVisual.illustrations && (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="font-bold mb-2">Ilustrações</h3>
              <p className="text-gray-600 text-sm">{data.keyVisual.illustrations}</p>
            </div>
          )}

          {isAdvanced && data.keyVisual.marketingArchitecture && (
            <div className="bg-gray-50 p-6 rounded-lg border">
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
