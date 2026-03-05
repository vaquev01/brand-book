"use client";
import { BrandbookData } from "@/lib/types";

export function SectionProductionGuidelines({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.productionGuidelines) return null;

  const p = data.productionGuidelines;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Produção &amp; Handoff
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Naming Convention</div>
            <p className="text-sm text-gray-700 font-mono break-words">{p.fileNamingConvention}</p>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Checklist</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {p.handoffChecklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-bold mb-3">Specs de Impressão</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="font-semibold">Perfil:</span> {p.printSpecs.colorProfile}</div>
                <div><span className="font-semibold">Resolução:</span> {p.printSpecs.resolution}</div>
                <div><span className="font-semibold">Sangria:</span> {p.printSpecs.bleed}</div>
                <div><span className="font-semibold">Margem segura:</span> {p.printSpecs.safeMargin}</div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{p.printSpecs.notes}</p>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-bold mb-3">Specs Digitais</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="font-semibold">Cor:</span> {p.digitalSpecs.colorSpace}</div>
                <div><span className="font-semibold">Escalas:</span> {p.digitalSpecs.exportScales.join(", ")}</div>
                <div><span className="font-semibold">Formatos:</span> {p.digitalSpecs.formats.join(", ")}</div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{p.digitalSpecs.compressionGuidelines}</p>
              <p className="text-xs text-gray-500 mt-2">{p.digitalSpecs.notes}</p>
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="font-bold">Entregáveis</h3>
              <p className="text-xs text-gray-500 mt-1">Pacote recomendado para agência, marketing e dev</p>
            </div>
            <div className="divide-y">
              {p.deliverables.map((d, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="font-semibold">{d.asset}</div>
                  <div className="text-xs text-gray-500 mt-1">Formatos: {d.formats.join(" · ")}</div>
                  <div className="text-sm text-gray-700 mt-2">{d.specs}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {p.productionMethods && p.productionMethods.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base font-bold mb-4 border-b pb-3">Métodos de Produção</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.productionMethods.map((pm, i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gray-50 border-b">
                  <h4 className="font-bold text-gray-900">{pm.method}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Substrato: {pm.substrate}</p>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Diretrizes</span>
                    <ul className="mt-2 space-y-1">
                      {pm.guidelines.map((g, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Restrições</span>
                    <ul className="mt-2 space-y-1">
                      {pm.restrictions.map((r, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
