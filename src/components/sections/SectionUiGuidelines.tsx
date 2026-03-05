"use client";
import { BrandbookData } from "@/lib/types";

export function SectionUiGuidelines({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.uiGuidelines) return null;

  const ui = data.uiGuidelines;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Guidelines de UI
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Layout / Grid</div>
            <p className="text-sm text-gray-700">{ui.layoutGrid}</p>
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Densidade</div>
            <p className="text-sm text-gray-700">{ui.spacingDensity}</p>
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Iconografia</div>
            <p className="text-sm text-gray-700">{ui.iconographyStyle}</p>
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Ilustração</div>
            <p className="text-sm text-gray-700">{ui.illustrationStyle}</p>
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">DataViz</div>
            <p className="text-sm text-gray-700">{ui.dataVizGuidelines}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-bold">Componentes</h3>
              <p className="text-xs text-gray-500 mt-1">Uso, estados, do/don&apos;t e notas de acessibilidade</p>
            </div>
            <div className="divide-y">
              {ui.components.map((c, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-bold">{c.name}</div>
                      <p className="text-sm text-gray-600 mt-1">{c.usage}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estados</div>
                      <div className="flex flex-wrap gap-2">
                        {c.states.map((s, j) => (
                          <span key={j} className="bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Acessibilidade</div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {c.accessibilityNotes.map((a, j) => (
                          <li key={j}>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Do</div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {c.do.map((d, j) => (
                          <li key={j}>{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Don&apos;t</div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {c.dont.map((d, j) => (
                          <li key={j}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
