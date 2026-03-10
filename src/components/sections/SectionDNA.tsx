"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

/* ── Inline SVG Icons (decorative, 20x20) ── */
const IconCompass = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="10,3 12,9 10,10 8,9" fill="currentColor" opacity="0.7" />
    <polygon points="10,17 8,11 10,10 12,11" fill="currentColor" opacity="0.35" />
  </svg>
);

const IconRocket = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M10 2C10 2 5 6 5 12l2.5 2.5L10 13l2.5 1.5L15 12c0-6-5-10-5-10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
    <path d="M7.5 14.5L5 17M12.5 14.5L15 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M2 10s3.5-5.5 8-5.5S18 10 18 10s-3.5 5.5-8 5.5S2 10 2 10z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.08" />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.18" />
  </svg>
);

const IconMegaphone = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M18 3v18l-7-4H5a2 2 0 01-2-2V9a2 2 0 012-2h6l7-4z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" strokeLinejoin="round" />
    <path d="M21 9c1 1 1 3 0 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconStar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.8 3 1.1-6.5L2.6 8.8l6.5-.9L12 2z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round" />
  </svg>
);

export function SectionDNA({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  const isAdvanced = !!data.brandConcept.uniqueValueProposition;
  const editorialLine = data.brandConcept.uniqueValueProposition || data.brandConcept.purpose || data.brandConcept.mission;

  return (
    <section className="page-break mb-6">
      {/* ── Header ── */}
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

      {/* ── Purpose / Mission / Vision  "Trio" ── */}
      <div className="mb-8">
        {/* Purpose — hero card */}
        <div className="rounded-[1.6rem] border border-gray-200 bg-white px-6 py-6 shadow-[0_16px_44px_rgba(15,23,42,0.05)] mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-500">
              <IconCompass />
            </div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Propósito</h3>
          </div>
          <EditableField
            value={data.brandConcept.purpose}
            onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, purpose: val } }))}
            className="text-[1.35rem] font-semibold leading-[1.5] text-gray-900"
            readOnly={!onUpdateData}
            multiline
          />
        </div>

        {/* Mission + Vision — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-[1.35rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500">
                <IconRocket />
              </div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Missão</h3>
            </div>
            <EditableField
              value={data.brandConcept.mission}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, mission: val } }))}
              className="text-gray-700 leading-7"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
          <div className="rounded-[1.35rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500">
                <IconEye />
              </div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Visão</h3>
            </div>
            <EditableField
              value={data.brandConcept.vision}
              onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, vision: val } }))}
              className="text-gray-700 leading-7"
              readOnly={!onUpdateData}
              multiline
            />
          </div>
        </div>
      </div>

      {/* ── UVP (if advanced) ── */}
      {isAdvanced && (
        <div className="mb-8 rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-[0_16px_40px_rgba(37,99,235,0.10)]">
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

      {/* ── RTBs + Psychographics row ── */}
      {isAdvanced && (data.brandConcept.reasonsToBelieve || data.brandConcept.userPsychographics) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {data.brandConcept.reasonsToBelieve && (
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
          {data.brandConcept.userPsychographics && (
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
        </div>
      )}

      {/* ── Values — numbered visual cards ── */}
      <div className="mb-8 rounded-[1.5rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-5">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.brandConcept.values.map((v, i) => (
            <div key={i} className="group relative rounded-xl border border-gray-200 bg-white px-4 py-5 text-center shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Large background number */}
              <span className="absolute top-1 left-3 text-[2.5rem] font-black text-gray-100 leading-none select-none pointer-events-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative z-10 font-bold text-gray-900 text-[0.95rem]">
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
                  className="no-print absolute top-1.5 right-2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full text-xs transition opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Personality — dark theme accent cards ── */}
      <div className="mb-8 rounded-[1.5rem] border border-gray-200 bg-gray-950 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <div className="flex items-center justify-between mb-5">
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.brandConcept.personality.map((p, i) => (
            <div key={i} className="group relative rounded-xl bg-white/[0.06] border border-white/10 overflow-hidden">
              {/* Accent top line */}
              <div className="h-[3px] w-full" style={{ background: "var(--bb-accent, #6366f1)" }} />
              <div className="px-4 py-4 text-center">
                <div className="text-white font-bold text-[0.95rem]">
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
              </div>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => ({
                    ...prev, brandConcept: { ...prev.brandConcept, personality: prev.brandConcept.personality.filter((_, idx) => idx !== i) }
                  }))}
                  className="no-print absolute top-2.5 right-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-300 hover:bg-gray-700 rounded-full text-xs transition opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Brand Archetype — hero callout ── */}
      {data.brandConcept.brandArchetype && (
        <div className="mb-8 rounded-[1.5rem] border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-6 shadow-[0_16px_40px_rgba(79,70,229,0.08)]">
          <div className="flex flex-col items-center text-center py-2">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
              <IconStar />
            </div>
            <h3 className="mb-3 text-[11px] font-bold text-indigo-800 uppercase tracking-[0.22em]">Arquétipo da Marca</h3>
            <div className="max-w-xl">
              <EditableField
                value={data.brandConcept.brandArchetype}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, brandArchetype: val } }))}
                className="text-indigo-950 text-lg font-semibold leading-7"
                readOnly={!onUpdateData}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tone of Voice — prominent card with icon ── */}
      <div className="rounded-[1.6rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-6 py-6 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 shrink-0 mt-0.5">
            <IconMegaphone />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Tom de Voz</h3>
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 italic">
              <EditableField
                value={data.brandConcept.toneOfVoice}
                onSave={(val) => onUpdateData?.(prev => ({ ...prev, brandConcept: { ...prev.brandConcept, toneOfVoice: val } }))}
                className="text-[1.05rem] text-gray-700 leading-7"
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
