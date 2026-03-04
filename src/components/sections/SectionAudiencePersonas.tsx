"use client";
import { BrandbookData } from "@/lib/types";

export function SectionAudiencePersonas({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.audiencePersonas || data.audiencePersonas.length === 0) return null;

  return (
    <section className="page-break mb-10">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Público-alvo (Personas)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.audiencePersonas.map((p, i) => (
          <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50 border-b">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Persona {i + 1}</div>
              <div className="text-xl font-extrabold mt-1">{p.name}</div>
              <div className="text-sm text-gray-600 mt-1">{p.role}</div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contexto</div>
                <p className="text-sm text-gray-700">{p.context}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Objetivos</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {p.goals.map((g, j) => (
                      <li key={j}>{g}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dores</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {p.painPoints.map((g, j) => (
                      <li key={j}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Objeções</div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {p.objections.map((g, j) => (
                      <li key={j}>{g}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Canais</div>
                  <div className="flex flex-wrap gap-2">
                    {p.channels.map((c, j) => (
                      <span key={j} className="bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
