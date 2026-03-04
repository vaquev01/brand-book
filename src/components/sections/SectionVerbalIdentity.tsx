"use client";
import { BrandbookData } from "@/lib/types";

export function SectionVerbalIdentity({ data, num }: { data: BrandbookData; num: number }) {
  if (!data.verbalIdentity) return null;

  const v = data.verbalIdentity;

  return (
    <section className="page-break mb-10">
      <h2 className="text-2xl font-bold mb-5 border-b pb-3">{String(num).padStart(2, "0")}. Identidade Verbal &amp; Mensagens</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 text-white rounded-xl p-5">
            <div className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2">Tagline</div>
            <div className="text-3xl font-extrabold leading-tight">{v.tagline}</div>
            <div className="mt-4 text-xs uppercase tracking-widest text-gray-300 font-bold mb-1">One-liner</div>
            <div className="text-lg text-gray-100">{v.oneLiner}</div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Pilares de Mensagem</h3>
            <div className="space-y-3">
              {v.messagingPillars.map((p, i) => (
                <div key={i} className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pilar {i + 1}</div>
                      <div className="text-lg font-bold mt-1">{p.title}</div>
                      <p className="text-gray-700 text-sm mt-2">{p.description}</p>
                    </div>
                  </div>

                  {p.proofPoints && p.proofPoints.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Proof Points</div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {p.proofPoints.map((pp, j) => (
                          <li key={j}>{pp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.exampleCopy && p.exampleCopy.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Exemplos de Copy</div>
                      <ul className="space-y-2">
                        {p.exampleCopy.map((c, j) => (
                          <li key={j} className="text-sm bg-white border rounded p-3 text-gray-700">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Traços de Voz</h3>
            <div className="flex flex-wrap gap-2">
              {v.brandVoiceTraits.map((t, i) => (
                <span key={i} className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-medium">{t}</span>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Vocabulário</h3>
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preferir</div>
              <div className="flex flex-wrap gap-2">
                {v.vocabulary.preferred.map((w, i) => (
                  <span key={i} className="bg-green-50 text-green-800 border border-green-100 text-xs px-2.5 py-1 rounded-full font-medium">{w}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Evitar</div>
              <div className="flex flex-wrap gap-2">
                {v.vocabulary.avoid.map((w, i) => (
                  <span key={i} className="bg-red-50 text-red-800 border border-red-100 text-xs px-2.5 py-1 rounded-full font-medium">{w}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Do / Don&apos;t</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Do</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {v.doDont.do.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Don&apos;t</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {v.doDont.dont.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Biblioteca Rápida</h3>
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Headlines</div>
              <ul className="space-y-2">
                {v.sampleHeadlines.map((h, i) => (
                  <li key={i} className="text-sm bg-gray-50 border rounded p-3 text-gray-700">{h}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CTAs</div>
              <div className="flex flex-wrap gap-2">
                {v.sampleCTAs.map((c, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-800 border border-indigo-100 text-xs px-2.5 py-1 rounded-full font-semibold">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {v.tonePerChannel && v.tonePerChannel.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base font-bold mb-3">Tom de Voz por Canal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {v.tonePerChannel.map((t, i) => (
              <div key={i} className="bg-white border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">{t.channel}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{t.tone}</p>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Exemplo</div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">&ldquo;{t.example}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
