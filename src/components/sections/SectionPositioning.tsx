"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionPositioning({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.positioning) return null;

  const p = data.positioning;
  const differentiators = p.primaryDifferentiators ?? [];
  const alternatives = p.competitiveAlternatives ?? [];
  const rtbs = p.reasonsToBelieve ?? [];

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Posicionamento
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Categoria</h3>
            <EditableField
              value={p.category}
              onSave={(val) => onUpdateData?.(prev => prev.positioning ? { ...prev, positioning: { ...prev.positioning, category: val } } : prev)}
              className="text-gray-800 font-medium"
              readOnly={!onUpdateData}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Mercado-alvo</h3>
            <EditableField
              value={p.targetMarket}
              onSave={(val) => onUpdateData?.(prev => prev.positioning ? { ...prev, positioning: { ...prev.positioning, targetMarket: val } } : prev)}
              className="text-gray-700"
              readOnly={!onUpdateData}
              multiline
            />
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Positioning Statement</h3>
            <EditableField
              value={p.positioningStatement}
              onSave={(val) => onUpdateData?.(prev => prev.positioning ? { ...prev, positioning: { ...prev.positioning, positioningStatement: val } } : prev)}
              className="text-indigo-950 font-medium"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Diferenciais</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.positioning) return prev;
                    return { ...prev, positioning: { ...prev.positioning, primaryDifferentiators: [...(prev.positioning.primaryDifferentiators || []), "Novo diferencial"] } };
                  })}
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              {differentiators.map((d, i) => (
                <li key={i} className="group/item">
                  <EditableField
                    value={d}
                    onSave={(val) => onUpdateData?.(prev => {
                      if (!prev.positioning) return prev;
                      const next = [...(prev.positioning.primaryDifferentiators || [])];
                      next[i] = val;
                      return { ...prev, positioning: { ...prev.positioning, primaryDifferentiators: next } };
                    })}
                    onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                      if (!prev.positioning) return prev;
                      return { ...prev, positioning: { ...prev.positioning, primaryDifferentiators: (prev.positioning.primaryDifferentiators || []).filter((_, idx) => idx !== i) } };
                    }) : undefined}
                    readOnly={!onUpdateData}
                    multiline
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Alternativas / Concorrentes</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.positioning) return prev;
                    return { ...prev, positioning: { ...prev.positioning, competitiveAlternatives: [...(prev.positioning.competitiveAlternatives || []), "Novo concorrente"] } };
                  })}
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              {alternatives.map((c, i) => (
                <li key={i} className="group/item">
                  <EditableField
                    value={c}
                    onSave={(val) => onUpdateData?.(prev => {
                      if (!prev.positioning) return prev;
                      const next = [...(prev.positioning.competitiveAlternatives || [])];
                      next[i] = val;
                      return { ...prev, positioning: { ...prev.positioning, competitiveAlternatives: next } };
                    })}
                    onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                      if (!prev.positioning) return prev;
                      return { ...prev, positioning: { ...prev.positioning, competitiveAlternatives: (prev.positioning.competitiveAlternatives || []).filter((_, idx) => idx !== i) } };
                    }) : undefined}
                    readOnly={!onUpdateData}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Reasons to Believe</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.positioning) return prev;
                    return { ...prev, positioning: { ...prev.positioning, reasonsToBelieve: [...(prev.positioning.reasonsToBelieve || []), "Novo RTB"] } };
                  })}
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
              {rtbs.map((r, i) => (
                <li key={i} className="group/item">
                  <EditableField
                    value={r}
                    onSave={(val) => onUpdateData?.(prev => {
                      if (!prev.positioning) return prev;
                      const next = [...(prev.positioning.reasonsToBelieve || [])];
                      next[i] = val;
                      return { ...prev, positioning: { ...prev.positioning, reasonsToBelieve: next } };
                    })}
                    onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                      if (!prev.positioning) return prev;
                      return { ...prev, positioning: { ...prev.positioning, reasonsToBelieve: (prev.positioning.reasonsToBelieve || []).filter((_, idx) => idx !== i) } };
                    }) : undefined}
                    readOnly={!onUpdateData}
                    multiline
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
