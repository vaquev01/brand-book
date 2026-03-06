"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionDNA({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const isAdvanced = !!data.brandConcept.uniqueValueProposition;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. DNA da Marca &amp; Estratégia
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Propósito</h3>
            <EditableField
              value={data.brandConcept.purpose}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, purpose: val } }))}
              className="text-xl font-medium text-gray-800"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Missão</h3>
            <EditableField
              value={data.brandConcept.mission}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, mission: val } }))}
              className="text-gray-700"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Visão</h3>
            <EditableField
              value={data.brandConcept.vision}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, vision: val } }))}
              className="text-gray-700"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
          {isAdvanced && (
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Proposta Única de Valor (UVP)</h3>
              <EditableField
                value={data.brandConcept.uniqueValueProposition || ""}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, uniqueValueProposition: val } }))}
                className="text-blue-900 font-medium"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isAdvanced && data.brandConcept.reasonsToBelieve && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Reasons to Believe (RTBs)</h3>
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, reasonsToBelieve: [...(prev.brandConcept.reasonsToBelieve || []), "Novo RTB"] } }))}
                    className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
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
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Psicografia do Usuário</h3>
              <EditableField
                value={data.brandConcept.userPsychographics}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, userPsychographics: val } }))}
                className="text-gray-700 text-sm"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          )}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Valores Essenciais</h3>
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
                <div key={i} className="bg-white border rounded-full shadow-sm pr-1 flex items-stretch overflow-hidden">
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
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personalidade</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, personality: [...prev.brandConcept.personality, "Novo Traço"] } }))}
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.brandConcept.personality.map((p, i) => (
                <div key={i} className="bg-gray-800 text-white rounded-full shadow-sm pr-1 flex items-stretch overflow-hidden">
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
        <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">Arquétipo da Marca</h3>
          <EditableField
            value={data.brandConcept.brandArchetype}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, brandArchetype: val } }))}
            className="text-indigo-900 font-medium"
            readOnly={!onUpdateData}
          />
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tom de Voz</h3>
        <div className="italic border-l-4 border-gray-300 pl-4 py-2">
          <EditableField
            value={data.brandConcept.toneOfVoice}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, toneOfVoice: val } }))}
            className="text-gray-700"
            readOnly={!onUpdateData}
            multiline
          />
        </div>
      </div>
    </section>
  );
}
