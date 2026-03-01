"use client";
import { BrandbookData } from "@/lib/types";

export function SectionDNA({ data, num }: { data: BrandbookData; num: number }) {
  const isAdvanced = !!data.brandConcept.uniqueValueProposition;

  return (
    <section className="page-break mb-16">
      <h2 className="text-3xl font-bold mb-8 border-b pb-4">{String(num).padStart(2, "0")}. DNA da Marca &amp; Estratégia</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Propósito</h3>
            <p className="text-xl font-medium text-gray-800">{data.brandConcept.purpose}</p>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Missão</h3>
            <p className="text-gray-700">{data.brandConcept.mission}</p>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Visão</h3>
            <p className="text-gray-700">{data.brandConcept.vision}</p>
          </div>
          {isAdvanced && (
            <div className="mb-6 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Proposta Única de Valor (UVP)</h3>
              <p className="text-blue-900 font-medium">{data.brandConcept.uniqueValueProposition}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isAdvanced && data.brandConcept.reasonsToBelieve && (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Reasons to Believe (RTBs)</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {data.brandConcept.reasonsToBelieve.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {isAdvanced && data.brandConcept.userPsychographics && (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Psicografia do Usuário</h3>
              <p className="text-gray-700 text-sm">{data.brandConcept.userPsychographics}</p>
            </div>
          )}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Valores Essenciais</h3>
            <div className="flex flex-wrap gap-2">
              {data.brandConcept.values.map((v, i) => (
                <span key={i} className="bg-white border px-3 py-1 rounded-full text-sm font-medium shadow-sm">{v}</span>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Personalidade</h3>
            <div className="flex flex-wrap gap-2">
              {data.brandConcept.personality.map((p, i) => (
                <span key={i} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tom de Voz</h3>
        <p className="text-gray-700 italic border-l-4 border-gray-300 pl-4 py-2">{data.brandConcept.toneOfVoice}</p>
      </div>
    </section>
  );
}
