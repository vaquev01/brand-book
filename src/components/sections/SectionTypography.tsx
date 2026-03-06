"use client";
import { BrandbookData, Typography } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

function TypoCard({ title, typo, typoKey, onUpdateData }: { title: string; typo: Typography; typoKey: string; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  return (
    <div className="bg-gray-50 p-5 rounded-lg border relative group/typo">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-1" style={{ fontFamily: `'${typo.name}', sans-serif` }}>
        <EditableField
          value={typo.name}
          onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], name: val } } }))}
          readOnly={!onUpdateData}
        />
      </div>
      {typo.category && (
        <span className="inline-block text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded mb-3">
          <EditableField
            value={typo.category}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], category: val } } }))}
            readOnly={!onUpdateData}
          />
        </span>
      )}
      <div className="text-gray-400 text-sm mb-3">Aa Bb Cc 0123456789 !@#</div>
      <div className="mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase">Uso: </span>
        <span className="text-sm">
          <EditableField
            value={typo.usage}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], usage: val } } }))}
            readOnly={!onUpdateData}
            multiline
          />
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {typo.weights.map((w, i) => (
          <span key={i} className="bg-gray-200 text-xs px-2 py-1 rounded flex items-stretch overflow-hidden group/item">
            <EditableField
              value={w}
              onSave={(val) => onUpdateData?.(prev => {
                const currentTypo = prev.typography[typoKey as keyof typeof prev.typography] as Typography;
                const nextWeights = [...currentTypo.weights];
                nextWeights[i] = val;
                return { ...prev, typography: { ...prev.typography, [typoKey]: { ...currentTypo, weights: nextWeights } } };
              })}
              readOnly={!onUpdateData}
            />
            {onUpdateData && (
              <button
                onClick={() => onUpdateData(prev => {
                  const currentTypo = prev.typography[typoKey as keyof typeof prev.typography] as Typography;
                  return { ...prev, typography: { ...prev.typography, [typoKey]: { ...currentTypo, weights: currentTypo.weights.filter((_, idx) => idx !== i) } } };
                })}
                className="no-print ml-1 -mr-1 pl-1 border-l border-gray-300 text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {onUpdateData && (
          <button
            onClick={() => onUpdateData(prev => {
              const currentTypo = prev.typography[typoKey as keyof typeof prev.typography] as Typography;
              return { ...prev, typography: { ...prev.typography, [typoKey]: { ...currentTypo, weights: [...currentTypo.weights, "Novo Peso"] } } };
            })}
            className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
          >
            + Adicionar
          </button>
        )}
      </div>
      {(typo.fallbackFont || typo.textTransform) && (
        <div className="border-t pt-3 space-y-1">
          {typo.fallbackFont && (
            <div className="text-xs text-gray-600 flex">
              <span className="font-semibold text-gray-700 mr-1">Alternativa Google Fonts:</span>
              <EditableField
                value={typo.fallbackFont}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], fallbackFont: val } } }))}
                readOnly={!onUpdateData}
                className="flex-1"
              />
            </div>
          )}
          {typo.textTransform && (
            <div className="text-xs text-gray-600 flex">
              <span className="font-semibold text-gray-700 mr-1">Transformação:</span>
              <EditableField
                value={typo.textTransform}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, typography: { ...prev.typography, [typoKey]: { ...prev.typography[typoKey as keyof typeof prev.typography], textTransform: val } } }))}
                readOnly={!onUpdateData}
                className="flex-1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SectionTypography({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const isAdvanced = !!data.typography.marketing;
  const advancedTypos: Array<{ title: string; typo: Typography; key: string }> = [];
  if (data.typography.marketing) advancedTypos.push({ title: "Marketing & Display", typo: data.typography.marketing, key: "marketing" });
  if (data.typography.ui) advancedTypos.push({ title: "UI & Alta Legibilidade", typo: data.typography.ui, key: "ui" });
  if (data.typography.monospace) advancedTypos.push({ title: "Dados & Monospace", typo: data.typography.monospace, key: "monospace" });

  const advancedCols = advancedTypos.length >= 3 ? "md:grid-cols-3" : advancedTypos.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Tipografia
      </h2>
      <div className={`grid grid-cols-1 ${isAdvanced ? advancedCols : "md:grid-cols-2"} gap-5`}>
        {isAdvanced ? (
          <>
            {advancedTypos.map(({ title, typo, key }) => (
              <TypoCard key={title} title={title} typo={typo} typoKey={key} onUpdateData={onUpdateData} />
            ))}
          </>
        ) : (
          <>
            {data.typography.primary && <TypoCard title="Fonte Primária" typo={data.typography.primary} typoKey="primary" onUpdateData={onUpdateData} />}
            {data.typography.secondary && <TypoCard title="Fonte Secundária" typo={data.typography.secondary} typoKey="secondary" onUpdateData={onUpdateData} />}
          </>
        )}
      </div>
    </section>
  );
}
