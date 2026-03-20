"use client";
import { useState } from "react";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionBrandStory({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const [manifestoExpanded, setManifestoExpanded] = useState(false);
  const [originExpanded, setOriginExpanded] = useState(false);

  if (!data.brandStory) return null;

  const s = data.brandStory;
  const editorialLine = s.brandPromise || s.originStory || s.manifesto;
  const manifestoIsLong = (s.manifesto?.length ?? 0) > 300;
  const originIsLong = (s.originStory?.length ?? 0) > 250;

  return (
    <section className="page-break mb-6">
      <div className="mb-6 rounded-[1.75rem] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/80 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Narrativa central</div>
            <h2 className="text-[1.7rem] md:text-[2.15rem] font-extrabold tracking-tight text-gray-950">
              {String(num).padStart(2, "0")}. Brand Story &amp; Manifesto
            </h2>
            {editorialLine && (
              <p className="mt-2 text-[15px] leading-7 text-gray-700 md:text-[15px]">
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
        {/* ── Manifesto ── */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Manifesto</h3>
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
            {/* Large decorative opening quotation mark */}
            <svg
              className="absolute top-6 left-6 md:top-8 md:left-8 opacity-[0.12] pointer-events-none"
              width="120"
              height="100"
              viewBox="0 0 120 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="0"
                y="90"
                fontSize="140"
                fontFamily="Georgia, serif"
                fontWeight="700"
                fill="var(--bb-accent, #c0a060)"
              >
                &ldquo;
              </text>
            </svg>
            <div className="relative px-7 py-10 md:px-10 md:py-14">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.35em] mb-6 opacity-60"
                style={{ color: `var(--bb-accent, #c0a060)` }}
              >
                Manifesto
              </div>
              <div
                className="relative"
                style={{
                  maxHeight: manifestoIsLong && !manifestoExpanded ? "220px" : "none",
                  overflow: manifestoIsLong && !manifestoExpanded ? "hidden" : "visible",
                  transition: "max-height 0.5s ease",
                }}
              >
                <div
                  className="whitespace-pre-line leading-[1.65] opacity-95 pl-2 md:pl-4 bb-hero-quote"
                  style={{
                    fontFamily: `var(--bb-body-font, 'Inter', sans-serif)`,
                    fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
                    fontWeight: 500,
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
                {/* Gradient fade when truncated */}
                {manifestoIsLong && !manifestoExpanded && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                    style={{ background: `linear-gradient(to top, var(--bb-primary, #0a0a0a), transparent)` }}
                  />
                )}
              </div>
              {manifestoIsLong && (
                <button
                  onClick={() => setManifestoExpanded(!manifestoExpanded)}
                  className="no-print mt-4 text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-100"
                  style={{
                    color: `var(--bb-accent, #c0a060)`,
                    borderColor: `var(--bb-accent, #c0a060)`,
                    opacity: 0.7,
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  {manifestoExpanded ? "↑ Resumir" : "↓ Ler manifesto completo"}
                </button>
              )}
              {/* Decorative bottom rule */}
              <div className="mt-8 w-16 h-[2px] opacity-40" style={{ background: `var(--bb-accent, #c0a060)` }} />
            </div>
          </div>
        </div>

        {/* ── Origin Story with timeline border ── */}
        <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <h3 className="mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Historia de Origem</h3>
          <div className="flex gap-4 items-start">
            {/* Timeline left rail */}
            <div className="flex flex-col items-center shrink-0">
              {/* Book icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              {/* Vertical timeline line */}
              <div className="w-[2px] flex-1 rounded-full bg-gradient-to-b from-gray-300 to-gray-100" />
            </div>
            {/* Story text */}
            <div className="flex-1 min-w-0 relative">
              <div
                style={{
                  maxHeight: originIsLong && !originExpanded ? "120px" : "none",
                  overflow: originIsLong && !originExpanded ? "hidden" : "visible",
                  transition: "max-height 0.4s ease",
                }}
              >
                <EditableField
                  value={s.originStory}
                  onSave={(val) => onUpdateData?.(prev => prev.brandStory ? { ...prev, brandStory: { ...prev.brandStory, originStory: val } } : prev)}
                  className="text-gray-700 text-[15px] leading-7"
                  readOnly={!onUpdateData}
                  multiline
                />
              </div>
              {originIsLong && !originExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t from-white to-transparent" />
              )}
              {originIsLong && (
                <button
                  onClick={() => setOriginExpanded(!originExpanded)}
                  className="no-print mt-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {originExpanded ? "↑ Resumir" : "↓ Ler história completa"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Brand Promise + Beliefs: 2-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          {/* Brand Promise — highlight card */}
          <div className="rounded-[1.6rem] border-2 border-gray-900 bg-gradient-to-br from-white via-white to-gray-50 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] flex flex-col h-full">
            <div className="flex items-center gap-2 mb-3">
              {/* Star / handshake icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Promessa da Marca</h3>
            </div>
            <div className="flex items-start gap-1 text-[1.18rem] font-semibold leading-8 text-gray-900 flex-1">
              <span className="text-2xl leading-none text-gray-400 -mt-1">&ldquo;</span>
              <EditableField
                value={s.brandPromise}
                onSave={(val) => onUpdateData?.(prev => prev.brandStory ? { ...prev, brandStory: { ...prev.brandStory, brandPromise: val } } : prev)}
                className="flex-1"
                readOnly={!onUpdateData}
                multiline
              />
              <span className="text-2xl leading-none text-gray-400 -mt-1">&rdquo;</span>
            </div>
          </div>

          {/* Beliefs — compact card grid */}
          {s.brandBeliefs && (
            <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">O que Acreditamos</h3>
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => {
                      if (!prev.brandStory) return prev;
                      return {
                        ...prev,
                        brandStory: {
                          ...prev.brandStory,
                          brandBeliefs: [...(prev.brandStory.brandBeliefs || []), "Nova crenca"]
                        }
                      };
                    })}
                    className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {s.brandBeliefs.map((belief, i) => (
                  <div key={i} className="group/item flex items-start gap-2.5 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-3 hover:border-gray-200 transition-colors">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[9px] font-bold text-white">{i + 1}</span>
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
                      className="flex-1 text-[13px] leading-6 text-gray-700"
                      readOnly={!onUpdateData}
                      multiline
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
