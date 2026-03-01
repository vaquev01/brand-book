"use client";
import { BrandbookData } from "@/lib/types";

export function SectionProductionGuidelines({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.productionGuidelines) return null;

  const p = data.productionGuidelines;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. Produção &amp; Handoff</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 border rounded-xl p-6">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Naming Convention</div>
            <p className="text-sm text-gray-700 font-mono break-words">{p.fileNamingConvention}</p>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-bold mb-3">Checklist</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {p.handoffChecklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-bold mb-3">Specs de Impressão</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="font-semibold">Perfil:</span> {p.printSpecs.colorProfile}</div>
                <div><span className="font-semibold">Resolução:</span> {p.printSpecs.resolution}</div>
                <div><span className="font-semibold">Sangria:</span> {p.printSpecs.bleed}</div>
                <div><span className="font-semibold">Margem segura:</span> {p.printSpecs.safeMargin}</div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{p.printSpecs.notes}</p>
            </div>

            <div className="bg-white border rounded-xl p-6">
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
                <div key={i} className="px-6 py-5">
                  <div className="font-semibold">{d.asset}</div>
                  <div className="text-xs text-gray-500 mt-1">Formatos: {d.formats.join(" · ")}</div>
                  <div className="text-sm text-gray-700 mt-2">{d.specs}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
