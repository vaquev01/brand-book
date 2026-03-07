"use client";
import { EditableField } from "@/components/EditableField";
import { BrandbookData } from "@/lib/types";

export function SectionProductionGuidelines({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.productionGuidelines) return null;

  const p = data.productionGuidelines;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Produção &amp; Handoff
      </h2>

      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 items-start">
          <div className="space-y-4">
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Naming Convention</div>
            <EditableField value={p.fileNamingConvention} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, fileNamingConvention: val } } : prev)} className="text-sm text-gray-700 font-mono break-words" readOnly={!onUpdateData} multiline />
          </div>

          <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Checklist</h3>
              {onUpdateData && (
                <button
                  type="button"
                  onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, handoffChecklist: [...prev.productionGuidelines.handoffChecklist, "Novo item de checklist"] } } : prev)}
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {p.handoffChecklist.map((c, i) => (
                <li key={i} className="group/item"><EditableField value={c} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, handoffChecklist: prev.productionGuidelines.handoffChecklist.map((item, idx) => idx === i ? val : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, handoffChecklist: prev.productionGuidelines.handoffChecklist.filter((_, idx) => idx !== i) } } : prev) : undefined} readOnly={!onUpdateData} multiline /></li>
              ))}
            </ul>
          </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-bold mb-3">Specs de Impressão</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="font-semibold">Perfil:</span> <EditableField value={p.printSpecs.colorProfile} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, printSpecs: { ...prev.productionGuidelines.printSpecs, colorProfile: val } } } : prev)} readOnly={!onUpdateData} /></div>
                <div><span className="font-semibold">Resolução:</span> <EditableField value={p.printSpecs.resolution} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, printSpecs: { ...prev.productionGuidelines.printSpecs, resolution: val } } } : prev)} readOnly={!onUpdateData} /></div>
                <div><span className="font-semibold">Sangria:</span> <EditableField value={p.printSpecs.bleed} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, printSpecs: { ...prev.productionGuidelines.printSpecs, bleed: val } } } : prev)} readOnly={!onUpdateData} /></div>
                <div><span className="font-semibold">Margem segura:</span> <EditableField value={p.printSpecs.safeMargin} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, printSpecs: { ...prev.productionGuidelines.printSpecs, safeMargin: val } } } : prev)} readOnly={!onUpdateData} /></div>
              </div>
              <EditableField value={p.printSpecs.notes} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, printSpecs: { ...prev.productionGuidelines.printSpecs, notes: val } } } : prev)} className="text-xs text-gray-500 mt-3" readOnly={!onUpdateData} multiline />
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-bold mb-3">Specs Digitais</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div><span className="font-semibold">Cor:</span> <EditableField value={p.digitalSpecs.colorSpace} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, colorSpace: val } } } : prev)} readOnly={!onUpdateData} /></div>
                <div><span className="font-semibold">Escalas:</span> {p.digitalSpecs.exportScales.map((scale, i) => <span key={i} className="inline-block mr-2"><EditableField value={scale} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, exportScales: prev.productionGuidelines.digitalSpecs.exportScales.map((item, idx) => idx === i ? val : item) } } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, exportScales: prev.productionGuidelines.digitalSpecs.exportScales.filter((_, idx) => idx !== i) } } } : prev) : undefined} readOnly={!onUpdateData} /></span>)}</div>
                <div><span className="font-semibold">Formatos:</span> {p.digitalSpecs.formats.map((format, i) => <span key={i} className="inline-block mr-2"><EditableField value={format} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, formats: prev.productionGuidelines.digitalSpecs.formats.map((item, idx) => idx === i ? val : item) } } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, formats: prev.productionGuidelines.digitalSpecs.formats.filter((_, idx) => idx !== i) } } } : prev) : undefined} readOnly={!onUpdateData} /></span>)}</div>
              </div>
              {onUpdateData && <div className="no-print mt-3 flex gap-2"><button type="button" onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, exportScales: [...prev.productionGuidelines.digitalSpecs.exportScales, "@1x"] } } } : prev)} className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Escala</button><button type="button" onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, formats: [...prev.productionGuidelines.digitalSpecs.formats, "PNG"] } } } : prev)} className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Formato</button></div>}
              <EditableField value={p.digitalSpecs.compressionGuidelines} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, compressionGuidelines: val } } } : prev)} className="text-xs text-gray-500 mt-3" readOnly={!onUpdateData} multiline />
              <EditableField value={p.digitalSpecs.notes} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, digitalSpecs: { ...prev.productionGuidelines.digitalSpecs, notes: val } } } : prev)} className="text-xs text-gray-500 mt-2" readOnly={!onUpdateData} multiline />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Entregáveis</h3>
              <p className="text-xs text-gray-500 mt-1">Pacote recomendado para agência, marketing e dev</p>
            </div>
            {onUpdateData && (
              <button
                type="button"
                onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, deliverables: [...prev.productionGuidelines.deliverables, { asset: "Novo entregável", formats: ["PDF"], specs: "Descreva as specs" }] } } : prev)}
                className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
              >
                + Adicionar
              </button>
            )}
          </div>
          <div className="divide-y">
            {p.deliverables.map((d, i) => (
              <div key={i} className="px-5 py-4 relative group/deliverable">
                {onUpdateData && (
                  <button type="button" onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, deliverables: prev.productionGuidelines.deliverables.filter((_, idx) => idx !== i) } } : prev)} className="absolute top-4 right-4 no-print w-6 h-6 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/deliverable:opacity-100 transition flex items-center justify-center" title="Excluir entregável"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                )}
                <div className="font-semibold"><EditableField value={d.asset} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, deliverables: prev.productionGuidelines.deliverables.map((item, idx) => idx === i ? { ...item, asset: val } : item) } } : prev)} readOnly={!onUpdateData} /></div>
                <div className="text-xs text-gray-500 mt-1">Formatos: {d.formats.map((format, j) => <span key={j} className="inline-block mr-2"><EditableField value={format} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, deliverables: prev.productionGuidelines.deliverables.map((item, idx) => idx === i ? { ...item, formats: item.formats.map((entry, entryIdx) => entryIdx === j ? val : entry) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, deliverables: prev.productionGuidelines.deliverables.map((item, idx) => idx === i ? { ...item, formats: item.formats.filter((_, entryIdx) => entryIdx !== j) } : item) } } : prev) : undefined} readOnly={!onUpdateData} /></span>)}</div>
                {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, deliverables: prev.productionGuidelines.deliverables.map((item, idx) => idx === i ? { ...item, formats: [...item.formats, "PDF"] } : item) } } : prev)} className="no-print mt-2 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Formato</button>}
                <EditableField value={d.specs} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, deliverables: prev.productionGuidelines.deliverables.map((item, idx) => idx === i ? { ...item, specs: val } : item) } } : prev)} className="text-sm text-gray-700 mt-2" readOnly={!onUpdateData} multiline />
              </div>
            ))}
          </div>
        </div>
      </div>

      {p.productionMethods && p.productionMethods.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3 mb-4 border-b pb-3">
            <h3 className="text-base font-bold">Métodos de Produção</h3>
            {onUpdateData && (
              <button
                type="button"
                onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: [...(prev.productionGuidelines.productionMethods || []), { method: "Novo método", substrate: "Substrato", guidelines: [], restrictions: [] }] } } : prev)}
                className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
              >
                + Adicionar
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.productionMethods.map((pm, i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm relative group/method">
                {onUpdateData && (
                  <button type="button" onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).filter((_, idx) => idx !== i) } } : prev)} className="absolute top-2 right-2 no-print w-6 h-6 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/method:opacity-100 transition flex items-center justify-center" title="Excluir método"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                )}
                <div className="px-5 py-4 bg-gray-50 border-b">
                  <h4 className="font-bold text-gray-900"><EditableField value={pm.method} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, method: val } : item) } } : prev)} readOnly={!onUpdateData} /></h4>
                  <p className="text-xs text-gray-500 mt-0.5">Substrato: <EditableField value={pm.substrate} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, substrate: val } : item) } } : prev)} readOnly={!onUpdateData} /></p>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Diretrizes</span>
                    <ul className="mt-2 space-y-1">
                      {pm.guidelines.map((g, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700 group/item">
                          <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                          <EditableField value={g} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, guidelines: item.guidelines.map((entry, entryIdx) => entryIdx === j ? val : entry) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, guidelines: item.guidelines.filter((_, entryIdx) => entryIdx !== j) } : item) } } : prev) : undefined} className="flex-1" readOnly={!onUpdateData} multiline />
                        </li>
                      ))}
                    </ul>
                    {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, guidelines: [...item.guidelines, "Nova diretriz"] } : item) } } : prev)} className="no-print mt-2 text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition">+ Adicionar</button>}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Restrições</span>
                    <ul className="mt-2 space-y-1">
                      {pm.restrictions.map((r, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700 group/item">
                          <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                          <EditableField value={r} onSave={(val) => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, restrictions: item.restrictions.map((entry, entryIdx) => entryIdx === j ? val : entry) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, restrictions: item.restrictions.filter((_, entryIdx) => entryIdx !== j) } : item) } } : prev) : undefined} className="flex-1" readOnly={!onUpdateData} multiline />
                        </li>
                      ))}
                    </ul>
                    {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.productionGuidelines ? { ...prev, productionGuidelines: { ...prev.productionGuidelines, productionMethods: (prev.productionGuidelines.productionMethods || []).map((item, idx) => idx === i ? { ...item, restrictions: [...item.restrictions, "Nova restrição"] } : item) } } : prev)} className="no-print mt-2 text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition">+ Adicionar</button>}
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
