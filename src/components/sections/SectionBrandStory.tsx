"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionBrandStory({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
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
              <div className="text-lg leading-relaxed text-gray-100 whitespace-pre-line">
                <EditableField
                  value={s.manifesto}
                  onSave={(val) => onUpdateData?.(prev => prev.brandStory ? { ...prev, brandStory: { ...prev.brandStory, manifesto: val } } : prev)}
                  readOnly={!onUpdateData}
                  multiline
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">História de Origem</h3>
            <div className="bg-gray-50 border rounded-xl p-4">
              <EditableField
                value={s.originStory}
                onSave={(val) => onUpdateData?.(prev => prev.brandStory ? { ...prev, brandStory: { ...prev.brandStory, originStory: val } } : prev)}
                className="text-gray-700 leading-relaxed"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Promessa da Marca</h3>
            <div className="text-gray-900 font-semibold text-lg leading-snug flex items-start gap-1">
              <span>&ldquo;</span>
              <EditableField
                value={s.brandPromise}
                onSave={(val) => onUpdateData?.(prev => prev.brandStory ? { ...prev, brandStory: { ...prev.brandStory, brandPromise: val } } : prev)}
                className="flex-1"
                readOnly={!onUpdateData}
                multiline
              />
              <span>&rdquo;</span>
            </div>
          </div>

          {s.brandBeliefs && (
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">O que Acreditamos</h3>
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => {
                      if (!prev.brandStory) return prev;
                      return {
                        ...prev,
                        brandStory: {
                          ...prev.brandStory,
                          brandBeliefs: [...(prev.brandStory.brandBeliefs || []), "Nova crença"]
                        }
                      };
                    })}
                    className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
              <ul className="space-y-3">
                {s.brandBeliefs.map((belief, i) => (
                  <li key={i} className="flex items-start gap-3 group/item">
                    <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <EditableField
                      value={belief}
                      onSave={(val) => onUpdateData?.(prev => {
                        if (!prev.brandStory) return prev;
                        const next = [...(prev.brandStory.brandBeliefs || [])];
                        next[i] = val;
                        return { ...prev, brandStory: { ...prev.brandStory, brandBeliefs: next } };
                      })}
                      onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                        if (!prev.brandStory) return prev;
                        return {
                          ...prev,
                          brandStory: {
                            ...prev.brandStory,
                            brandBeliefs: (prev.brandStory.brandBeliefs || []).filter((_, idx) => idx !== i)
                          }
                        };
                      }) : undefined}
                      className="text-gray-700 text-sm flex-1"
                      readOnly={!onUpdateData}
                      multiline
                    />
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
