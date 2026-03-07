"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionDNA({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const isAdvanced = !!data.brandConcept.uniqueValueProposition;
  const editorialLine = data.brandConcept.uniqueValueProposition || data.brandConcept.purpose || data.brandConcept.mission;

  return (
    <section className="page-break mb-6">
      <div className="mb-6 rounded-[1.75rem] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/80 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400">Fundação estratégica</div>
            <h2 className="text-[1.7rem] md:text-[2.15rem] font-extrabold tracking-tight text-gray-950">
              {String(num).padStart(2, "0")}. DNA da Marca &amp; Estratégia
            </h2>
            {editorialLine && (
              <p className="mt-2 text-sm leading-7 text-gray-600 md:text-[15px]">
                {editorialLine}
              </p>
            )}
          </div>
          <div className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shadow-sm">
            Essência viva da marca
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="rounded-[1.6rem] border border-gray-200 bg-white px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
            <h3 className="mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Propósito</h3>
            <EditableField
              value={data.brandConcept.purpose}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, purpose: val } }))}
              className="text-[1.35rem] font-semibold leading-[1.5] text-gray-900"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
          <div className="rounded-[1.35rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <h3 className="mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Missão</h3>
            <EditableField
              value={data.brandConcept.mission}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, mission: val } }))}
              className="text-gray-700 leading-7"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
          <div className="rounded-[1.35rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <h3 className="mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Visão</h3>
            <EditableField
              value={data.brandConcept.vision}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, vision: val } }))}
              className="text-gray-700 leading-7"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
          {isAdvanced && (
            <div className="rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-[0_16px_40px_rgba(37,99,235,0.10)]">
              <h3 className="mb-2 text-[11px] font-bold text-blue-800 uppercase tracking-[0.22em]">Proposta Única de Valor (UVP)</h3>
              <EditableField
                value={data.brandConcept.uniqueValueProposition || ""}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, uniqueValueProposition: val } }))}
                className="text-blue-950 text-[1.02rem] font-semibold leading-7"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isAdvanced && data.brandConcept.reasonsToBelieve && (
            <div className="rounded-[1.5rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Reasons to Believe (RTBs)</h3>
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, reasonsToBelieve: [...(prev.brandConcept.reasonsToBelieve || []), "Novo RTB"] } }))}
                    className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
              <ul className="list-disc pl-5 text-gray-700 space-y-2 leading-7">
                {data.brandConcept.reasonsToBelieve.map((r, i) => (
                  <li key={i} className="group/item">
                    <EditableField
                      value={r}
                      onSave={(val) => onUpdateData?.(prev => {
                        const next = [...(prev.brandConcept.reasonsToBelieve || [])];
                        next[i] = val;
                        return { ...prev, brandConcept: { ...prev.brandConcept, reasonsToBelieve: next } };
                      })}
                      onDelete={onUpdateData ? () => onUpdateData?.(prev => ({
                        ...prev, brandConcept: { ...prev.brandConcept, reasonsToBelieve: (prev.brandConcept.reasonsToBelieve || []).filter((_, idx) => idx !== i) }
                      })) : undefined}
                      readOnly={!onUpdateData}
                      multiline
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isAdvanced && data.brandConcept.userPsychographics && (
            <div className="rounded-[1.5rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <h3 className="mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Psicografia do Usuário</h3>
              <EditableField
                value={data.brandConcept.userPsychographics}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, userPsychographics: val } }))}
                className="text-sm text-gray-700 leading-7"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
          <div className="rounded-[1.5rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Valores Essenciais</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, values: [...prev.brandConcept.values, "Novo Valor"] } }))}
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.brandConcept.values.map((v, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-full shadow-sm pr-1 flex items-stretch overflow-hidden">
                  <div className="px-3 py-1 text-sm font-medium">
                    <EditableField
                      value={v}
                      onSave={(val) => onUpdateData?.(prev => {
                        const next = [...prev.brandConcept.values];
                        next[i] = val;
                        return { ...prev, brandConcept: { ...prev.brandConcept, values: next } };
                      })}
                      readOnly={!onUpdateData}
                    />
                  </div>
                  {onUpdateData && (
                    <button
                      onClick={() => onUpdateData(prev => ({
                        ...prev, brandConcept: { ...prev.brandConcept, values: prev.brandConcept.values.filter((_, idx) => idx !== i) }
                      }))}
                      className="no-print w-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition border-l"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-gray-200 bg-gray-950 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Personalidade</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, personality: [...prev.brandConcept.personality, "Novo Traço"] } }))}
                  className="no-print text-[10px] font-bold text-gray-300 bg-white/10 hover:bg-white/15 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.brandConcept.personality.map((p, i) => (
                <div key={i} className="bg-white/10 text-white rounded-full shadow-sm pr-1 flex items-stretch overflow-hidden border border-white/10">
                  <div className="px-3 py-1 text-sm font-medium">
                    <EditableField
                      value={p}
                      onSave={(val) => onUpdateData?.(prev => {
                        const next = [...prev.brandConcept.personality];
                        next[i] = val;
                        return { ...prev, brandConcept: { ...prev.brandConcept, personality: next } };
                      })}
                      readOnly={!onUpdateData}
                    />
                  </div>
                  {onUpdateData && (
                    <button
                      onClick={() => onUpdateData(prev => ({
                        ...prev, brandConcept: { ...prev.brandConcept, personality: prev.brandConcept.personality.filter((_, idx) => idx !== i) }
                      }))}
                      className="no-print w-6 flex items-center justify-center text-gray-400 hover:text-red-300 hover:bg-gray-700 transition border-l border-gray-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data.brandConcept.brandArchetype && (
        <div className="mt-6 rounded-[1.5rem] border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-[0_16px_40px_rgba(79,70,229,0.08)]">
          <h3 className="mb-2 text-[11px] font-bold text-indigo-800 uppercase tracking-[0.22em]">Arquétipo da Marca</h3>
          <EditableField
            value={data.brandConcept.brandArchetype}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, brandArchetype: val } }))}
            className="text-indigo-950 font-semibold leading-7"
            readOnly={!onUpdateData}
          />
        </div>
      )}

      <div className="mt-6 rounded-[1.6rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
        <h3 className="mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Tom de Voz</h3>
        <div className="border-l-4 border-gray-300 pl-4 py-2 italic">
          <EditableField
            value={data.brandConcept.toneOfVoice}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, toneOfVoice: val } }))}
            className="text-[1.02rem] text-gray-700 leading-7"
            readOnly={!onUpdateData}
            multiline
          />
        </div>
      </div>
    </section>
  );
}
