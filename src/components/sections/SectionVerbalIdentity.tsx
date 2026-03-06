"use client";
import { BrandbookData } from "@/lib/types";
import { EditableField } from "@/components/EditableField";

export function SectionVerbalIdentity({ data, num, onUpdateData }: { data: BrandbookData; num: number; onUpdateData?: (updater: (prev: BrandbookData) => BrandbookData) => void }) {
  if (!data.verbalIdentity) return null;

  const v = data.verbalIdentity;

  return (
    <section className="page-break mb-6">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-4 border-b border-gray-100 pb-2">
        {String(num).padStart(2, "0")}. Identidade Verbal &amp; Mensagens
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 text-white rounded-xl p-5">
            <div className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2">Tagline</div>
            <div className="text-3xl font-extrabold leading-tight">
              <EditableField
                value={v.tagline}
                onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, tagline: val } } : prev)}
                readOnly={!onUpdateData}
                multiline
              />
            </div>
            <div className="mt-4 text-xs uppercase tracking-widest text-gray-300 font-bold mb-1">One-liner</div>
            <div className="text-lg text-gray-100">
              <EditableField
                value={v.oneLiner}
                onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, oneLiner: val } } : prev)}
                readOnly={!onUpdateData}
                multiline
              />
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Pilares de Mensagem</h3>
            <div className="space-y-3">
              {v.messagingPillars.map((p, i) => (
                <div key={i} className="bg-gray-50 border rounded-lg p-4 group/pillar relative">
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pilar {i + 1}</div>
                      <div className="text-lg font-bold mt-1">
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
                      <div className="text-gray-700 text-sm mt-2">
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
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Proof Points</div>
                      {onUpdateData && (
                        <button
                          onClick={() => onUpdateData(prev => {
                            if (!prev.verbalIdentity) return prev;
                            const next = [...prev.verbalIdentity.messagingPillars];
                            next[i] = { ...next[i], proofPoints: [...(next[i].proofPoints || []), "Novo proof point"] };
                            return { ...prev, verbalIdentity: { ...prev.verbalIdentity, messagingPillars: next } };
                          })}
                          className="no-print text-[10px] font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
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
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exemplos de Copy</div>
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
                    <ul className="space-y-2">
                      {(p.exampleCopy || []).map((c, j) => (
                        <li key={j} className="text-sm bg-white border rounded p-3 text-gray-700 group/item">
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
                        </li>
                      ))}
                    </ul>
                  </div>
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
                className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700 transition"
              >
                + Adicionar Pilar
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Traços de Voz</h3>
            <div className="flex flex-wrap gap-2">
              {v.brandVoiceTraits.map((t, i) => (
                <span key={i} className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-medium">
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

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Vocabulário</h3>
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preferir</div>
              <div className="flex flex-wrap gap-2">
                {v.vocabulary.preferred.map((w, i) => (
                  <span key={i} className="bg-green-50 text-green-800 border border-green-100 text-xs px-2.5 py-1 rounded-full font-medium">
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
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Evitar</div>
              <div className="flex flex-wrap gap-2">
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
                  className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                >
                  + Adicionar
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Do / Don&apos;t</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Do</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {v.doDont.do.map((d, i) => (
                    <li key={i}>
                      <EditableField
                        value={d}
                        onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, do: [...prev.verbalIdentity.doDont.do.slice(0, i), val, ...prev.verbalIdentity.doDont.do.slice(i + 1)] } } } : prev)}
                        readOnly={!onUpdateData}
                      />
                    </li>
                  ))}
                </ul>
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => {
                      if (!prev.verbalIdentity) return prev;
                      return { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, do: [...prev.verbalIdentity.doDont.do, "Novo item"] } } };
                    })}
                    className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Don&apos;t</div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {v.doDont.dont.map((d, i) => (
                    <li key={i}>
                      <EditableField
                        value={d}
                        onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, dont: [...prev.verbalIdentity.doDont.dont.slice(0, i), val, ...prev.verbalIdentity.doDont.dont.slice(i + 1)] } } } : prev)}
                        readOnly={!onUpdateData}
                      />
                    </li>
                  ))}
                </ul>
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => {
                      if (!prev.verbalIdentity) return prev;
                      return { ...prev, verbalIdentity: { ...prev.verbalIdentity, doDont: { ...prev.verbalIdentity.doDont, dont: [...prev.verbalIdentity.doDont.dont, "Novo item"] } } };
                    })}
                    className="no-print text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold mb-3">Biblioteca Rápida</h3>
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Headlines</div>
              <ul className="space-y-2">
                {v.sampleHeadlines.map((h, i) => (
                  <li key={i} className="text-sm bg-gray-50 border rounded p-3 text-gray-700">
                    <EditableField
                      value={h}
                      onSave={(val) => onUpdateData?.(prev => prev.verbalIdentity ? { ...prev, verbalIdentity: { ...prev.verbalIdentity, sampleHeadlines: [...prev.verbalIdentity.sampleHeadlines.slice(0, i), val, ...prev.verbalIdentity.sampleHeadlines.slice(i + 1)] } } : prev)}
                      readOnly={!onUpdateData}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CTAs</div>
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
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {v.tonePerChannel.map((t, i) => (
              <div key={i} className="bg-white border rounded-xl p-5 space-y-3 relative group/card">
                {onUpdateData && (
                  <button
                    onClick={() => onUpdateData(prev => {
                      if (!prev.verbalIdentity) return prev;
                      return { ...prev, verbalIdentity: { ...prev.verbalIdentity, tonePerChannel: (prev.verbalIdentity.tonePerChannel || []).filter((_, idx) => idx !== i) } };
                    })}
                    className="absolute top-2 right-2 w-6 h-6 bg-white border rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition flex items-center justify-center"
                    title="Excluir"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
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
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
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
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Exemplo</div>
                  <div className="text-xs text-gray-600 italic leading-relaxed flex">
                    <span className="mr-1">&ldquo;</span>
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
                    <span className="ml-1">&rdquo;</span>
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
