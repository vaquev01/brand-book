"use client";
import { EditableField } from "@/components/EditableField";
import { BrandbookData } from "@/lib/types";

export function SectionUiGuidelines({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
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
            <EditableField value={ui.layoutGrid} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, layoutGrid: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Densidade</div>
            <EditableField value={ui.spacingDensity} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, spacingDensity: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Iconografia</div>
            <EditableField value={ui.iconographyStyle} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, iconographyStyle: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Ilustração</div>
            <EditableField value={ui.illustrationStyle} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, illustrationStyle: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
          </div>
          <div className="bg-gray-50 border rounded-xl p-4">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">DataViz</div>
            <EditableField value={ui.dataVizGuidelines} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, dataVizGuidelines: val } } : prev)} className="text-sm text-gray-700" readOnly={!onUpdateData} multiline />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">Componentes</h3>
                <p className="text-xs text-gray-500 mt-1">Uso, estados, do/don&apos;t e notas de acessibilidade</p>
              </div>
              {onUpdateData && (
                <button
                  type="button"
                  onClick={() => onUpdateData(prev => prev.uiGuidelines ? {
                    ...prev,
                    uiGuidelines: {
                      ...prev.uiGuidelines,
                      components: [
                        ...prev.uiGuidelines.components,
                        { name: "Novo componente", usage: "Descreva o uso", states: [], do: [], dont: [], accessibilityNotes: [] }
                      ]
                    }
                  } : prev)}
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <div className="divide-y">
              {ui.components.map((c, i) => (
                <div key={i} className="px-5 py-4 relative group/component">
                  {onUpdateData && (
                    <button
                      type="button"
                      onClick={() => onUpdateData(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.filter((_, idx) => idx !== i) } } : prev)}
                      className="absolute top-4 right-4 no-print w-6 h-6 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/component:opacity-100 transition flex items-center justify-center"
                      title="Excluir componente"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-bold"><EditableField value={c.name} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, name: val } : item) } } : prev)} readOnly={!onUpdateData} /></div>
                      <EditableField value={c.usage} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, usage: val } : item) } } : prev)} className="text-sm text-gray-600 mt-1" readOnly={!onUpdateData} multiline />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estados</div>
                      <div className="flex flex-wrap gap-2">
                        {c.states.map((s, j) => (
                          <span key={j} className="bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full font-medium"><EditableField value={s} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, states: item.states.map((state, stateIdx) => stateIdx === j ? val : state) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, states: item.states.filter((_, stateIdx) => stateIdx !== j) } : item) } } : prev) : undefined} readOnly={!onUpdateData} /></span>
                        ))}
                      </div>
                      {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, states: [...item.states, "Novo estado"] } : item) } } : prev)} className="no-print mt-2 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Adicionar</button>}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Acessibilidade</div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {c.accessibilityNotes.map((a, j) => (
                          <li key={j} className="group/item"><EditableField value={a} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, accessibilityNotes: item.accessibilityNotes.map((note, noteIdx) => noteIdx === j ? val : note) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, accessibilityNotes: item.accessibilityNotes.filter((_, noteIdx) => noteIdx !== j) } : item) } } : prev) : undefined} readOnly={!onUpdateData} multiline /></li>
                        ))}
                      </ul>
                      {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, accessibilityNotes: [...item.accessibilityNotes, "Nova nota"] } : item) } } : prev)} className="no-print mt-2 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Adicionar</button>}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Do</div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {c.do.map((d, j) => (
                          <li key={j} className="group/item"><EditableField value={d} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, do: item.do.map((entry, entryIdx) => entryIdx === j ? val : entry) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, do: item.do.filter((_, entryIdx) => entryIdx !== j) } : item) } } : prev) : undefined} readOnly={!onUpdateData} multiline /></li>
                        ))}
                      </ul>
                      {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, do: [...item.do, "Novo do"] } : item) } } : prev)} className="no-print mt-2 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Adicionar</button>}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Don&apos;t</div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {c.dont.map((d, j) => (
                          <li key={j} className="group/item"><EditableField value={d} onSave={(val) => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, dont: item.dont.map((entry, entryIdx) => entryIdx === j ? val : entry) } : item) } } : prev)} onDelete={onUpdateData ? () => onUpdateData?.(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, dont: item.dont.filter((_, entryIdx) => entryIdx !== j) } : item) } } : prev) : undefined} readOnly={!onUpdateData} multiline /></li>
                        ))}
                      </ul>
                      {onUpdateData && <button type="button" onClick={() => onUpdateData(prev => prev.uiGuidelines ? { ...prev, uiGuidelines: { ...prev.uiGuidelines, components: prev.uiGuidelines.components.map((item, idx) => idx === i ? { ...item, dont: [...item.dont, "Novo don't"] } : item) } } : prev)} className="no-print mt-2 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">+ Adicionar</button>}
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
