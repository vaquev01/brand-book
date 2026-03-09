"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionBrandStory({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.brandStory) return null;

  const s = data.brandStory;
  const editorialLine = s.brandPromise || s.originStory || s.manifesto;

  return (
    <section className="page-break mb-6">
      <div className="mb-6 rounded-[1.75rem] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/80 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400">Narrativa central</div>
            <h2 className="text-[1.7rem] md:text-[2.15rem] font-extrabold tracking-tight text-gray-950">
              {String(num).padStart(2, "0")}. Brand Story &amp; Manifesto
            </h2>
            {editorialLine && (
              <p className="mt-2 text-sm leading-7 text-gray-600 md:text-[15px]">
                {editorialLine}
              </p>
            )}
          </div>
          <div className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shadow-sm">
            Narrativa com assinatura
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Manifesto</h3>
          {/* Editorial manifesto — uses brand fonts + primary color via CSS variables */}
          <div
            className="rounded-[1.8rem] overflow-hidden shadow-[0_32px_80px_rgba(15,23,42,0.22)] relative"
            style={{
              background: `var(--bb-primary, #0a0a0a)`,
              color: `var(--bb-bg, #ffffff)`,
            }}
          >
            {/* Decorative rule */}
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `var(--bb-accent, #c0a060)` }} />
            {/* Background texture */}
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, var(--bb-accent, #c0a060) 0%, transparent 60%), radial-gradient(circle at 80% 20%, var(--bb-accent, #c0a060) 0%, transparent 50%)`,
            }} />
            <div className="relative px-7 py-10 md:px-10 md:py-14">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.35em] mb-6 opacity-60"
                style={{ color: `var(--bb-accent, #c0a060)` }}
              >
                Manifesto
              </div>
              <div
                className="whitespace-pre-line leading-[1.65] opacity-95"
                style={{
                  fontFamily: `var(--bb-heading-font, 'Georgia', serif)`,
                  fontSize: "clamp(1.15rem, 2.5vw, 1.5rem)",
                  fontWeight: 600,
                  color: `var(--bb-bg, #ffffff)`,
                }}
              >
                <EditableField
                  value={s.manifesto}
                  onSave={(val) => onUpdateData?.(prev => prev.brandStory ? { ...prev, brandStory: { ...prev.brandStory, manifesto: val } } : prev)}
                  readOnly={!onUpdateData}
                  multiline
                />
              </div>
              {/* Decorative bottom rule */}
              <div className="mt-8 w-16 h-[2px] opacity-40" style={{ background: `var(--bb-accent, #c0a060)` }} />
            </div>
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <h3 className="mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">História de Origem</h3>
          <EditableField
            value={s.originStory}
            onSave={(val) => onUpdateData?.(prev => prev.brandStory ? { ...prev, brandStory: { ...prev.brandStory, originStory: val } } : prev)}
            className="text-gray-700 leading-8"
            readOnly={!onUpdateData}
            multiline
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 items-start">
          <div className="rounded-[1.6rem] border border-gray-900 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
            <h3 className="mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Promessa da Marca</h3>
            <div className="flex items-start gap-1 text-[1.18rem] font-semibold leading-8 text-gray-900">
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
            <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">O que Acreditamos</h3>
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
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white shadow-sm">{i + 1}</span>
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
                      className="flex-1 text-sm leading-7 text-gray-700"
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
