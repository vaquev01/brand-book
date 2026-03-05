"use client";
import { BrandbookData } from "@/lib/types";

export function SectionBrandStory({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.brandStory) return null;

  const s = data.brandStory;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Brand Story &amp; Manifesto
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Manifesto</h3>
            <div className="bg-gray-900 text-white rounded-2xl p-5">
              <div className="text-lg leading-relaxed text-gray-100 whitespace-pre-line">{s.manifesto}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">História de Origem</h3>
            <div className="bg-gray-50 border rounded-xl p-4">
              <p className="text-gray-700 leading-relaxed">{s.originStory}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Promessa da Marca</h3>
            <p className="text-gray-900 font-semibold text-lg leading-snug">&ldquo;{s.brandPromise}&rdquo;</p>
          </div>

          {s.brandBeliefs && s.brandBeliefs.length > 0 && (
            <div className="bg-white border rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">O que Acreditamos</h3>
              <ul className="space-y-3">
                {s.brandBeliefs.map((belief, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-gray-700 text-sm">{belief}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
