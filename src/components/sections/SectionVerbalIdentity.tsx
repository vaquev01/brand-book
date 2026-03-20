"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionVerbalIdentity({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.verbalIdentity) return null;

  const v = data.verbalIdentity;
  const editorialLine = v.oneLiner || v.tagline || v.messagingPillars[0]?.description;

  return (
    <section className="page-break mb-6">
      <div className="mb-6 rounded-[1.75rem] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/80 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:px-7 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">Assinatura verbal</div>
            <h2 className="text-[1.7rem] md:text-[2.15rem] font-extrabold tracking-tight text-gray-950">
              {String(num).padStart(2, "0")}. Identidade Verbal &amp; Mensagens
            </h2>
            {editorialLine && (
              <p className="mt-2 text-[15px] leading-7 text-gray-700 md:text-[15px]">
                {editorialLine}
              </p>
            )}
          </div>
          <div className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500 shadow-sm">
            Voz, ritmo e memorabilidade
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-6">
        <div className="space-y-4">
          {/* Tagline + One-liner dark box */}
          <div className="rounded-[1.8rem] border border-gray-900 bg-gray-950 px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-300">Tagline</div>
            <div className="text-[2rem] font-extrabold leading-[1.08] md:text-[2.45rem]">
              <EditableField
                value={v.tagline}
                onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, tagline: val } } : prev)}
                readOnly={!onUpdateData}
                multiline
              />
            </div>
            <div className="mb-1 mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-300">One-liner</div>
            <div className="max-w-3xl text-[1.02rem] leading-7 text-gray-100 md:text-[1.08rem]">
              <EditableField
                value={v.oneLiner}
                onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, oneLiner: val } } : prev)}
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          </div>

          {/* Messaging Pillars — 2-column grid with collapsible details */}
          <div className="rounded-[1.55rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-950">Pilares de Mensagem</h3>
                <p className="mt-1 text-sm text-gray-500">Narrativa, prova e aplicação de copy.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {v.messagingPillars.map((p, i) => (
                <div key={i} className="group/pillar relative rounded-[1.1rem] border border-gray-200 bg-white/90 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.03)]">
                  {onUpdateData && (
                    <button
                      onClick={() => onUpdateData(prev => {
                        if (!prev.verbalIdentity) return prev;
                        return {
                          ...prev,
                          verbalIdentity: {
                            ...prev.verbalIdentity,
                            messagingPillars: prev.verbalIdentity.messagingPillars.filter((_, idx) => idx !== i)
                          }
                        };
                      })}
                      className="absolute top-2 right-2 w-6 h-6 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/pillar:opacity-100 transition flex items-center justify-center"
                      title="Excluir Pilar"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Pilar {i + 1}</div>
                  <div className="mt-1 text-[1.05rem] font-bold text-gray-950">
                    <EditableField
                      value={p.title}
                      onSave={(val) => onUpdateData?.(prev => {
                        if (!prev.verbalIdentity) return prev;
                        const next = [...prev.verbalIdentity.messagingPillars];
                        next[i] = { ...next[i], title: val };
                        return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: next } };
                      })}
                      readOnly={!onUpdateData}
                    />
                  </div>
                  <div className="mt-1.5 text-sm leading-6 text-gray-700">
                    <EditableField
                      value={p.description}
                      onSave={(val) => onUpdateData?.(prev => {
                        if (!prev.verbalIdentity) return prev;
                        const next = [...prev.verbalIdentity.messagingPillars];
                        next[i] = { ...next[i], description: val };
                        return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: next } };
                      })}
                      readOnly={!onUpdateData}
                      multiline
                    />
                  </div>

                  {/* Collapsible Proof Points */}
                  {((p.proofPoints && p.proofPoints.length > 0) || onUpdateData) && (
                    <details className="mt-3 group/details">
                      <summary className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em] cursor-pointer select-none hover:text-gray-600 transition flex items-center gap-1">
                        <svg className="w-3 h-3 transition-transform group-open/details:rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        Proof Points ({(p.proofPoints || []).length})
                      </summary>
                      <div className="mt-2">
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 leading-6">
                          {(p.proofPoints || []).map((pp, j) => (
                            <li key={j} className="group/item">
                              <EditableField
                                value={pp}
                                onSave={(val) => onUpdateData?.(prev => {
                                  if (!prev.verbalIdentity) return prev;
                                  const nextP = [...prev.verbalIdentity.messagingPillars];
                                  const nextPP = [...(nextP[i].proofPoints || [])];
                                  nextPP[j] = val;
                                  nextP[i] = { ...nextP[i], proofPoints: nextPP };
                                  return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: nextP } };
                                })}
                                onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                                  if (!prev.verbalIdentity) return prev;
                                  const nextP = [...prev.verbalIdentity.messagingPillars];
                                  nextP[i] = { ...nextP[i], proofPoints: (nextP[i].proofPoints || []).filter((_, idx) => idx !== j) };
                                  return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: nextP } };
                                }) : undefined}
                                readOnly={!onUpdateData}
                                multiline
                              />
                            </li>
                          ))}
                        </ul>
                        {onUpdateData && (
                          <button
                            onClick={() => onUpdateData(prev => {
                              if (!prev.verbalIdentity) return prev;
                              const next = [...prev.verbalIdentity.messagingPillars];
                              next[i] = { ...next[i], proofPoints: [...(next[i].proofPoints || []), "Novo proof point"] };
                              return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: next } };
                            })}
                            className="no-print mt-1 text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                          >
                            + Adicionar
                          </button>
                        )}
                      </div>
                    </details>
                  )}

                  {/* Collapsible Example Copy */}
                  {((p.exampleCopy && p.exampleCopy.length > 0) || onUpdateData) && (
                    <details className="mt-2 group/details">
                      <summary className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em] cursor-pointer select-none hover:text-gray-600 transition flex items-center gap-1">
                        <svg className="w-3 h-3 transition-transform group-open/details:rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        Exemplos de Copy ({(p.exampleCopy || []).length})
                      </summary>
                      <div className="mt-2 space-y-1.5">
                        {(p.exampleCopy || []).map((c, j) => (
                          <div key={j} className="group/item rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-2.5 text-sm text-gray-700">
                            <EditableField
                              value={c}
                              onSave={(val) => onUpdateData?.(prev => {
                                if (!prev.verbalIdentity) return prev;
                                const nextP = [...prev.verbalIdentity.messagingPillars];
                                const nextEC = [...(nextP[i].exampleCopy || [])];
                                nextEC[j] = val;
                                nextP[i] = { ...nextP[i], exampleCopy: nextEC };
                                return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: nextP } };
                              })}
                              onDelete={onUpdateData ? () => onUpdateData?.(prev => {
                                if (!prev.verbalIdentity) return prev;
                                const nextP = [...prev.verbalIdentity.messagingPillars];
                                nextP[i] = { ...nextP[i], exampleCopy: (nextP[i].exampleCopy || []).filter((_, idx) => idx !== j) };
                                return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: nextP } };
                              }) : undefined}
                              readOnly={!onUpdateData}
                              multiline
                            />
                          </div>
                        ))}
                        {onUpdateData && (
                          <button
                            onClick={() => onUpdateData(prev => {
                              if (!prev.verbalIdentity) return prev;
                              const next = [...prev.verbalIdentity.messagingPillars];
                              next[i] = { ...next[i], exampleCopy: [...(next[i].exampleCopy || []), "Novo exemplo de copy"] };
                              return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: next } };
                            })}
                            className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                          >
                            + Adicionar
                          </button>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
            {onUpdateData && (
              <button
                onClick={() => onUpdateData(prev => {
                  if (!prev.verbalIdentity) return prev;
                  return {
                    ...prev,
                    verbalIdentity: {
                      ...prev.verbalIdentity,
                      messagingPillars: [...prev.verbalIdentity.messagingPillars, { title: "Novo Pilar", description: "Descrição" }]
                    }
                  };
                })}
                className="mt-3 w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 transition"
              >
                + Adicionar Pilar
              </button>
            )}
          </div>
        </div>

        {/* Voice Traits + Vocabulary — combined single row */}
        <div className="rounded-[1.45rem] border border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <h3 className="mb-3 text-base font-bold text-gray-950">Espectro da Voz da Marca</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Voice Traits */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em] mb-2">Traços de Voz</div>
              <div className="flex flex-wrap gap-1.5">
                {v.brandVoiceTraits.map((t, i) => (
                  <span key={i} className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                    <EditableField
                      value={t}
                      onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, brandVoiceTraits: [...prev.verbalIdentity.brandVoiceTraits.slice(0, i), val, ...prev.verbalIdentity.brandVoiceTraits.slice(i + 1)] } } : prev)}
                      readOnly={!onUpdateData}
                    />
                  </span>
                ))}
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => {
                      if (!prev.verbalIdentity) return prev;
                      return { ...prev, verbalIdentity: { ...prev.verbalIdentity, brandVoiceTraits: [...prev.verbalIdentity.brandVoiceTraits, "Novo traço"] } };
                    })}
                    className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
            </div>

            {/* Preferred vocabulary */}
            <div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.22em] mb-2">Preferir</div>
              <div className="flex flex-wrap gap-1.5">
                {v.vocabulary.preferred.map((w, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs px-2.5 py-1 rounded-full font-medium">
                    <EditableField
                      value={w}
                      onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, vocabulary: { ...prev.verbalIdentity.vocabulary, preferred: [...prev.verbalIdentity.vocabulary.preferred.slice(0, i), val, ...prev.verbalIdentity.vocabulary.preferred.slice(i + 1)] } } } : prev)}
                      readOnly={!onUpdateData}
                    />
                  </span>
                ))}
              </div>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.verbalIdentity) return prev;
                    return { ...prev, verbalIdentity: { ...prev.verbalIdentity, vocabulary: { ...prev.verbalIdentity.vocabulary, preferred: [...prev.verbalIdentity.vocabulary.preferred, "Nova palavra"] } } };
                  })}
                  className="no-print mt-1 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>

            {/* Avoid vocabulary */}
            <div>
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-[0.22em] mb-2">Evitar</div>
              <div className="flex flex-wrap gap-1.5">
                {v.vocabulary.avoid.map((w, i) => (
                  <span key={i} className="bg-red-50 text-red-800 border border-red-100 text-xs px-2.5 py-1 rounded-full font-medium">
                    <EditableField
                      value={w}
                      onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, vocabulary: { ...prev.verbalIdentity.vocabulary, avoid: [...prev.verbalIdentity.vocabulary.avoid.slice(0, i), val, ...prev.verbalIdentity.vocabulary.avoid.slice(i + 1)] } } } : prev)}
                      readOnly={!onUpdateData}
                    />
                  </span>
                ))}
              </div>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.verbalIdentity) return prev;
                    return { ...prev, verbalIdentity: { ...prev.verbalIdentity, vocabulary: { ...prev.verbalIdentity.vocabulary, avoid: [...prev.verbalIdentity.vocabulary.avoid, "Nova palavra"] } } };
                  })}
                  className="no-print mt-1 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Do/Don't — side-by-side visual card with check/X icons */}
        <div className="rounded-[1.45rem] border border-gray-200 bg-white px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <h3 className="font-bold mb-4 text-base text-gray-950">Do / Don&apos;t</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Do column */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Do
              </div>
              <div className="space-y-2">
                {v.doDont.do.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <div className="flex-1">
                      <EditableField
                        value={d}
                        onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, do: [...prev.verbalIdentity.doDont.do.slice(0, i), val, ...prev.verbalIdentity.doDont.do.slice(i + 1)] } } } : prev)}
                        readOnly={!onUpdateData}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.verbalIdentity) return prev;
                    return { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, do: [...prev.verbalIdentity.doDont.do, "Novo item"] } } };
                  })}
                  className="no-print mt-2 text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-100 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>

            {/* Don't column */}
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
              <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                Don&apos;t
              </div>
              <div className="space-y-2">
                {v.doDont.dont.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <div className="flex-1">
                      <EditableField
                        value={d}
                        onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, dont: [...prev.verbalIdentity.doDont.dont.slice(0, i), val, ...prev.verbalIdentity.doDont.dont.slice(i + 1)] } } } : prev)}
                        readOnly={!onUpdateData}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {onUpdateData && (
                <button
                  onClick={() => onUpdateData(prev => {
                    if (!prev.verbalIdentity) return prev;
                    return { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, dont: [...prev.verbalIdentity.doDont.dont, "Novo item"] } } };
                  })}
                  className="no-print mt-2 text-[10px] font-bold text-gray-500 bg-white hover:bg-gray-100 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Headlines + CTAs — Biblioteca Rápida */}
        <div className="rounded-[1.45rem] border border-gray-200 bg-white px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <h3 className="font-bold mb-4 text-base text-gray-950">Biblioteca Rápida</h3>

          {/* Headlines as horizontal scrollable strip */}
          <div className="mb-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em] mb-2">Headlines</div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              {v.sampleHeadlines.map((h, i) => (
                <div key={i} className="shrink-0 w-[220px] text-sm bg-gray-50 border rounded-xl p-3 text-gray-700">
                  <EditableField
                    value={h}
                    onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, sampleHeadlines: [...prev.verbalIdentity.sampleHeadlines.slice(0, i), val, ...prev.verbalIdentity.sampleHeadlines.slice(i + 1)] } } : prev)}
                    readOnly={!onUpdateData}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTAs as pills */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.18em] mb-2">CTAs</div>
            <div className="flex flex-wrap gap-2">
              {v.sampleCTAs.map((c, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-800 border border-indigo-100 text-xs px-2.5 py-1 rounded-full font-semibold flex items-stretch overflow-hidden group/item">
                  <EditableField
                    value={c}
                    onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, sampleCTAs: [...prev.verbalIdentity.sampleCTAs.slice(0, i), val, ...prev.verbalIdentity.sampleCTAs.slice(i + 1)] } } : prev)}
                    readOnly={!onUpdateData}
                  />
                  {onUpdateData && (
                    <button
                      onClick={() => onUpdateData(prev => {
                        if (!prev.verbalIdentity) return prev;
                        return { ...prev, verbalIdentity: { ...prev.verbalIdentity, sampleCTAs: prev.verbalIdentity.sampleCTAs.filter((_, idx) => idx !== i) } };
                      })}
                      className="no-print ml-1 -mr-1 pl-1 border-l border-indigo-200 text-indigo-400 hover:text-indigo-600"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {onUpdateData && (
              <button
                onClick={() => onUpdateData(prev => {
                  if (!prev.verbalIdentity) return prev;
                  return { ...prev, verbalIdentity: { ...prev.verbalIdentity, sampleCTAs: [...prev.verbalIdentity.sampleCTAs, "Novo CTA"] } };
                })}
                className="no-print mt-2 text-[10px] font-bold text-indigo-500 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded transition"
              >
                + Adicionar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brand Voice em Ação — mock compositions (kept as-is) */}
      {(v.sampleHeadlines?.length > 0 || v.sampleCTAs?.length > 0 || v.tagline) && (
        <div className="mt-6 mb-6">
          <h3 className="text-base font-bold mb-1">Voz da Marca em Ação</h3>
          <p className="text-xs text-gray-500 mb-4">Identidade verbal aplicada em peças reais</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Instagram post mock */}
            {v.sampleHeadlines?.[0] && (
              <div
                className="rounded-[1.4rem] overflow-hidden shadow-lg aspect-square flex flex-col relative"
                style={{ background: `var(--bb-primary, #1a1a1a)` }}
              >
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 80% 20%, var(--bb-accent, #c0a060) 0%, transparent 55%)`,
                }} />
                <div className="flex-1 flex items-center justify-center p-7 relative">
                  <p
                    className="text-center leading-snug font-bold"
                    style={{
                      fontFamily: `var(--bb-heading-font, 'Georgia', serif)`,
                      color: `var(--bb-bg, #ffffff)`,
                      fontSize: "clamp(1rem, 3.5vw, 1.3rem)",
                    }}
                  >
                    {v.sampleHeadlines[0]}
                  </p>
                </div>
                {v.sampleCTAs?.[0] && (
                  <div className="px-5 pb-5 relative">
                    <div
                      className="inline-block px-4 py-2 rounded-full text-xs font-bold"
                      style={{
                        background: `var(--bb-accent, #c0a060)`,
                        color: `var(--bb-primary, #0a0a0a)`,
                        fontFamily: `var(--bb-body-font, sans-serif)`,
                      }}
                    >
                      {v.sampleCTAs[0]}
                    </div>
                  </div>
                )}
                <div className="px-4 py-2 border-t border-white/10">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-40" style={{ color: `var(--bb-bg, #fff)` }}>
                    Instagram Post
                  </span>
                </div>
              </div>
            )}

            {/* Email subject line mock */}
            {v.sampleHeadlines?.[1] && (
              <div className="rounded-[1.4rem] border bg-white overflow-hidden shadow-sm flex flex-col">
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono flex-1 text-center">email</span>
                </div>
                <div className="flex-1 p-5 space-y-3">
                  <div className="border-b pb-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Assunto</p>
                    <p
                      className="text-sm font-semibold text-gray-900 leading-snug"
                      style={{ fontFamily: `var(--bb-body-font, sans-serif)` }}
                    >
                      {v.sampleHeadlines[1]}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3" style={{ fontFamily: `var(--bb-body-font, sans-serif)` }}>
                    {data.brandConcept?.purpose || v.messagingPillars[0]?.description || "Conteúdo do email alinhado com a voz da marca."}
                  </p>
                  {v.sampleCTAs?.[1] && (
                    <div
                      className="inline-block px-5 py-2.5 rounded-lg text-xs font-bold text-white mt-2"
                      style={{ background: `var(--bb-primary, #1a1a1a)` }}
                    >
                      {v.sampleCTAs[1]}
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">E-mail</span>
                </div>
              </div>
            )}

            {/* Outdoor / headline mock */}
            {v.tagline && (
              <div
                className="rounded-[1.4rem] overflow-hidden shadow-lg flex flex-col relative"
                style={{ background: `var(--bb-accent, #D5A41D)`, minHeight: "200px" }}
              >
                <div className="flex-1 flex flex-col items-start justify-end p-7 relative">
                  <div
                    className="text-[9px] font-bold uppercase tracking-[0.3em] mb-3 opacity-70"
                    style={{ color: `var(--bb-primary, #0a0a0a)` }}
                  >
                    Tagline — Outdoor
                  </div>
                  <p
                    className="leading-tight font-black"
                    style={{
                      fontFamily: `var(--bb-heading-font, 'Georgia', serif)`,
                      color: `var(--bb-primary, #0a0a0a)`,
                      fontSize: "clamp(1.3rem, 4vw, 1.9rem)",
                    }}
                  >
                    {v.tagline}
                  </p>
                </div>
                <div className="px-4 py-2 border-t border-black/10">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: `var(--bb-primary, #0a0a0a)` }}>
                    Outdoor / OOH
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tone per Channel — compact smaller cards */}
      {v.tonePerChannel && v.tonePerChannel.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold">Tom de Voz por Canal</h3>
            {onUpdateData && (
              <button
                onClick={() => onUpdateData(prev => {
                  if (!prev.verbalIdentity) return prev;
                  return { ...prev, verbalIdentity: { ...prev.verbalIdentity, tonePerChannel: [...(prev.verbalIdentity.tonePerChannel || []), { channel: "Novo Canal", tone: "Descrição do tom...", example: "Exemplo de copy" }] } };
                })}
                className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
              >
                + Adicionar
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-start">
            {v.tonePerChannel.map((t, i) => (
              <div key={i} className="bg-white border rounded-xl p-3.5 space-y-2 relative group/card">
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => {
                      if (!prev.verbalIdentity) return prev;
                      return { ...prev, verbalIdentity: { ...prev.verbalIdentity, tonePerChannel: (prev.verbalIdentity.tonePerChannel || []).filter((_, idx) => idx !== i) } };
                    })}
                    className="absolute top-2 right-2 w-5 h-5 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition flex items-center justify-center"
                    title="Excluir"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
                <span className="inline-block bg-gray-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  <EditableField
                    value={t.channel}
                    onSave={(val) => onUpdateData?.(prev => {
                      if (!prev.verbalIdentity) return prev;
                      const next = [...(prev.verbalIdentity.tonePerChannel || [])];
                      next[i] = { ...next[i], channel: val };
                      return { ...prev, verbalIdentity: { ...prev.verbalIdentity, tonePerChannel: next } };
                    })}
                    readOnly={!onUpdateData}
                  />
                </span>
                <div className="text-xs text-gray-700 leading-relaxed">
                  <EditableField
                    value={t.tone}
                    onSave={(val) => onUpdateData?.(prev => {
                      if (!prev.verbalIdentity) return prev;
                      const next = [...(prev.verbalIdentity.tonePerChannel || [])];
                      next[i] = { ...next[i], tone: val };
                      return { ...prev, verbalIdentity: { ...prev.verbalIdentity, tonePerChannel: next } };
                    })}
                    readOnly={!onUpdateData}
                    multiline
                  />
                </div>
                <div className="bg-gray-50 border rounded-lg p-2">
                  <div className="text-[10px] text-gray-600 italic leading-relaxed flex">
                    <span className="mr-0.5">&ldquo;</span>
                    <EditableField
                      value={t.example}
                      onSave={(val) => onUpdateData?.(prev => {
                        if (!prev.verbalIdentity) return prev;
                        const next = [...(prev.verbalIdentity.tonePerChannel || [])];
                        next[i] = { ...next[i], example: val };
                        return { ...prev, verbalIdentity: { ...prev.verbalIdentity, tonePerChannel: next } };
                      })}
                      readOnly={!onUpdateData}
                      multiline
                      className="flex-1"
                    />
                    <span className="ml-0.5">&rdquo;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
