"use client";

import { Field, ArrayEditor, type EditorTabProps } from "./EditorFields";

export function EditorPersonas({ data, onPatch }: EditorTabProps) {
  return (
    <div className="space-y-4">
      {(data.audiencePersonas ?? []).map((persona, i) => (
        <div key={i} className="app-surface-soft space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Persona {i + 1}</h4>
            <button
              type="button"
              onClick={() => onPatch({ audiencePersonas: (data.audiencePersonas ?? []).filter((_, j) => j !== i) })}
              className="text-xs font-medium text-gray-400 transition hover:text-red-500"
            >
              Remover
            </button>
          </div>
          <Field label="Nome" value={persona.name} onChange={(v) => {
            const next = [...(data.audiencePersonas ?? [])];
            next[i] = { ...next[i], name: v };
            onPatch({ audiencePersonas: next });
          }} placeholder="Ex: Maria, CEO de startup..." />
          <Field label="Cargo / Papel" value={persona.role} onChange={(v) => {
            const next = [...(data.audiencePersonas ?? [])];
            next[i] = { ...next[i], role: v };
            onPatch({ audiencePersonas: next });
          }} placeholder="Ex: CEO, Designer, Marketing Manager..." />
          <Field label="Contexto" value={persona.context} onChange={(v) => {
            const next = [...(data.audiencePersonas ?? [])];
            next[i] = { ...next[i], context: v };
            onPatch({ audiencePersonas: next });
          }} multiline rows={2} placeholder="Cenario em que essa persona interage com a marca..." />
          <ArrayEditor label="Objetivos" items={persona.goals} onChange={(v) => {
            const next = [...(data.audiencePersonas ?? [])];
            next[i] = { ...next[i], goals: v };
            onPatch({ audiencePersonas: next });
          }} addLabel="Objetivo" />
          <ArrayEditor label="Dores" items={persona.painPoints} onChange={(v) => {
            const next = [...(data.audiencePersonas ?? [])];
            next[i] = { ...next[i], painPoints: v };
            onPatch({ audiencePersonas: next });
          }} addLabel="Dor / frustracao" />
          <ArrayEditor label="Objecoes" items={persona.objections} onChange={(v) => {
            const next = [...(data.audiencePersonas ?? [])];
            next[i] = { ...next[i], objections: v };
            onPatch({ audiencePersonas: next });
          }} addLabel="Objecao" />
          <ArrayEditor label="Canais" items={persona.channels} onChange={(v) => {
            const next = [...(data.audiencePersonas ?? [])];
            next[i] = { ...next[i], channels: v };
            onPatch({ audiencePersonas: next });
          }} addLabel="Canal" />
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const newPersona = { name: "Nova Persona", role: "", context: "", goals: [], painPoints: [], objections: [], channels: [] };
          onPatch({ audiencePersonas: [...(data.audiencePersonas ?? []), newPersona] });
        }}
        className="app-surface-soft w-full border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-gray-500 transition hover:border-slate-500 hover:text-gray-700"
      >
        + Adicionar Persona
      </button>
    </div>
  );
}
