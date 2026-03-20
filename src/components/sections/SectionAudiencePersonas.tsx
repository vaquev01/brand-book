"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

const PERSONA_COLORS = [
  "var(--bb-primary, #1a1a1a)",
  "var(--bb-accent, #c0a060)",
  "#4f46e5",
  "#059669",
];

export function SectionAudiencePersonas({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.audiencePersonas || data.audiencePersonas.length === 0) return null;

  return (
    <section className="page-break mb-6">
      {/* Section header card */}
      <div className="mb-6 rounded-[1.75rem] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/80 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Estratégia de audiência</div>
            <h2 className="text-[1.7rem] md:text-[2.15rem] font-extrabold tracking-tight text-gray-950">
              {String(num).padStart(2, "0")}. Público-alvo (Personas)
            </h2>
            <p className="mt-2 text-[15px] leading-7 text-gray-700 md:text-[15px]">
              Perfis detalhados do público que a marca pretende alcançar, com objetivos, dores e canais de contacto.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shadow-sm">
              Personas &amp; segmentação
            </div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {data.audiencePersonas.map((p, i) => {
          const accentColor = PERSONA_COLORS[i % PERSONA_COLORS.length];
          const initial = (p.name || "P").charAt(0).toUpperCase();

          return (
            <div key={i} className="bg-white border rounded-xl overflow-hidden shadow-sm relative group/persona" style={{ borderTopWidth: "4px", borderTopColor: accentColor }}>
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

              {/* Avatar + Name header */}
              <div className="px-5 py-4 bg-gray-50 border-b pr-14 flex items-center gap-4">
                {p.imageUrl ? (
                  <div className="w-14 h-14 rounded-2xl shrink-0 shadow-md overflow-hidden relative group/avatar">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 right-0.5 text-[7px] font-bold bg-black/60 text-white px-1 py-0.5 rounded-md">IA</span>
                  </div>
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shrink-0 shadow-md relative group/avatar cursor-default"
                    style={{ background: accentColor }}
                    title="Persona sem imagem"
                  >
                    {initial}
                    {onUpdateData && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/40 flex items-center justify-center bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                        <span className="text-[9px] font-bold text-white/90 text-center leading-tight">✨<br/>IA</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Persona {i + 1}</div>
                  <div className="text-lg font-extrabold mt-0.5 leading-tight">
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
                  <div className="text-sm text-gray-500 mt-0.5">
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
              </div>

              <div className="p-4 space-y-4">
                {/* Porte / Maturidade Digital — only show if filled */}
                {((p.companySize && p.companySize !== "—") || (p.digitalMaturity && p.digitalMaturity !== "—") || onUpdateData) && (
                <div className="flex flex-wrap gap-3">
                  {(p.companySize && p.companySize !== "—" || onUpdateData) && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 flex-1 min-w-[140px]">
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Porte</div>
                    <div className="text-xs text-blue-900 font-medium">
                      <EditableField
                        value={p.companySize || "—"}
                        onSave={(val) => onUpdateData?.(prev => {
                          const next = [...(prev.audiencePersonas || [])];
                          next[i] = { ...next[i], companySize: val };
                          return { ...prev, audiencePersonas: next };
                        })}
                        readOnly={!onUpdateData}
                      />
                    </div>
                  </div>
                  )}
                  {(p.digitalMaturity && p.digitalMaturity !== "—" || onUpdateData) && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 flex-1 min-w-[140px]">
                    <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">Maturidade Digital</div>
                    <div className="text-xs text-purple-900 font-medium">
                      <EditableField
                        value={p.digitalMaturity || "—"}
                        onSave={(val) => onUpdateData?.(prev => {
                          const next = [...(prev.audiencePersonas || [])];
                          next[i] = { ...next[i], digitalMaturity: val };
                          return { ...prev, audiencePersonas: next };
                        })}
                        readOnly={!onUpdateData}
                      />
                    </div>
                  </div>
                  )}
                </div>
                )}
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

                {/* Goals as green pill tags */}
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
                  <div className="flex flex-wrap gap-2">
                    {p.goals.map((g, j) => (
                      <span key={j} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-1.5 rounded-full font-medium group/item">
                        <svg className="w-3 h-3 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <EditableField
                          value={g}
                          onSave={(val) => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            const nextGoals = [...next[i].goals];
                            nextGoals[j] = val;
                            next[i] = { ...next[i], goals: nextGoals };
                            return { ...prev, audiencePersonas: next };
                          })}
                          readOnly={!onUpdateData}
                        />
                        {onUpdateData && (
                          <button
                            onClick={() => onUpdateData(prev => {
                              const next = [...(prev.audiencePersonas || [])];
                              next[i] = { ...next[i], goals: next[i].goals.filter((_, idx) => idx !== j) };
                              return { ...prev, audiencePersonas: next };
                            })}
                            className="no-print ml-0.5 text-emerald-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pains as red pill tags */}
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
                  <div className="flex flex-wrap gap-2">
                    {p.painPoints.map((g, j) => (
                      <span key={j} className="inline-flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-200 text-xs px-3 py-1.5 rounded-full font-medium group/item">
                        <svg className="w-3 h-3 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <EditableField
                          value={g}
                          onSave={(val) => onUpdateData?.(prev => {
                            const next = [...(prev.audiencePersonas || [])];
                            const nextPains = [...next[i].painPoints];
                            nextPains[j] = val;
                            next[i] = { ...next[i], painPoints: nextPains };
                            return { ...prev, audiencePersonas: next };
                          })}
                          readOnly={!onUpdateData}
                        />
                        {onUpdateData && (
                          <button
                            onClick={() => onUpdateData(prev => {
                              const next = [...(prev.audiencePersonas || [])];
                              next[i] = { ...next[i], painPoints: next[i].painPoints.filter((_, idx) => idx !== j) };
                              return { ...prev, audiencePersonas: next };
                            })}
                            className="no-print ml-0.5 text-red-400 hover:text-red-600"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Objections as compact quote-style */}
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
                  <div className="space-y-1.5">
                    {p.objections.map((g, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm text-gray-600 italic group/item pl-2 border-l-2 border-gray-200 py-0.5">
                        <span className="text-gray-400 shrink-0">&ldquo;</span>
                        <div className="flex-1">
                          <EditableField
                            value={g}
                            onSave={(val) => onUpdateData?.(prev => {
                              const next = [...(prev.audiencePersonas || [])];
                              const nextObjs = [...next[i].objections];
                              nextObjs[j] = val;
                              next[i] = { ...next[i], objections: nextObjs };
                              return { ...prev, audiencePersonas: next };
                            })}
                            readOnly={!onUpdateData}
                          />
                        </div>
                        <span className="text-gray-400 shrink-0">&rdquo;</span>
                        {onUpdateData && (
                          <button
                            onClick={() => onUpdateData(prev => {
                              const next = [...(prev.audiencePersonas || [])];
                              next[i] = { ...next[i], objections: next[i].objections.filter((_, idx) => idx !== j) };
                              return { ...prev, audiencePersonas: next };
                            })}
                            className="no-print text-gray-300 hover:text-red-500 shrink-0 opacity-0 group-hover/item:opacity-100 transition"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Channels as compact horizontal tags */}
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
                  <div className="flex flex-wrap gap-1.5">
                    {p.channels.map((c, j) => (
                      <span key={j} className="bg-gray-900 text-white text-[11px] px-2.5 py-1 rounded-full font-medium flex items-stretch overflow-hidden group/item">
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
          );
        })}
      </div>
    </section>
  );
}
