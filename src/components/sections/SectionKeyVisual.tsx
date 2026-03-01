"use client";
import { BrandbookData } from "@/lib/types";

export function SectionKeyVisual({ data, num }: { data: BrandbookData; num: number }) {
  const isAdvanced = !!data.keyVisual.iconography;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Key Visual &amp; Linguagem Gráfica</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
    </section>
  );
}
