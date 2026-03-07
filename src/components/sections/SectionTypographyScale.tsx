"use client";
import { EditableField } from "@/components/EditableField";
import { BrandbookData, TypographyScaleItem } from "@/lib/types";

export function SectionTypographyScale({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.typographyScale || data.typographyScale.length === 0) return null;

  const fontMap: Record<string, string | undefined> = {
    marketing: data.typography.marketing?.name,
    ui: data.typography.ui?.name,
    monospace: data.typography.monospace?.name,
    primary: data.typography.primary?.name,
    secondary: data.typography.secondary?.name,
  };

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Escala Tipográfica
      </h2>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">Styles</h3>
            <p className="text-xs text-gray-500 mt-1">Tamanhos, line-height, peso e uso recomendado</p>
          </div>
          {onUpdateData && (
            <button
              type="button"
              onClick={() => onUpdateData(prev => ({
                ...prev,
                typographyScale: [
                  ...(prev.typographyScale || []),
                  {
                    name: "Novo estilo",
                    fontRole: "ui",
                    size: "16px",
                    lineHeight: "24px",
                    fontWeight: "400",
                    usage: "Descreva o uso recomendado"
                  } satisfies TypographyScaleItem
                ]
              }))}
              className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
            >
              + Adicionar
            </button>
          )}
        </div>

        <div className="divide-y">
          {data.typographyScale.map((t, i) => (
            <div key={i} className="px-5 py-4 relative group/item">
              {onUpdateData && (
                <button
                  type="button"
                  onClick={() => onUpdateData(prev => ({
                    ...prev,
                    typographyScale: (prev.typographyScale || []).filter((_, idx) => idx !== i)
                  }))}
                  className="absolute top-3 right-3 no-print w-6 h-6 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/item:opacity-100 transition flex items-center justify-center"
                  title="Excluir estilo"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] gap-4 items-start">
                <div className="space-y-4 min-w-0">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Display</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <EditableField
                        value={t.name}
                        onSave={(val) => onUpdateData?.(prev => {
                          const next = [...(prev.typographyScale || [])];
                          next[i] = { ...next[i], name: val };
                          return { ...prev, typographyScale: next };
                        })}
                        readOnly={!onUpdateData}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Role: <span className="font-mono"><EditableField value={t.fontRole} onSave={(val) => onUpdateData?.(prev => {
                      const next = [...(prev.typographyScale || [])];
                      next[i] = { ...next[i], fontRole: val as TypographyScaleItem["fontRole"] };
                      return { ...prev, typographyScale: next };
                    })} readOnly={!onUpdateData} /></span></div>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <div><EditableField value={t.size} onSave={(val) => onUpdateData?.(prev => {
                        const next = [...(prev.typographyScale || [])];
                        next[i] = { ...next[i], size: val };
                        return { ...prev, typographyScale: next };
                      })} readOnly={!onUpdateData} /> · <EditableField value={t.lineHeight} onSave={(val) => onUpdateData?.(prev => {
                        const next = [...(prev.typographyScale || [])];
                        next[i] = { ...next[i], lineHeight: val };
                        return { ...prev, typographyScale: next };
                      })} readOnly={!onUpdateData} /> · <EditableField value={t.fontWeight} onSave={(val) => onUpdateData?.(prev => {
                        const next = [...(prev.typographyScale || [])];
                        next[i] = { ...next[i], fontWeight: val };
                        return { ...prev, typographyScale: next };
                      })} readOnly={!onUpdateData} /></div>
                      {t.letterSpacing && (
                        <div><EditableField value={t.letterSpacing} onSave={(val) => onUpdateData?.(prev => {
                          const next = [...(prev.typographyScale || [])];
                          next[i] = { ...next[i], letterSpacing: val };
                          return { ...prev, typographyScale: next };
                        })} readOnly={!onUpdateData} /></div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Uso</div>
                    <EditableField
                      value={t.usage}
                      onSave={(val) => onUpdateData?.(prev => {
                        const next = [...(prev.typographyScale || [])];
                        next[i] = { ...next[i], usage: val };
                        return { ...prev, typographyScale: next };
                      })}
                      className="text-sm text-gray-700"
                      readOnly={!onUpdateData}
                      multiline
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Preview</div>
                  <div className="bg-gray-50 border rounded-lg p-5 min-h-[132px] flex items-center">
                    <div
                      className="text-gray-900 break-words max-w-full"
                      style={{
                        fontFamily: fontMap[t.fontRole] ? `'${fontMap[t.fontRole]}', ${t.fontRole === "monospace" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "sans-serif"}` : undefined,
                        fontSize: t.size,
                        lineHeight: t.lineHeight,
                        fontWeight: /^\d+$/.test(t.fontWeight) ? Number(t.fontWeight) : t.fontWeight,
                        letterSpacing: t.letterSpacing,
                      }}
                    >
                      {data.brandName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
