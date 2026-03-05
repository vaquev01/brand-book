"use client";
import { BrandbookData } from "@/lib/types";

export function SectionPositioning({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.positioning) return null;

  const p = data.positioning;
  const differentiators = p.primaryDifferentiators ?? [];
  const alternatives = p.competitiveAlternatives ?? [];
  const rtbs = p.reasonsToBelieve ?? [];

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Posicionamento
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Categoria</h3>
            <p className="text-gray-800 font-medium">{p.category}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Mercado-alvo</h3>
            <p className="text-gray-700">{p.targetMarket}</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Positioning Statement</h3>
            <p className="text-indigo-950 font-medium">{p.positioningStatement}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold mb-3">Diferenciais</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {differentiators.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold mb-3">Alternativas / Concorrentes</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {alternatives.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-bold mb-3">Reasons to Believe</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {rtbs.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
