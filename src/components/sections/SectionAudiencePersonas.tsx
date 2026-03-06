"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionAudiencePersonas({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.audiencePersonas || data.audiencePersonas.length === 0) return null;

  return (
    <section className="page-break mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {String(num).padStart(2, "0")}. Público-alvo (Personas)
        </h2>
        {onUpdateData && (
          <button
            onClick={() => onUpdateData(prev => ({
              ...prev,
              audiencePersonas: [...(prev.audiencePersonas || []), {
                name: "Nova Persona",
                role: "Cargo / Papel",
                context: "Contexto",
                goals: ["Objetivo 1"],
                painPoints: ["Dor 1"],
                objections: ["Objeção 1"],
                channels: ["Canal 1"]
              }]
            }))}
            className="no-print flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            + Adicionar Persona
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {data.audiencePersonas.map((p, i) => (
          <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm relative group/persona">
            {onUpdateData && (
              <button
                onClick={() => onUpdateData(prev => ({
                  ...prev,
                  audiencePersonas: (prev.audiencePersonas || []).filter((_, idx) => idx !== i)
                }))}
                className="absolute top-4 right-4 w-8 h-8 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/persona:opacity-100 transition flex items-center justify-center z-10 shadow-sm"
                title="Excluir Persona"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            )}
            <div className="px-5 py-4 bg-gray-50 border-b pr-14">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Persona {i + 1}</div>
              <div className="text-xl font-extrabold mt-1">
                <EditableField
                  value={p.name}
                  onSave={(val) => onUpdateData?.(prev => {
                    const next = [...(prev.audiencePersonas || [])];
                    next[i] = { ...next[i], name: val };
                    return { ...prev, audiencePersonas: next };
                  })}
                  readOnly={!onUpdateData}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <EditableField
                  value={p.role}
                  onSave={(val) => onUpdateData?.(prev => {
                    const next = [...(prev.audiencePersonas || [])];
                    next[i] = { ...next[i], role: val };
                    return { ...prev, audiencePersonas: next };
                  })}
                  readOnly={!onUpdateData}
                />
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 flex-1 min-w-[140px]">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Porte</div>
                  <div className="text-xs text-blue-900 font-medium">
                    <EditableField
                      value={p.companySize || "Não definido"}
                      onSave={(val) => onUpdateData?.(prev => {
                        const next = [...(prev.audiencePersonas || [])];
                        next[i] = { ...next[i], companySize: val };
                        return { ...prev, audiencePersonas: next };
                      })}
                      readOnly={!onUpdateData}
                    />
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 flex-1 min-w-[140px]">
                  <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">Maturidade Digital</div>
                  <div className="text-xs text-purple-900 font-medium">
                    <EditableField
                      value={p.digitalMaturity || "Não definido"}
                      onSave={(val) => onUpdateData?.(prev => {
                        const next = [...(prev.audiencePersonas || [])];
                        next[i] = { ...next[i], digitalMaturity: val };
                        return { ...prev, audiencePersonas: next };
                      })}
                      readOnly={!onUpdateData}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contexto</div>
                <div className="text-sm text-gray-700">
                  <EditableField
                    value={p.context}
                    onSave={(val) => onUpdateData?.(prev => {
                      const next = [...(prev.audiencePersonas || [])];
                      next[i] = { ...next[i], context: val };
                      return { ...prev, audiencePersonas: next };
                    })}
                    readOnly={!onUpdateData}
                    multiline
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Objetivos</div>
                    {onUpdateData && (
                      <button
                        onClick={() => onUpdateData(prev => {
                          const next = [...(prev.audiencePersonas || [])];
                          next[i] = { ...next[i], goals: [...(next[i].goals || []), "Novo objetivo"] };
                          return { ...prev, audiencePersonas: next };
                        })}
                        className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                      >
                        + Adicionar
                      </button>
                    )}
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {p.goals.map((g, j) => (
                      <li key={j} className="group/item">
                        <EditableField
                          value={g}
                          onSave={(val) => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            const nextGoals = [...next[i].goals];
                            nextGoals[j] = val;
                            next[i] = { ...next[i], goals: nextGoals };
                            return { ...prev, audiencePersonas: next };
                          })}
                          onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            next[i] = { ...next[i], goals: next[i].goals.filter((_, idx) => idx !== j) };
                            return { ...prev, audiencePersonas: next };
                          }) : undefined}
                          readOnly={!onUpdateData}
                          multiline
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dores</div>
                    {onUpdateData && (
                      <button
                        onClick={() => onUpdateData(prev => {
                          const next = [...(prev.audiencePersonas || [])];
                          next[i] = { ...next[i], painPoints: [...(next[i].painPoints || []), "Nova dor"] };
                          return { ...prev, audiencePersonas: next };
                        })}
                        className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                      >
                        + Adicionar
                      </button>
                    )}
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {p.painPoints.map((g, j) => (
                      <li key={j} className="group/item">
                        <EditableField
                          value={g}
                          onSave={(val) => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            const nextPains = [...next[i].painPoints];
                            nextPains[j] = val;
                            next[i] = { ...next[i], painPoints: nextPains };
                            return { ...prev, audiencePersonas: next };
                          })}
                          onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            next[i] = { ...next[i], painPoints: next[i].painPoints.filter((_, idx) => idx !== j) };
                            return { ...prev, audiencePersonas: next };
                          }) : undefined}
                          readOnly={!onUpdateData}
                          multiline
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Objeções</div>
                    {onUpdateData && (
                      <button
                        onClick={() => onUpdateData(prev => {
                          const next = [...(prev.audiencePersonas || [])];
                          next[i] = { ...next[i], objections: [...(next[i].objections || []), "Nova objeção"] };
                          return { ...prev, audiencePersonas: next };
                        })}
                        className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                      >
                        + Adicionar
                      </button>
                    )}
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {p.objections.map((g, j) => (
                      <li key={j} className="group/item">
                        <EditableField
                          value={g}
                          onSave={(val) => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            const nextObjs = [...next[i].objections];
                            nextObjs[j] = val;
                            next[i] = { ...next[i], objections: nextObjs };
                            return { ...prev, audiencePersonas: next };
                          })}
                          onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            next[i] = { ...next[i], objections: next[i].objections.filter((_, idx) => idx !== j) };
                            return { ...prev, audiencePersonas: next };
                          }) : undefined}
                          readOnly={!onUpdateData}
                          multiline
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Canais</div>
                    {onUpdateData && (
                      <button
                        onClick={() => onUpdateData(prev => {
                          const next = [...(prev.audiencePersonas || [])];
                          next[i] = { ...next[i], channels: [...(next[i].channels || []), "Novo canal"] };
                          return { ...prev, audiencePersonas: next };
                        })}
                        className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                      >
                        + Adicionar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.channels.map((c, j) => (
                      <span key={j} className="bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-stretch overflow-hidden group/item">
                        <EditableField
                          value={c}
                          onSave={(val) => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            const nextChannels = [...next[i].channels];
                            nextChannels[j] = val;
                            next[i] = { ...next[i], channels: nextChannels };
                            return { ...prev, audiencePersonas: next };
                          })}
                          readOnly={!onUpdateData}
                        />
                        {onUpdateData && (
                          <button
                            onClick={() => onUpdateData(prev => {
                              const next = [...(prev.audiencePersonas || [])];
                              next[i] = { ...next[i], channels: next[i].channels.filter((_, idx) => idx !== j) };
                              return { ...prev, audiencePersonas: next };
                            })}
                            className="no-print ml-1 -mr-1 pl-1 border-l border-gray-700 text-gray-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        )}
                      </span>
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
