"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionPositioning({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.positioning) return null;

  const p = data.positioning;
  const differentiators = p.primaryDifferentiators ?? [];
  const alternatives = p.competitiveAlternatives ?? [];
  const rtbs = p.reasonsToBelieve ?? [];
  const actionButtonClass = "no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition";

  return (
    <section className="page-break mb-6">
      {/* ── Section Header (editorial style) ── */}
      <div className="mb-6 rounded-[1.75rem] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/80 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Estrategia de mercado</div>
            <h2 className="text-[1.7rem] md:text-[2.15rem] font-extrabold tracking-tight text-gray-950">
              {String(num).padStart(2, "0")}. Posicionamento
            </h2>
            {p.positioningStatement && (
              <p className="mt-2 text-[15px] leading-7 text-gray-700 md:text-[15px]">
                {p.positioningStatement}
              </p>
            )}
          </div>
          <div className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shadow-sm">
            Proposta de valor
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Stat Cards: Category + Target Market ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category stat card */}
          <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200">
              {/* Tag / folder icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em] mb-1.5">Categoria</h3>
              <EditableField
                value={p.category}
                onSave={(val) => onUpdateData?.(prev => prev.positioning ? { ...prev, positioning: { ...prev.positioning, category: val } } : prev)}
                className="text-gray-900 font-semibold text-[1.05rem]"
                readOnly={!onUpdateData}
              />
            </div>
          </div>

          {/* Target Market stat card */}
          <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200">
              {/* Users / target icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em] mb-1.5">Mercado-alvo</h3>
              <EditableField
                value={p.targetMarket}
                onSave={(val) => onUpdateData?.(prev => prev.positioning ? { ...prev, positioning: { ...prev.positioning, targetMarket: val } } : prev)}
                className="text-gray-800 font-medium text-sm leading-6"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          </div>
        </div>

        {/* ── Positioning Statement — hero quote card ── */}
        <div
          className="rounded-[1.8rem] overflow-hidden shadow-[0_24px_64px_rgba(15,23,42,0.10)] relative border border-gray-100"
          style={{ background: `var(--bb-primary, #0a0a0a)`, color: `var(--bb-bg, #ffffff)` }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `var(--bb-accent, #c0a060)` }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, var(--bb-accent, #c0a060) 0%, transparent 60%)`,
          }} />
          {/* Decorative quotation marks */}
          <svg className="absolute top-4 left-6 md:top-6 md:left-8 opacity-[0.10] pointer-events-none" width="80" height="70" viewBox="0 0 80 70" fill="none">
            <text x="0" y="65" fontSize="100" fontFamily="Georgia, serif" fontWeight="700" fill="var(--bb-accent, #c0a060)">&ldquo;</text>
          </svg>
          <svg className="absolute bottom-4 right-6 md:bottom-6 md:right-8 opacity-[0.10] pointer-events-none" width="80" height="70" viewBox="0 0 80 70" fill="none">
            <text x="0" y="65" fontSize="100" fontFamily="Georgia, serif" fontWeight="700" fill="var(--bb-accent, #c0a060)">&rdquo;</text>
          </svg>
          <div className="relative px-8 py-10 md:px-12 md:py-14 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.35em] mb-5 opacity-60" style={{ color: `var(--bb-accent, #c0a060)` }}>
              Positioning Statement
            </div>
            <div
              className="max-w-3xl mx-auto leading-[1.7] opacity-95"
              style={{
                fontFamily: `var(--bb-heading-font, 'Georgia', serif)`,
                fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)",
                fontWeight: 600,
                color: `var(--bb-bg, #ffffff)`,
              }}
            >
              <EditableField
                value={p.positioningStatement}
                onSave={(val) => onUpdateData?.(prev => prev.positioning ? { ...prev, positioning: { ...prev.positioning, positioningStatement: val } } : prev)}
                readOnly={!onUpdateData}
                multiline
              />
            </div>
            <div className="mt-6 mx-auto w-12 h-[2px] opacity-30" style={{ background: `var(--bb-accent, #c0a060)` }} />
          </div>
        </div>

        {/* ── Three Lists as Card Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Differentiators card */}
          <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
                {/* Diamond / star icon */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em] flex-1">Diferenciais</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.positioning) return prev;
                    return { ...prev, positioning: { ...prev.positioning, primaryDifferentiators: [...(prev.positioning.primaryDifferentiators || []), "Novo diferencial"] } };
                  })}
                  className={actionButtonClass}
                >
                  +
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {differentiators.map((d, i) => (
                <div key={i} className="group/item inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 text-[12px] text-gray-700 font-medium hover:border-gray-300 transition-colors">
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
                </div>
              ))}
            </div>
          </div>

          {/* Competitors card */}
          <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                {/* Shield icon */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em] flex-1">Concorrentes</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.positioning) return prev;
                    return { ...prev, positioning: { ...prev.positioning, competitiveAlternatives: [...(prev.positioning.competitiveAlternatives || []), "Novo concorrente"] } };
                  })}
                  className={actionButtonClass}
                >
                  +
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {alternatives.map((c, i) => (
                <div key={i} className="group/item inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 text-[12px] text-gray-700 font-medium hover:border-gray-300 transition-colors">
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
                </div>
              ))}
            </div>
          </div>

          {/* Reasons to Believe card */}
          <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200">
                {/* Check-circle icon */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em] flex-1">RTBs</h3>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.positioning) return prev;
                    return { ...prev, positioning: { ...prev.positioning, reasonsToBelieve: [...(prev.positioning.reasonsToBelieve || []), "Novo RTB"] } };
                  })}
                  className={actionButtonClass}
                >
                  +
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {rtbs.map((r, i) => (
                <div key={i} className="group/item inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 text-[12px] text-gray-700 font-medium hover:border-gray-300 transition-colors">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
